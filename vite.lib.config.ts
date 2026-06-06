import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Library build: emits only the reusable pieces (the `cursor/canvas` shim and
// the web host runtime), never the demo app. The demo site is built by the
// default `vite.config.ts`. Peer deps stay external so consumers supply their
// own React/Mantine and we don't ship duplicate copies.
export default defineConfig({
  plugins: [
    react(),
    dts({
      // Flatten output to dist/{shim,runtime}/* and keep tests/helpers out.
      entryRoot: 'src',
      include: ['src/shim', 'src/runtime'],
      exclude: ['src/**/__tests__/**', 'src/**/*.test.*', 'src/test/**'],
    }),
  ],
  build: {
    lib: {
      entry: {
        'cursor-canvas': resolve('./src/shim/cursor-canvas.tsx'),
        runtime: resolve('./src/runtime/index.tsx'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'react-dom/client',
        '@mantine/core',
        '@mantine/charts',
        'recharts',
      ],
    },
  },
});
