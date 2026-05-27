/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel deployment uses built-in API routing, no rewrites needed
  // The /src/app/api routes are automatically exposed as /api/* endpoints
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
