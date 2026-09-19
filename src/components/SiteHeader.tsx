import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

const nav = [
  { href: "/ipynb-to-html", label: "To HTML" },
  { href: "/how-to-convert-jupyter-notebook-to-pdf", label: "How to" },
  { href: "/fix-nbconvert-pdf-error", label: "Fix errors" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="print-hide sticky top-0 z-40 border-b border-line-soft bg-surface">
      <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/* A 3x cut of logo.png for the 30px header slot; the full file is 93 KB and only the OG
              image needs it. */}
          <Image src="/logo-header.png" alt="" width={72} height={84} className="h-[30px] w-auto" priority />
          {/* Four nav items plus the wordmark do not fit a 375px phone; the mark alone
              identifies the site there, and the wordmark returns at 420px. */}
          <span className="hidden text-[22px] font-bold tracking-tight text-ink min-[420px]:inline">
            ipynb<span className="text-brand">to</span>pdf
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-[14px] font-medium tracking-wide text-ink uppercase sm:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-3 text-[14px] font-medium whitespace-nowrap text-ink sm:hidden">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-brand">
                {item.label}
              </Link>
            ))}
          </nav>
          <a
            href={site.repo}
            className="hidden rounded-lg bg-brand px-4 py-2 text-[14px] font-semibold text-white hover:bg-brand-dark sm:inline-block"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
