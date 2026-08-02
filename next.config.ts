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
  images: {
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
