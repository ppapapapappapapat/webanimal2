/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' since you need server functionality
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '2mb'
    },
    optimizeCss: true,
  },
};

export default nextConfig;