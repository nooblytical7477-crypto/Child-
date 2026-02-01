import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 8080, // Changed from 5173 to 8080 for Cloud Run/Container compatibility
    strictPort: true, // Fail if port 8080 is not available
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 8080, // Ensure production preview also uses 8080
  }
})