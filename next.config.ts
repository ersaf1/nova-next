import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer', 'canvas fontconfig'],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'gsap',
      'lenis',
      'clsx',
      'tailwind-merge',
      '@radix-ui/react-toast',
      '@radix-ui/react-slot',
    ],
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'pixabay.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'jrnmzwtjqcvknoclycbd.supabase.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
