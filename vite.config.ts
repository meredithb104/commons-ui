/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base is the GitHub Pages path for meredithb104/commons-ui.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/commons-ui/" : "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
