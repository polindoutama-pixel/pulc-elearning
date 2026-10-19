import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
const testDataDir = '/tmp/pulc-e2e-' + randomUUID();
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ||
  (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: process.env.PULC_TEST_URL || 'http://127.0.0.1:3011',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    launchOptions: { executablePath, args: ['--no-sandbox'] },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: process.env.PULC_TEST_URL
    ? undefined
    : [
        {
          command: `DATA_DIR=${testDataDir} PORT=3011 PULC_DEMO=true node server/index.js`,
          url: 'http://127.0.0.1:3011/api/health',
          reuseExistingServer: false,
        },
        {
          command:
            'PULC_API_TARGET=http://127.0.0.1:3011 npm exec vite -- --host 127.0.0.1 --port 5181',
          url: 'http://127.0.0.1:5181',
          reuseExistingServer: false,
        },
      ],
});
