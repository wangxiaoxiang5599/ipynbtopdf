import Link from "next/link";
import type { Metadata } from "next";
import { Converter } from "@/components/Converter";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "ipynb to PDF — convert Jupyter notebooks online, free",
  description:
    "Convert .ipynb Jupyter notebooks to PDF in your browser. Keeps Markdown, code highlighting, LaTeX math, plots and tables. No upload, no install.",
  alternates: { canonical: "/" },
};

const keeps = [
  { title: "Markdown", body: "Headings, lists, tables, images." },
  { title: "Code", body: "Highlighted, in Python, R, Julia and more." },
  { title: "Math", body: "LaTeX equations, rendered properly." },
  { title: "Plots", body: "Charts, DataFrames, printed output." },
];

const steps = [
  { title: "Pick your file", body: "Choose a notebook, or drop it on the page." },
  { title: "Check it", body: "Hide the code if you only want the write-up." },
  { title: "Save as PDF", body: "Your browser writes the file." },
];

const faqs = [
  {
    q: "Is my notebook uploaded?",
    a: "No. It is read and converted on your own computer. Nothing is sent anywhere, so private work stays private.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. No Python, no LaTeX, no account. Just the browser you are already using.",
  },
  {
    q: "Can I leave the code out?",
    a: "Yes. Turn off the Code switch and the PDF shows only your text and results.",
  },
  {
    q: "Can I still select text in the PDF?",
    a: "Yes. It is real text, so you can copy and search it — not a picture of a page.",
  },
];

export default function Home() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ipynbtopdf",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      url: site.url,
      description:
        "Free browser-based converter that turns Jupyter notebook .ipynb files into PDF without uploading them.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-5">
        <section className="print-hide pt-12 pb-9 text-center sm:pt-16">
          <h1 className="text-[42px] leading-[1.1] font-semibold tracking-tight text-ink sm:text-[58px]">
            Convert ipynb to PDF
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[19px] leading-snug text-muted">
            Free, and your file never leaves your computer.
          </p>
        </section>

        <section className="print-area mx-auto max-w-3xl">
          <Converter />
        </section>

        <section className="print-hide mx-auto mt-7 flex max-w-3xl flex-wrap justify-center gap-x-9 gap-y-2 text-[15px] text-muted">
          <span>No upload</span>
          <span>No account</span>
          <span>No install</span>
        </section>

        <section className="print-hide mt-24">
          <h2 className="text-[30px] font-semibold tracking-tight text-ink">
            Your notebook, kept intact
          </h2>
          <div className="mt-7 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {keeps.map((item) => (
              <div key={item.title} className="bg-surface px-6 py-6">
                <h3 className="text-[18px] font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-[16px] leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="print-hide mt-20">
          <h2 className="text-[30px] font-semibold tracking-tight text-ink">
            Three steps
          </h2>
          <ol className="mt-7 grid gap-7 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="font-mono text-[15px] text-brand">{index + 1}</span>
                <h3 className="mt-1.5 text-[18px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-1 text-[16px] leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-[16px] text-ink-soft">
            <Link
              href="/how-to-convert-jupyter-notebook-to-pdf"
              className="text-brand-dark underline underline-offset-2"
            >
              All five ways to export a notebook
            </Link>
          </p>
        </section>

        <section className="print-hide mt-20">
          <h2 className="text-[30px] font-semibold tracking-tight text-ink">Questions</h2>
          <dl className="mt-7 divide-y divide-line-soft border-t border-line-soft">
            {faqs.map((item) => (
              <div key={item.q} className="py-6">
                <dt className="text-[18px] font-semibold text-ink">{item.q}</dt>
                <dd className="mt-2 max-w-2xl text-[16px] leading-relaxed text-muted">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-[16px] text-ink-soft">
            <Link
              href="/fix-nbconvert-pdf-error"
              className="text-brand-dark underline underline-offset-2"
            >
              Getting an error from nbconvert instead?
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
