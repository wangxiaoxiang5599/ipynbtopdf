import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fix nbconvert PDF errors: xelatex, pandoc, 500",
  description:
    "Why 'jupyter nbconvert --to pdf' fails and how to fix it: xelatex not found, pandoc missing, 500 Internal Server Error, CJK characters.",
  alternates: { canonical: "/fix-nbconvert-pdf-error" },
};

const errors = [
  {
    message: "nbconvert failed: xelatex not found on PATH",
    cause:
      "nbconvert's PDF exporter renders through LaTeX, and no LaTeX engine is installed. Jupyter does not ship one.",
    fix: "Install a TeX distribution — MiKTeX on Windows, MacTeX on macOS, TeX Live on Linux — then reopen your terminal so PATH picks it up. Or skip LaTeX entirely with the webpdf exporter below.",
  },
  {
    message: "500 : Internal Server Error (when exporting from the Jupyter menu)",
    cause:
      "The same missing-LaTeX problem, surfaced through the web UI, which swallows the real message. The actual error is in the terminal running the Jupyter server.",
    fix: "Look at that terminal for the real cause. It is almost always a missing xelatex or pandoc.",
  },
  {
    message: "Pandoc wasn't found / pandoc: command not found",
    cause:
      "nbconvert converts Markdown cells through Pandoc, which is a separate binary and is not installed by pip.",
    fix: "Install Pandoc from pandoc.org, or with conda: conda install -c conda-forge pandoc.",
  },
  {
    message: "PDF creating failed, captured latex output: ... Undefined control sequence",
    cause:
      "A Markdown or output cell contains a character LaTeX cannot typeset — often an emoji, a box-drawing character from a progress bar, or CJK text under the default font.",
    fix: "Find and remove the offending character, or export through webpdf, which has no such restriction.",
  },
  {
    message: "Everything runs, but the PDF has garbled or missing CJK characters",
    cause:
      "The default LaTeX template uses a font with no Chinese, Japanese or Korean glyphs.",
    fix: "Either pass a CJK-capable template to nbconvert, or use webpdf — the browser already has the fonts.",
  },
];

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: errors.map((item) => ({
      "@type": "Question",
      name: item.message,
      acceptedAnswer: { "@type": "Answer", text: `${item.cause} ${item.fix}` },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="prose-page mx-auto my-10 max-w-3xl px-6 py-10 sm:my-14 sm:px-12 sm:py-12">
        <h1 className="text-[40px] font-semibold leading-[1.15] tracking-tight text-ink">
          Fixing nbconvert PDF export errors
        </h1>
        <p className="mt-4 text-[19px] leading-relaxed text-muted">
          Almost every one of these comes down to the same thing:{" "}
          <code>--to pdf</code> is not a PDF writer, it is a LaTeX writer. It renders your
          notebook to a <code>.tex</code> file and then asks a TeX engine to typeset it. If
          that engine is missing or unhappy, the export dies — usually with a message that
          says nothing about LaTeX.
        </p>

        <h2>The errors, one by one</h2>
        {errors.map((item) => (
          <div key={item.message} className="mt-7">
            <h3 className="font-mono text-[15px] leading-relaxed text-ink">
              {item.message}
            </h3>
            <p className="mt-1.5">
              <span className="text-ink">Why: </span>
              {item.cause}
            </p>
            <p>
              <span className="text-ink">Fix: </span>
              {item.fix}
            </p>
          </div>
        ))}

        <h2>The fix that works for all of them</h2>
        <p>
          If you do not specifically need LaTeX typesetting, stop fighting it and render
          through a browser instead:
        </p>
        <pre>
          <code>
            pip install &quot;nbconvert[webpdf]&quot;{"\n"}
            jupyter nbconvert --to webpdf --allow-chromium-download notebook.ipynb
          </code>
        </pre>
        <p>
          Same tool, same notebook, no TeX distribution. The first run downloads a headless
          Chromium, so it is slow once and fast after.
        </p>

        <h2>Or skip the toolchain entirely</h2>
        <p>
          If you only need the PDF and not a repeatable pipeline, the{" "}
          <Link href="/">browser converter on the home page</Link> does the same job with
          nothing installed. It reads the notebook locally, renders Markdown, syntax
          highlighting, KaTeX math and image outputs, and hands it to your browser&rsquo;s
          own PDF writer. Nothing is uploaded, which also makes it usable for work you are
          not allowed to send to a third-party server.
        </p>

        <h2>Still stuck on LaTeX</h2>
        <p>
          When you genuinely need the LaTeX output, export the intermediate file and read
          the real error:
        </p>
        <pre>
          <code>jupyter nbconvert --to latex notebook.ipynb</code>
        </pre>
        <p>
          Then run <code>xelatex notebook.tex</code> by hand. The TeX log names the line
          and the character that broke it, which nbconvert&rsquo;s wrapper does not.
        </p>
      </article>
    </>
  );
}
