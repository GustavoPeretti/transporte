import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Encaminha chamadas /api e /media para o backend Django em dev.
      '/api': 'http://localhost:8000',
      '/media': 'http://localhost:8000',
    },
  },
})
