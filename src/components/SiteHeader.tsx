import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

/* The converters live under one menu so the bar stays three items wide as tools are added;
   the guides keep their own links because each is a page people arrive at directly. */
export const tools = [
  { href: "/", label: "ipynb to PDF" },
  { href: "/ipynb-to-html", label: "ipynb to HTML" },
  { href: "/ipynb-to-py", label: "ipynb to PY" },
];

const nav = [
  { href: "/how-to-convert-jupyter-notebook-to-pdf", label: "How to" },
  { href: "/fix-nbconvert-pdf-error", label: "Fix errors" },
  { href: "/faq", label: "FAQ" },
];

/* <details> rather than a JS menu: it opens on click and on Enter, closes on a second click,
   and needs no client component in the header. It does not close when you click elsewhere,
   which for a three-item list is a fair trade. */
function ToolsMenu({ className }: { className: string }) {
  return (
    <details className={`group relative ${className}`}>
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 hover:text-brand [&::-webkit-details-marker]:hidden">
        Tools
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-180">
          <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="absolute left-0 z-50 mt-1 min-w-[190px] rounded-xl border border-line bg-surface p-1.5 shadow-[0_6px_18px_rgba(51,51,59,0.08)] normal-case tracking-normal">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block rounded-lg px-3 py-2 text-[14px] font-medium text-ink hover:bg-brand-soft hover:text-brand-dark"
          >
            {tool.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

export function SiteHeader() {
  return (
    <header className="print-hide sticky top-0 z-40 border-b border-line-soft bg-surface">
      <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/* A 3x cut of logo.png for the 30px header slot; the full file is 93 KB and only the OG
              image needs it. */}
          <Image src="/logo-header.png" alt="" width={72} height={84} className="h-[30px] w-auto" priority />
          <span className="hidden text-[22px] font-bold tracking-tight text-ink min-[400px]:inline">
            ipynb<span className="text-brand">to</span>pdf
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-[14px] font-medium tracking-wide text-ink uppercase sm:flex">
          <ToolsMenu className="uppercase" />
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-2 text-[14px] font-medium whitespace-nowrap text-ink sm:hidden">
            <ToolsMenu className="" />
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
