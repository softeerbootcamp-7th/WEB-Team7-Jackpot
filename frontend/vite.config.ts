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
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
});
