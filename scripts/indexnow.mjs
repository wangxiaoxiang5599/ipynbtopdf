/* Tells Bing (and every other IndexNow engine) which pages changed, so they recrawl now
   instead of whenever the sitemap next gets picked up. The URL list comes from the live
   sitemap so this can't drift from what the site actually serves.
   Run after a deploy with: node scripts/indexnow.mjs [url ...]
   With no arguments every sitemap URL is sent; pass URLs to send just those. */

const HOST = "ipynbtopdf.xyz";
/* Not a secret: IndexNow proves ownership by fetching this same key from the site root
   (public/<key>.txt), so it is public by design. */
const KEY = "3282865deac57a51931e208c891814ff";

async function sitemapUrls() {
  const xml = await fetch(`https://${HOST}/sitemap.xml`).then((r) => r.text());
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const urlList = process.argv.length > 2 ? process.argv.slice(2) : await sitemapUrls();
const keyLocation = `https://${HOST}/${KEY}.txt`;

const served = await fetch(keyLocation).then((r) => (r.ok ? r.text() : ""));
if (served.trim() !== KEY) {
  console.error(`Key file not live at ${keyLocation} — deploy first, then rerun.`);
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation, urlList }),
});

/* 200 = accepted, 202 = accepted but the key will be checked later; anything else is a
   real rejection (bad key, wrong host, malformed list). */
console.log(`IndexNow ${res.status} for ${urlList.length} URL(s):`);
for (const url of urlList) console.log("  " + url);
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
