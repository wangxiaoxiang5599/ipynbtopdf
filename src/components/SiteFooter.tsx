import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="print-hide mt-20 border-t border-line-soft">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 text-[15px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          Notebooks are converted in your browser. Nothing is uploaded to a server.
        </p>
        <nav className="flex gap-5">
          <Link href="/how-to-convert-jupyter-notebook-to-pdf" className="hover:text-ink">
            How to
          </Link>
          <Link href="/fix-nbconvert-pdf-error" className="hover:text-ink">
            nbconvert errors
          </Link>
          <Link href="/faq" className="hover:text-ink">
            FAQ
          </Link>
        </nav>
      </div>
    </footer>
  );
}
