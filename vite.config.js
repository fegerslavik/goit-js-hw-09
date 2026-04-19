import { defineConfig } from 'vite';
import path from 'path';
import { glob } from 'glob';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';

export default defineConfig(({ command }) => {
  return {
    define: {
      global: {},
    },
    root: 'src',
    publicDir: false,
    build: {
      sourcemap: true,
      rollupOptions: {
        input: glob
          .sync('./*.html', { cwd: 'src' })
          .map(file =>
            path.resolve(__dirname, 'src', file.replace(/\\/g, '/'))
          ),
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          entryFileNames: '[name].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
        },
      },
      outDir: '../dist',
      emptyOutDir: true,
    },
    plugins: [injectHTML(), FullReload(['src/*.html'])],
  };
});
