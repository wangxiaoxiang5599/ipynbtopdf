"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { tools } from "@/lib/nav";

/* A native <details> so it works before hydration and needs no state; the effect only adds
   the three ways a menu is expected to close that <details> lacks: choosing an item (a
   client-side navigation leaves it open otherwise), clicking elsewhere, and Escape. */
export function ToolsMenu({ className }: { className: string }) {
  const ref = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    const close = () => ref.current?.removeAttribute("open");
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <details ref={ref} className={`group relative ${className}`}>
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
            onClick={() => ref.current?.removeAttribute("open")}
            className="block rounded-lg px-3 py-2 text-[14px] font-medium text-ink hover:bg-brand-soft hover:text-brand-dark"
          >
            {tool.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
