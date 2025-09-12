/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  // Ensure frontend runs on port 5000
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
  // Hydration fixes
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Suppress hydration warnings for development
  reactStrictMode: true,
  // Disable static optimization for pages that might have hydration issues
  trailingSlash: false,
};

module.exports = nextConfig;
