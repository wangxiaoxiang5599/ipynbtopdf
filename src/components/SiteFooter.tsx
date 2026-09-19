import Link from "next/link";
import { site } from "@/lib/site";
import { tools } from "@/components/SiteHeader";

const columns = [
  { title: "Tools", links: tools },
  {
    title: "Guides",
    links: [
      { href: "/how-to-convert-jupyter-notebook-to-pdf", label: "How to convert a notebook to PDF" },
      { href: "/fix-nbconvert-pdf-error", label: "Fix nbconvert PDF errors" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: site.repo, label: "Source on GitHub" },
      { href: `${site.repo}/blob/master/LICENSE`, label: "MIT licence" },
      { href: `${site.repo}/issues`, label: "Report a problem" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="print-hide mt-24 border-t border-line-soft bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-[20px] font-bold tracking-tight text-ink">
            ipynb<span className="text-brand">to</span>pdf
          </p>
          <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-muted">
            Converts Jupyter notebooks to PDF inside your browser. Nothing is uploaded, nothing
            is installed, and there is no account to make.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-[14px] font-semibold text-ink">{column.title}</p>
            <ul className="mt-3 space-y-2 text-[14px] text-muted">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line-soft">
        <p className="mx-auto max-w-6xl px-5 py-5 text-[13px] text-muted">
          © {new Date().getFullYear()} ipynbtopdf · Free, open source, and runs entirely on your
          machine.
        </p>
      </div>
    </footer>
  );
}
