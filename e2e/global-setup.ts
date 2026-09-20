import { execSync } from "node:child_process";

/**
 * Build before every Playwright run, always with the root base path (never
 * GITHUB_PAGES=1): the tests audit dist/ through `vite preview` at "/", and a
 * `build:pages` dist (base "/commons-ui/") would 404 there. CI runs its own
 * `build:pages` afterward, for the deploy artifact, so this build never ships.
 */
export default function globalSetup(): void {
  execSync("npm run build", { stdio: "inherit" });
}
