import { execSync } from "node:child_process";

/**
 * Build before every local Playwright run, always with the root base path
 * (never GITHUB_PAGES=1): the tests audit dist/ through `vite preview` at "/",
 * and a `build:pages` dist (base "/commons-ui/") would 404 there. CI instead
 * builds in its own step, before this ever runs, so the webServer it starts
 * always has something to serve (this build races with webServer startup).
 */
export default function globalSetup(): void {
  if (process.env["CI"]) return;
  execSync("npm run build", { stdio: "inherit" });
}
