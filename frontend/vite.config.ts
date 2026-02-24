import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // sockjs-client에서 global 변수를 찾지 못해
    // 오류가 나지 않도록 global을 window로 치환
    // Node.js의 global 객체와 브라우저의 window 객체 간 차이 오류 방지
    global: 'window',
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('react-router')) {
            return 'router';
          }

          if (id.includes('@tanstack')) {
            return 'react-query';
          }

          if (id.includes('zod')) {
            return 'zod';
          }

          if (id.includes('sockjs') || id.includes('stomp')) {
            return 'socket';
          }

          if (id.includes('react')) {
            return 'react-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
});
