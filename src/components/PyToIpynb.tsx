"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Notebook } from "@/lib/ipynb";
import {
  defaultPyOptions,
  notebookJson,
  scriptToNotebook,
  type Detected,
  type PyOptions,
} from "@/lib/py-to-ipynb";
import { downloadText } from "@/lib/export-html";
import { setPendingFile } from "@/lib/handoff";
import { track } from "@/lib/analytics";
import { useFileDrop } from "@/lib/use-file-drop";
import { Icon } from "@/components/Icon";
import { ArrowMark, RadioGroup, UploadMark } from "@/components/Converter";

type Lib = typeof import("@/lib/ipynb");

const TOOL = "py-to-ipynb";

/* Where the finished notebook can go next. Each page opens with it already loaded. */
const nextSteps = [
  { href: "/ipynb-viewer", label: "Open in viewer" },
  { href: "/", label: "Convert to PDF" },
  { href: "/ipynb-to-html", label: "Convert to HTML" },
];

const detectedLabel: Record<Detected, string> = {
  percent: "split at # %% markers",
  nbconvert: "split at # In[ ]: markers",
  blank: "split at double blank lines",
  single: "one cell",
};

const SAMPLE = `"""Monthly sales report.

Loads the sales table, adds a running total and plots it.
"""

# %%
import pandas as pd
import matplotlib.pyplot as plt
# %matplotlib inline

# %% [markdown]
# ## Load the data
#
# One row per month. In a real script this would be \`pd.read_csv("sales.csv")\`.

# %%
sales = pd.DataFrame({
    "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "revenue": [120, 135, 150, 145, 170, 190],
})
sales["running_total"] = sales["revenue"].cumsum()
sales

# %% Plot it
ax = sales.plot(x="month", y="revenue", marker="o", legend=False)
ax.set_ylabel("Revenue (k$)")
plt.show()
`;

/* The reverse of the Converter's script mode: a .py comes in, a notebook goes out. It keeps
   the same shape — empty state, then the result beside a sidebar — but the input can also be
   pasted, since a script is often a few lines copied from somewhere rather than a file. */
export function PyToIpynb() {
  const router = useRouter();
  const libRef = useRef<Lib | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [options, setOptions] = useState<PyOptions>(defaultPyOptions);
  const [html, setHtml] = useState("");
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const conversion = useMemo(
    () => (source === null ? null : scriptToNotebook(source, options)),
    [source, options],
  );
  const notebook: Notebook | null = conversion?.notebook ?? null;
  const baseName = fileName.replace(/\.(py|txt)$/i, "") || "notebook";

  const open = useCallback(async (text: string, name: string) => {
    setBusy(true);
    setError("");
    try {
      if (/^\s*\{[\s\S]*"cells"\s*:/.test(text)) {
        throw new Error("That file is already a notebook. Open it in the viewer to read it.");
      }
      if (!text.trim()) throw new Error("There's no code in that file.");
      libRef.current ??= await import("@/lib/ipynb");
      setOptions(defaultPyOptions);
      setFileName(name);
      setSource(text);
      track("Notebook Opened", { tool: TOOL });
    } catch (cause) {
      track("Notebook Failed", { tool: TOOL });
      setError(cause instanceof Error ? cause.message : "Something went wrong reading that file.");
    } finally {
      setBusy(false);
    }
  }, []);

  const loadFile = useCallback(
    async (file: File) => void open(await file.text(), file.name),
    [open],
  );
  const dragging = useFileDrop(loadFile);

  useEffect(() => {
    const lib = libRef.current;
    if (!lib || !notebook) return;
    setHtml(lib.renderNotebook(notebook, { showCode: true, showOutputs: false, showPrompts: false, foldOutputs: true }));
  }, [notebook]);

  const file = () =>
    new File([notebookJson(notebook!)], `${baseName}.ipynb`, { type: "application/x-ipynb+json" });

  const download = () => {
    track("Export", { format: "ipynb", tool: TOOL });
    downloadText(`${baseName}.ipynb`, notebookJson(notebook!), "application/x-ipynb+json");
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(notebookJson(notebook!));
      track("Export", { format: "copy-ipynb", tool: TOOL });
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("The browser refused clipboard access. Download the file instead.");
    }
  };

  const sendTo = (href: string) => {
    setPendingFile(file());
    router.push(href);
  };

  const reset = () => {
    setSource(null);
    setHtml("");
    setFileName("");
    setError("");
  };

  const dropOverlay = dragging ? (
    <div className="print-hide pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-brand/90 text-center text-white">
      <div>
        <UploadMark size={64} color="#fff" />
        <p className="mt-4 text-[32px] font-semibold">Drop your script here</p>
        <p className="mt-1 text-[17px] opacity-90">.py files</p>
      </div>
    </div>
  ) : null;

  if (!notebook) {
    return (
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-surface text-center shadow-[0_8px_32px_-16px_rgba(32,43,54,0.18)]" aria-busy={busy}>
        {dropOverlay}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft px-5 py-3 text-[12px] sm:px-8">
          <span className="font-medium text-ink-soft">.py <span className="mx-2 text-muted">→</span> Jupyter notebook</span>
          <span className="inline-flex items-center gap-1.5 text-[#35644e]"><Icon name="shield" size={15} /> Local processing</span>
        </div>
        <div className="px-5 py-8 sm:px-8 sm:py-10">
          <p className="mb-2 text-[22px] font-semibold tracking-tight text-ink">Your script starts here</p>
          <p className="mb-6 text-[14px] leading-relaxed text-muted">Open a .py file or paste the code. No account needed.</p>
          <label className="inline-flex cursor-pointer items-center gap-3 rounded-lg bg-brand px-7 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-brand-dark focus-within:outline-3 focus-within:outline-offset-4 focus-within:outline-brand">
            <input
              type="file"
              accept=".py,.pyw,.txt,text/x-python,text/plain"
              className="sr-only"
              disabled={busy}
              onChange={(event) => {
                const picked = event.target.files?.[0];
                if (picked) void loadFile(picked);
                event.target.value = "";
              }}
            />
            <UploadMark size={22} color="#fff" />
            {busy ? "Opening…" : "Select .py file"}
          </label>
          <p className="mt-4 text-[14px] text-muted">
            or drop it anywhere on this page, or{" "}
            <button
              type="button"
              aria-expanded={pasting}
              onClick={() => setPasting((value) => !value)}
              className="font-medium text-brand-dark underline underline-offset-2 hover:text-brand"
            >
              paste the code
            </button>
          </p>

          {pasting ? (
            <form
              className="mx-auto mt-6 max-w-2xl text-left"
              onSubmit={(event) => {
                event.preventDefault();
                if (!pasted.trim()) {
                  setError("Paste some Python code first.");
                  return;
                }
                void open(pasted, "notebook.py");
              }}
            >
              <textarea
                value={pasted}
                onChange={(event) => {
                  setPasted(event.target.value);
                  setError("");
                }}
                rows={10}
                spellCheck={false}
                aria-label="Python code"
                placeholder={"# %%\nimport pandas as pd\n\n# %%\ndf = pd.read_csv(\"data.csv\")\ndf.head()"}
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 font-mono text-[14px] leading-relaxed text-ink placeholder:text-muted focus:border-brand focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy}
                className="mt-2 w-full rounded-xl border border-line px-5 py-3 text-[15px] font-medium text-ink hover:border-ink/40 disabled:opacity-50"
              >
                Convert to notebook
              </button>
            </form>
          ) : null}

          {error ? (
            <p role="alert" className="mx-auto mt-6 max-w-md rounded-lg border border-[#f3d0d0] bg-[#fdf2f2] px-4 py-3 text-[15px] text-[#9b2c2c]">
              {error}
            </p>
          ) : null}

          <p className="mt-6 text-[14px] text-muted">
            See the result first.{" "}
            <button
              type="button"
              disabled={busy}
              onClick={() => void open(SAMPLE, "sales_report.py")}
              className="font-medium text-brand-dark underline underline-offset-2 hover:text-brand"
            >
              Try a sample
            </button>
          </p>
        </div>
        <div className="border-t border-line-soft bg-bg/60 px-5 py-3.5 text-[12px] leading-relaxed text-muted">
          Your file is processed in this browser and is never uploaded.{" "}
          <Link href="/privacy" className="font-medium text-ink-soft underline underline-offset-2 hover:text-brand-dark">Privacy details</Link>
        </div>
      </div>
    );
  }

  const cells = notebook.cells ?? [];
  const markdownCells = cells.filter((cell) => cell.cell_type === "markdown").length;

  return (
    <div>
      {dropOverlay}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="order-2 rounded-2xl border border-line bg-surface p-8 sm:p-10 lg:order-1">
          <div className="nb-doc" dangerouslySetInnerHTML={{ __html: html }} />
        </div>

        <aside className="order-1 rounded-2xl border border-line bg-surface lg:sticky lg:top-[84px] lg:order-2">
          <div className="border-b border-line-soft px-6 py-5">
            <h2 className="text-[20px] font-semibold text-ink">Notebook options</h2>
            <p className="mt-2 truncate font-mono text-[13px] text-ink-soft" title={`${baseName}.ipynb`}>
              {baseName}.ipynb
            </p>
            <p className="text-[13px] text-muted">
              {cells.length} {cells.length === 1 ? "cell" : "cells"}
              {markdownCells ? ` (${markdownCells} Markdown)` : ""} · {detectedLabel[conversion!.detected]}
            </p>
          </div>

          <div className="divide-y divide-line-soft">
            <RadioGroup
              title="Split into cells"
              name="split"
              value={options.split}
              onChange={(split) => setOptions((o) => ({ ...o, split }))}
              choices={[
                { value: "auto", label: "Automatic", hint: "At # %% or # In[ ]: markers if the file has them, otherwise at double blank lines" },
                { value: "blank", label: "At double blank lines", hint: "Roughly one function or class per cell" },
                { value: "single", label: "One cell", hint: "The whole script, unchanged" },
              ]}
            />
            <RadioGroup
              title="Magics and !shell lines"
              name="magics"
              value={options.magics}
              onChange={(magics) => setOptions((o) => ({ ...o, magics }))}
              choices={[
                { value: "restore", label: "Restore", hint: "# %matplotlib and get_ipython() calls go back to %matplotlib" },
                { value: "keep", label: "Leave as written", hint: "Exactly what the script has" },
              ]}
            />
          </div>

          <div className="border-t border-line-soft px-6 py-5">
            <button
              type="button"
              onClick={download}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-4 text-[20px] font-medium text-white shadow-[0_3px_6px_rgba(0,0,0,0.14)] hover:bg-brand-dark"
            >
              Download .ipynb
              <ArrowMark />
            </button>
            <button
              type="button"
              onClick={() => void copyJson()}
              className="mt-3 w-full rounded-xl border border-line px-5 py-2.5 text-[15px] text-ink-soft hover:border-ink/40"
            >
              {copied ? "Copied" : "Copy notebook JSON"}
            </button>
            <div className="mt-4 rounded-xl bg-page px-4 py-3 text-[13px] leading-relaxed text-muted">
              <p>Then, with this notebook loaded:</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                {nextSteps.map((step) => (
                  <button
                    key={step.href}
                    type="button"
                    onClick={() => sendTo(step.href)}
                    className="font-medium text-brand underline underline-offset-2 hover:text-brand-dark"
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
            {error ? <p className="mt-3 text-[13px] leading-snug text-[#9b2c2c]">{error}</p> : null}
            <button
              type="button"
              onClick={reset}
              className="mt-3 w-full rounded-xl border border-line px-5 py-2.5 text-[15px] text-ink-soft hover:border-ink/40"
            >
              Convert another script
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
