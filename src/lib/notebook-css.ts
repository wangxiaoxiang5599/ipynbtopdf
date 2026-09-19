/* The rendered-notebook stylesheet, kept as a string rather than in globals.css because two
   consumers need it: the preview on the page (injected by the root layout) and the standalone
   HTML file the /ipynb-to-html page writes, which has to carry its own copy. One source means
   the download can never drift from what the preview showed.

   Everything here is scoped under .nb-doc / .nb-* / .hljs-* and reads the same custom
   properties as the site; the exported file defines those itself (see export-html.ts). */
export const notebookCss = `
/* ---- rendered notebook document ---- */

.nb-doc {
  font-size: 14px;
  line-height: 1.65;
  color: var(--ink);
}

.nb-cell + .nb-cell {
  margin-top: 1.25rem;
}

.nb-prompt {
  font-family: var(--font-mono-code), ui-monospace, monospace;
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 4px;
}

.nb-md h1,
.nb-md h2,
.nb-md h3,
.nb-md h4 {
  font-weight: 500;
  line-height: 1.3;
  margin: 1.25em 0 0.5em;
  break-after: avoid;
  scroll-margin-top: 80px;
}

.nb-md h1 {
  font-size: 1.75em;
}
.nb-md h2 {
  font-size: 1.4em;
}
.nb-md h3 {
  font-size: 1.15em;
}
.nb-md h4 {
  font-size: 1em;
}
.nb-md > *:first-child {
  margin-top: 0;
}

.nb-md p {
  margin: 0.75em 0;
}

.nb-md ul,
.nb-md ol {
  margin: 0.75em 0;
  padding-left: 1.5em;
}

.nb-md ul {
  list-style: disc;
}
.nb-md ol {
  list-style: decimal;
}

.nb-md blockquote {
  border-left: 3px solid var(--line);
  padding-left: 0.9em;
  color: var(--muted);
  margin: 0.75em 0;
}

.nb-md a {
  color: var(--brand-dark);
  text-decoration: underline;
}

.nb-md img {
  max-width: 100%;
}

.nb-md code {
  font-family: var(--font-mono-code), ui-monospace, monospace;
  font-size: 0.875em;
  background: var(--code-bg);
  border-radius: 4px;
  padding: 0.1em 0.35em;
}

.nb-md pre code {
  background: none;
  padding: 0;
}

.nb-md table,
.nb-out table {
  border-collapse: collapse;
  font-size: 0.85em;
  margin: 0.5em 0;
}

.nb-md th,
.nb-md td,
.nb-out th,
.nb-out td {
  border: 1px solid var(--line);
  padding: 4px 10px;
  text-align: right;
}

.nb-md th,
.nb-out th {
  background: var(--code-bg);
  font-weight: 500;
}

.nb-code {
  background: var(--code-bg);
  border: 1px solid var(--line-soft);
  border-left: 3px solid var(--brand-line);
  border-radius: 6px;
  padding: 10px 14px;
  overflow-x: auto;
}

.nb-code pre,
.nb-md pre {
  font-family: var(--font-mono-code), ui-monospace, monospace;
  font-size: 12.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  tab-size: 4;
}

.nb-md pre {
  background: var(--code-bg);
  border: 1px solid var(--line-soft);
  border-radius: 6px;
  padding: 10px 14px;
  margin: 0.75em 0;
}

.nb-out {
  margin-top: 8px;
  font-size: 12.5px;
  break-inside: avoid;
}

.nb-out pre {
  font-family: var(--font-mono-code), ui-monospace, monospace;
  font-size: 12.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--ink-soft);
  padding: 2px 0;
}

/* KaTeX draws stretchy arrows and wide hats with its own tiny <svg>s, sized in em by its
   stylesheet; forcing height: auto on those collapses them. */
.nb-out img,
.nb-out svg:not(.katex *) {
  max-width: 100%;
  height: auto;
}

/* Wide DataFrames scroll sideways on screen; for paper the Converter measures each one and
   sets --nb-zoom so it shrinks to the page width instead of being cut off. */
.nb-table {
  max-width: 100%;
  overflow-x: auto;
}

@media print {
  .nb-table {
    overflow: visible;
  }
  .nb-table table {
    zoom: var(--nb-zoom, 1);
  }
}

.nb-out-error {
  background: #fdf2f2;
  border: 1px solid #f3d0d0;
  border-radius: 6px;
  padding: 8px 12px;
}

.nb-out-error pre {
  color: #9b2c2c;
}

.nb-fold {
  display: block;
  color: var(--muted);
  font-style: italic;
  padding: 2px 0;
}

.nb-missing {
  display: inline-block;
  border: 1px dashed var(--line);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12.5px;
  color: var(--muted);
}

.nb-tex-raw {
  font-family: var(--font-mono-code), ui-monospace, monospace;
  font-size: 0.875em;
  color: var(--muted);
  background: var(--code-bg);
  border-radius: 4px;
  padding: 0.15em 0.4em;
  white-space: pre-wrap;
}

.nb-out-stderr {
  background: #fdf6ee;
  border-radius: 6px;
  padding: 4px 10px;
}

/* The script preview on /ipynb-to-py: one code block standing in for the whole document. */
.nb-script {
  font-family: var(--font-mono-code), ui-monospace, monospace;
  font-size: 12.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  tab-size: 4;
  color: var(--ink);
}

/* highlight.js tokens, tuned warm */
.hljs-comment,
.hljs-quote {
  color: #8a827a;
  font-style: italic;
}
.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-built_in {
  color: #a0522d;
}
.hljs-string,
.hljs-doctag,
.hljs-regexp {
  color: #4c7a3f;
}
.hljs-number,
.hljs-symbol {
  color: #1f6f8b;
}
.hljs-title,
.hljs-title.function_,
.hljs-section {
  color: #2f5fa8;
}
.hljs-attr,
.hljs-attribute,
.hljs-variable,
.hljs-params {
  color: #6b4e9b;
}
.hljs-meta {
  color: #8a827a;
}
`;
