import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const sharedSrc = resolve(rootDir, "../../packages/shared/src");

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "@panshot/shared/styles/globals.css": resolve(
          sharedSrc,
          "styles/globals.css",
        ),
        "@panshot/shared": resolve(sharedSrc, "index.ts"),
      },
    },
    plugins: [react()],
  },
});
