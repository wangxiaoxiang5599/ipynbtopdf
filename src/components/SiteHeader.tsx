import Link from "next/link";
import Image from "next/image";

const nav = [
  { href: "/how-to-convert-jupyter-notebook-to-pdf", label: "How to" },
  { href: "/fix-nbconvert-pdf-error", label: "Fix errors" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="print-hide border-b border-line-soft">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          {/* A 3x cut of logo.png for the 28px header slot; the full file is 93 KB and only the OG
              image needs it. */}
          <Image src="/logo-header.png" alt="" width={72} height={84} className="h-7 w-auto" priority />
          <span className="font-mono text-[17px] text-ink">ipynbtopdf</span>
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
