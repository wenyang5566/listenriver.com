import config from '../playwright.config.js';
import { resolve } from 'node:path';
export default {
  ...config,
  testDir: resolve('tests'),
  outputDir: resolve('test-results'),
  globalTimeout: 60000,
  workers: 1,
  use: { ...config.use, baseURL: 'http://127.0.0.1:14144' },
  webServer: undefined,
};
