"use client";

import { useState } from "react";
import { site } from "@/lib/site";

export function EmbedCode() {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const code = `<iframe\n  src="${site.url}/embed/widget"\n  title="Jupyter notebook to PDF converter"\n  width="100%"\n  height="640"\n  style="border: 0; border-radius: 16px"\n  loading="lazy"\n  referrerpolicy="strict-origin-when-cross-origin"\n></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyFailed(false);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
  };

  return (
    <div>
      <pre className="overflow-x-auto rounded-xl border border-line-soft bg-bg p-4 text-[13px] leading-relaxed text-ink-soft">
        <code>{code}</code>
      </pre>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-lg bg-brand px-4 py-2.5 text-[14px] font-medium text-white hover:bg-brand-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {copied ? "Copied" : "Copy embed code"}
        </button>
        <p aria-live="polite" className="text-[13px] text-muted">
          {copyFailed ? "Copy was blocked. Select the code above and copy it." : copied ? "Embed code copied." : "Paste this where the converter should appear."}
        </p>
      </div>
    </div>
  );
}
