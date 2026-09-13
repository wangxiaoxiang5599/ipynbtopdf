# ipynbtopdf

**Live at [ipynbtopdf.xyz](https://ipynbtopdf.xyz).**

Converts Jupyter `.ipynb` notebooks to PDF entirely in the browser. No backend, no upload,
no LaTeX toolchain — the notebook is parsed and rendered client-side, then handed to the
browser's own print engine so the PDF keeps real, selectable text.

## Running it

```bash
npm install
npm run dev
```

## How the conversion works

`src/lib/ipynb.ts` is the whole converter:

1. **Parse** — accepts nbformat 4 and upgrades the legacy nbformat 3 layout (cells under
   `worksheets`, `input` instead of `source`, `pyout` instead of `execute_result`, MIME data
   as bare `png`/`latex`/`html` keys).
2. **Render** — Markdown via `markdown-it`, code via `highlight.js`, maths via KaTeX, and
   outputs by MIME preference: `text/html` → `text/latex` → SVG → raster → plain text. LaTeX
   is tried first so a figure that ships both TeX and a bitmap becomes crisp vector maths,
   falling back to the bitmap when KaTeX cannot typeset it.
3. **Sanitize** — DOMPurify, with `<use>` re-allowed (matplotlib draws every marker with it)
   but its references confined to same-document fragments.

## Things that look like bugs but are not

- **Every inlined SVG gets its ids prefixed.** Two exports of one figure carry identical
  element ids; once both are on the page the second figure's `url(#…)` resolves to the first
  one's definitions and it renders blank.
- **A lone `\r` in stream output collapses the line, `\r\n` does not.** The first is a
  progress bar redrawing itself; the second is a Windows line ending.
- **Print margins live in `@page`, not as padding.** Padding applies once across the whole
  flow, which leaves content flush against the paper edge at every page break.
- **`@emnapi/core` and `@emnapi/runtime` are devDependencies nothing imports.** They are
  dependencies of `@img/sharp-wasm32`, which npm lists in the lockfile but whose own
  dependencies it will not resolve while running on Windows. A Linux CI then runs `npm ci`,
  finds them missing, and refuses to install. Declaring them puts them in the lockfile so
  the build host is satisfied. Drop them once the lockfile is generated on Linux.

## Testing

There is no unit suite. The converter is checked against real notebooks — the corpus at
https://github.com/odewahn/ipynb-examples is a good one, and every file in it exercises the
nbformat 3 path.
