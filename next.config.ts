import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    appDir: true, // 🔴 DAS FEHLTE
  },
};

export default nextConfig;
