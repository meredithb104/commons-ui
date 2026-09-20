import { defineConfig, devices } from "@playwright/test";

// Runs against the production build (vite preview), not the dev server, so what
// gets audited is what gets deployed. globalSetup rebuilds first (outside CI) so
// that build is never stale, however the tests are launched.
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"] ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env["CI"],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
