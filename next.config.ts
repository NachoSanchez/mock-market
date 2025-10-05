import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'carrefourar.vtexassets.com' },
      { protocol: 'https', hostname: 'carrefour.com.ar' },
    ],
  }
};

export default nextConfig;
