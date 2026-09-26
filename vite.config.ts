import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { handleApiRequest } from './server/apiRouter.ts'

function databaseApiPlugin(): Plugin {
  return {
    name: 'database-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/db')) {
          await handleApiRequest(req, res, next)
        } else {
          next()
        }
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/db')) {
          await handleApiRequest(req, res, next)
        } else {
          next()
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), databaseApiPlugin()],
  server: {
    port: 3000,
    host: true,
  },
})

