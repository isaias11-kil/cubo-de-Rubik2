import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // ESTA ES LA LÍNEA QUE ARREGLA EL DISEÑO (CSS/JS)
  base: '/',

  define: {
    global: 'globalThis',
  },

  optimizeDeps: {
    include: ['cubejs']
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
});