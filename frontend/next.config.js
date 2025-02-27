/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  eslint: {
    // Disable ESLint during production builds to prevent failures
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during the build
    ignoreBuildErrors: true,
  },
  // Avoid errors from missing modules
  webpack: (config, { isServer }) => {
    // Add polyfills and handle externals
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Add src and lib directories to module resolution
    config.resolve.modules = [
      path.resolve(__dirname),
      path.resolve(__dirname, "src"),
      path.resolve(__dirname, "src/lib"),
      "node_modules",
    ];

    // Add module aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
      lib: path.resolve(__dirname, "src/lib"),
      react: path.resolve(__dirname, "node_modules/react"),
    };

    return config;
  },
  experimental: {
    esmExternals: true,
  },
  // Configure API proxy for development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "production"
            ? "https://kind-gwenora-papajams-0ddff9e5.koyeb.app/api/:path*"
            : "http://localhost:8001/api/:path*",
      },
    ];
  },
  // Ensure images from external sources can be optimized
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kind-gwenora-papajams-0ddff9e5.koyeb.app",
        port: "",
        pathname: "/**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  // Disable the custom server for Vercel deployment
  distDir: ".next",
  // Enable standalone output for Docker deployment
  output: "standalone",
};

module.exports = nextConfig;
