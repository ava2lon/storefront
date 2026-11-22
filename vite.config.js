import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    cssTarget: 'safari15',
    rollupOptions: {
      input: {
        pos: resolve(root, 'index.html'),
        shop: resolve(root, 'shop.html'),
      },
    },
  },
  server: {
    port: 5174,
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
});
