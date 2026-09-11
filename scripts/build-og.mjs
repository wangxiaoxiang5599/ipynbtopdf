/* Regenerates public/og.png, the social share card.
   Run with: node scripts/build-og.mjs */
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const TITLE = "Convert ipynb to PDF";
const SUBTITLE = "Free, and your file never leaves your computer";
const DOMAIN = "ipynbtopdf.xyz";

const logo = await sharp("public/logo.png").resize(224, 260, { fit: "inside" }).toBuffer();
const { width: logoWidth, height: logoHeight } = await sharp(logo).metadata();

const gap = 56;
const textLeft = Math.round((WIDTH - (logoWidth + gap + 660)) / 2) + logoWidth + gap;
const logoLeft = textLeft - gap - logoWidth;

const text = Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}">
  <text x="${textLeft}" y="286" font-family="Segoe UI, Arial, sans-serif" font-size="64" font-weight="700" fill="#1a1614">${TITLE}</text>
  <text x="${textLeft}" y="344" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#6b635c">${SUBTITLE}</text>
  <text x="${textLeft}" y="410" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#c25a16">${DOMAIN}</text>
</svg>`);

await sharp({
  create: { width: WIDTH, height: HEIGHT, channels: 4, background: "#faf8f5" },
})
  .composite([
    { input: logo, left: logoLeft, top: Math.round((HEIGHT - logoHeight) / 2) },
    { input: text, left: 0, top: 0 },
    {
      input: {
        create: { width: WIDTH, height: 18, channels: 4, background: "#f37726" },
      },
      left: 0,
      top: HEIGHT - 18,
    },
  ])
  .png()
  .toFile("public/og.png");

console.log("wrote public/og.png");
