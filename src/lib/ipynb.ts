import MarkdownIt from "markdown-it";
import hljs from "highlight.js/lib/common";
import julia from "highlight.js/lib/languages/julia";
import matlab from "highlight.js/lib/languages/matlab";
import katex from "katex";
import DOMPurify from "dompurify";

hljs.registerLanguage("julia", julia);
hljs.registerLanguage("matlab", matlab);

/* DOMPurify drops <use> outright because it can pull in an external document. Matplotlib
   draws every scatter marker and tick with it, so allow the tag but confine its reference
   to a fragment of the same document, which is the part that was dangerous. */
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.nodeName?.toLowerCase() !== "use") return;
  for (const attribute of ["href", "xlink:href"]) {
    const value = node.getAttribute?.(attribute);
    if (value && !value.startsWith("#")) node.removeAttribute(attribute);
  }
});

type Source = string | string[];

type MimeBundle = Record<string, Source>;

type Output =
  | { output_type: "stream"; name?: string; text?: Source }
  | { output_type: "execute_result"; data?: MimeBundle; execution_count?: number | null }
  | { output_type: "display_data"; data?: MimeBundle }
  | { output_type: "error"; ename?: string; evalue?: string; traceback?: string[] };

export type NotebookCell = {
  cell_type: "markdown" | "code" | "raw";
  source?: Source;
  outputs?: Output[];
  execution_count?: number | null;
  attachments?: Record<string, MimeBundle>;
};

type Cell = NotebookCell;

export type Notebook = {
  cells?: NotebookCell[];
  metadata?: {
    language_info?: { name?: string };
    kernelspec?: { language?: string; display_name?: string };
  };
  nbformat?: number;
};

/** nbformat 3 and earlier: cells live under worksheets, with different field names. */
type LegacyCell = {
  cell_type: string;
  level?: number;
  source?: Source;
  input?: Source;
  prompt_number?: number | null;
  outputs?: LegacyOutput[];
};

type LegacyOutput = {
  output_type: string;
  stream?: string;
  text?: Source;
  ename?: string;
  evalue?: string;
  traceback?: string[];
  [mime: string]: unknown;
};

const LEGACY_MIME: Record<string, string> = {
  text: "text/plain",
  html: "text/html",
  latex: "text/latex",
  markdown: "text/markdown",
  png: "image/png",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
};

function upgradeOutput(output: LegacyOutput): Output {
  if (output.output_type === "stream") {
    return { output_type: "stream", name: output.stream, text: output.text };
  }

  if (output.output_type === "pyerr" || output.output_type === "error") {
    return {
      output_type: "error",
      ename: output.ename,
      evalue: output.evalue,
      traceback: output.traceback,
    };
  }

  const data: MimeBundle = {};
  for (const [key, mime] of Object.entries(LEGACY_MIME)) {
    const value = output[key];
    if (typeof value === "string" || Array.isArray(value)) {
      data[mime] = value as Source;
    }
  }

  return output.output_type === "pyout"
    ? { output_type: "execute_result", data }
    : { output_type: "display_data", data };
}

function upgradeCell(cell: LegacyCell): Cell {
  if (cell.cell_type === "heading") {
    const hashes = "#".repeat(Math.min(Math.max(cell.level ?? 1, 1), 6));
    return { cell_type: "markdown", source: `${hashes} ${text(cell.source)}` };
  }

  if (cell.cell_type === "code") {
    return {
      cell_type: "code",
      source: cell.input ?? cell.source,
      execution_count: cell.prompt_number ?? null,
      outputs: (cell.outputs ?? []).map(upgradeOutput),
    };
  }

  return {
    cell_type: cell.cell_type === "raw" ? "raw" : "markdown",
    source: cell.source,
  };
}

export type RenderOptions = {
  showCode: boolean;
  showOutputs: boolean;
  showPrompts: boolean;
  /** Keep the head and tail of text outputs longer than FOLD_AT lines; pip logs and epoch
      printouts otherwise run to pages. */
  foldOutputs: boolean;
};

const FOLD_AT = 40;
const FOLD_HEAD = 25;
const FOLD_TAIL = 10;

/* Module state for the duration of one renderNotebook call, so the output renderers do
   not need the options threaded through every signature. */
let folding = false;

/** Escaped text for a <pre>, folded when long. The marker is inserted after escaping so it
    can carry a class the stylesheet can mute. */
function textBlock(value: string): string {
  const lines = value.replace(/\n$/, "").split("\n");
  if (!folding || lines.length <= FOLD_AT) return escapeHtml(value);
  const hidden = lines.length - FOLD_HEAD - FOLD_TAIL;
  return [
    escapeHtml(lines.slice(0, FOLD_HEAD).join("\n")),
    `<span class="nb-fold">⋯ ${hidden} more lines hidden ⋯</span>`,
    escapeHtml(lines.slice(-FOLD_TAIL).join("\n")),
  ].join("\n");
}

export type NotebookStats = {
  cells: number;
  codeCells: number;
  markdownCells: number;
  language: string;
};

export function parseNotebook(source: string): Notebook {
  const nb = JSON.parse(source) as Notebook & { worksheets?: { cells?: LegacyCell[] }[] };

  if (Array.isArray(nb.cells)) return nb;

  if (Array.isArray(nb.worksheets)) {
    const cells = nb.worksheets.flatMap((sheet) => sheet.cells ?? []).map(upgradeCell);
    return { ...nb, cells };
  }

  throw new Error("This file does not look like a Jupyter notebook.");
}

export function notebookStats(nb: Notebook): NotebookStats {
  const cells = nb.cells ?? [];
  return {
    cells: cells.length,
    codeCells: cells.filter((c) => c.cell_type === "code").length,
    markdownCells: cells.filter((c) => c.cell_type === "markdown").length,
    language: notebookLanguage(nb),
  };
}

export function notebookLanguage(nb: Notebook): string {
  return (
    nb.metadata?.language_info?.name ?? nb.metadata?.kernelspec?.language ?? "python"
  );
}

export function cellText(source: Source | undefined): string {
  return text(source);
}

function text(source: Source | undefined): string {
  if (!source) return "";
  return Array.isArray(source) ? source.join("") : source;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const ANSI = /\[[0-9;]*[a-zA-Z]/g;

function stripAnsi(value: string): string {
  return value.replace(ANSI, "");
}

/* A lone \r means the line was rewritten in place — a progress bar redrawing itself. \r\n is
   just a Windows line ending and has to survive, or multi-line output collapses onto one row. */
function applyCarriageReturns(value: string): string {
  const normalized = value.replace(/\r\n/g, "\n");
  if (!normalized.includes("\r")) return normalized;

  return normalized
    .split("\n")
    .map((line) => {
      const last = line.lastIndexOf("\r");
      return last === -1 ? line : line.slice(last + 1);
    })
    .join("\n");
}

/* Jupyter shows consecutive writes to the same stream as one continuous block. Rendering each
   as its own box breaks a console transcript into disconnected fragments. */
function mergeStreams(outputs: Output[]): Output[] {
  const merged: Output[] = [];
  for (const output of outputs) {
    const previous = merged[merged.length - 1];
    if (
      output.output_type === "stream" &&
      previous?.output_type === "stream" &&
      previous.name === output.name
    ) {
      previous.text = text(previous.text) + text(output.text);
      continue;
    }
    merged.push(output.output_type === "stream" ? { ...output } : output);
  }
  return merged;
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    }
    return escapeHtml(code);
  },
});

function protectMath(src: string) {
  const math: { tex: string; display: boolean }[] = [];
  const push = (tex: string, display: boolean) => {
    math.push({ tex, display });
    return `%%MATH${math.length - 1}%%`;
  };

  const segments = src.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g);
  const out = segments
    .map((segment, index) => {
      if (index % 2 === 1) return segment;
      return segment
        .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) => push(tex, true))
        .replace(/\\\[([\s\S]+?)\\\]/g, (_, tex: string) => push(tex, true))
        .replace(/\\\(([\s\S]+?)\\\)/g, (_, tex: string) => push(tex, false))
        .replace(
          /(?<!\\)\$(?!\s)((?:[^$\n\\]|\\.)+?)(?<!\s)\$/g,
          (_, tex: string) => push(tex, false),
        );
    })
    .join("");

  return { out, math };
}

/* KaTeX has no eqnarray; MathJax does, so notebooks are full of it. aligned is the
   standard stand-in and lays the same rows out sensibly. */
function normalizeTex(tex: string): string {
  return tex
    .replace(/\\begin\{eqnarray\*?\}/g, "\\begin{aligned}")
    .replace(/\\end\{eqnarray\*?\}/g, "\\end{aligned}");
}

function renderTex(tex: string, display: boolean): string {
  try {
    return katex.renderToString(normalizeTex(tex).trim(), {
      displayMode: display,
      throwOnError: true,
      output: "html",
    });
  } catch {
    /* A red KaTeX error block in a printed PDF helps nobody. Showing the source at least
       leaves the reader something they can act on. */
    return `<code class="nb-tex-raw">${escapeHtml(tex.trim())}</code>`;
  }
}

function restoreMath(html: string, math: { tex: string; display: boolean }[]): string {
  return html.replace(/%%MATH(\d+)%%/g, (whole, index: string) => {
    const item = math[Number(index)];
    return item ? renderTex(item.tex, item.display) : whole;
  });
}

function inlineAttachments(source: string, attachments: Cell["attachments"]): string {
  if (!attachments) return source;
  return source.replace(/attachment:([^)\s"']+)/g, (whole, name: string) => {
    const bundle = attachments[decodeURIComponent(name)] ?? attachments[name];
    if (!bundle) return whole;
    const mime = Object.keys(bundle)[0];
    if (!mime) return whole;
    return `data:${mime};base64,${text(bundle[mime]).replace(/\s/g, "")}`;
  });
}

function renderMarkdownCell(cell: Cell): string {
  const source = inlineAttachments(text(cell.source), cell.attachments);
  const { out, math } = protectMath(source);
  return `<div class="nb-md">${restoreMath(md.render(out), math)}</div>`;
}

/** Source shown as it is when highlight.js has no grammar for the kernel's language. */
export function highlightCode(code: string, language: string): string {
  return hljs.getLanguage(language)
    ? hljs.highlight(code, { language, ignoreIllegals: true }).value
    : escapeHtml(code);
}

function renderCodeCell(cell: Cell, language: string, options: RenderOptions): string {
  const code = text(cell.source);
  if (!code.trim() && !(cell.outputs ?? []).length) return "";

  const parts: string[] = [];

  if (options.showCode && code.trim()) {
    const highlighted = highlightCode(code, language);
    const prompt =
      options.showPrompts && cell.execution_count != null
        ? `<div class="nb-prompt">In [${cell.execution_count}]</div>`
        : "";
    parts.push(`${prompt}<div class="nb-code"><pre><code>${highlighted}</code></pre></div>`);
  }

  if (options.showOutputs) {
    const outputs = mergeStreams(cell.outputs ?? []).map(renderOutput).filter(Boolean);
    if (outputs.length) parts.push(outputs.join(""));
  }

  return parts.join("");
}

const MIME_ORDER = [
  "text/html",
  "text/latex",
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/gif",
  "text/markdown",
  "text/plain",
];

let svgSerial = 0;

/* Two figures of the same plot carry identical element ids. Once both are inlined into one
   page the second figure's url(#…) and href="#…" resolve to the first one's definitions and
   it draws empty, so every id gets a per-figure prefix. */
function isolateSvgIds(svg: string): string {
  const prefix = `nb${(svgSerial += 1)}-`;
  const ids = new Set<string>();
  for (const match of svg.matchAll(/\sid="([^"]+)"/g)) ids.add(match[1]);

  let out = svg;
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out
      .replace(new RegExp(`\\sid="${escaped}"`, "g"), ` id="${prefix}${id}"`)
      .replace(new RegExp(`url\\(#${escaped}\\)`, "g"), `url(#${prefix}${id})`)
      .replace(new RegExp(`href="#${escaped}"`, "g"), `href="#${prefix}${id}"`);
  }
  return out;
}

/** Returns null when the maths cannot be typeset, so a bitmap of the same output can win instead. */
function renderLatexOutput(value: string): string | null {
  /* IPython's Latex() often holds a bare environment with no $ around it. */
  if (!/\$|\\\(|\\\[/.test(value) && /\\begin\{/.test(value)) {
    return `<div class="nb-out nb-md">${renderTex(value, true)}</div>`;
  }
  const { out, math } = protectMath(value);
  if (!math.length) return null;
  try {
    const html = md.render(out).replace(/%%MATH(\d+)%%/g, (whole, index: string) => {
      const item = math[Number(index)];
      if (!item) return whole;
      return katex.renderToString(normalizeTex(item.tex).trim(), {
        displayMode: item.display,
        throwOnError: true,
        output: "html",
      });
    });
    return `<div class="nb-out nb-md">${html}</div>`;
  } catch {
    return null;
  }
}

/* Plotly, Bokeh, Altair and ipywidgets save a <script> that draws the output and a <div> for
   it to draw into. The script cannot run in a document, so all that would remain is an empty
   box — often a fixed 450px tall one. */
function htmlHasContent(html: string): boolean {
  const clean = DOMPurify.sanitize(html, { ADD_DATA_URI_TAGS: ["img", "source"] });
  const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return false;
  return Boolean(root.textContent?.trim()) || root.querySelector("img, svg, table, video, audio, canvas") !== null;
}

/* Jupyter's text/plain for a rich object is the repr, which says only what the object was:
   `<IPython.core.display.Javascript object>`, `<Figure size 640x480 with 1 Axes>`,
   `<pandas.io.formats.style.Styler at 0x7f…>`. Showing it in a document explains nothing. */
const REPR_PLACEHOLDER = /^<[\w.]+(?: size [^>]*)?(?: object| at 0x[0-9a-f]+)?>$/i;

/* Outputs that only exist while a kernel is running, in the words a reader would use. */
const INTERACTIVE: [RegExp, string][] = [
  [/plotly/i, "Plotly chart"],
  [/bokeh/i, "Bokeh plot"],
  [/vega/i, "Vega/Altair chart"],
  [/widget/i, "ipywidgets control"],
  [/javascript/i, "JavaScript output"],
  [/holoviews/i, "HoloViews plot"],
];

function describeInteractive(mimes: string[]): string | null {
  for (const mime of mimes) {
    for (const [pattern, name] of INTERACTIVE) if (pattern.test(mime)) return name;
  }
  return null;
}

function renderMimeBundle(data: MimeBundle | undefined): string {
  if (!data) return "";
  const mimes = Object.keys(data);

  for (const mime of MIME_ORDER) {
    if (!(mime in data)) continue;
    const value = text(data[mime]);

    if (mime === "image/svg+xml") {
      return `<div class="nb-out">${isolateSvgIds(value)}</div>`;
    }
    if (mime === "text/html") {
      if (!htmlHasContent(value)) continue;
      return `<div class="nb-out">${value}</div>`;
    }
    if (mime === "text/latex") {
      const rendered = renderLatexOutput(value);
      if (rendered) return rendered;
      continue;
    }
    if (mime.startsWith("image/")) {
      return `<div class="nb-out"><img src="data:${mime};base64,${value.replace(
        /\s/g,
        "",
      )}" alt="notebook output" /></div>`;
    }
    if (mime === "text/markdown") {
      const { out, math } = protectMath(value);
      return `<div class="nb-out nb-md">${restoreMath(md.render(out), math)}</div>`;
    }
    if (REPR_PLACEHOLDER.test(value.trim())) continue;
    return `<div class="nb-out"><pre>${textBlock(stripAnsi(value))}</pre></div>`;
  }

  const interactive = describeInteractive(mimes);
  if (interactive) {
    return `<div class="nb-out"><span class="nb-missing">Interactive ${interactive} — it needs a running notebook and cannot be shown in a document.</span></div>`;
  }
  const plain = text(data["text/plain"]).trim();
  if (/^<Figure/i.test(plain)) {
    return `<div class="nb-out"><span class="nb-missing">Figure was not saved with the notebook.</span></div>`;
  }
  if (plain) {
    return `<div class="nb-out"><pre>${textBlock(stripAnsi(plain))}</pre></div>`;
  }
  return `<div class="nb-out"><span class="nb-missing">Output of type ${escapeHtml(
    mimes.join(", ") || "unknown",
  )} cannot be shown in a document.</span></div>`;
}

function renderOutput(output: Output): string {
  if (output.output_type === "stream") {
    const stderr = output.name === "stderr";
    return `<div class="nb-out${stderr ? " nb-out-stderr" : ""}"><pre>${textBlock(
      applyCarriageReturns(stripAnsi(text(output.text))),
    )}</pre></div>`;
  }

  if (output.output_type === "error") {
    const body = (output.traceback ?? []).map(stripAnsi).join("\n").trim();
    const fallback = `${output.ename ?? "Error"}: ${output.evalue ?? ""}`;
    return `<div class="nb-out nb-out-error"><pre>${textBlock(body || fallback)}</pre></div>`;
  }

  return renderMimeBundle(output.data);
}

export function renderNotebook(nb: Notebook, options: RenderOptions): string {
  svgSerial = 0;
  folding = options.foldOutputs;
  const language = notebookLanguage(nb);
  const body = (nb.cells ?? [])
    .map((cell) => {
      if (cell.cell_type === "markdown") return renderMarkdownCell(cell);
      if (cell.cell_type === "code") return renderCodeCell(cell, language, options);
      if (cell.cell_type === "raw") {
        const raw = text(cell.source).trim();
        return raw ? `<pre>${escapeHtml(raw)}</pre>` : "";
      }
      return "";
    })
    .filter(Boolean)
    .map((html) => `<div class="nb-cell">${html}</div>`)
    .join("");

  const clean = DOMPurify.sanitize(body, {
    ADD_TAGS: ["use", "math", "semantics", "annotation", "mrow", "mi", "mo", "mn", "msup"],
    ADD_DATA_URI_TAGS: ["img", "source"],
  });

  return tidyDocument(clean);
}

/* Two fixes that need a DOM walk rather than string work.

   Markdown cells often point at a file sitting next to the notebook (files/logo.png). Only
   the .ipynb was opened, so that image can never load — left alone it both requests a path
   on this site and prints a broken-image icon.

   Colab wraps every DataFrame in a toolbar of "convert to interactive table" / "suggest
   charts" buttons, each with its own <style> and <script>. The script is already gone, the
   buttons are hidden only by that CSS, and none of it belongs in a document. */
function tidyDocument(html: string): string {
  if (!html.includes("<img") && !html.includes("colab-df") && !html.includes("<table")) return html;

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return html;

  for (const bar of root.querySelectorAll(".colab-df-buttons")) bar.remove();

  for (const table of root.querySelectorAll(".nb-out table")) {
    if (table.parentElement?.classList.contains("nb-table")) continue;
    const wrap = doc.createElement("div");
    wrap.className = "nb-table";
    table.replaceWith(wrap);
    wrap.append(table);
  }

  for (const img of root.querySelectorAll("img")) {
    const src = img.getAttribute("src") ?? "";
    if (/^(data:|https?:|\/\/)/i.test(src)) continue;

    const note = doc.createElement("span");
    note.className = "nb-missing";
    note.textContent = src
      ? `Image stored beside the notebook, not inside it: ${src}`
      : "Image missing from the notebook";
    img.replaceWith(note);
  }

  return root.innerHTML;
}
