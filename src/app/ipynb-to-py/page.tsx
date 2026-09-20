import Link from "next/link";
import type { Metadata } from "next";
import { Converter } from "@/components/Converter";
import { site } from "@/lib/site";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "IPYNB to PY Converter — Jupyter notebook to Python script, free",
  description:
    "Convert a Jupyter notebook (.ipynb) to a clean Python script in your browser. Markdown becomes comments, magics are commented out. No upload, no nbconvert.",
  alternates: { canonical: "/ipynb-to-py" },
  openGraph: {
    title: "IPYNB to PY Converter — Jupyter notebook to Python script, free",
    url: `${site.url}/ipynb-to-py`,
  },
};

const badges = [
  { label: "No upload", icon: "shield" },
  { label: "No account", icon: "user" },
  { label: "No install", icon: "bolt" },
  { label: "Open source", icon: "code" },
] as const;

const steps = [
  {
    title: "Pick your file",
    body: "Choose a notebook, or drop it on the page. Python, R and Julia kernels are recognised and the script gets the matching extension.",
  },
  {
    title: "Check the script",
    body: "The whole file is shown, highlighted. Choose how cells are marked, whether Markdown stays as comments, and what happens to %magics.",
  },
  {
    title: "Download .py",
    body: "The script is written straight to disk. Or copy it and paste it into an editor.",
  },
];

const methods = [
  {
    name: "This converter",
    install: "Nothing",
    magics: "Commented out, script runs",
    markdown: "Comments, or dropped",
    markers: "# %%, # In[n]:, or none",
  },
  {
    name: "nbconvert --to script",
    install: "Python + nbconvert",
    magics: "Rewritten to get_ipython() calls — fails outside IPython",
    markdown: "Comments",
    markers: "# In[n]:",
  },
  {
    name: "JupyterLab export",
    install: "Jupyter",
    magics: "Same as nbconvert",
    markdown: "Comments",
    markers: "# In[n]:",
  },
  {
    name: "VS Code export",
    install: "Jupyter extension",
    magics: "Kept as written",
    markdown: "Comments",
    markers: "# %%",
  },
  {
    name: "Jupytext",
    install: "Python + jupytext",
    magics: "Commented, reversible",
    markdown: "Comments",
    markers: "# %%, several formats",
  },
];

const uses = [
  {
    title: "Put it under version control",
    body: "A .py diffs line by line. An .ipynb is JSON with outputs and base64 images inside, and every run changes it. Commit the script next to the notebook, or instead of it.",
  },
  {
    title: "Turn it into a module",
    body: "Once the code is a plain file you can import it, add a main guard, and run it from a scheduler or a pipeline without a kernel.",
  },
  {
    title: "Hand in a .py",
    body: "Some courses and code reviews want a script, not a notebook. Keep the headings as comments and the structure of the write-up survives.",
  },
];

const faqs = [
  {
    q: "Is my notebook uploaded?",
    a: "No. The file is read and converted by JavaScript on your own computer. There is no server to send it to.",
  },
  {
    q: "Why does the script from nbconvert fail with NameError: get_ipython?",
    a: "nbconvert turns every IPython magic — %matplotlib inline, %%time, !pip install — into a call like get_ipython().run_line_magic(...). That function only exists inside IPython, so running the file with plain python raises NameError. This converter comments those lines out instead, so the script runs and you can still see what was there.",
  },
  {
    q: "What happens to the outputs?",
    a: "They are not part of a script. A .py holds the code that produced them; run it and the outputs come back. If you want a file that keeps the plots and tables, convert to HTML or PDF instead.",
  },
  {
    q: "What do the cell markers do?",
    a: "# %% is a comment to Python, but VS Code, Spyder and PyCharm read it as a cell boundary and let you run one cell at a time, like a notebook. # In[3]: is the marker nbconvert writes and carries the execution count. None gives you a plain script with a blank line between cells.",
  },
  {
    q: "Where do the Markdown cells go?",
    a: "Each line becomes a comment, so headings and explanations stay in the file where they were. Choose Drop for code only.",
  },
  {
    q: "Does it work with R and Julia notebooks?",
    a: "Yes. The kernel language is read from the notebook's metadata: an R kernel gives you an .R file, Julia a .jl. All three comment with #, so Markdown cells work the same way. Magic handling is only applied to Python.",
  },
  {
    q: "Can I convert a .py back to .ipynb?",
    a: "Not here. Jupytext does that on the command line, and reads the # %% markers this page writes, so a script from here goes back into a notebook with the cells intact.",
  },
  {
    q: "Is it free?",
    a: "Yes. No account, no watermark, no file limit. The code is open source under the MIT licence.",
  },
];

export default function IpynbToPy() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ipynbtopdf — IPYNB to PY",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: `${site.url}/ipynb-to-py`,
      description:
        "Free browser-based converter that turns Jupyter notebook .ipynb files into Python scripts without uploading them.",
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
            Convert ipynb to py
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[19px] leading-snug text-ink-soft sm:text-[22px] sm:leading-8">
            Turn a Jupyter notebook into a Python script in your browser. Free, and the file
            never leaves your computer.
          </p>
        </section>

        <section className="print-area">
          <Converter mode="script" />
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
            A script that actually runs
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            An <code className="font-mono text-[15px]">.ipynb</code> is JSON holding code
            cells, Markdown cells and saved outputs. A script needs only the code, in order,
            with the notebook-only lines dealt with. This converter writes the code cells out,
            keeps the Markdown as comments, and comments out{" "}
            <code className="font-mono text-[15px]">%magics</code> and{" "}
            <code className="font-mono text-[15px]">!shell</code> lines — the two things
            that make an exported notebook crash under plain{" "}
            <code className="font-mono text-[15px]">python</code>.
          </p>
        </section>

        <section className="print-hide mt-24 text-center">
          <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
            How to convert a notebook to a Python script
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
              Five ways to get a .py out of a notebook
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
              They all write the same code cells. They differ on the three lines that are not
              Python — magics, Markdown and cell markers — and that is what decides whether the
              file runs.
            </p>
          </div>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[760px] text-left text-[15px]">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-4 font-medium">Method</th>
                  <th className="px-5 py-4 font-medium">Needs installing</th>
                  <th className="px-5 py-4 font-medium">%magics and !shell</th>
                  <th className="px-5 py-4 font-medium">Markdown</th>
                  <th className="px-5 py-4 font-medium">Cell markers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {methods.map((m, index) => (
                  <tr key={m.name} className={index === 0 ? "bg-brand-soft" : undefined}>
                    <td className="px-5 py-4 font-medium text-ink">{m.name}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.install}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.magics}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.markdown}</td>
                    <td className="px-5 py-4 font-mono text-[13px] text-ink-soft">{m.markers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mx-auto mt-8 max-w-3xl text-[16px] leading-relaxed text-ink-soft">
            <p>The command-line route, for when you have Python anyway:</p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-line-soft bg-surface px-4 py-3 font-mono text-[14px] text-ink">
              jupyter nbconvert --to script notebook.ipynb
            </pre>
            <p className="mt-3">
              Then open the result and look for{" "}
              <code className="font-mono text-[14px]">get_ipython()</code>. Every one of those
              lines was a magic, and every one will raise{" "}
              <code className="font-mono text-[14px]">NameError</code> until you delete or
              comment it. That is the step this page does for you.
            </p>
          </div>
        </section>

        <section className="print-hide mt-24 text-center">
          <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
            What the script is for
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
            Want the outputs kept?{" "}
            <Link href="/" className="font-medium text-brand-dark hover:underline">
              Convert to PDF
            </Link>
            {" · "}
            <Link href="/ipynb-to-html" className="font-medium text-brand-dark hover:underline">
              Convert to HTML
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
                The converter is JavaScript running in this page. It reads the notebook JSON,
                takes the source of each cell in order, and writes the script; the preview is
                highlighted with highlight.js. There is no upload endpoint, so the file cannot
                leave your machine.
              </p>
              <p>
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
