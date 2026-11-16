import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3180',
        configure(proxy) {
          proxy.on('proxyReq', (proxyRequest, request) => {
            if (!request.headers.origin) proxyRequest.setHeader('origin', 'http://127.0.0.1:5173');
          });
        },
      },
    },
  },
});
