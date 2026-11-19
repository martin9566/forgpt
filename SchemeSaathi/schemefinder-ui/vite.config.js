import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.API_PROXY_TARGET || 'http://127.0.0.1:3001'

  return {
    plugins: [react()],
    server: { proxy: createApiProxy(target) },
    preview: { proxy: createApiProxy(target) },
  }
})

function createApiProxy(target) {
  return {
    '/api': {
      target,
      changeOrigin: true,
    },
  }
}
