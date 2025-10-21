/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable serverless functions for Vercel deployment
  output: 'standalone',
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig
