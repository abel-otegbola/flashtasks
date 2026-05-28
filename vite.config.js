import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleHermesRequest } from './src/hermes/server/index.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'hermes-api-dev-middleware',
      configureServer(server) {
        server.middlewares.use('/api/hermes', async (req, res, next) => {
          try {
            await handleHermesRequest(req, res)
          } catch (error) {
            next(error)
          }
        })
      },
    },
  ],
})
