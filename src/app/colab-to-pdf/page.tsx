import Link from "next/link";
import type { Metadata } from "next";
import { Converter } from "@/components/Converter";
import { site } from "@/lib/site";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Colab to PDF — convert a Google Colab notebook to PDF, no LaTeX",
  description:
    "Save a Google Colab notebook as a PDF: download the .ipynb, open it here, hide the code if you like, and save. No upload, no TeX install, no cut-off outputs.",
  alternates: { canonical: "/colab-to-pdf" },
  openGraph: {
    title: "Colab to PDF — convert a Google Colab notebook to PDF, no LaTeX",
    url: `${site.url}/colab-to-pdf`,
  },
};

const badges = [
  { label: "No upload", icon: "shield" },
  { label: "No account", icon: "user" },
  { label: "No install", icon: "bolt" },
  { label: "Open source", icon: "code" },
] as const;

const printProblems = [
  {
    title: "It prints the window, not the notebook",
    body: "File → Print in Colab is the browser's print of the Colab page. The file browser, the toolbar and the comment gutter come along, and the notebook gets whatever width is left.",
  },
  {
    title: "Long outputs are cut off",
    body: "Colab shows scrolling output boxes. The printer sees the box, not the scroll, so a training log or a long DataFrame ends where the box ends.",
  },
  {
    title: "Code wraps badly, plots shrink",
    body: "Code cells are laid out for a screen. On paper the lines break mid-word, and figures are scaled to the column Colab happened to give them.",
  },
];

const methods = [
  {
    name: "This page",
    setup: "Download the .ipynb from Colab",
    time: "Seconds",
    hideCode: "One switch",
    fails: "Interactive widgets show a placeholder",
  },
  {
    name: "nbconvert inside Colab",
    setup: "!apt-get install texlive-xetex (~700 MB)",
    time: "5–10 minutes, every session",
    hideCode: "--no-input flag",
    fails: "Missing TeX packages, wide tables, non-Latin text",
  },
  {
    name: "File → Print → Save as PDF",
    setup: "Nothing",
    time: "Seconds",
    hideCode: "No",
    fails: "Sidebar in the page, outputs cut off, wrapped code",
  },
];

const steps = [
  {
    title: "Run what you want on paper",
    body: "Outputs are saved with the notebook, so cells that have not run have nothing to show. Runtime → Run all if in doubt.",
  },
  {
    title: "Download the .ipynb",
    body: "File → Download → Download .ipynb. The file lands in your Downloads folder with the notebook's name.",
  },
  {
    title: "Open it here",
    body: "Drop the file on this page. You see the whole notebook laid out for A4 or Letter, with nothing from the Colab interface around it.",
  },
  {
    title: "Save as PDF",
    body: "Hide the code if the reader only needs the write-up, then Download PDF. Your browser writes the file with real, selectable text.",
  },
];

const faqs = [
  {
    q: "Why can't I paste my Colab link?",
    a: "Most Colab notebooks live in Google Drive, and Drive only serves them to you while you are signed in — a website cannot fetch them, and this one would not want to. Download the .ipynb with File → Download and open the file here. Colab links that open a GitHub notebook (the address contains /github/) can be pasted directly, because the file is public on GitHub.",
  },
  {
    q: "Some of my outputs are missing in the PDF",
    a: "They were missing in the file. Colab only saves the outputs of cells that have run in the current session; if you opened an old notebook and downloaded it without running it, the code cells are empty of results. Runtime → Run all, wait for it to finish, then download again.",
  },
  {
    q: "Are my plots and images included?",
    a: "Yes. Matplotlib, seaborn and Plotly's static export are saved into the notebook as images and appear in the PDF at full width. Plotly's interactive charts and ipywidgets need a running kernel and cannot exist on paper; a placeholder marks where they were.",
  },
  {
    q: "Can I leave the code out?",
    a: "Yes. Turn off the Code switch and the PDF shows only Markdown and outputs — the report without the machinery. It is the equivalent of nbconvert's --no-input, without installing anything.",
  },
  {
    q: "What about very long outputs, like pip install logs?",
    a: "They are folded by default: outputs longer than 40 lines keep their first 25 and last 10 lines with a note in between, so a package install does not take three pages. Turn off Fold long outputs to print everything.",
  },
  {
    q: "How do I convert a Colab notebook to PDF with nbconvert instead?",
    a: "In a Colab cell run !apt-get install -y texlive-xetex texlive-fonts-recommended texlive-plain-generic, then !jupyter nbconvert --to pdf your_notebook.ipynb, having first uploaded or mounted the file. Budget five to ten minutes for the TeX install, which is repeated in every new session, and expect it to fail on wide tables and non-Latin characters. It is the route for people who need LaTeX typesetting specifically.",
  },
  {
    q: "Does this work for Kaggle notebooks too?",
    a: "Yes. Kaggle's File → Download Notebook gives the same .ipynb format. Kaggle has no PDF export of its own, so this is the whole route.",
  },
  {
    q: "Is my notebook uploaded?",
    a: "No. The file is read and rendered by JavaScript on your computer, and the PDF is written by your browser. There is no server to send it to.",
  },
  {
    q: "Is it free?",
    a: "Yes. No account, no watermark, no file limit. The code is open source under the MIT licence.",
  },
];

export default function ColabToPdf() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to convert a Google Colab notebook to PDF",
      description:
        "Download the .ipynb from Colab, open it in a browser-based converter, and save it as a PDF without LaTeX.",
      step: steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.body,
      })),
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
            Convert a Google Colab notebook to PDF
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[19px] leading-snug text-ink-soft sm:text-[22px] sm:leading-8">
            Colab has no PDF export and its Print button prints the whole page. Download the
            notebook, open it here, and save a clean PDF from your browser.
          </p>
        </section>

        <section className="print-area">
          <Converter mode="pdf" variant="colab" />
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
            Why Colab&rsquo;s Print gives a bad PDF
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            Colab is a web app, and File → Print asks the browser to print the app. The
            notebook is in there somewhere, but so is everything around it.
          </p>
          <div className="mt-10 grid gap-5 text-left sm:grid-cols-3">
            {printProblems.map((item) => (
              <div key={item.title} className="card">
                <h3 className="text-[20px] font-medium text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="print-hide mt-24 text-center">
          <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
            Colab to PDF in four steps
          </h2>
          <ol className="mt-10 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
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
              Three ways to get a PDF out of Colab
            </h2>
          </div>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[720px] text-left text-[15px]">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-4 font-medium">Method</th>
                  <th className="px-5 py-4 font-medium">Setup</th>
                  <th className="px-5 py-4 font-medium">Time</th>
                  <th className="px-5 py-4 font-medium">Hide code</th>
                  <th className="px-5 py-4 font-medium">Where it breaks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {methods.map((m, index) => (
                  <tr key={m.name} className={index === 0 ? "bg-brand-soft" : undefined}>
                    <td className="px-5 py-4 font-medium text-ink">{m.name}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.setup}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.time}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.hideCode}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.fails}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mx-auto mt-8 max-w-3xl text-[16px] leading-relaxed text-ink-soft">
            <p>
              The nbconvert route, if you need LaTeX typesetting and have the minutes. Run in a
              Colab cell, with the notebook uploaded to the session or Drive mounted:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-line-soft bg-surface px-4 py-3 font-mono text-[14px] leading-relaxed text-ink">
{`!apt-get install -y texlive-xetex texlive-fonts-recommended texlive-plain-generic
!jupyter nbconvert --to pdf --no-input your_notebook.ipynb`}
            </pre>
            <p className="mt-3">
              The install is around 700 MB and does not persist between sessions. When it fails,
              it is usually a missing TeX package, a table wider than the page, or characters
              the default fonts do not cover —{" "}
              <Link href="/fix-nbconvert-pdf-error" className="font-medium text-brand-dark hover:underline">
                the fixes are here
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="print-hide mt-24">
          <div className="card mx-auto max-w-3xl sm:p-10">
            <h2 className="text-[26px] font-semibold text-ink sm:text-[30px]">
              Built for what Colab notebooks contain
            </h2>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-ink-soft">
              <p>
                Colab saves a few things other Jupyter frontends do not. DataFrames come wrapped
                in a toolbar of interactive buttons; those are removed and the table is kept.
                Package installs and training loops leave hundreds of lines of output; those are
                folded to their head and tail so the PDF stays readable, with a switch to print
                them in full. Colab&rsquo;s own display formats are skipped in favour of the
                plain HTML and images saved beside them.
              </p>
              <p>
                Everything runs as JavaScript in this page. Markdown is rendered with markdown-it,
                code highlighted with highlight.js, maths typeset with KaTeX, and the result is
                sanitised with DOMPurify. There is no upload endpoint;{" "}
                <a href={site.repo} className="font-medium text-brand-dark hover:underline">
                  the source is on GitHub
                </a>{" "}
                under the MIT licence.
              </p>
            </div>
          </div>
          <p className="mt-8 text-center text-[16px] text-ink-soft">
            Want it as a web page or a script instead?{" "}
            <Link href="/ipynb-to-html" className="font-medium text-brand-dark hover:underline">
              Colab to HTML
            </Link>
            {" · "}
            <Link href="/ipynb-to-py" className="font-medium text-brand-dark hover:underline">
              Colab to .py
            </Link>
          </p>
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
