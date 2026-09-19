/* The viewer's "Save as" buttons send the open notebook to a converter page. Pages are
   client-side navigations within one running app, so a module variable survives the hop
   and no storage is involved: the file is handed over in memory and taken once. A full
   reload drops it, and the target page simply starts empty as it always did. */

let pending: File | null = null;

export function setPendingFile(file: File): void {
  pending = file;
}

export function takePendingFile(): File | null {
  const file = pending;
  pending = null;
  return file;
}
