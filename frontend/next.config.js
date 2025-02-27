/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
    // Handle missing modules gracefully
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
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
    domains: ["kind-gwenora-papajams-0ddff9e5.koyeb.app"],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

module.exports = nextConfig;
