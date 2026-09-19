"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Notebook, NotebookStats, RenderOptions } from "@/lib/ipynb";
import { downloadText, fragmentHtml, standaloneHtml, type HtmlExportKind } from "@/lib/export-html";
import { defaultScriptOptions, type Script, type ScriptOptions } from "@/lib/script-options";
import { setPendingFile, takePendingFile } from "@/lib/handoff";
import { fetchNotebookFile } from "@/lib/fetch-notebook";

type Lib = typeof import("@/lib/ipynb");
type ScriptLib = typeof import("@/lib/script");

const defaultOptions: RenderOptions = {
  showCode: true,
  showOutputs: true,
  showPrompts: false,
  foldOutputs: true,
};

const GUIDE_SEEN = "ipynbtopdf.guide-seen";

/* One component serves every tool page. Opening the file is identical; the mode decides what
   the preview shows (a rendered document, or a script) and what the sidebar does with it.
   "view" is the reader: no export of its own, an outline instead, and buttons that carry the
   open file to the other three. */
export type ConverterMode = "pdf" | "html" | "script" | "view";

type OutlineEntry = { id: string; level: number; text: string };

const saveAs = [
  { href: "/", label: "PDF" },
  { href: "/ipynb-to-html", label: "HTML" },
  { href: "/ipynb-to-py", label: "Python script" },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* "colab" changes only the empty state: the visitor is in Colab with no file yet, so the
   first thing shown is how to get one, and a link field for Colab's GitHub-backed URLs. */
export function Converter({
  mode = "pdf",
  variant,
}: {
  mode?: ConverterMode;
  variant?: "colab";
}) {
  const router = useRouter();
  const libRef = useRef<Lib | null>(null);
  const scriptLibRef = useRef<ScriptLib | null>(null);
  const docRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<File | null>(null);
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [stats, setStats] = useState<NotebookStats | null>(null);
  const [fileName, setFileName] = useState("");
  const [html, setHtml] = useState("");
  const [options, setOptions] = useState(defaultOptions);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [exportKind, setExportKind] = useState<HtmlExportKind>("page");
  const [scriptOptions, setScriptOptions] = useState<ScriptOptions>(defaultScriptOptions);
  const [script, setScript] = useState<Script | null>(null);
  const [copied, setCopied] = useState(false);
  const [outline, setOutline] = useState<OutlineEntry[]>([]);
  const [link, setLink] = useState("");
  const [fileSize, setFileSize] = useState(0);

  const loadFile = useCallback(async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const lib = (libRef.current ??= await import("@/lib/ipynb"));
      if (mode === "script") scriptLibRef.current ??= await import("@/lib/script");
      const nb = lib.parseNotebook(await file.text());
      fileRef.current = file;
      setFileSize(file.size);
      setNotebook(nb);
      setStats(lib.notebookStats(nb));
      setFileName(file.name);
      setOptions(defaultOptions);
      setScriptOptions(defaultScriptOptions);
    } catch (cause) {
      setNotebook(null);
      setStats(null);
      setHtml("");
      setScript(null);
      setError(
        cause instanceof SyntaxError
          ? "That file isn't valid JSON, so it can't be read as a notebook."
          : cause instanceof Error
            ? cause.message
            : "Something went wrong reading that file.",
      );
    } finally {
      setBusy(false);
    }
  }, [mode]);

  /* A file sent over from the viewer's "Save as" buttons. Taken inside the timer, not the
     effect body: development Strict Mode runs the effect, cleans up and runs it again, and a
     file taken by the first run would be gone by the second. */
  useEffect(() => {
    const timer = setTimeout(() => {
      const file = takePendingFile();
      if (file) void loadFile(file);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadFile]);

  useEffect(() => {
    const lib = libRef.current;
    if (!lib || !notebook || mode === "script") return;
    setHtml(lib.renderNotebook(notebook, options));
  }, [notebook, options, mode]);

  /* The outline is read off the rendered headings rather than the Markdown source, so it
     shows what the reader sees — after inline code, links and maths have been rendered. */
  useEffect(() => {
    const root = docRef.current;
    if (!root || mode !== "view") return;
    const headings = root.querySelectorAll<HTMLHeadingElement>(".nb-md h1, .nb-md h2, .nb-md h3");
    const entries: OutlineEntry[] = [];
    headings.forEach((heading, index) => {
      const id = `nb-h-${index}`;
      heading.id = id;
      const text = heading.textContent?.trim() ?? "";
      if (text) entries.push({ id, level: Number(heading.tagName[1]), text });
    });
    setOutline(entries);
  }, [html, mode]);

  useEffect(() => {
    const lib = scriptLibRef.current;
    if (!lib || !notebook || mode !== "script") return;
    setScript(lib.notebookToScript(notebook, fileName, scriptOptions));
  }, [notebook, fileName, scriptOptions, mode]);

  /* A4 with the @page margins leaves about 182 mm, 688 px at 96 dpi; Letter is a touch
     wider. A table past that is zoomed down for print, never up. */
  useEffect(() => {
    const root = docRef.current;
    if (!root) return;
    const PRINT_WIDTH = 688;
    for (const table of root.querySelectorAll<HTMLTableElement>(".nb-table table")) {
      const width = table.scrollWidth;
      table.style.setProperty("--nb-zoom", width > PRINT_WIDTH ? String(PRINT_WIDTH / width) : "1");
    }
  }, [html]);

  /* Notebooks link images that live on the open web, and old ones point at URLs that died
     years ago. A broken-image icon printed into a PDF helps nobody. */
  useEffect(() => {
    const root = docRef.current;
    if (!root) return;

    const replace = (img: HTMLImageElement) => {
      const note = document.createElement("span");
      note.className = "nb-missing";
      note.textContent = `Image could not be loaded: ${img.getAttribute("src") ?? ""}`;
      img.replaceWith(note);
    };

    const onError = (event: Event) => {
      if (event.target instanceof HTMLImageElement) replace(event.target);
    };

    root.addEventListener("error", onError, true);
    for (const img of root.querySelectorAll("img")) {
      if (img.complete && img.naturalWidth === 0) replace(img);
    }

    return () => root.removeEventListener("error", onError, true);
  }, [html]);

  const loadSample = async () => {
    const response = await fetch("/sample-notebook.ipynb");
    const blob = await response.blob();
    void loadFile(new File([blob], "sample-notebook.ipynb"));
  };

  const openLink = async () => {
    setBusy(true);
    setError("");
    try {
      await loadFile(await fetchNotebookFile(link));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That link could not be opened.");
    } finally {
      setBusy(false);
    }
  };

  const sendTo = (href: string) => {
    if (fileRef.current) setPendingFile(fileRef.current);
    router.push(href);
  };

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* The whole window is the drop target, so a file dragged anywhere onto the page opens it.
     dragenter/dragleave fire for every child crossed, hence the depth counter. */
  useEffect(() => {
    let depth = 0;
    const enter = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      depth += 1;
      setDragging(true);
    };
    const leave = () => {
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const over = (event: DragEvent) => event.preventDefault();
    const drop = (event: DragEvent) => {
      event.preventDefault();
      depth = 0;
      setDragging(false);
      const file = event.dataTransfer?.files?.[0];
      if (file) void loadFile(file);
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("dragover", over);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("dragover", over);
      window.removeEventListener("drop", drop);
    };
  }, [loadFile]);

  const print = () => {
    const previous = document.title;
    document.title = fileName.replace(/\.ipynb$/i, "") || "notebook";
    window.print();
    document.title = previous;
  };

  const download = () => {
    let seenGuide = false;
    try {
      seenGuide = localStorage.getItem(GUIDE_SEEN) === "1";
    } catch {
      seenGuide = false;
    }
    if (seenGuide) print();
    else setShowGuide(true);
  };

  const confirmGuide = () => {
    try {
      localStorage.setItem(GUIDE_SEEN, "1");
    } catch {
      // a browser with storage blocked simply shows the guide again next time
    }
    setShowGuide(false);
    setTimeout(print, 0);
  };

  const baseName = fileName.replace(/\.ipynb$/i, "") || "notebook";

  const exportHtml = () =>
    exportKind === "page" ? standaloneHtml(baseName, html) : fragmentHtml(html);

  const downloadHtml = () => downloadText(`${baseName}.html`, exportHtml());

  const downloadScript = () => {
    if (script) downloadText(`${baseName}.${script.extension}`, script.code, "text/plain");
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(mode === "script" ? (script?.code ?? "") : exportHtml());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("The browser refused clipboard access. Download the file instead.");
    }
  };

  const reset = () => {
    setNotebook(null);
    setStats(null);
    setHtml("");
    setScript(null);
    setOutline([]);
    setFileName("");
    setError("");
    fileRef.current = null;
  };

  const modeLabel = {
    pdf: "PDF options",
    html: "HTML options",
    script: "Script options",
    view: "Notebook",
  }[mode];
  const downloadLabel = {
    pdf: "Download PDF",
    html: "Download HTML",
    script: `Download .${script?.extension ?? "py"}`,
    view: "",
  }[mode];
  const onDownload = { pdf: download, html: downloadHtml, script: downloadScript, view: reset }[mode];
  const kernel = notebook?.metadata?.kernelspec?.display_name ?? stats?.language ?? "";

  const dropOverlay = dragging ? (
    <div className="print-hide pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-brand/90 text-center text-white">
      <div>
        <UploadMark size={64} color="#fff" />
        <p className="mt-4 text-[32px] font-semibold">Drop your notebook here</p>
        <p className="mt-1 text-[17px] opacity-90">.ipynb files only</p>
      </div>
    </div>
  ) : null;

  const showLink = mode === "view" || variant === "colab";

  if (!notebook) {
    return (
      <div className="text-center">
        {dropOverlay}
        {variant === "colab" ? <ColabSteps /> : null}
        <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl bg-brand px-12 py-6 text-[24px] font-medium text-white shadow-[0_3px_6px_rgba(0,0,0,0.14)] transition-colors hover:bg-brand-dark">
          <input
            type="file"
            accept=".ipynb,application/json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void loadFile(file);
              event.target.value = "";
            }}
          />
          <UploadMark size={22} color="#fff" />
          {busy ? "Opening…" : mode === "view" ? "Open .ipynb file" : "Select .ipynb file"}
        </label>
        <p className="mt-4 text-[14px] text-muted">or drop the notebook anywhere on this page</p>

        {showLink ? (
          <form
            className="mx-auto mt-8 flex max-w-xl gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void openLink();
            }}
          >
            <input
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder={
                variant === "colab"
                  ? "https://colab.research.google.com/github/user/repo/blob/main/nb.ipynb"
                  : "https://github.com/user/repo/blob/main/notebook.ipynb"
              }
              aria-label="Link to a notebook"
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !link.trim()}
              className="shrink-0 rounded-xl border border-line px-5 py-3 text-[15px] font-medium text-ink hover:border-ink/40 disabled:opacity-50"
            >
              Open link
            </button>
          </form>
        ) : null}
        {showLink ? (
          <p className="mt-3 text-[13px] text-muted">
            {variant === "colab"
              ? "Works for Colab links that open a GitHub notebook. Drive links need the download step above."
              : "GitHub, Gist or any public .ipynb address. Your browser fetches it; this site never sees it."}
          </p>
        ) : null}

        {error ? (
          <p className="mx-auto mt-6 max-w-md rounded-lg border border-[#f3d0d0] bg-[#fdf2f2] px-4 py-3 text-[15px] text-[#9b2c2c]">
            {error}
          </p>
        ) : null}

        <p className="mt-8 text-[15px] text-muted">
          No notebook to hand?{" "}
          <button
            type="button"
            onClick={() => void loadSample()}
            className="font-medium text-brand-dark underline underline-offset-2 hover:text-brand"
          >
            Try a sample
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      {dropOverlay}
      {showGuide ? (
        <PrintGuide onCancel={() => setShowGuide(false)} onConfirm={confirmGuide} />
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] print:block">
        <div className="print-area order-2 rounded-2xl border border-line bg-surface p-8 sm:p-10 lg:order-1">
          {mode === "script" ? (
            <pre className="nb-script">
              <code dangerouslySetInnerHTML={{ __html: script?.html ?? "" }} />
            </pre>
          ) : (
            <div
              id="nb-doc"
              ref={docRef}
              className="nb-doc"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>

        <aside className="print-hide order-1 rounded-2xl border border-line bg-surface lg:sticky lg:top-[84px] lg:order-2">
          <div className="border-b border-line-soft px-6 py-5">
            <h2 className="text-[20px] font-semibold text-ink">{modeLabel}</h2>
            <p className="mt-2 truncate font-mono text-[13px] text-ink-soft" title={fileName}>
              {fileName}
            </p>
            {stats ? (
              <p className="text-[13px] text-muted">
                {mode === "script" && script
                  ? `${plural(stats.codeCells, "code cell")} · ${script.languageName} → .${script.extension}`
                  : mode === "view"
                    ? `${kernel} · ${plural(stats.cells, "cell")} · ${formatSize(fileSize)}`
                    : plural(stats.cells, "cell")}
              </p>
            ) : null}
          </div>

          {mode === "view" && outline.length ? (
            <nav aria-label="Outline" className="border-b border-line-soft px-6 py-5">
              <p className="text-[15px] font-medium text-ink">Outline</p>
              <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-[14px]">
                {outline.map((entry) => (
                  <li key={entry.id} style={{ paddingLeft: `${(entry.level - 1) * 12}px` }}>
                    <button
                      type="button"
                      onClick={() => jumpTo(entry.id)}
                      className="block w-full truncate text-left text-ink-soft hover:text-brand-dark"
                      title={entry.text}
                    >
                      {entry.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {mode === "script" ? (
            <div className="divide-y divide-line-soft">
              <RadioGroup
                title="Cell markers"
                name="markers"
                value={scriptOptions.markers}
                onChange={(markers) => setScriptOptions((o) => ({ ...o, markers }))}
                choices={[
                  { value: "percent", label: "# %%", hint: "VS Code, Spyder and PyCharm run these as cells", mono: true },
                  { value: "nbconvert", label: "# In[1]:", hint: "What nbconvert --to script writes", mono: true },
                  { value: "none", label: "None", hint: "Cells run together, nothing between them" },
                ]}
              />
              <RadioGroup
                title="Markdown cells"
                name="markdown"
                value={scriptOptions.markdown}
                onChange={(markdown) => setScriptOptions((o) => ({ ...o, markdown }))}
                choices={[
                  { value: "comment", label: "Keep as comments", hint: "Headings and notes stay in the file" },
                  { value: "drop", label: "Drop", hint: "Code only" },
                ]}
              />
              <RadioGroup
                title="Magics and !shell lines"
                name="magics"
                value={scriptOptions.magics}
                onChange={(magics) => setScriptOptions((o) => ({ ...o, magics }))}
                choices={[
                  { value: "comment", label: "Comment out", hint: "%matplotlib and !pip stay visible, the script still runs" },
                  { value: "remove", label: "Remove", hint: "Gone from the file" },
                  { value: "keep", label: "Keep as written", hint: "For running inside IPython" },
                ]}
              />
            </div>
          ) : (
          <div className="space-y-4 px-6 py-5">
            <Toggle
              label="Code cells"
              hint="Off gives a report with only text and results"
              checked={options.showCode}
              onChange={(showCode) => setOptions((o) => ({ ...o, showCode }))}
            />
            <Toggle
              label="Outputs"
              hint="Plots, tables and printed text"
              checked={options.showOutputs}
              onChange={(showOutputs) => setOptions((o) => ({ ...o, showOutputs }))}
            />
            <Toggle
              label="Cell numbers"
              hint="The In [1] / Out [1] labels"
              checked={options.showPrompts}
              onChange={(showPrompts) => setOptions((o) => ({ ...o, showPrompts }))}
            />
            <Toggle
              label="Fold long outputs"
              hint="Logs over 40 lines keep their first 25 and last 10"
              checked={options.foldOutputs}
              onChange={(foldOutputs) => setOptions((o) => ({ ...o, foldOutputs }))}
            />
          </div>
          )}

          {mode === "html" ? (
            <fieldset className="border-t border-line-soft px-6 py-5">
              <legend className="sr-only">What the file contains</legend>
              <p className="text-[15px] font-medium text-ink">Output</p>
              <div className="mt-3 space-y-2.5">
                <Radio
                  name="export-kind"
                  value="page"
                  label="Full page"
                  hint="A complete .html with styles inside, opens anywhere"
                  checked={exportKind === "page"}
                  onChange={setExportKind}
                />
                <Radio
                  name="export-kind"
                  value="fragment"
                  label="Body only"
                  hint="Just the notebook markup, for pasting into a site"
                  checked={exportKind === "fragment"}
                  onChange={setExportKind}
                />
              </div>
            </fieldset>
          ) : null}

          {mode === "view" ? (
            <div className="border-t border-line-soft px-6 py-5">
              <p className="text-[15px] font-medium text-ink">Save as</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {saveAs.map((target, index) => (
                  <button
                    key={target.href}
                    type="button"
                    onClick={() => sendTo(target.href)}
                    className={
                      index === 0
                        ? "rounded-xl bg-brand px-3 py-3 text-[15px] font-medium text-white hover:bg-brand-dark"
                        : "rounded-xl border border-line px-3 py-3 text-[15px] font-medium text-ink hover:border-ink/40"
                    }
                  >
                    {target.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-muted">Opens the converter with this notebook already loaded.</p>
            </div>
          ) : null}

          <div className="border-t border-line-soft px-6 py-5">
            {mode !== "view" ? (
              <button
                type="button"
                onClick={onDownload}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-4 text-[20px] font-medium text-white shadow-[0_3px_6px_rgba(0,0,0,0.14)] hover:bg-brand-dark"
              >
                {downloadLabel}
                <ArrowMark />
              </button>
            ) : null}
            {mode !== "pdf" && mode !== "view" ? (
              <button
                type="button"
                onClick={() => void copyText()}
                className="mt-3 w-full rounded-xl border border-line px-5 py-2.5 text-[15px] text-ink-soft hover:border-ink/40"
              >
                {copied ? "Copied" : mode === "html" ? "Copy HTML" : "Copy code"}
              </button>
            ) : null}
            {error ? (
              <p className="mt-3 text-[13px] leading-snug text-[#9b2c2c]">{error}</p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              className={`w-full rounded-xl border border-line px-5 py-2.5 text-[15px] text-ink-soft hover:border-ink/40${mode === "view" ? "" : " mt-3"}`}
            >
              {mode === "view" ? "Open another notebook" : "Choose another file"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* The Colab File menu, drawn rather than screenshotted so it stays crisp and matches the
   site; the labels are Colab's own. */
function ColabSteps() {
  return (
    <div className="mx-auto mb-10 grid max-w-3xl gap-5 text-left sm:grid-cols-2">
      <div className="card">
        <p className="flex items-center gap-3 text-[17px] font-medium text-ink">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-[15px] font-semibold text-white">
            1
          </span>
          In Colab: File → Download → Download .ipynb
        </p>
        <div className="mt-4 flex gap-2 font-sans text-[13px]" aria-hidden="true">
          <ul className="w-36 overflow-hidden rounded-lg border border-line bg-surface text-ink-soft">
            <li className="px-3 py-1.5">New notebook</li>
            <li className="px-3 py-1.5">Open notebook</li>
            <li className="px-3 py-1.5">Save</li>
            <li className="flex justify-between bg-brand px-3 py-1.5 font-medium text-white">
              Download <span>▸</span>
            </li>
            <li className="px-3 py-1.5">Print</li>
          </ul>
          <ul className="h-fit w-36 overflow-hidden rounded-lg border border-line bg-surface text-ink-soft">
            <li className="bg-brand px-3 py-1.5 font-medium text-white">Download .ipynb</li>
            <li className="px-3 py-1.5">Download .py</li>
          </ul>
        </div>
        <p className="mt-3 text-[13px] text-muted">
          Outputs are saved with the file, so run the cells you want in the PDF first.
        </p>
      </div>
      <div className="card flex flex-col justify-center">
        <p className="flex items-center gap-3 text-[17px] font-medium text-ink">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-[15px] font-semibold text-white">
            2
          </span>
          Open that file here
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          Use the button below or drop the file anywhere on the page. It is rendered in your
          browser and saved as a PDF from there. Nothing is uploaded.
        </p>
      </div>
    </div>
  );
}

function PrintGuide({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Before the print window opens"
      className="print-hide fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-5"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-surface p-8 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-[24px] font-semibold text-ink">Two settings to check</h2>
        <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">
          A print window will open. Set these, then click Save.
        </p>

        <div className="mt-6 space-y-4 rounded-xl border border-line bg-bg p-5 text-left">
          <div>
            <p className="text-[14px] text-muted">Destination</p>
            <div className="mt-1.5 flex items-center justify-between rounded-lg border-2 border-brand bg-surface px-4 py-3">
              <span className="text-[16px] text-ink">Save as PDF</span>
              <span className="text-[13px] text-muted">▾</span>
            </div>
          </div>
          <div>
            <p className="text-[14px] text-muted">Under &ldquo;More settings&rdquo;</p>
            <div className="mt-1.5 flex items-center gap-3 rounded-lg border-2 border-brand bg-surface px-4 py-3">
              <span className="flex size-[18px] items-center justify-center rounded border border-line-soft bg-bg" />
              <span className="text-[16px] text-ink">Headers and footers</span>
              <span className="ml-auto text-[14px] text-muted">off</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="mt-7 w-full rounded-xl bg-brand px-6 py-4 text-[18px] font-medium text-white hover:bg-brand-dark"
        >
          Got it, open the print window
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 select-none">
      <span>
        <span className="block text-[15px] font-medium text-ink">{label}</span>
        <span className="block text-[13px] text-muted">{hint}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  );
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function RadioGroup<T extends string>({
  title,
  name,
  value,
  onChange,
  choices,
}: {
  title: string;
  name: string;
  value: T;
  onChange: (value: T) => void;
  choices: { value: T; label: string; hint: string; mono?: boolean }[];
}) {
  return (
    <fieldset className="px-6 py-5">
      <legend className="sr-only">{title}</legend>
      <p className="text-[15px] font-medium text-ink">{title}</p>
      <div className="mt-3 space-y-2.5">
        {choices.map((choice) => (
          <Radio
            key={choice.value}
            name={name}
            value={choice.value}
            label={choice.label}
            hint={choice.hint}
            mono={choice.mono}
            checked={value === choice.value}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  );
}

function Radio<T extends string>({
  name,
  value,
  label,
  hint,
  mono,
  checked,
  onChange,
}: {
  name: string;
  value: T;
  label: string;
  hint: string;
  mono?: boolean;
  checked: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 select-none">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="mt-[3px] flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 border-line peer-checked:border-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 after:size-2 after:rounded-full after:bg-brand after:opacity-0 peer-checked:after:opacity-100"
      />
      <span>
        <span
          className={
            mono
              ? "block font-mono text-[14px] font-medium text-ink"
              : "block text-[15px] font-medium text-ink"
          }
        >
          {label}
        </span>
        <span className="block text-[13px] text-muted">{hint}</span>
      </span>
    </label>
  );
}

function ArrowMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadMark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 16V4m0 0-5 5m5-5 5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
