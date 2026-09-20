import Link from "next/link";
import type { Metadata } from "next";
import { Converter } from "@/components/Converter";
import { site } from "@/lib/site";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "IPYNB Viewer — open and view Jupyter notebooks online, no upload",
  description:
    "Open any .ipynb file in your browser and read it like a document — from a file or a GitHub link. No Jupyter, no Python, no upload. Save as PDF, HTML or .py.",
  alternates: { canonical: "/ipynb-viewer" },
  openGraph: {
    title: "IPYNB Viewer — open and view Jupyter notebooks online, no upload",
    url: `${site.url}/ipynb-viewer`,
  },
};

const badges = [
  { label: "No upload", icon: "shield" },
  { label: "No account", icon: "user" },
  { label: "No install", icon: "bolt" },
  { label: "Open source", icon: "code" },
] as const;

const methods = [
  {
    name: "This viewer",
    install: "Nothing",
    run: "No",
    large: "Yes, limited by your browser's memory",
    private: "Stays on your computer",
  },
  {
    name: "Jupyter / JupyterLab",
    install: "Python + Jupyter",
    run: "Yes",
    large: "Yes",
    private: "Stays on your computer",
  },
  {
    name: "VS Code",
    install: "VS Code + Jupyter extension (+ Python to run)",
    run: "Yes, with a kernel",
    large: "Yes",
    private: "Stays on your computer",
  },
  {
    name: "Google Colab",
    install: "A Google account",
    run: "Yes",
    large: "Yes",
    private: "Uploaded to Google Drive",
  },
  {
    name: "GitHub's file view",
    install: "Nothing",
    run: "No",
    large: "Often “Sorry, something went wrong” or truncated",
    private: "Only if the repo is",
  },
];

const cans = [
  {
    title: "Read it",
    body: "Markdown, highlighted code, LaTeX maths, plots, DataFrames and printed output, in the order they were saved. An outline of the headings sits beside it for long notebooks.",
  },
  {
    title: "Show only what you need",
    body: "Hide the code to read the write-up, hide the outputs to review the code, or show the In [n] labels to follow the execution order.",
  },
  {
    title: "Keep a copy",
    body: "Save it as a PDF, a single HTML file or a .py script. The notebook goes straight to the converter, already loaded.",
  },
];

const cannots = [
  "Run cells. Nothing executes here; you see the outputs that were saved in the file.",
  "Edit cells. This is a reader. To change the notebook, open it in Jupyter or VS Code.",
  "Show widgets and interactive charts. They need a running kernel; a static image is shown when one was saved.",
];

const faqs = [
  {
    q: "How do I open an .ipynb file without Jupyter or Python?",
    a: "Drop the file on this page, or paste a link to it. It is rendered by JavaScript in your browser, so nothing needs installing and nothing is sent anywhere.",
  },
  {
    q: "Is my notebook uploaded?",
    a: "No. When you choose a file, your browser reads it locally. When you paste a link, your browser fetches it from that address directly. This site has no server that receives files.",
  },
  {
    q: "What is an .ipynb file?",
    a: "A Jupyter notebook. Inside it is JSON: a list of cells, each either Markdown text or code, and for code cells the outputs that were saved the last time it ran — text, tables, images as base64. That is why it opens in a text editor as a wall of braces, and why a viewer is needed to read it.",
  },
  {
    q: "Can I open a notebook from GitHub?",
    a: "Yes. Paste the notebook's GitHub address — the one in your browser's bar when you are looking at it — and click Open link. Gist links work too. The link is turned into the raw file address and your browser fetches it. Private repositories can't be read this way; download the file and open it here.",
  },
  {
    q: "GitHub says “Sorry, something went wrong. Reload?” on my notebook",
    a: "GitHub's own renderer gives up on large notebooks and on some outputs. Paste the same link here instead. This viewer reads the file itself, so the size limit is your browser's memory, not GitHub's render budget.",
  },
  {
    q: "Can I run or edit the notebook here?",
    a: "No. This is a reader. Running code needs a kernel, which means Python on a machine somewhere; editing needs Jupyter or VS Code. What you can do here is read, hide code or outputs, and save a copy as PDF, HTML or a script.",
  },
  {
    q: "Does it work with Google Colab and Kaggle notebooks?",
    a: "Yes. Both save standard .ipynb files. In Colab use File → Download → .ipynb; in Kaggle use File → Download Notebook. Then open the file here.",
  },
  {
    q: "Is there a size limit?",
    a: "Only your browser's memory. Notebooks with hundreds of embedded images are the slow case. There is no upload, so there is no upload limit.",
  },
  {
    q: "Is it free?",
    a: "Yes. No account, no watermark, no limit on how many you open. The code is open source under the MIT licence.",
  },
];

export default function IpynbViewer() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ipynbtopdf — IPYNB viewer",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      url: `${site.url}/ipynb-viewer`,
      description:
        "Free browser-based viewer that opens Jupyter notebook .ipynb files from disk or a GitHub link without uploading them.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: "https://opensource.org/licenses/MIT",
      sameAs: site.repo,
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

      <div className="mx-auto max-w-6xl px-5">
        <section className="print-hide pt-12 pb-10 text-center sm:pt-16">
          <h1 className="text-[34px] leading-[1.15] font-semibold text-ink sm:text-[42px] sm:leading-[52px]">
            Open and view .ipynb files online
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[19px] leading-snug text-ink-soft sm:text-[22px] sm:leading-8">
            Read a Jupyter notebook in your browser, from a file or a GitHub link. No Python,
            no Jupyter, and the file never leaves your computer.
          </p>
        </section>

        <section className="print-area">
          <Converter mode="view" />
        </section>

        <section className="print-hide mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-3 text-[15px] text-ink-soft">
          {badges.map((badge) => (
            <span key={badge.label} className="inline-flex items-center gap-2">
              <Icon name={badge.icon} size={18} />
              {badge.label === "Open source" ? (
                <a href={site.repo} className="hover:text-brand">
                  {badge.label}
                </a>
              ) : (
                badge.label
              )}
            </span>
          ))}
        </section>

        <section className="print-hide mt-28">
          <div className="text-center">
            <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
              What an .ipynb file is
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
              A Jupyter notebook is a JSON file. Open one in a text editor and this is what you
              get: a list of cells, each with its type, its source, and — for code — the outputs
              saved the last time it ran. Images are in there as base64 text, which is why a
              notebook with a few plots is megabytes long and why it needs a viewer.
            </p>
          </div>
          <pre className="mx-auto mt-8 max-w-3xl overflow-x-auto rounded-2xl border border-line bg-surface px-6 py-5 font-mono text-[13px] leading-relaxed text-ink">
{`{
  "cells": [
    { "cell_type": "markdown", "source": ["# Housing price analysis"] },
    { "cell_type": "code",
      "execution_count": 1,
      "source": ["df = pd.read_csv(\\"ames.csv\\")\\n", "df.head()"],
      "outputs": [{ "output_type": "execute_result",
                    "data": { "text/html": ["<table>...</table>"] } }] }
  ],
  "metadata": { "kernelspec": { "display_name": "Python 3" } },
  "nbformat": 4
}`}
          </pre>
        </section>

        <section className="print-hide mt-24">
          <div className="text-center">
            <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
              Five ways to open an .ipynb file
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
              To read a notebook you need a renderer; to run or edit it you need a kernel, which
              means Python somewhere. Pick by what you want to do with it.
            </p>
          </div>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[760px] text-left text-[15px]">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-4 font-medium">Method</th>
                  <th className="px-5 py-4 font-medium">Needs installing</th>
                  <th className="px-5 py-4 font-medium">Can run code</th>
                  <th className="px-5 py-4 font-medium">Large notebooks</th>
                  <th className="px-5 py-4 font-medium">Your file</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {methods.map((m, index) => (
                  <tr key={m.name} className={index === 0 ? "bg-brand-soft" : undefined}>
                    <td className="px-5 py-4 font-medium text-ink">{m.name}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.install}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.run}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.large}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.private}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="print-hide mt-24 text-center">
          <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
            What you can do here
          </h2>
          <div className="mt-10 grid gap-5 text-left sm:grid-cols-3">
            {cans.map((item) => (
              <div key={item.title} className="card">
                <h3 className="text-[20px] font-medium text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-3xl text-left">
            <p className="text-[15px] font-medium text-ink">And what you can&rsquo;t</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-muted">
              {cannots.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <p className="mt-8 text-[16px] text-ink-soft">
            Straight to a converter instead?{" "}
            <Link href="/" className="font-medium text-brand-dark hover:underline">
              PDF
            </Link>
            {" · "}
            <Link href="/ipynb-to-html" className="font-medium text-brand-dark hover:underline">
              HTML
            </Link>
            {" · "}
            <Link href="/ipynb-to-py" className="font-medium text-brand-dark hover:underline">
              Python script
            </Link>
          </p>
        </section>

        <section className="print-hide mt-24">
          <div className="card mx-auto max-w-3xl sm:p-10">
            <h2 className="text-[26px] font-semibold text-ink sm:text-[30px]">
              How it works, and why you can trust it
            </h2>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-ink-soft">
              <p>
                The viewer is JavaScript running in this page. Markdown is rendered with
                markdown-it, code is highlighted with highlight.js, equations are typeset with
                KaTeX, and the result is sanitised with DOMPurify before it is shown. A pasted
                link is fetched by your browser from that address; the file passes from the host
                to you and nowhere else.
              </p>
              <p>
                <a href={site.repo} className="font-medium text-brand-dark hover:underline">
                  The source is on GitHub
                </a>{" "}
                under the MIT licence, and the site is a static export with no server behind it.
              </p>
            </div>
          </div>
        </section>

        <section className="print-hide mt-24">
          <h2 className="text-center text-[30px] font-semibold text-ink sm:text-[34px]">
            Questions
          </h2>
          <dl className="mx-auto mt-10 max-w-3xl divide-y divide-line-soft rounded-2xl border border-line bg-surface px-6 sm:px-8">
            {faqs.map((item) => (
              <div key={item.q} className="py-6">
                <dt className="text-[18px] font-medium text-ink">{item.q}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
