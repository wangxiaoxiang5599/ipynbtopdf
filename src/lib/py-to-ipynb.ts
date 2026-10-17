import type { Notebook, NotebookCell } from "./ipynb";

/* Turns a Python script into a notebook. The hard part is deciding where one cell ends and
   the next begins, and scripts that came out of a notebook already say so: `# %%` is what
   VS Code, Spyder, PyCharm, Jupytext and this site's ipynb-to-py page write, and `# In[n]:`
   is what nbconvert writes. A script with neither is split where PEP 8 puts two blank
   lines, which is between top-level functions and classes. Pure string work, no DOM, so it
   can be imported anywhere. */

export type SplitMode = "auto" | "blank" | "single";

export type PyOptions = {
  split: SplitMode;
  /* "restore" undoes what ipynb-to-py and nbconvert did to IPython lines: `# %matplotlib`
     and `get_ipython().run_line_magic(...)` both go back to `%matplotlib`. */
  magics: "restore" | "keep";
};

export const defaultPyOptions: PyOptions = { split: "auto", magics: "restore" };

/** How the cells were actually found, for the sidebar to say. */
export type Detected = "percent" | "nbconvert" | "blank" | "single";

export type PyConversion = {
  notebook: Notebook;
  detected: Detected;
};

type Draft = { type: "code" | "markdown"; lines: string[] };

const PERCENT = /^# ?%%(\s|$)/;
const PERCENT_MARKDOWN = /^# ?%%.*\[(markdown|md)\]/;
const NBCONVERT = /^# In\[[\d ]*\]:\s*$/;

/* The first lines nbconvert and editors put at the top of a script, plus the header this
   site's own ipynb-to-py writes. None of them mean anything inside a notebook. */
const PREAMBLE = [/^#!/, /^# ?-\*- coding[:=]/, /^# coding[:=]/, /^# Converted from .* by ipynbtopdf\.xyz$/];

/* Only magics people actually write, so a comment like `# %s is the name` is left alone. */
const LINE_MAGICS =
  "matplotlib|time|timeit|pip|conda|load_ext|reload_ext|autoreload|config|cd|env|run|capture|writefile|html|bash|sh|sql|debug|prun|who|whos|store|reset|pylab|precision|load|pwd|ls|history|lsmagic|xmode|pdb|tensorboard|javascript|latex|markdown|script|file|svg|js";
const COMMENTED_MAGIC = new RegExp(`^(\\s*)# (%{1,2}(?:${LINE_MAGICS})\\b.*)$`);
const COMMENTED_SHELL = /^(\s*)# (![A-Za-z][\w.-]*(?: .*)?)$/;
/* nbconvert's rewrites. Only the plain single-quoted form is undone; anything with escapes
   or a computed argument stays as nbconvert wrote it, because it still runs in IPython. */
const LINE_MAGIC_CALL = /^(\s*)get_ipython\(\)\.run_line_magic\('(\w+)', '([^'\\]*)'\)\s*$/;
const SYSTEM_CALL = /^(\s*)get_ipython\(\)\.system\('([^'\\]*)'\)\s*$/;

export function scriptToNotebook(source: string, options: PyOptions): PyConversion {
  const lines = stripPreamble(source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n"));

  let detected: Detected;
  const drafts: Draft[] = [];
  let rest = lines;
  /* A module docstring at the very top reads better as the notebook's opening Markdown than
     as a string literal, whichever way the rest is split. */
  const docstring = options.split === "single" ? null : leadingDocstring(lines);
  if (docstring) {
    drafts.push({ type: "markdown", lines: docstring.text });
    rest = lines.slice(docstring.end);
  }

  if (options.split === "single") {
    detected = "single";
    drafts.push({ type: "code", lines: rest });
  } else if (options.split === "auto" && rest.some((line) => PERCENT.test(line))) {
    detected = "percent";
    drafts.push(...splitPercent(rest));
  } else if (options.split === "auto" && rest.some((line) => NBCONVERT.test(line))) {
    detected = "nbconvert";
    drafts.push(...splitNbconvert(rest));
  } else {
    detected = "blank";
    drafts.push(...splitBlank(rest));
  }

  const cells = drafts
    .map((draft) => ({ ...draft, lines: trimBlank(draft.lines) }))
    .filter((draft) => draft.lines.some((line) => line.trim()))
    .map((draft) => toCell(draft, options));

  return {
    detected,
    notebook: {
      cells,
      metadata: {
        kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
        language_info: { name: "python" },
      } as Notebook["metadata"],
      nbformat: 4,
      nbformat_minor: 4,
    } as Notebook,
  };
}

/** The .ipynb file text, in Jupyter's own layout (one-space indent, trailing newline). */
export function notebookJson(nb: Notebook): string {
  return JSON.stringify(nb, null, 1) + "\n";
}

function stripPreamble(lines: string[]): string[] {
  let start = 0;
  while (start < lines.length && (!lines[start].trim() || PREAMBLE.some((re) => re.test(lines[start])))) {
    start += 1;
  }
  return lines.slice(start);
}

function splitPercent(lines: string[]): Draft[] {
  const drafts: Draft[] = [{ type: "code", lines: [] }];
  for (const line of lines) {
    if (PERCENT.test(line)) {
      const markdown = PERCENT_MARKDOWN.test(line);
      drafts.push({ type: markdown ? "markdown" : "code", lines: [] });
      /* `# %% Load the data` names the cell in VS Code; keep the name as a comment rather
         than lose it. */
      const title = line.replace(/^# ?%%/, "").replace(/\[[^\]]*\]/, "").trim();
      if (title && !markdown) drafts[drafts.length - 1].lines.push(`# ${title}`);
      continue;
    }
    drafts[drafts.length - 1].lines.push(line);
  }
  return drafts.map((draft) =>
    draft.type === "markdown" ? { ...draft, lines: stripTripleQuotes(draft.lines) ?? uncomment(draft.lines) } : draft,
  );
}

/* nbconvert --to script writes each code cell as `# In[n]:`, two blank lines, the code and
   two more blank lines; a Markdown cell is a block of `# ` lines with one blank line around
   it. So inside each stretch between markers, comment-only blocks at the end that sit two
   blank lines below the code are the Markdown cells that came before the next code cell. */
function splitNbconvert(lines: string[]): Draft[] {
  const segments: string[][] = [[]];
  for (const line of lines) {
    if (NBCONVERT.test(line)) segments.push([]);
    else segments[segments.length - 1].push(line);
  }

  const drafts: Draft[] = [];
  segments.forEach((segment, index) => {
    const blocks = blocksOf(segment);
    if (index === 0) {
      /* Before the first marker there is no code cell, only Markdown and maybe imports
         someone added by hand. */
      for (const block of blocks) {
        drafts.push(isComment(block.lines) ? { type: "markdown", lines: uncomment(block.lines) } : { type: "code", lines: block.lines });
      }
      return;
    }

    let cut = blocks.length;
    while (cut > 0 && isComment(blocks[cut - 1].lines)) cut -= 1;
    if (cut === 0 || cut === blocks.length || blocks[cut].gapBefore < 2) cut = blocks.length;

    const codeEnd = cut === blocks.length ? segment.length : blocks[cut].start;
    drafts.push({ type: "code", lines: segment.slice(0, codeEnd) });
    for (const block of blocks.slice(cut)) drafts.push({ type: "markdown", lines: uncomment(block.lines) });
  });
  return drafts;
}

/* Two or more blank lines start a new cell. */
function splitBlank(lines: string[]): Draft[] {
  const drafts: Draft[] = [];
  let current: string[] = [];
  let blanks = 0;
  for (const line of lines) {
    if (!line.trim()) {
      blanks += 1;
      current.push(line);
      continue;
    }
    /* A blank run only splits at the top level: two blank lines inside an indented block
       (a long function body) keep the block together. */
    if (blanks >= 2 && !/^\s/.test(line) && current.some((l) => l.trim())) {
      drafts.push({ type: "code", lines: current });
      current = [];
    }
    blanks = 0;
    current.push(line);
  }
  drafts.push({ type: "code", lines: current });
  return drafts;
}

function leadingDocstring(lines: string[]): { text: string[]; end: number } | null {
  const first = lines[0]?.trim() ?? "";
  const quote = first.startsWith('"""') ? '"""' : first.startsWith("'''") ? "'''" : "";
  if (!quote) return null;

  const opening = first.slice(3);
  if (opening.includes(quote)) {
    return { text: [opening.slice(0, opening.indexOf(quote))], end: 1 };
  }
  for (let i = 1; i < lines.length; i += 1) {
    const at = lines[i].indexOf(quote);
    if (at >= 0) {
      const body = [opening, ...lines.slice(1, i), lines[i].slice(0, at)];
      return { text: dedent(body), end: i + 1 };
    }
  }
  return null;
}

/** Comment-only blocks separated by blank lines, with how many blank lines came before. */
function blocksOf(lines: string[]): { start: number; lines: string[]; gapBefore: number }[] {
  const blocks: { start: number; lines: string[]; gapBefore: number }[] = [];
  let gap = 0;
  lines.forEach((line, index) => {
    if (!line.trim()) {
      gap += 1;
      return;
    }
    const last = blocks[blocks.length - 1];
    if (last && gap === 0) last.lines.push(line);
    else blocks.push({ start: index, lines: [line], gapBefore: gap });
    gap = 0;
  });
  return blocks;
}

function isComment(lines: string[]): boolean {
  return lines.every((line) => !line.trim() || line.trimStart().startsWith("#"));
}

function uncomment(lines: string[]): string[] {
  return lines.map((line) => line.replace(/^\s*# ?/, ""));
}

/* Jupytext also accepts a Markdown cell written as a triple-quoted string; null when the
   cell is the usual `# ` comments instead. */
function stripTripleQuotes(lines: string[]): string[] | null {
  const body = trimBlank(lines);
  const first = body[0]?.trim() ?? "";
  const last = body[body.length - 1]?.trim() ?? "";
  const quote = first.startsWith('"""') ? '"""' : first.startsWith("'''") ? "'''" : "";
  if (!quote || !last.endsWith(quote) || body.join("\n").trim().length < 6) return null;
  const inner = body.join("\n").trim().slice(3, -3);
  return inner.replace(/^\n|\n$/g, "").split("\n");
}

function dedent(lines: string[]): string[] {
  const indents = lines.slice(1).filter((l) => l.trim()).map((l) => l.match(/^\s*/)![0].length);
  const cut = indents.length ? Math.min(...indents) : 0;
  return [lines[0].trim(), ...lines.slice(1).map((l) => l.slice(cut))];
}

function trimBlank(lines: string[]): string[] {
  let start = 0;
  let end = lines.length;
  while (start < end && !lines[start].trim()) start += 1;
  while (end > start && !lines[end - 1].trim()) end -= 1;
  return lines.slice(start, end).map((line) => line.replace(/\s+$/, ""));
}

function restoreMagic(line: string): string {
  const call = line.match(LINE_MAGIC_CALL);
  if (call) return `${call[1]}%${call[2]}${call[3] ? ` ${call[3]}` : ""}`;
  const system = line.match(SYSTEM_CALL);
  if (system) return `${system[1]}!${system[2]}`;
  const commented = line.match(COMMENTED_MAGIC) ?? line.match(COMMENTED_SHELL);
  if (commented) return commented[1] + commented[2];
  return line;
}

function toCell(draft: Draft, options: PyOptions): NotebookCell {
  const lines =
    draft.type === "code" && options.magics === "restore" ? draft.lines.map(restoreMagic) : draft.lines;
  /* nbformat stores source as a list of lines, each but the last keeping its newline. */
  const source = lines.map((line, i) => (i < lines.length - 1 ? `${line}\n` : line));
  return draft.type === "code"
    ? ({ cell_type: "code", execution_count: null, metadata: {}, outputs: [], source } as NotebookCell)
    : ({ cell_type: "markdown", metadata: {}, source } as NotebookCell);
}
