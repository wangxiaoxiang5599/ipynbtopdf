import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

/* Dates are the last time the page's *content* changed, kept by hand. Stamping the build
   time here would claim every page changed on every deploy, and Google stops trusting the
   field once it catches that. Bump a date when you edit the page it belongs to. */
const routes = [
  { path: "/", priority: 1, lastModified: "2026-09-19" },
  { path: "/ipynb-to-html", priority: 0.9, lastModified: "2026-09-19" },
  { path: "/ipynb-to-py", priority: 0.9, lastModified: "2026-09-19" },
  { path: "/ipynb-viewer", priority: 0.9, lastModified: "2026-09-19" },
  { path: "/colab-to-pdf", priority: 0.9, lastModified: "2026-09-19" },
  { path: "/how-to-convert-jupyter-notebook-to-pdf", priority: 0.8, lastModified: "2026-09-11" },
  { path: "/fix-nbconvert-pdf-error", priority: 0.8, lastModified: "2026-09-11" },
  { path: "/faq", priority: 0.6, lastModified: "2026-09-11" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority, lastModified }) => ({
    /* Plain concatenation rather than new URL(): the canonical tag and the JSON-LD both
       write the home page as the bare origin, and the sitemap should spell it the same way. */
    url: path === "/" ? site.url : site.url + path,
    lastModified,
    priority,
  }));
}
