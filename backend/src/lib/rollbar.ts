import Rollbar from 'rollbar'
import dotenv from 'dotenv'
// import path from 'path'  // ← УДАЛИТЕ эту строку (она не используется)

dotenv.config()

const ROLLBAR_ACCESS_TOKEN = process.env.ROLLBAR_SERVER_ACCESS_TOKEN
const SOURCE_VERSION = process.env.SOURCE_VERSION || '1.0.0'

export const rollbar = new Rollbar({
  accessToken: ROLLBAR_ACCESS_TOKEN || 'MISSING_TOKEN',
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.HOST_ENV || 'local',
  payload: {
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: SOURCE_VERSION,
      },
    },
    code_version: SOURCE_VERSION,
    server: {
      host: process.env.HOSTNAME || 'localhost',
      root: process.cwd(),
    },
  },
})

// Функция для отправки ошибок
export const rollbarError = (error: Error | string, metadata?: any) => {
  if (!ROLLBAR_ACCESS_TOKEN) {
    console.warn('⚠️ ROLLBAR_SERVER_ACCESS_TOKEN not set, skipping Rollbar log')
    return
  }

  if (typeof error === 'string') {
    rollbar.error(error, metadata)
  } else {
    rollbar.error(error, metadata)
  }
}

// Функция для отправки ошибок с дополнительным контекстом
export const rollbarErrorWithContext = (error: Error, context: Record<string, any>, metadata?: any) => {
  if (!ROLLBAR_ACCESS_TOKEN) return

  const enhancedError = new Error(error.message)
  enhancedError.stack = error.stack
  ;(enhancedError as any).context = context

  rollbar.error(enhancedError, { ...metadata, context })
}

// Middleware для Express
export const rollbarMiddleware = (err: any, req: any, res: any, next: any) => {
  if (!ROLLBAR_ACCESS_TOKEN) {
    return next(err)
  }

  rollbar.error(err, {
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      user: req.user,
    },
  })

  next(err)
}

// Обработчик для TRPC ошибок
export const rollbarTrpcError = (error: unknown, context?: Record<string, any>) => {
  if (!ROLLBAR_ACCESS_TOKEN) return

  const err = error instanceof Error ? error : new Error(String(error))

  rollbar.error(err, {
    trpc: true,
    ...context,
  })
}

export default rollbar
