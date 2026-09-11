import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* The optimizer at /_next/image needs a server; on a static host every next/image would
     otherwise render as a broken image. */
  images: { unoptimized: true },
};

export default nextConfig;
