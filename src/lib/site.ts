/* Canonicals and the sitemap are built from this. Pointing them at a domain that is not
   actually serving the site tells Google to index that other domain instead, so fall back to
   whatever host is really deployed rather than to a hopeful guess. */
/* A static export bakes these URLs in at build time, so the value has to be right during
   `next build` — there is no request later to derive it from. Host-specific env vars are no
   help here, since the build may run anywhere. */
function resolveUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NODE_ENV === "production") return "https://ipynbtopdf.xyz";
  return "http://localhost:3000";
}

export const site = {
  name: "ipynbtopdf",
  url: resolveUrl(),
  tagline: "Convert Jupyter notebooks to PDF, right in your browser",
  repo: "https://github.com/wangxiaoxiang5599/ipynbtopdf",
};
