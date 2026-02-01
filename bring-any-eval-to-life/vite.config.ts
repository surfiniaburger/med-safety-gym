import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    base: '/med-safety-gym/',
    plugins: [
      react(), 
      tailwindcss(),
      nodePolyfills({
        include: ['events', 'process', 'buffer', 'util', 'stream', 'crypto', 'path', 'querystring', 'http', 'https', 'zlib', 'os', 'tls', 'dns', 'url', 'child_process', 'vm', 'tty'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'node:stream/web': path.resolve(__dirname, 'stream-web-polyfill.ts'),
        'fs': path.resolve(__dirname, 'fs-polyfill.ts'),
        'node:fs': path.resolve(__dirname, 'fs-polyfill.ts'),
        'net': path.resolve(__dirname, 'net-polyfill.ts'),
        'node:net': path.resolve(__dirname, 'net-polyfill.ts'),
        'tty': path.resolve(__dirname, 'tty-polyfill.ts'),
        'node:tty': path.resolve(__dirname, 'tty-polyfill.ts'),
        'process': path.resolve(__dirname, 'process-polyfill.ts'),
        'node:process': path.resolve(__dirname, 'process-polyfill.ts'),
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./setupTests.ts'],
    }
  };
});
