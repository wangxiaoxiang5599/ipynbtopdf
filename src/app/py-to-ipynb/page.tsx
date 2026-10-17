import Link from "next/link";
import type { Metadata } from "next";
import { PyToIpynb } from "@/components/PyToIpynb";
import { site } from "@/lib/site";
import { Icon } from "@/components/Icon";

const title = "PY to IPYNB Converter — Python script to Jupyter notebook, free";

export const metadata: Metadata = {
  title,
  description:
    "Convert a Python script (.py) to a Jupyter notebook (.ipynb) in your browser. Cells split at # %% markers or blank lines, comments become Markdown. No upload.",
  alternates: { canonical: "/py-to-ipynb" },
  /* Metadata merges shallowly, so this replaces the layout's openGraph whole; the image and
     site name have to be restated or the share card loses them. */
  openGraph: {
    type: "website",
    siteName: site.name,
    title,
    url: `${site.url}/py-to-ipynb`,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ipynbtopdf" }],
  },
};

const badges = [
  { label: "No upload", icon: "shield" },
  { label: "No account", icon: "user" },
  { label: "No install", icon: "bolt" },
  { label: "Open source", icon: "code" },
] as const;

const rules = [
  {
    title: "# %% markers",
    body: "The convention VS Code, Spyder, PyCharm and Jupytext share. Each marker starts a cell; # %% [markdown] starts a Markdown cell made from the comment lines under it.",
    example: "# %% [markdown]\n# ## Load the data\n\n# %%\ndf = pd.read_csv(\"x.csv\")",
  },
  {
    title: "# In[ ]: markers",
    body: "What jupyter nbconvert --to script writes. Each marker is a code cell; the comment blocks between cells were Markdown cells and become Markdown again.",
    example: "# ## Load the data\n\n# In[2]:\n\n\ndf = pd.read_csv(\"x.csv\")",
  },
  {
    title: "Neither",
    body: "A new cell wherever two blank lines sit at the top level, which in a PEP 8 script is between functions and classes. A module docstring becomes the opening Markdown.",
    example: "import pandas as pd\n\n\ndef load(path):\n    return pd.read_csv(path)",
  },
];

const steps = [
  {
    title: "Open the script",
    body: "Choose a .py file, drop it on the page, or paste the code. Nothing is installed and nothing is uploaded.",
  },
  {
    title: "Check the cells",
    body: "The notebook is shown cell by cell as Jupyter would show it. Switch how cells are split if the automatic choice isn't what you want.",
  },
  {
    title: "Download .ipynb",
    body: "The notebook is written straight to disk. Or send it on to the viewer, or to the PDF or HTML converter, already loaded.",
  },
];

const methods = [
  {
    name: "This converter",
    install: "Nothing",
    split: "# %%, # In[ ]: or blank lines",
    markdown: "From # %% [markdown] and nbconvert comments",
    magics: "Restored",
  },
  {
    name: "Jupytext",
    install: "Python + jupytext",
    split: "# %% and several other formats",
    markdown: "From # %% [markdown]",
    magics: "Restored",
  },
  {
    name: "VS Code",
    install: "VS Code + Python and Jupyter extensions",
    split: "# %%",
    markdown: "From # %% [markdown]",
    magics: "As written",
  },
  {
    name: "Paste into Jupyter",
    install: "Jupyter",
    split: "By hand",
    markdown: "By hand",
    magics: "As written",
  },
];

const uses = [
  {
    title: "Run it in Colab",
    body: "Colab opens notebooks, not scripts. Convert, then in Colab choose File → Upload notebook and pick the .ipynb.",
  },
  {
    title: "Run it a piece at a time",
    body: "A long script becomes cells you can run, change and rerun one at a time, keeping the variables from the cells before.",
  },
  {
    title: "Hand in a notebook",
    body: "Some courses and reviewers want an .ipynb. Comments marked as Markdown become proper text cells between the code.",
  },
];

const faqs = [
  {
    q: "Is my script uploaded?",
    a: "No. The file is read and converted by JavaScript on your own computer. There is no server to send it to.",
  },
  {
    q: "Does it run my code?",
    a: "No. The notebook has your code in cells and no outputs, exactly like a notebook nobody has run yet. Open it in Jupyter, Colab or VS Code and run the cells to get the outputs.",
  },
  {
    q: "How do I choose where the cells start?",
    a: "Put a # %% line where you want each cell to begin, and # %% [markdown] above comment lines that should be text. VS Code, Spyder and PyCharm already treat those lines as cells, so the script stays a normal script.",
  },
  {
    q: "What happens to %matplotlib and get_ipython() lines?",
    a: "They go back to the magics they were. Scripts exported from a notebook carry them either commented out (# %matplotlib inline) or rewritten by nbconvert (get_ipython().run_line_magic('matplotlib', 'inline')); both become %matplotlib inline again, and !pip lines likewise. Choose Leave as written to keep the script's lines untouched.",
  },
  {
    q: "Can I convert a notebook back to a script?",
    a: "Yes, with the ipynb to py converter on this site. It writes # %% markers, so a script from there comes back here with the same cells.",
  },
  {
    q: "How do I open the .ipynb in Colab?",
    a: "In Colab, File → Upload notebook, then choose the downloaded file. In Jupyter or JupyterLab, open it from the file browser; in VS Code, open it like any file.",
  },
  {
    q: "Does it work with R or Julia scripts?",
    a: "Not yet. The notebook is written for a Python 3 kernel, so only Python scripts are converted as they should be.",
  },
  {
    q: "Is it free?",
    a: "Yes. No account, no watermark, no file limit. The code is open source under the MIT licence.",
  },
];

export default function PyToIpynbPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ipynbtopdf — PY to IPYNB",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: `${site.url}/py-to-ipynb`,
      description:
        "Free browser-based converter that turns Python scripts into Jupyter notebooks without uploading them.",
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
        <section className="pt-12 pb-10 text-center sm:pt-16">
          <h1 className="text-[34px] leading-[1.15] font-semibold text-ink sm:text-[42px] sm:leading-[52px]">
            Convert py to ipynb
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[19px] leading-snug text-ink-soft sm:text-[22px] sm:leading-8">
            Turn a Python script into a Jupyter notebook in your browser. Free, and the file
            never leaves your computer.
          </p>
        </section>

        <section>
          <PyToIpynb />
        </section>

        <section className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-3 text-[15px] text-ink-soft">
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

        <section className="mt-28">
          <div className="text-center">
            <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
              Where the cells come from
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
              A <code className="font-mono text-[15px]">.py</code> file is one long run of
              code, and a notebook is a list of cells, so the only real question is where to
              cut. Many scripts already say: they came out of a notebook or an editor that
              marks cells with a comment. The converter looks for those marks first.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {rules.map((rule) => (
              <div key={rule.title} className="card">
                <h3 className="font-mono text-[18px] font-medium text-ink">{rule.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{rule.body}</p>
                <pre className="mt-4 overflow-x-auto rounded-lg border border-line-soft bg-page px-3 py-2.5 font-mono text-[12px] leading-relaxed text-ink-soft">
                  {rule.example}
                </pre>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 text-center">
          <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
            How to convert a Python script to a Jupyter notebook
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

        <section className="mt-24">
          <div className="text-center">
            <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
              Four ways to turn a .py into a notebook
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
              They all end with your code in cells. They differ on how the cuts are found,
              whether comments can become text, and what happens to the IPython lines a
              notebook export left behind.
            </p>
          </div>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[760px] text-left text-[15px]">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-4 font-medium">Method</th>
                  <th className="px-5 py-4 font-medium">Needs installing</th>
                  <th className="px-5 py-4 font-medium">Cells split at</th>
                  <th className="px-5 py-4 font-medium">Markdown cells</th>
                  <th className="px-5 py-4 font-medium">%magics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {methods.map((m, index) => (
                  <tr key={m.name} className={index === 0 ? "bg-brand-soft" : undefined}>
                    <td className="px-5 py-4 font-medium text-ink">{m.name}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.install}</td>
                    <td className="px-5 py-4 font-mono text-[13px] text-ink-soft">{m.split}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.markdown}</td>
                    <td className="px-5 py-4 text-ink-soft">{m.magics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mx-auto mt-8 max-w-3xl text-[16px] leading-relaxed text-ink-soft">
            <p>The command-line route, for when you have Python anyway:</p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-line-soft bg-surface px-4 py-3 font-mono text-[14px] text-ink">
              pip install jupytext{"\n"}jupytext --to notebook script.py
            </pre>
            <p className="mt-3">
              Jupytext reads the same <code className="font-mono text-[14px]"># %%</code>{" "}
              markers, so a script that converts well here converts the same way there, and a
              notebook from either goes back to the same script.
            </p>
          </div>
        </section>

        <section className="mt-24 text-center">
          <h2 className="text-[30px] font-semibold text-ink sm:text-[34px]">
            What the notebook is for
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
            Going the other way?{" "}
            <Link href="/ipynb-to-py" className="font-medium text-brand-dark hover:underline">
              Convert ipynb to py
            </Link>
            {" · "}
            <Link href="/ipynb-viewer" className="font-medium text-brand-dark hover:underline">
              View a notebook online
            </Link>
            {" · "}
            <Link href="/" className="font-medium text-brand-dark hover:underline">
              Convert a notebook to PDF
            </Link>
          </p>
        </section>

        <section className="mt-24">
          <div className="card mx-auto max-w-3xl sm:p-10">
            <h2 className="text-[26px] font-semibold text-ink sm:text-[30px]">
              How it works, and why you can trust it
            </h2>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-ink-soft">
              <p>
                The converter is JavaScript running in this page. It reads the script as text,
                finds the cell boundaries, and writes standard nbformat 4 JSON with a Python 3
                kernel; the preview uses the same renderer as the rest of this site. There is
                no upload endpoint, so the file cannot leave your machine.
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

        <section className="mt-24">
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
