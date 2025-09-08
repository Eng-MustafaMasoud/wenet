import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow starting the app even if ESLint/TypeScript errors exist
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
