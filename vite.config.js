import { defineConfig } from 'vite';
import path from 'path';
import { promises as fs } from 'fs';
import { glob } from 'glob';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';

function publicHtmlPlugin() {
  const publicRoot = path.resolve(__dirname, 'src', 'public');

  return {
    name: 'public-html',
    // Dev server: serve HTML files from src/public
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET') {
          return next();
        }

        const url = req.url?.split('?')[0].split('#')[0] || '';
        if (url !== '/' && !url.endsWith('.html')) {
          return next();
        }

        const fileName = url === '/' ? 'index.html' : url.replace(/^\//, '');
        const filePath = path.join(publicRoot, fileName);

        if (!filePath.startsWith(publicRoot)) {
          return next();
        }

        try {
          const html = await fs.readFile(filePath, 'utf8');
          const transformedHtml = await server.transformIndexHtml(
            req.url,
            html
          );
          res.setHeader('Content-Type', 'text/html');
          res.end(transformedHtml);
        } catch (error) {
          next();
        }
      });
    },
    // Build: move HTML files from dist/public/ to dist/
    generateBundle(_, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.startsWith('public/') && fileName.endsWith('.html')) {
          const newFileName = fileName.replace('public/', '');
          chunk.fileName = newFileName;
          bundle[newFileName] = chunk;
          delete bundle[fileName];
        }
      }
    },
    async closeBundle() {
      const distPublic = path.resolve(__dirname, 'dist', 'public');
      const dist = path.resolve(__dirname, 'dist');
      try {
        const files = await fs.readdir(distPublic);
        for (const file of files) {
          if (file.endsWith('.html')) {
            await fs.rename(path.join(distPublic, file), path.join(dist, file));
          }
        }
        await fs.rmdir(distPublic);
      } catch {}
    },
  };
}

export default defineConfig(({ command }) => {
  return {
    define: {
      [command === 'serve' ? 'global' : '_global']: {},
    },
    root: 'src',
    publicDir: false,
    build: {
      sourcemap: true,
      rollupOptions: {
        // Шукаємо HTML-файли в src/public
        input: glob
          .sync('./public/*.html', { cwd: 'src' })
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
      outDir: '../dist', // Виходимо назад у корінь проєкту для папки dist
      emptyOutDir: true,
    },
    plugins: [
      publicHtmlPlugin(),
      injectHTML(),
      FullReload(['public/**/*.html']),
    ],
  };
});
