import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // KEIN output: "export"
  // KEIN experimental.appDir (Next 15 nutzt App Router automatisch)
};

export default nextConfig;
