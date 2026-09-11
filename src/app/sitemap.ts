import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", priority: 1 },
    { path: "/how-to-convert-jupyter-notebook-to-pdf", priority: 0.8 },
    { path: "/fix-nbconvert-pdf-error", priority: 0.8 },
    { path: "/faq", priority: 0.6 },
  ];

  return routes.map(({ path, priority }) => ({
    url: new URL(path, site.url).toString(),
    lastModified: new Date(),
    priority,
  }));
}
