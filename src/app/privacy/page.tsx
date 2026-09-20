import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy details — how your notebook is handled",
  description: "How local notebook conversion works, when network requests happen, and what this website stores in your browser.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="prose-page mx-auto my-10 max-w-3xl px-6 py-10 sm:my-14 sm:px-12">
      <p className="text-muted">About this tool · Updated September 20, 2026</p>
      <h1 className="text-[36px] leading-tight font-semibold tracking-tight sm:text-[44px]">Your notebook, explained.</h1>
      <p className="mt-5">You should know what happens before choosing a file. Here is how this website handles notebooks and connections.</p>

      <h2>Conversion happens in your browser</h2>
      <p>When you choose a local .ipynb file, the converter reads it in browser memory. It renders the text, code and saved outputs without executing notebook code. The application has no notebook upload endpoint or server-side conversion service.</p>
      <p>PDF export uses your browser&rsquo;s print dialog. HTML and script exports are generated in the browser. The converter does not save your notebook in local storage; reloading the page clears the open document.</p>

      <h2>When the page connects to the internet</h2>
      <ul>
        <li>Loading the website downloads its pages, fonts and conversion code. The hosting provider receives normal web requests.</li>
        <li>Opening a notebook from a public link fetches it from that host. Trying the sample downloads our example notebook.</li>
        <li>External images or other remote media referenced by a notebook can be fetched from their hosts when rendered. Embedded images do not need that fetch.</li>
        <li>The website includes Google AdSense. This third-party script can make requests and use cookies or similar technologies. Local conversion does not mean the entire page is free of third-party connections.</li>
      </ul>

      <h2>What is stored on your device</h2>
      <p>The converter stores a small preference called <code>ipynbtopdf.guide-seen</code> in local storage to remember whether you have seen the PDF print instructions. It does not contain notebook contents. Browser downloads, printing and third-party storage are handled separately by your browser and those services.</p>

      <h2>Inspect the project or report a problem</h2>
      <p>ipynbtopdf is an independent project with <a href={site.repo}>source code on GitHub</a>, published under the MIT licence. It is not affiliated with Project Jupyter or Google Colab.</p>
      <p>You can <a href={`${site.repo}/issues`}>report a problem on GitHub</a>. Issues are public, so use a minimal example with private information removed. For confidential work, check your organization&rsquo;s policies before using a third-party website.</p>
      <p><Link href="/">Back to the converter →</Link></p>
    </article>
  );
}
