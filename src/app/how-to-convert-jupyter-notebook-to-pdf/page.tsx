import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to convert a Jupyter notebook to PDF (5 ways)",
  description:
    "Five ways to turn an .ipynb file into a PDF: online converter, Jupyter's menu, nbconvert, webpdf and VS Code — and where each one breaks.",
  alternates: { canonical: "/how-to-convert-jupyter-notebook-to-pdf" },
};

export default function Page() {
  return (
    <article className="prose-page mx-auto my-10 max-w-3xl px-6 py-10 sm:my-14 sm:px-12 sm:py-12">
      <h1 className="text-[40px] font-semibold leading-[1.15] tracking-tight text-ink">
        How to convert a Jupyter notebook to PDF
      </h1>
      <p className="mt-4 text-[19px] leading-relaxed text-muted">
        There are five routes from <code>.ipynb</code> to PDF. They differ mostly in what
        you have to install first, and in how badly they fail when something is missing.
      </p>

      <h2>1. Use an online converter</h2>
      <p>
        The fastest route if you do not want to install anything. Drop the file on the{" "}
        <Link href="/">converter on the home page</Link>, check the preview, and save. The
        notebook is parsed by JavaScript in your own browser, so nothing is uploaded and
        no TeX distribution is involved.
      </p>
      <p>
        Worth knowing: the final PDF is written by your browser&rsquo;s print engine, so
        you pick <strong>Save as PDF</strong> as the destination in the print dialog. The
        upside is that the text stays selectable and searchable instead of being flattened
        into a picture.
      </p>

      <h2>2. Jupyter&rsquo;s own menu</h2>
      <p>
        In JupyterLab: <code>File → Save and Export Notebook As → PDF</code>. In classic
        Notebook: <code>File → Download as → PDF via LaTeX</code>.
      </p>
      <p>
        This calls nbconvert behind the scenes, which calls LaTeX. On a fresh machine it
        usually fails, because a full TeX distribution is roughly a 2 GB install that
        Jupyter does not ship with. If you got here after seeing{" "}
        <code>500 : Internal Server Error</code> or{" "}
        <code>nbconvert failed: xelatex not found</code>, that is why — see{" "}
        <Link href="/fix-nbconvert-pdf-error">fixing nbconvert PDF errors</Link>.
      </p>

      <h2>3. nbconvert on the command line</h2>
      <p>The classic LaTeX route:</p>
      <pre>
        <code>jupyter nbconvert --to pdf notebook.ipynb</code>
      </pre>
      <p>
        Requires nbconvert, Pandoc, and XeLaTeX. It produces genuinely beautiful,
        typeset output — the best of any option here — and it is the right choice for a
        thesis or a paper. It is the wrong choice when you just need to hand a notebook to
        someone this afternoon.
      </p>

      <h2>4. nbconvert&rsquo;s webpdf exporter</h2>
      <p>Same tool, no LaTeX — it drives a headless Chromium instead:</p>
      <pre>
        <code>
          pip install &quot;nbconvert[webpdf]&quot;{"\n"}
          jupyter nbconvert --to webpdf --allow-chromium-download notebook.ipynb
        </code>
      </pre>
      <p>
        This is the most reliable command-line option and the one to reach for when the
        LaTeX route keeps failing. It downloads a browser on first use, so the first run is
        slow and needs network access.
      </p>

      <h2>5. VS Code</h2>
      <p>
        VS Code can open <code>.ipynb</code> files natively, but its export menu also
        leans on nbconvert, so it inherits the same LaTeX dependency. The workaround that
        always works is <code>Export → HTML</code>, then open the HTML file in a browser
        and print it to PDF.
      </p>

      <h2>Which one should you use</h2>
      <ul>
        <li>
          <strong>Handing in coursework or sharing a report</strong> — online converter, or
          webpdf if you like the terminal.
        </li>
        <li>
          <strong>A thesis, a paper, anything typeset</strong> — nbconvert with LaTeX.
        </li>
        <li>
          <strong>Confidential or client work</strong> — a browser-based converter that
          never uploads, or a local command-line tool. Avoid services that upload the file
          to a server.
        </li>
        <li>
          <strong>Automating it in CI</strong> — <code>--to webpdf</code>, since it needs
          no interactive dialog.
        </li>
      </ul>

      <h2>Getting a clean-looking PDF</h2>
      <p>
        Whichever route you take, a few things make the result read better. Restart the
        kernel and run all cells before exporting, so the numbering is consistent and no
        stale output sneaks in. Clear any cell that dumps hundreds of rows — a truncated{" "}
        <code>head()</code> reads far better on paper. And if the audience does not need
        the implementation, hide the code cells entirely: the{" "}
        <Link href="/">converter</Link> has a toggle for that, and the result reads like a
        report rather than a transcript.
      </p>
    </article>
  );
}
