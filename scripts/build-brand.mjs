/* Render all raster brand assets from the shared vector source.
   Run with: node scripts/build-brand.mjs */
import sharp from "sharp";

for (const [path, size] of [
  ["public/logo.png", 512],
  ["public/logo-header.png", 108],
  ["src/app/icon.png", 64],
  ["src/app/apple-icon.png", 180],
]) {
  await sharp("public/logo.svg").resize(size, size).png().toFile(path);
  console.log(`wrote ${path}`);
}
