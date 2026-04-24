/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // This wildcard allows Vercel to optimize ANY secure image
      },
    ],
  },
};

module.exports = nextConfig;