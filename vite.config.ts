import { defineConfig } from 'vite';
export default defineConfig({
  // Native build/report HTML must not trigger a web-game reload during play or tests.
  server: { watch: { ignored: ['**/android/**', '**/test-results/**', '**/playwright-report/**'] } },
});
