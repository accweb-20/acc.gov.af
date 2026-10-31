/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Images are resized by the Sanity CDN (see sanity/lib/imageLoader.ts):
    // every device downloads a picture at the size it actually displays.
    loader: "custom",
    loaderFile: "./sanity/lib/imageLoader.ts",
    deviceSizes: [360, 480, 640, 828, 1080, 1200, 1600, 1920],
    imageSizes: [64, 96, 128, 160, 256, 320],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
  // Smaller JavaScript: only the icons that are used are bundled
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

module.exports = nextConfig;
