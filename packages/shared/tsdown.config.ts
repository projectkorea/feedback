import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: './src/index.ts',
    'db/index': './src/db/index.ts',
    'services/index': './src/services/index.ts',
    'services/emailService': './src/services/emailService.ts',
  },
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  dts: true,
  clean: true,
  external: ['better-sqlite3', 'mongoose', 'nodemailer', '@slack/webhook', 'node-fetch'],
});
