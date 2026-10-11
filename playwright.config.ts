import { loadEnvConfig } from "@next/env";
import { defineConfig } from "@playwright/test";

// Tests run against a production build (`pnpm build` first) and a local Supabase stack
// (`supabase start`). Port 3210 keeps clear of whatever else is on 3000.
loadEnvConfig(process.cwd());

const PORT = 3210;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `pnpm exec next start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
