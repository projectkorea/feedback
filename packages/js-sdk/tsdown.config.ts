import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['./src/index.ts'],
    format: ['esm'],
    platform: 'browser',
    target: 'es2020',
    dts: true,
    clean: true,
    external: ['@feedback-sdk/core'],
  },
  {
    entry: ['./src/index.ts'],
    format: ['iife'],
    platform: 'browser',
    target: 'es2020',
    outDir: './dist/browser',
    globalName: 'FeedbackSDK',
    minify: true,
    noExternal: ['@feedback-sdk/core'],
  },
]);
