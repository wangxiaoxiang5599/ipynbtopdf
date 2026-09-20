import Link from "next/link";
import type { Metadata } from "next";
import { Converter } from "@/components/Converter";
import { site } from "@/lib/site";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  /* "converter" is its own query (ipynb to pdf converter) and every competing page carries
     it in the title; the H1 keeps the plain phrase people actually type. */
  title: "IPYNB to PDF Converter — free, in your browser, no upload",
  description:
    "Convert .ipynb Jupyter notebooks to PDF in your browser. Keeps Markdown, code highlighting, LaTeX math, plots and tables. No upload, no account, no LaTeX.",
  alternates: { canonical: "/" },
};

const keeps = [
  { title: "Markdown", body: "Headings, lists, tables, images.", icon: "markdown" },
  { title: "Code", body: "Highlighted, in Python, R, Julia and more.", icon: "code" },
  { title: "Math", body: "LaTeX equations, rendered properly.", icon: "math" },
  { title: "Plots", body: "Charts, DataFrames, printed output.", icon: "plots" },
] as const;

const badges = [
  { label: "Processed on your device", icon: "shield" },
  { label: "Free, no sign-up", icon: "user" },
  { label: "Open source", icon: "code" },
] as const;

const steps = [
  {
    title: "Pick your file",
    body: "Choose a notebook, or drop it on the page. It works with notebooks saved from Jupyter, JupyterLab, Colab, Kaggle and VS Code.",
  },
  {
    title: "Check it",
    body: "Preview the text, code and saved outputs. Hide the code if you only want the write-up, then check pagination in the print preview.",
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
    offline: "After first conversion loads",
    failure: "Wide tables, interactive outputs",
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
    href: "/colab-to-pdf",
    link: "Colab to PDF, step by step",
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
    a: "The converter reads your local file in your browser and does not upload it to a conversion server. External images in a notebook can make network requests, and this website loads Google AdSense. See Privacy details for the full explanation.",
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
    q: "Can I get HTML or a .py script instead of a PDF?",
    a: "Yes. The ipynb to HTML page uses the same renderer and writes a single .html file with the styles inside. The ipynb to PY page writes the code cells out as a script, with magics commented out so it runs.",
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
    a: "After opening a notebook once to load the conversion code, you can convert local files while keeping this tab open offline. External images and notebooks opened from a URL still need a connection.",
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

      <div className="mx-auto max-w-6xl px-5">
        <section className="print-hide pt-10 pb-8 text-center sm:pt-14 sm:pb-9">
          <p className="mb-4 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">A simpler notebook workflow</p>
          <h1 className="text-[36px] leading-[1.12] font-semibold tracking-[-1.6px] text-ink sm:text-[52px] sm:tracking-[-2px]">
            Your notebook. <span className="text-brand">Ready for PDF.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-ink-soft sm:text-[18px]">
            Convert ipynb to PDF, right in your browser.{" "}<br className="hidden sm:block" />
            Keep your code, equations and saved plots. Skip the setup.
          </p>
        </section>

        <section className="print-area">
          <Converter />
        </section>

        <section aria-label="About this converter" className="print-hide mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-x-7 gap-y-3 text-[13px] text-muted">
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

        <section className="print-hide mt-20 text-center">
          <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
            Your notebook, kept intact
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            An <code className="font-mono text-[15px]">.ipynb</code> file is JSON: a list of
            cells, each holding Markdown or code, plus whatever output the code produced when
            it last ran. This converter renders all of it — the same cells, in the same order,
            with the outputs that were saved in the file.
          </p>
          <div className="mt-10 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
            {keeps.map((item) => (
              <div key={item.title} className="card">
                <span className="card-icon">
                  <Icon name={item.icon} size={26} />
                </span>
                <h3 className="mt-5 text-[20px] font-medium text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="print-hide mt-24 text-center">
          <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
            How to convert a notebook to PDF
          </h2>
          <ol className="mt-10 grid gap-5 text-left sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="card">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand text-[17px] font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-[20px] font-medium text-ink">{step.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="print-hide mt-24">
          <div className="text-center">
            <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
              Five ways to turn a notebook into a PDF
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
              Choose the route that fits your setup. LaTeX-based exports need a TeX
              installation; browser-based options use a print engine instead.
            </p>
          </div>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[680px] text-left text-[15px]">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-4 font-medium">Method</th>
                  <th className="px-5 py-4 font-medium">Needs installing</th>
                  <th className="px-5 py-4 font-medium">Hide code</th>
                  <th className="px-5 py-4 font-medium">Works offline</th>
                  <th className="px-5 py-4 font-medium">Usual failure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {methods.map((m, index) => (
                  <tr key={m.name} className={index === 0 ? "bg-brand-soft" : undefined}>
                    <td className="px-5 py-4 font-medium text-ink">{m.name}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.install}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.hideCode}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.offline}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.failure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-[16px] text-ink-soft">
            <Link
              href="/how-to-convert-jupyter-notebook-to-pdf"
              className="font-medium text-brand-dark hover:underline"
            >
              Each method, step by step
            </Link>
            {" · "}
            <Link
              href="/fix-nbconvert-pdf-error"
              className="font-medium text-brand-dark hover:underline"
            >
              Fixing nbconvert errors
            </Link>
          </p>
        </section>

        <section className="print-hide mt-24 text-center">
          <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
            From Colab, VS Code or Kaggle
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            Wherever the notebook lives, the route is the same: get the{" "}
            <code className="font-mono text-[15px]">.ipynb</code> file onto your disk, then
            open it here.
          </p>
          <div className="mt-10 grid gap-5 text-left sm:grid-cols-3">
            {sources.map((item) => (
              <div key={item.title} className="card">
                <h3 className="text-[20px] font-medium text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{item.body}</p>
                {item.href ? (
                  <Link href={item.href} className="mt-3 inline-block text-[14px] font-medium text-brand-dark hover:underline">
                    {item.link}
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="print-hide mt-24 scroll-mt-24">
          <div className="card mx-auto max-w-3xl sm:p-10">
            <h2 className="text-[26px] font-semibold text-ink sm:text-[30px]">
              A small tool. An open process.
            </h2>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-ink-soft">
              <p>
                Your browser reads the notebook and renders its saved contents. The converter
                does not execute your code or upload the file to a conversion server. You
                review the document, then use your browser&rsquo;s print dialog to save the PDF.
              </p>
              <p>
                You can inspect{" "}
                <a href={site.repo} className="font-medium text-brand-dark hover:underline">
                  the source on GitHub
                </a>{" "}
                under the MIT licence. External notebook images can connect to their hosts,
                and the website loads Google AdSense. Our{" "}
                <Link href="/privacy" className="font-medium text-brand-dark underline underline-offset-2">privacy details</Link>{" "}
                explain these connections and local storage. For work files, follow your
                organization&rsquo;s data policies.
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
          <p className="mt-8 text-center text-[16px] text-ink-soft">
            <Link href="/faq" className="font-medium text-brand-dark hover:underline">
              More questions, answered in detail
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
