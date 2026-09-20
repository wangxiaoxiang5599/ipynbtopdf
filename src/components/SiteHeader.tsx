import Link from "next/link";
import { Brand } from "@/components/Brand";
import { site } from "@/lib/site";
import { ToolsMenu } from "@/components/ToolsMenu";

const nav = [
  { href: "/how-to-convert-jupyter-notebook-to-pdf", label: "How to" },
  { href: "/fix-nbconvert-pdf-error", label: "Fix errors" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="print-hide sticky top-0 z-40 border-b border-line-soft bg-surface">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3 px-5">
        <Link href="/" aria-label="ipynbtopdf home" className="flex shrink-0 items-center">
          <Brand />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 text-[14px] font-medium text-ink-soft md:flex">
          <ToolsMenu className="" />
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <nav aria-label="Mobile navigation" className="flex items-center text-[14px] font-medium text-ink md:hidden">
            <ToolsMenu className="[&>div]:right-0 [&>div]:left-auto" />
          </nav>
          <a
            href={site.repo}
            className="hidden rounded-lg border border-line px-4 py-2 text-[13px] font-medium text-ink hover:border-brand hover:text-brand-dark md:inline-block"
          >
            Source on GitHub ↗
          </a>
        </div>
      </div>
    </header>
  );
}
