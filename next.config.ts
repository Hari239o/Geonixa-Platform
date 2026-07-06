import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-28781f5e00a345e5a46019b14becca74.r2.dev',
      },
    ],
  },
};

export default nextConfig;
