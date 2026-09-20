import Link from "next/link";
import type { Metadata } from "next";
import { Converter } from "@/components/Converter";
import { site } from "@/lib/site";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "IPYNB to HTML Converter — free, in your browser, no upload",
  description:
    "Convert a Jupyter notebook (.ipynb) to one HTML file in your browser. Keeps Markdown, highlighted code, LaTeX math, plots and tables. No upload, no nbconvert.",
  alternates: { canonical: "/ipynb-to-html" },
  openGraph: {
    title: "IPYNB to HTML Converter — free, in your browser, no upload",
    url: `${site.url}/ipynb-to-html`,
  },
};

const keeps = [
  { title: "Markdown", body: "Headings, lists, tables, images.", icon: "markdown" },
  { title: "Code", body: "Highlighted, in Python, R, Julia and more.", icon: "code" },
  { title: "Math", body: "LaTeX equations, rendered properly.", icon: "math" },
  { title: "Plots", body: "Charts, DataFrames, printed output.", icon: "plots" },
] as const;

const badges = [
  { label: "No upload", icon: "shield" },
  { label: "No account", icon: "user" },
  { label: "No install", icon: "bolt" },
  { label: "Open source", icon: "code" },
] as const;

const steps = [
  {
    title: "Pick your file",
    body: "Choose a notebook, or drop it on the page. It works with notebooks saved from Jupyter, JupyterLab, Colab, Kaggle and VS Code.",
  },
  {
    title: "Check it",
    body: "The notebook is shown exactly as the HTML will look. Hide the code if you only want the write-up, then choose a full page or just the body.",
  },
  {
    title: "Download HTML",
    body: "One file, styles included, that opens in any browser. Or copy the markup and paste it into your own site.",
  },
];

const methods = [
  {
    name: "This converter",
    install: "Nothing",
    hideCode: "One switch",
    single: "Yes, styles inline",
    images: "Inside the file",
  },
  {
    name: "nbconvert --to html",
    install: "Python + nbconvert",
    hideCode: "--no-input flag",
    single: "Yes",
    images: "Inside the file since 6.5, beside it before",
  },
  {
    name: "JupyterLab export",
    install: "Jupyter",
    hideCode: "No",
    single: "Yes",
    images: "Inside the file",
  },
  {
    name: "VS Code export",
    install: "Jupyter extension + nbconvert",
    hideCode: "No",
    single: "Yes",
    images: "Inside the file",
  },
  {
    name: "GitHub file view",
    install: "Nothing",
    hideCode: "No",
    single: "Not a file at all",
    images: "Shown, not saved",
  },
];

const uses = [
  {
    title: "Send it to someone without Jupyter",
    body: "An .html opens on any phone or laptop with a double-click. The reader sees the notebook the way you saw it, and never has to install Python.",
  },
  {
    title: "Put it on a website",
    body: "Choose Body only, paste the markup into a blog post, a wiki or a course page, and the notebook becomes part of it. It picks up your site's fonts.",
  },
  {
    title: "Keep a copy that opens in ten years",
    body: "HTML is the one format every device will keep reading. Outputs are frozen into the file exactly as they were when the notebook last ran.",
  },
];

const faqs = [
  {
    q: "Is my notebook uploaded?",
    a: "No. The file is read and converted by JavaScript on your own computer. There is no server to send it to.",
  },
  {
    q: "Will the HTML file open without an internet connection?",
    a: "Yes. The stylesheet and every image are inside the file. The one exception is LaTeX maths: the equation fonts are loaded from a CDN, so a notebook with equations needs a connection the first time it is opened. Everything else works offline.",
  },
  {
    q: "Are the images inside the file?",
    a: "Yes. Plots and other images a notebook saved are stored in the .ipynb as base64 text, and they are written into the HTML the same way. Images that lived beside the notebook on disk cannot be reached and are marked with a note.",
  },
  {
    q: "Can I paste it into a blog or a wiki?",
    a: "Yes. Choose Body only and copy the HTML. You get the notebook markup without the page around it, so it sits inside your own template. It is plain HTML — headings, paragraphs, pre blocks and tables — with class names you can style.",
  },
  {
    q: "Can I leave the code out?",
    a: "Yes. Turn off the Code switch and the file shows only text and results, the same as nbconvert's --no-input.",
  },
  {
    q: "How is this different from nbconvert --to html?",
    a: "nbconvert needs Python installed, and its HTML reproduces the look of JupyterLab, prompts and all. This page needs nothing installed and produces a clean document made to be read, in one file. Both keep the outputs exactly as saved.",
  },
  {
    q: "Does it work with Google Colab notebooks?",
    a: "Yes. Download the notebook from Colab with File → Download → .ipynb and open it here. Outputs that were run in Colab are included.",
  },
  {
    q: "HTML or PDF — which should I choose?",
    a: "PDF for anything that will be printed, submitted or attached to an email. HTML when the reader will look at it on a screen: it scales to the window, the text can be selected and searched, and it is a fraction of the size. Both come from the same rendering on this site.",
  },
  {
    q: "What about Plotly charts and widgets?",
    a: "Anything that needs JavaScript to draw itself is not in the saved notebook, only a placeholder is. If a static image was saved alongside, that image is used. Otherwise a note is shown where the widget was.",
  },
  {
    q: "Is it free?",
    a: "Yes. No account, no watermark, no file limit. The code is open source under the MIT licence.",
  },
];

export default function IpynbToHtml() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ipynbtopdf — IPYNB to HTML",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      url: `${site.url}/ipynb-to-html`,
      description:
        "Free browser-based converter that turns Jupyter notebook .ipynb files into a single HTML file without uploading them.",
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
            Convert ipynb to HTML
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[19px] leading-snug text-ink-soft sm:text-[22px] sm:leading-8">
            Turn a Jupyter notebook into a single HTML file in your browser. Free, and the
            file never leaves your computer.
          </p>
        </section>

        <section className="print-area">
          <Converter mode="html" />
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

        <section className="print-hide mt-28 text-center">
          <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
            Your notebook, kept intact
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            An <code className="font-mono text-[15px]">.ipynb</code> file is JSON: a list of
            cells holding Markdown or code, plus the output each cell produced when it last ran.
            This converter renders all of it into one HTML document — same cells, same order,
            same outputs — with the stylesheet written into the file.
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
            How to convert a notebook to HTML
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
              Five ways to get HTML out of a notebook
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
              HTML is the one export that never needed LaTeX, so every route works. The
              differences are what you have to install first, and what the file looks like at
              the end.
            </p>
          </div>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[720px] text-left text-[15px]">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-4 font-medium">Method</th>
                  <th className="px-5 py-4 font-medium">Needs installing</th>
                  <th className="px-5 py-4 font-medium">Hide code</th>
                  <th className="px-5 py-4 font-medium">One file</th>
                  <th className="px-5 py-4 font-medium">Images</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {methods.map((m, index) => (
                  <tr key={m.name} className={index === 0 ? "bg-brand-soft" : undefined}>
                    <td className="px-5 py-4 font-medium text-ink">{m.name}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.install}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.hideCode}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.single}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.images}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mx-auto mt-8 max-w-3xl text-[16px] leading-relaxed text-ink-soft">
            <p>The command-line route, for when you have Python anyway:</p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-line-soft bg-surface px-4 py-3 font-mono text-[14px] text-ink">
              jupyter nbconvert --to html notebook.ipynb
            </pre>
            <p className="mt-3">
              Add <code className="font-mono text-[14px]">--no-input</code> to drop the code
              cells. On nbconvert older than 6.5, add{" "}
              <code className="font-mono text-[14px]">--embed-images</code> or the plots are
              written into a folder beside the file.
            </p>
          </div>
        </section>

        <section className="print-hide mt-24 text-center">
          <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
            What an HTML notebook is for
          </h2>
          <div className="mt-10 grid gap-5 text-left sm:grid-cols-3">
            {uses.map((item) => (
              <div key={item.title} className="card">
                <h3 className="text-[20px] font-medium text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[16px] text-ink-soft">
            Need it on paper instead?{" "}
            <Link href="/" className="font-medium text-brand-dark hover:underline">
              Convert the same notebook to PDF
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
                The whole converter is JavaScript running in this page. Markdown is rendered
                with markdown-it, code is highlighted with highlight.js, equations are typeset
                with KaTeX, and the result is sanitised with DOMPurify before it is shown or
                saved. There is no upload endpoint, so the file cannot leave your machine.
              </p>
              <p>
                The HTML you download is the same markup you see in the preview, wrapped in a
                page with the stylesheet written inline.{" "}
                <a href={site.repo} className="font-medium text-brand-dark hover:underline">
                  The source is on GitHub
                </a>{" "}
                under the MIT licence.
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
