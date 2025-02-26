/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
