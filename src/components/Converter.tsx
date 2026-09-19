"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Notebook, NotebookStats, RenderOptions } from "@/lib/ipynb";
import { downloadText, fragmentHtml, standaloneHtml, type HtmlExportKind } from "@/lib/export-html";
import { defaultScriptOptions, type Script, type ScriptOptions } from "@/lib/script-options";

type Lib = typeof import("@/lib/ipynb");
type ScriptLib = typeof import("@/lib/script");

const defaultOptions: RenderOptions = {
  showCode: true,
  showOutputs: true,
  showPrompts: false,
};

const GUIDE_SEEN = "ipynbtopdf.guide-seen";

/* One component serves every tool page. Opening the file is identical; the mode decides what
   the preview shows (a rendered document, or a script) and what the sidebar does with it. */
export type ConverterMode = "pdf" | "html" | "script";

export function Converter({ mode = "pdf" }: { mode?: ConverterMode }) {
  const libRef = useRef<Lib | null>(null);
  const scriptLibRef = useRef<ScriptLib | null>(null);
  const docRef = useRef<HTMLDivElement | null>(null);
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

  const loadFile = useCallback(async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const lib = (libRef.current ??= await import("@/lib/ipynb"));
      if (mode === "script") scriptLibRef.current ??= await import("@/lib/script");
      const nb = lib.parseNotebook(await file.text());
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

  useEffect(() => {
    const lib = libRef.current;
    if (!lib || !notebook || mode === "script") return;
    setHtml(lib.renderNotebook(notebook, options));
  }, [notebook, options, mode]);

  useEffect(() => {
    const lib = scriptLibRef.current;
    if (!lib || !notebook || mode !== "script") return;
    setScript(lib.notebookToScript(notebook, fileName, scriptOptions));
  }, [notebook, fileName, scriptOptions, mode]);

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
    setFileName("");
    setError("");
  };

  const modeLabel = { pdf: "PDF options", html: "HTML options", script: "Script options" }[mode];
  const downloadLabel = {
    pdf: "Download PDF",
    html: "Download HTML",
    script: `Download .${script?.extension ?? "py"}`,
  }[mode];
  const onDownload = { pdf: download, html: downloadHtml, script: downloadScript }[mode];

  const dropOverlay = dragging ? (
    <div className="print-hide pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-brand/90 text-center text-white">
      <div>
        <UploadMark size={64} color="#fff" />
        <p className="mt-4 text-[32px] font-semibold">Drop your notebook here</p>
        <p className="mt-1 text-[17px] opacity-90">.ipynb files only</p>
      </div>
    </div>
  ) : null;

  if (!notebook) {
    return (
      <div className="text-center">
        {dropOverlay}
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
          {busy ? "Opening…" : "Select .ipynb file"}
        </label>
        <p className="mt-4 text-[14px] text-muted">or drop the notebook anywhere on this page</p>

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
                  : plural(stats.cells, "cell")}
              </p>
            ) : null}
          </div>

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

          <div className="border-t border-line-soft px-6 py-5">
            <button
              type="button"
              onClick={onDownload}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-4 text-[20px] font-medium text-white shadow-[0_3px_6px_rgba(0,0,0,0.14)] hover:bg-brand-dark"
            >
              {downloadLabel}
              <ArrowMark />
            </button>
            {mode !== "pdf" ? (
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
              className="mt-3 w-full rounded-xl border border-line px-5 py-2.5 text-[15px] text-ink-soft hover:border-ink/40"
            >
              Choose another file
            </button>
          </div>
        </aside>
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
