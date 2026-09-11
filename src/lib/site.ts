/* Canonicals and the sitemap are built from this. Pointing them at a domain that is not
   actually serving the site tells Google to index that other domain instead, so fall back to
   whatever host is really deployed rather than to a hopeful guess. */
function resolveUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export const site = {
  name: "ipynbtopdf",
  url: resolveUrl(),
  tagline: "Convert Jupyter notebooks to PDF, right in your browser",
};
