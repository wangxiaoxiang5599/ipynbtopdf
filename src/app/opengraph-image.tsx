import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Convert ipynb to PDF — free, in your browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpengraphImage() {
  const logo = readFileSync(join(process.cwd(), "public", "logo.png")).toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          padding: "0 72px",
          background: "#faf8f5",
          borderBottom: "18px solid #f37726",
        }}
      >
        <img
          src={`data:image/png;base64,${logo}`}
          width={224}
          height={260}
          alt=""
          style={{ objectFit: "contain", flexShrink: 0 }}
        />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 776 }}>
          <div style={{ fontSize: 64, fontWeight: 700, color: "#1a1614", letterSpacing: -1 }}>
            Convert ipynb to PDF
          </div>
          <div style={{ fontSize: 30, color: "#6b635c", marginTop: 18 }}>
            Free, and your file never leaves your computer
          </div>
          <div style={{ fontSize: 26, color: "#c25a16", marginTop: 30 }}>ipynbtopdf.xyz</div>
        </div>
      </div>
    ),
    size,
  );
}
