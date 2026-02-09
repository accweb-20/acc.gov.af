/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // recommended: prefer remotePatterns for more control
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
  // keep other config you already have
};

module.exports = nextConfig;
