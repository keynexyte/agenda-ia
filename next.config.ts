import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sqlite3'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
