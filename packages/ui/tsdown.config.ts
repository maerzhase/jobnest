import type { UserConfig } from "tsdown";

const isWatch = process.argv.includes("--watch");

const config: UserConfig = {
  entry: ["src/index.ts"],
  unbundle: true,
  deps: {
    onlyBundle: false,
    neverBundle: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@base-ui/react",
      "@base-ui/react/*",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
  },
  format: "esm",
  dts: true,
  clean: !isWatch,
  outDir: "dist",
  platform: "browser",
};

export default config;
