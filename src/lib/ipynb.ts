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
};

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

function renderMimeBundle(data: MimeBundle | undefined): string {
  if (!data) return "";

  for (const mime of MIME_ORDER) {
    if (!(mime in data)) continue;
    const value = text(data[mime]);

    if (mime === "image/svg+xml") {
      return `<div class="nb-out">${isolateSvgIds(value)}</div>`;
    }
    if (mime === "text/html") {
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
    return `<div class="nb-out"><pre>${escapeHtml(stripAnsi(value))}</pre></div>`;
  }

  return `<div class="nb-out"><pre>[output of type ${escapeHtml(
    Object.keys(data).join(", ") || "unknown",
  )} cannot be shown in a PDF]</pre></div>`;
}

function renderOutput(output: Output): string {
  if (output.output_type === "stream") {
    const stderr = output.name === "stderr";
    return `<div class="nb-out${stderr ? " nb-out-stderr" : ""}"><pre>${escapeHtml(
      applyCarriageReturns(stripAnsi(text(output.text))),
    )}</pre></div>`;
  }

  if (output.output_type === "error") {
    const body = (output.traceback ?? []).map(stripAnsi).join("\n").trim();
    const fallback = `${output.ename ?? "Error"}: ${output.evalue ?? ""}`;
    return `<div class="nb-out nb-out-error"><pre>${escapeHtml(
      body || fallback,
    )}</pre></div>`;
  }

  return renderMimeBundle(output.data);
}

export function renderNotebook(nb: Notebook, options: RenderOptions): string {
  svgSerial = 0;
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

  return flagUnresolvableImages(clean);
}

/* Markdown cells often point at a file sitting next to the notebook (files/logo.png). Only
   the .ipynb was opened, so that image can never load — left alone it both requests a path
   on this site and prints a broken-image icon. */
function flagUnresolvableImages(html: string): string {
  if (!html.includes("<img")) return html;

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return html;

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
