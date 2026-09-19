import { notebookCss } from "./notebook-css";

const KATEX_CSS = "https://cdn.jsdelivr.net/npm/katex@0.18.7/dist/katex.min.css";

/* The values the notebook stylesheet reads from the site's :root. The exported file has no
   site around it, so it carries its own copy. The mono stack drops JetBrains Mono: the site
   self-hosts that font and a file opened from a desktop cannot reach it. */
const rootVars = `
:root {
  --bg: #f5f5fa;
  --surface: #ffffff;
  --ink: #33333b;
  --ink-soft: #47474f;
  --muted: #707078;
  --line: #d6d6df;
  --line-soft: #e8e8ef;
  --brand: #f37726;
  --brand-dark: #d8621a;
  --brand-line: #f5a76c;
  --code-bg: #f5f5fa;
  --font-mono-code: ui-monospace, "Cascadia Mono", "SF Mono", Menlo, Consolas, monospace;
}
html {
  background: var(--bg);
}
body {
  margin: 0;
  padding: 40px 20px;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--ink-soft);
}
.nb-page {
  max-width: 900px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 40px;
}
@media (max-width: 640px) {
  body { padding: 16px 8px; }
  .nb-page { padding: 20px 16px; }
}
@media print {
  html { background: #fff; }
  body { padding: 0; }
  .nb-page { max-width: none; border: 0; border-radius: 0; padding: 0; }
}
`;

export type HtmlExportKind = "page" | "fragment";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** The rendered notebook as it should be pasted into another page: just the document div. */
export function fragmentHtml(body: string): string {
  return `<div class="nb-doc">\n${body}\n</div>`;
}

/** A complete, self-contained .html file: styles inline, KaTeX linked only when maths is present. */
export function standaloneHtml(title: string, body: string): string {
  const hasMath = body.includes('class="katex');
  const katex = hasMath ? `\n<link rel="stylesheet" href="${KATEX_CSS}">` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="generator" content="ipynbtopdf.xyz">${katex}
<style>${rootVars}${notebookCss}</style>
</head>
<body>
<main class="nb-page">
${fragmentHtml(body)}
</main>
</body>
</html>
`;
}

export function downloadText(fileName: string, text: string, type = "text/html"): void {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  /* Revoking synchronously races the click in Firefox; a tick is plenty. */
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
