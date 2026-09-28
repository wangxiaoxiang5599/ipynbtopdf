import type { Metadata } from "next";
import { EmbedCode } from "@/components/EmbedCode";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Embed a Jupyter Notebook to PDF Converter",
  description:
    "Add a free, browser-based Jupyter notebook to PDF converter to a course, documentation page, or developer site with one iframe.",
  alternates: { canonical: "/embed" },
};

export default function EmbedPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <section className="text-center">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          For docs, courses and developer sites
        </p>
        <h1 className="text-[34px] leading-tight font-semibold tracking-tight text-ink sm:text-[46px]">
          Embed a Jupyter notebook to PDF converter
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
          Give readers a way to turn an <code>.ipynb</code> file into a PDF without leaving your page.
          The notebook is read in their browser and is not uploaded to our conversion server.
        </p>
      </section>

      <section className="card mx-auto mt-10 max-w-3xl">
        <h2 className="text-[22px] font-semibold text-ink">1. Copy the iframe</h2>
        <p className="mb-4 mt-2 text-[15px] leading-relaxed text-ink-soft">
          Paste this HTML into the page where you want the converter. The frame fills its container
          and starts at 640 pixels tall; visitors can scroll inside it while previewing a long notebook.
        </p>
        <EmbedCode />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-center text-[22px] font-semibold text-ink">Preview</h2>
        <iframe
          src={`${site.url}/embed/widget`}
          title="Jupyter notebook to PDF converter preview"
          width="100%"
          height="640"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="block w-full rounded-2xl border border-line bg-bg"
        />
      </section>

      <section className="card mx-auto mt-12 max-w-3xl">
        <h2 className="text-[22px] font-semibold text-ink">What visitors can do</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          They can choose a notebook from their device, preview saved text, code, equations and plots,
          then use the browser print dialog to save a PDF. No Python, TeX installation or account is
          needed. Interactive widgets still need a saved static image because a PDF cannot preserve
          their interaction.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          The widget includes a visible “Powered by ipynbtopdf” attribution. Its link is marked
          nofollow: readers can still visit the converter, but the embed is not intended to pass
          search ranking credit. For a standalone converter or more information about local
          processing, visit <a href={site.url} className="font-medium text-brand-dark underline underline-offset-2">ipynbtopdf.xyz</a>.
        </p>
      </section>
    </div>
  );
}
