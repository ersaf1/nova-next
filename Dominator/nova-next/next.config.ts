import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer', 'canvas fontconfig'],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'gsap',
      'clsx',
      'tailwind-merge',
      '@radix-ui/react-toast',
      '@radix-ui/react-slot',
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
