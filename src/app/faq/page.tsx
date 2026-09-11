import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ipynb to PDF: frequently asked questions",
  description:
    "Privacy, file size, math rendering, hiding code cells, page breaks and what happens to interactive outputs when you convert a Jupyter notebook to PDF.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "Is my notebook uploaded to a server?",
    a: "No. The file is read with the browser's file API and rendered by JavaScript on your machine. There is no upload endpoint, so the notebook cannot leave your computer — which also means you can use this on work that is not allowed to go to a third-party service. One honest caveat: if a Markdown cell links an image hosted on the web, your browser fetches that image from wherever it lives, exactly as Jupyter itself does. Images stored inside the notebook never cause a request.",
  },
  {
    q: "Do I need Python, LaTeX or nbconvert installed?",
    a: "No. Nothing is installed and nothing is executed. The notebook is treated as a document: its cells and their saved outputs are rendered as they were when you last ran them.",
  },
  {
    q: "Why does Download PDF open a print dialog?",
    a: "Because your browser's print engine is the best PDF writer available without a server. It produces real, selectable, searchable text and sane page breaks. The alternative — screenshotting the page into an image-based PDF — gives you a file where you cannot select a single line of code. Choose 'Save as PDF' as the destination and the file is written straight to disk.",
  },
  {
    q: "Can I export the notebook without code cells?",
    a: "Yes. Turn off the Code toggle and the PDF contains only Markdown and results. This is the usual choice when the reader cares about findings rather than implementation.",
  },
  {
    q: "Are LaTeX equations supported?",
    a: "Yes. Inline math with $…$ or \\(…\\) and display math with $$…$$ or \\[…\\] are rendered with KaTeX. Dollar signs inside code blocks are left alone, so shell snippets are not mistaken for equations.",
  },
  {
    q: "What about plots and DataFrames?",
    a: "Anything the notebook saved as output is rendered: matplotlib PNGs and SVGs, pandas DataFrame tables, stdout, stderr and error tracebacks. Outputs are read from the file, so a cell that was never run has nothing to show.",
  },
  {
    q: "What happens to interactive widgets and Plotly charts?",
    a: "Anything that needs JavaScript to draw itself cannot exist in a PDF — this is true of every notebook-to-PDF tool, including nbconvert. If a static image was saved alongside the widget, that image is used. The fix is to save such figures as static images in the notebook before exporting.",
  },
  {
    q: "How large a notebook can it handle?",
    a: "The limit is your browser's memory rather than a server quota. Notebooks with hundreds of embedded images are the slow case, since every image is base64 data inside the file itself.",
  },
  {
    q: "Is it really free?",
    a: "Yes — no account, no file limit, no watermark. There is no server doing the conversion, so there is no per-file cost to pass on.",
  },
];

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="prose-page mx-auto max-w-2xl px-5 pt-14 pb-4">
        <h1 className="text-[40px] font-semibold leading-[1.15] tracking-tight text-ink">
          Questions about converting notebooks
        </h1>

        <dl className="mt-9 divide-y divide-line-soft border-t border-line-soft">
          {faqs.map((item) => (
            <div key={item.q} className="py-6">
              <dt className="text-[19px] font-semibold text-ink">{item.q}</dt>
              <dd className="mt-2 text-[17px] leading-relaxed text-ink-soft">{item.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-[17px] text-ink-soft">
          Something not answered here? The{" "}
          <Link href="/how-to-convert-jupyter-notebook-to-pdf">
            comparison of the five export routes
          </Link>{" "}
          and the{" "}
          <Link href="/fix-nbconvert-pdf-error">nbconvert error guide</Link> cover the
          command-line side.
        </p>
      </article>
    </>
  );
}
