import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Project Pages are served from /<repo>/. Override with BASE_PATH if the
// repository is renamed or deployed elsewhere.
const base = process.env.BASE_PATH ?? '/cursor-canvas-web/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      // The single bridge: `cursor/canvas` resolves to the Mantine shim.
      'cursor/canvas': fileURLToPath(
        new URL('./src/shim/cursor-canvas.tsx', import.meta.url),
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
