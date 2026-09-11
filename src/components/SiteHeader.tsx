import Link from "next/link";

const nav = [
  { href: "/how-to-convert-jupyter-notebook-to-pdf", label: "How to" },
  { href: "/fix-nbconvert-pdf-error", label: "Fix errors" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="print-hide border-b border-line-soft">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="flex items-baseline gap-1.5 font-mono text-[17px]">
          <span className="text-ink">ipynb</span>
          <span className="text-brand">→</span>
          <span className="text-ink">pdf</span>
        </Link>
        <nav className="flex items-center gap-4 text-[15px] whitespace-nowrap text-muted sm:gap-5">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
