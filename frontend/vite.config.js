import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  
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
