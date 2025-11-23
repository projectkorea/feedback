import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Build configuration
await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'iife',
  globalName: 'FeedbackSDK',
  outfile: 'dist/feedback-sdk.js',
  platform: 'browser',
  target: ['es2020'],
  minify: false,
  sourcemap: true,
  banner: {
    js: `/**
 * Feedback SDK
 * Version: 1.0.0
 * A lightweight feedback collection SDK for web applications
 */`
  },
  footer: {
    js: `// Expose to window
if (typeof window !== 'undefined') {
  window.FeedbackSDK = FeedbackSDK.FeedbackSDK;
}`
  }
});

// Build minified version
await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'iife',
  globalName: 'FeedbackSDK',
  outfile: 'dist/feedback-sdk.min.js',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  sourcemap: true
});

console.log('✅ Build completed!');
console.log('  - dist/feedback-sdk.js');
console.log('  - dist/feedback-sdk.min.js');
