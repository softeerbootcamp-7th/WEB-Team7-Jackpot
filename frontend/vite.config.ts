import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

// ESM 환경에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react({ exclude: /\/src\/workers\// }), tailwindcss()],

  worker: {
    // Worker 내부에서도 ESM(import/export) 포맷을 사용하도록 설정
    format: 'es',
  },

  define: {
    // sockjs-client, worker 전역 객체 문제 해결
    // worker 환경: self / window === undefined
    // 브라우저 메인 스레드: self === window
    global: 'self',
  },

  server: {
    port: 3000,
  },

  preview: {
    port: 3000,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // React는 건드리지 않음 (매우 중요)

          // React Router
          if (id.includes('react-router')) {
            return 'router';
          }

          // React Query
          if (id.includes('@tanstack')) {
            return 'react-query';
          }

          // Validation
          if (id.includes('zod')) {
            return 'zod';
          }

          // WebSocket
          if (id.includes('sockjs-client') || id.includes('@stomp/stompjs')) {
            return 'socket';
          }

          // 그 외 node_modules
          return 'vendor';
        },
      },
    },
  },
});
