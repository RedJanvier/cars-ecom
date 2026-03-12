/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8090',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: '*.railway.app',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: '*.fly.dev',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_PB_URL: process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8090',
  },
}

module.exports = nextConfig
