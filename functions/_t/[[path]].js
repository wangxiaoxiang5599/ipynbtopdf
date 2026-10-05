// Cloudflare Pages Function: Plausible through this site's own domain, so pages only ever load
// /_t/s.js and post to /_t/e. Where the analytics server lives is kept in the project's
// secrets (PLAUSIBLE_ORIGIN, PLAUSIBLE_SCRIPT), not in this public repo.

export async function onRequest({ request, env }) {
  const path = new URL(request.url).pathname;
  const origin = env.PLAUSIBLE_ORIGIN;
  if (!origin || !env.PLAUSIBLE_SCRIPT) return new Response("Not found", { status: 404 });

  if (path === "/_t/s.js" && request.method === "GET") {
    const res = await fetch(`${origin}/js/${env.PLAUSIBLE_SCRIPT}.js`, {
      cf: { cacheTtl: 3600, cacheEverything: true },
    });
    if (!res.ok) return new Response("", { status: 502 });
    // The script's built-in endpoint names the analytics host; point it back here.
    const body = (await res.text()).replaceAll(`${origin}/api/event`, "/_t/e");
    return new Response(body, {
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }

  if (path === "/_t/e" && request.method === "POST") {
    const res = await fetch(`${origin}/api/event`, {
      method: "POST",
      body: request.body,
      headers: {
        "content-type": request.headers.get("content-type") ?? "text/plain",
        "user-agent": request.headers.get("user-agent") ?? "",
        // Plausible reads the visitor's IP from this header first (country, unique visitors).
        "x-plausible-ip": request.headers.get("cf-connecting-ip") ?? "",
      },
    });
    return new Response(res.body, { status: res.status });
  }

  return new Response("Not found", { status: 404 });
}
