import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    // Configuración limpia sin código innecesario
    return config;
  },
};

export default nextConfig;
