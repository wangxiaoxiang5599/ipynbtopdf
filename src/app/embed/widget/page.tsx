import type { Metadata } from "next";
import { Converter } from "@/components/Converter";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Jupyter Notebook to PDF Converter",
  description: "Convert an .ipynb notebook to PDF in your browser, without uploading the file.",
  robots: { index: false, follow: true },
};

export default function EmbedWidgetPage() {
  return (
    <div data-embed-root className="min-h-screen px-3 py-3 sm:px-4 sm:py-4">
      <div className="print-hide mx-auto mb-3 flex max-w-3xl items-center justify-between gap-3 px-1">
        <p className="text-[13px] font-medium text-ink">Convert a Jupyter notebook to PDF</p>
        <p className="shrink-0 text-[12px] text-muted">Local processing · No upload</p>
      </div>
      <Converter />
      <p className="print-hide mx-auto mt-3 max-w-3xl px-1 text-[12px] text-muted">
        Powered by{" "}
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="font-medium text-brand-dark underline underline-offset-2"
        >
          ipynbtopdf
        </a>
        {" · Your notebook stays in your browser."}
      </p>
    </div>
  );
}
