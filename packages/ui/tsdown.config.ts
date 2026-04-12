import type { UserConfig } from "tsdown";

const isWatch = process.argv.includes("--watch");

const config: UserConfig = {
  entry: ["src/index.ts"],
  unbundle: true,
  inlineOnly: false,
  format: "esm",
  dts: true,
  clean: !isWatch,
  outDir: "dist",
  platform: "browser",
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "@base-ui/react",
    "@base-ui/react/*",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
  ],
};

export default config;
