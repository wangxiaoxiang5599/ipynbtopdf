import Link from "next/link";
import type { Metadata } from "next";
import { Converter } from "@/components/Converter";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  /* "converter" is its own query (ipynb to pdf converter) and every competing page carries
     it in the title; the H1 keeps the plain phrase people actually type. */
  title: "IPYNB to PDF Converter — free, in your browser, no upload",
  description:
    "Convert .ipynb Jupyter notebooks to PDF in your browser. Keeps Markdown, code highlighting, LaTeX math, plots and tables. No upload, no account, no LaTeX. Open source.",
  alternates: { canonical: "/" },
};

const keeps = [
  { title: "Markdown", body: "Headings, lists, tables, images." },
  { title: "Code", body: "Highlighted, in Python, R, Julia and more." },
  { title: "Math", body: "LaTeX equations, rendered properly." },
  { title: "Plots", body: "Charts, DataFrames, printed output." },
];

const steps = [
  {
    title: "Pick your file",
    body: "Choose a notebook, or drop it on the page. It works with notebooks saved from Jupyter, JupyterLab, Colab, Kaggle and VS Code.",
  },
  {
    title: "Check it",
    body: "The notebook is shown exactly as the PDF will look. Hide the code if you only want the write-up.",
  },
  {
    title: "Save as PDF",
    body: "Your browser writes the file. Pick the paper size and margins in the print dialog.",
  },
];

const methods = [
  {
    name: "This converter",
    install: "Nothing",
    hideCode: "One switch",
    offline: "Yes, once loaded",
    failure: "None to speak of",
  },
  {
    name: "Jupyter menu (PDF via LaTeX)",
    install: "TeX distribution, ~2 GB",
    hideCode: "No",
    offline: "Yes",
    failure: "500 error, xelatex not found",
  },
  {
    name: "nbconvert --to pdf",
    install: "nbconvert, Pandoc, XeLaTeX",
    hideCode: "--no-input flag",
    offline: "Yes",
    failure: "Missing TeX packages, wide tables",
  },
  {
    name: "nbconvert --to webpdf",
    install: "nbconvert + a Chromium download",
    hideCode: "--no-input flag",
    offline: "After first run",
    failure: "Chromium download blocked",
  },
  {
    name: "VS Code export",
    install: "Same as nbconvert",
    hideCode: "No",
    offline: "Yes",
    failure: "Export failed, see Jupyter output",
  },
];

const sources = [
  {
    title: "Google Colab",
    body: "File → Download → Download .ipynb. Then drop that file here. Colab's own Print gives you a PDF of the browser window, with the sidebar in it.",
  },
  {
    title: "VS Code",
    body: "The notebook you are editing already is an .ipynb on disk. Drop it here when Export → PDF fails on the LaTeX step.",
  },
  {
    title: "Kaggle",
    body: "File → Download Notebook. Kaggle has no PDF export at all, so this is the whole route.",
  },
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
    q: "How do I convert ipynb to PDF without LaTeX?",
    a: "Use this page. The notebook is rendered as HTML by JavaScript and the PDF is written by your browser's print engine, so no TeX distribution is involved at any point. The other LaTeX-free route is nbconvert's webpdf exporter, which needs Python and a Chromium download.",
  },
  {
    q: "Can I leave the code out?",
    a: "Yes. Turn off the Code switch and the PDF shows only your text and results. This is the equivalent of nbconvert's --no-input, without the command line.",
  },
  {
    q: "Does it work with Google Colab notebooks?",
    a: "Yes. Download the notebook from Colab with File → Download → .ipynb, then open it here. Colab saves standard nbformat 4 files, and outputs that were run in Colab are included.",
  },
  {
    q: "Why does Save as PDF open a print dialog?",
    a: "Because the browser's print engine is the best PDF writer that exists without a server. Choose Save as PDF as the destination; the file is written straight to disk with real, selectable text.",
  },
  {
    q: "Can I still select text in the PDF?",
    a: "Yes. It is real text, so you can copy and search it — not a picture of a page.",
  },
  {
    q: "Can I change the paper size or margins?",
    a: "Yes. A4 or Letter, portrait or landscape, and the margins are all set in the print dialog, the same place you choose Save as PDF.",
  },
  {
    q: "What about Plotly charts and widgets?",
    a: "Anything that needs JavaScript to draw itself cannot exist in a PDF, with this tool or any other. If the notebook saved a static image next to the widget, that image is used.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. Once the page has loaded, you can disconnect and keep converting. There is no server to talk to.",
  },
  {
    q: "Is there a file size limit?",
    a: "Only your browser's memory. Notebooks with hundreds of embedded images are the slow case, since each image is base64 text inside the file.",
  },
  {
    q: "Is it free?",
    a: "Yes. No account, no watermark, no file limit. The conversion runs on your machine, so there is no cost to pass on. The code is open source under the MIT licence.",
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
          <a href={site.repo} className="underline underline-offset-2 hover:text-ink">
            Open source
          </a>
        </section>

        <section className="print-hide mt-24">
          <h2 className="text-[30px] font-semibold tracking-tight text-ink">
            Your notebook, kept intact
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-muted">
            An <code className="font-mono text-[15px]">.ipynb</code> file is JSON: a list of
            cells, each holding Markdown or code, plus whatever output the code produced when
            it last ran. This converter renders all of it — the same cells, in the same order,
            with the outputs that were saved in the file.
          </p>
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
                <span className="font-mono text-[15px] text-brand-dark">{index + 1}</span>
                <h3 className="mt-1.5 text-[18px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-1 text-[16px] leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="print-hide mt-20">
          <h2 className="text-[30px] font-semibold tracking-tight text-ink">
            Five ways to turn a notebook into a PDF
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-muted">
            Every other route goes through nbconvert, and nbconvert&rsquo;s PDF exporter goes
            through LaTeX. That is where most of them fail on a machine that has never had
            TeX installed.
          </p>
          <div className="mt-7 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[640px] text-left text-[15px]">
              <thead className="bg-surface text-muted">
                <tr className="border-b border-line">
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Needs installing</th>
                  <th className="px-4 py-3 font-medium">Hide code</th>
                  <th className="px-4 py-3 font-medium">Works offline</th>
                  <th className="px-4 py-3 font-medium">Usual failure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {methods.map((m) => (
                  <tr key={m.name} className="bg-surface">
                    <td className="px-4 py-3 font-medium text-ink">{m.name}</td>
                    <td className="px-4 py-3 text-ink-soft">{m.install}</td>
                    <td className="px-4 py-3 text-ink-soft">{m.hideCode}</td>
                    <td className="px-4 py-3 text-ink-soft">{m.offline}</td>
                    <td className="px-4 py-3 text-ink-soft">{m.failure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-[16px] text-ink-soft">
            <Link
              href="/how-to-convert-jupyter-notebook-to-pdf"
              className="text-brand-dark underline underline-offset-2"
            >
              Each method, step by step
            </Link>
            {" · "}
            <Link
              href="/fix-nbconvert-pdf-error"
              className="text-brand-dark underline underline-offset-2"
            >
              Fixing nbconvert errors
            </Link>
          </p>
        </section>

        <section className="print-hide mt-20">
          <h2 className="text-[30px] font-semibold tracking-tight text-ink">
            From Colab, VS Code or Kaggle
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-muted">
            Wherever the notebook lives, the route is the same: get the{" "}
            <code className="font-mono text-[15px]">.ipynb</code> file onto your disk, then
            open it here.
          </p>
          <div className="mt-7 grid gap-7 sm:grid-cols-3">
            {sources.map((item) => (
              <div key={item.title}>
                <h3 className="text-[18px] font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-[16px] leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="print-hide mt-20">
          <h2 className="text-[30px] font-semibold tracking-tight text-ink">
            How it works, and why you can trust it
          </h2>
          <div className="mt-3 max-w-2xl space-y-4 text-[17px] leading-relaxed text-muted">
            <p>
              The whole converter is JavaScript running in this page. Markdown is rendered
              with markdown-it, code is highlighted with highlight.js, equations are typeset
              with KaTeX, and the result is sanitised with DOMPurify before it is shown. There
              is no upload endpoint — not a private one, not an optional one — so the file
              cannot leave your machine.
            </p>
            <p>
              You do not have to take that on faith:{" "}
              <a
                href={site.repo}
                className="text-brand-dark underline underline-offset-2"
              >
                the source is on GitHub
              </a>{" "}
              under the MIT licence, and the site is a static export with no server behind
              it. If your employer does not allow notebooks on third-party services, this is
              the converter you can still use.
            </p>
          </div>
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
            <Link href="/faq" className="text-brand-dark underline underline-offset-2">
              More questions, answered in detail
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
