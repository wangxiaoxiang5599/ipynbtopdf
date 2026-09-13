"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Notebook, NotebookStats, RenderOptions } from "@/lib/ipynb";

type Lib = typeof import("@/lib/ipynb");

const defaultOptions: RenderOptions = {
  showCode: true,
  showOutputs: true,
  showPrompts: false,
};

const GUIDE_SEEN = "ipynbtopdf.guide-seen";

export function Converter() {
  const libRef = useRef<Lib | null>(null);
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

  const loadFile = useCallback(async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const lib = (libRef.current ??= await import("@/lib/ipynb"));
      const nb = lib.parseNotebook(await file.text());
      setNotebook(nb);
      setStats(lib.notebookStats(nb));
      setFileName(file.name);
      setOptions(defaultOptions);
    } catch (cause) {
      setNotebook(null);
      setStats(null);
      setHtml("");
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
  }, []);

  useEffect(() => {
    const lib = libRef.current;
    if (!lib || !notebook) return;
    setHtml(lib.renderNotebook(notebook, options));
  }, [notebook, options]);

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

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void loadFile(file);
  };

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

  const reset = () => {
    setNotebook(null);
    setStats(null);
    setHtml("");
    setFileName("");
    setError("");
  };

  if (!notebook) {
    return (
      <div>
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
            dragging
              ? "border-brand bg-brand-soft"
              : "border-brand-line bg-brand-soft/60 hover:border-brand"
          }`}
        >
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
          <UploadMark />
          <span className="mt-6 rounded-xl bg-brand px-9 py-4 text-[19px] font-medium text-ink">
            {busy ? "Opening…" : "Select .ipynb file"}
          </span>
          <p className="mt-4 text-[15px] text-muted">or drop it here</p>
        </label>

        {error ? (
          <p className="mt-4 rounded-lg border border-[#f3d0d0] bg-[#fdf2f2] px-4 py-3 text-[15px] text-[#9b2c2c]">
            {error}
          </p>
        ) : null}

        <p className="mt-5 text-center text-[15px] text-muted">
          <button
            type="button"
            onClick={() => void loadSample()}
            className="text-brand-dark underline underline-offset-2 hover:text-brand"
          >
            Try a sample notebook
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="print-hide rounded-2xl border border-line bg-surface px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <p className="truncate font-mono text-[15px] text-ink">{fileName}</p>
            {stats ? (
              <p className="mt-0.5 text-[14px] text-muted">{stats.cells} cells</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-line px-5 py-3 text-[16px] text-ink-soft hover:border-ink/30"
            >
              New file
            </button>
            <button
              type="button"
              onClick={download}
              className="rounded-xl bg-brand px-7 py-3 text-[17px] font-medium text-ink hover:bg-brand-line"
            >
              Download PDF
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-line-soft pt-4 text-[16px] text-ink-soft">
          <Toggle
            label="Code"
            checked={options.showCode}
            onChange={(showCode) => setOptions((o) => ({ ...o, showCode }))}
          />
          <Toggle
            label="Results"
            checked={options.showOutputs}
            onChange={(showOutputs) => setOptions((o) => ({ ...o, showOutputs }))}
          />
          <Toggle
            label="Cell numbers"
            checked={options.showPrompts}
            onChange={(showPrompts) => setOptions((o) => ({ ...o, showPrompts }))}
          />
        </div>
      </div>

      {showGuide ? (
        <PrintGuide onCancel={() => setShowGuide(false)} onConfirm={confirmGuide} />
      ) : null}

      <div className="print-area mt-5 rounded-xl border border-line bg-surface p-8 sm:p-10">
        <div
          id="nb-doc"
          ref={docRef}
          className="nb-doc"
          dangerouslySetInnerHTML={{ __html: html }}
        />
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
          className="mt-7 w-full rounded-xl bg-brand px-6 py-4 text-[18px] font-medium text-ink hover:bg-brand-line"
        >
          Got it, open the print window
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-[18px] accent-brand"
      />
      {label}
    </label>
  );
}

function UploadMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 20.5h12a2 2 0 0 0 2-2V8.5L14.5 3H6a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2Z"
        stroke="#f37726"
        strokeWidth="1.4"
      />
      <path d="M14 3v5.5h6" stroke="#f37726" strokeWidth="1.4" />
      <path d="M12 16v-5m0 0-2 2m2-2 2 2" stroke="#f37726" strokeWidth="1.4" />
    </svg>
  );
}
