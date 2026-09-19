/* Loading a notebook by URL happens in the visitor's browser, the same as choosing a file:
   the request goes straight from them to the host. GitHub is the case that matters, and
   its page URLs are not the file, so they are rewritten to the raw host, which allows
   cross-origin reads. Anything else is fetched as given and either works or explains why. */

const GITHUB_BLOB = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/(.+)$/i;
const GIST = /^https?:\/\/gist\.github\.com\/([^/]+)\/([0-9a-f]+)\/?(?:#.*)?$/i;

export function toRawUrl(input: string): string {
  const url = input.trim();
  const blob = GITHUB_BLOB.exec(url);
  if (blob) {
    const [, user, repo, rest] = blob;
    return `https://raw.githubusercontent.com/${user}/${repo}/${rest.split("?")[0]}`;
  }
  const gist = GIST.exec(url);
  if (gist) {
    const [, user, id] = gist;
    return `https://gist.githubusercontent.com/${user}/${id}/raw`;
  }
  return url;
}

function nameFromUrl(url: string): string {
  const path = url.split("?")[0].split("#")[0];
  const parts = path.split("/").filter(Boolean);
  /* A gist's raw address ends in /raw; the id before it is the only name it has. */
  if (parts.at(-1) === "raw") parts.pop();
  const last = decodeURIComponent(parts.pop() ?? "notebook");
  return /\.ipynb$/i.test(last) ? last : `${last}.ipynb`;
}

export async function fetchNotebookFile(input: string): Promise<File> {
  if (!/^https?:\/\//i.test(input.trim())) {
    throw new Error("That doesn't look like a link. Paste the full address, starting with https://");
  }
  const url = toRawUrl(input);

  let response: Response;
  try {
    response = await fetch(url, { mode: "cors" });
  } catch {
    throw new Error(
      "That site doesn't let a browser fetch the file directly. Download the .ipynb and open it here instead.",
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Nothing at that address. Private repositories can't be read this way — download the file and open it here.",
    );
  }
  if (!response.ok) {
    throw new Error(`The server answered ${response.status} for that link.`);
  }

  const blob = await response.blob();
  return new File([blob], nameFromUrl(url), { type: "application/json" });
}
