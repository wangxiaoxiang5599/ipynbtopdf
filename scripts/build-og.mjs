/* Regenerates public/og.png, the social share card.
   Run with: node scripts/build-og.mjs */
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const TITLE = "Convert ipynb to PDF";
const SUBTITLE = "Local conversion. Free. Open source.";
const DOMAIN = "ipynbtopdf.xyz";

const logo = await sharp("public/logo.svg").resize(200, 200).toBuffer();
const { width: logoWidth, height: logoHeight } = await sharp(logo).metadata();

const gap = 48;
const textLeft = Math.round((WIDTH - (logoWidth + gap + 660)) / 2) + logoWidth + gap;
const logoLeft = textLeft - gap - logoWidth;

const text = Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}">
  <text x="${textLeft}" y="286" font-family="Segoe UI, Arial, sans-serif" font-size="60" font-weight="700" fill="#202b36">${TITLE}</text>
  <text x="${textLeft}" y="344" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#465360">${SUBTITLE}</text>
  <text x="${textLeft}" y="410" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#c45119">${DOMAIN}</text>
</svg>`);

await sharp({
  create: { width: WIDTH, height: HEIGHT, channels: 4, background: "#f8f9fb" },
})
  .composite([
    { input: logo, left: logoLeft, top: Math.round((HEIGHT - logoHeight) / 2) },
    { input: text, left: 0, top: 0 },
    {
      input: {
        create: { width: WIDTH, height: 8, channels: 4, background: "#c45119" },
      },
      left: 0,
      top: HEIGHT - 8,
    },
  ])
  .png()
  .toFile("public/og.png");

console.log("wrote public/og.png");
