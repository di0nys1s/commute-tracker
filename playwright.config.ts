import { defineConfig } from "@playwright/test";
import os from "node:os";
import path from "node:path";

export default defineConfig({
  testDir: "playwright/tests",
  timeout: 30_000,
  retries: 0,
  reporter: "list",
  outputDir: path.join(os.tmpdir(), "playwright-output"),
  use: {
    headless: true,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    baseURL: "http://localhost:3000",
  },
});
