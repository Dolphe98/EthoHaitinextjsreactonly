/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend.ethohaiti.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.printify.com', 
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;