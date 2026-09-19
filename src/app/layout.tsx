import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { site } from "@/lib/site";
import { notebookCss } from "@/lib/notebook-css";

const sans = Inter({ variable: "--font-sans-body", subsets: ["latin"] });

/* Not preloaded: it draws the header wordmark and cell prompts, nothing the first paint waits
   for, and the preload was competing with Inter for the H1. */
const mono = JetBrains_Mono({ variable: "--font-mono-code", subsets: ["latin"], preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  /* No brand suffix template: an unknown brand buys nothing in a search result and costs
     the 13 characters Google would otherwise show of the actual title. */
  title: "ipynb to PDF — convert Jupyter notebooks online, free",
  description:
    "Convert .ipynb Jupyter notebooks to PDF in your browser. Keeps Markdown, code highlighting, LaTeX math, plots and tables. No upload, no install.",
  /* A plain file rather than a generated route: static hosts serve by extension, and social
     scrapers reject an image served as application/octet-stream. Regenerate with
     scripts/build-og.mjs when the headline or domain changes. */
  openGraph: {
    type: "website",
    siteName: site.name,
    url: site.url,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Convert ipynb to PDF" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

/* Site-level entities, emitted once here so every page carries them. The home page adds
   the SoftwareApplication and FAQPage that only describe itself; these two say what the site
   is called and who publishes it, which is what AI search engines read when they cite a page.
   Organization rather than Person: the wordmark is the brand, and a personal name would only
   invite "who is that?" in a citation. */
const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    description: site.tagline,
    publisher: { "@id": `${site.url}/#organization` },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: `${site.url}/logo.png`,
    sameAs: [site.repo],
  },
];

/* AdSense's site-verification loader. The reviewer looks for this exact tag in the served
   HTML of every page, so it is a plain <script> in <head> rather than next/script, which
   would inject it on the client. async, so it never blocks the first paint. Ad units come
   later, once the site is approved. */
const ADSENSE_CLIENT = "ca-pub-6243042545068232";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {/* The notebook stylesheet lives in a TS module so the HTML export can embed the same
            text; see notebook-css.ts. Unlayered, like the rules it left behind in globals.css. */}
        <style dangerouslySetInnerHTML={{ __html: notebookCss }} />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
