import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { site } from "@/lib/site";

const sans = Inter({ variable: "--font-sans-body", subsets: ["latin"] });

const mono = JetBrains_Mono({ variable: "--font-mono-code", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  /* No brand suffix template: an unknown brand buys nothing in a search result and costs
     the 13 characters Google would otherwise show of the actual title. */
  title: "ipynb to PDF — convert Jupyter notebooks online, free",
  description:
    "Convert .ipynb Jupyter notebooks to PDF in your browser. Keeps Markdown, code highlighting, LaTeX math, plots and tables. No upload, no install.",
  openGraph: {
    type: "website",
    siteName: site.name,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
