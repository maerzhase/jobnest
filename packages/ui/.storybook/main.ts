import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/postcss";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
  viteFinal: (config) => ({
    ...config,
    plugins: [...(config.plugins ?? []), tsconfigPaths()],
    resolve: {
      ...config.resolve,
      alias: {
        ...((config.resolve as { alias?: Record<string, string> })?.alias ??
          {}),
        "@": resolve(__dirname, "../src"),
      },
    },
    css: {
      postcss: {
        plugins: [tailwindcss],
      },
    },
  }),
};

export default config;
