/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@feedback-sdk/react', '@feedback-sdk/core']
};

export default nextConfig;
