import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  
  base: '/',

  define: {
    global: 'window',
  },

  optimizeDeps: {
    include: ['cubejs']
  },

  build: {
    rollupOptions: {
      context: 'window',
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
});
