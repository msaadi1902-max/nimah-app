import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    webpackBuildWorker: false, // هذا السطر يحمي Vercel من الانهيار
  }
};

export default nextConfig;