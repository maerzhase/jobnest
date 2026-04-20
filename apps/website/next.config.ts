import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

const jobnestPkg = JSON.parse(
  readFileSync(join(__dirname, "../jobnest/package.json"), "utf-8")
) as {
  version: string;
};

const nextConfig: NextConfig = {
  transpilePackages: ["@jobnest/ui"],
  output: "export",
  env: {
    NEXT_PUBLIC_JOBNEST_VERSION: jobnestPkg.version,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
