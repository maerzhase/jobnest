import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@jobnest/ui"],
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
