import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const API_PATH = '/api/integrationassistant'

function readBody(req: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function sendJson(
  res: ServerResponse<IncomingMessage>,
  statusCode: number,
  payload: Record<string, string>,
) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function writeProxyResponse(
  res: ServerResponse<IncomingMessage>,
  response: Response,
  body: ArrayBuffer,
) {
  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'content-encoding') {
      res.setHeader(key, value)
    }
  })
  res.end(Buffer.from(body))
}

function integrationApiFallbackPlugin(
  localApiBaseUrl: string,
  fallbackApiUrl?: string,
): Plugin {
  return {
    name: 'integration-api-fallback',
    configureServer(server) {
      server.middlewares.use(API_PATH, async (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        const body = await readBody(req)
        const contentType = req.headers['content-type'] ?? 'application/json'

        try {
          const localResponse = await fetch(`${localApiBaseUrl}${API_PATH}`, {
            body,
            headers: {
              'Content-Type': Array.isArray(contentType) ? contentType[0] : contentType,
            },
            method: 'POST',
          })
          const localBody = await localResponse.arrayBuffer()
          writeProxyResponse(res, localResponse, localBody)
          return
        } catch {
          server.config.logger.warn(
            `Local integration API unavailable at ${localApiBaseUrl}; trying fallback.`,
          )
        }

        if (!fallbackApiUrl) {
          sendJson(res, 502, {
            message:
              'Local integration API is unavailable and no fallback URL is configured.',
          })
          return
        }

        try {
          const fallbackResponse = await fetch(fallbackApiUrl, {
            body,
            headers: {
              'Content-Type': Array.isArray(contentType) ? contentType[0] : contentType,
            },
            method: 'POST',
          })
          const fallbackBody = await fallbackResponse.arrayBuffer()
          writeProxyResponse(res, fallbackResponse, fallbackBody)
        } catch {
          sendJson(res, 502, {
            message:
              'Local integration API and fallback Apps Script endpoint are both unavailable.',
          })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const localApiBaseUrl = env.INTEGRATION_API_LOCAL_URL || 'http://127.0.0.1:8000'
  const fallbackApiUrl = env.INTEGRATION_API_FALLBACK_URL

  return {
    plugins: [react(), integrationApiFallbackPlugin(localApiBaseUrl, fallbackApiUrl)],
  }
})
