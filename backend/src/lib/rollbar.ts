import Rollbar from 'rollbar'
import dotenv from 'dotenv'

dotenv.config()

const ROLLBAR_ACCESS_TOKEN = process.env.ROLLBAR_SERVER_ACCESS_TOKEN
const SOURCE_VERSION = process.env.SOURCE_VERSION || '1.0.0'

let rollbarInstance: Rollbar | null = null

export const initRollbar = () => {
  const isRollbarEnabled = ROLLBAR_ACCESS_TOKEN

  if (isRollbarEnabled) {
    rollbarInstance = new Rollbar({
      accessToken: ROLLBAR_ACCESS_TOKEN,
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
  }
}

export const rollbarCaptureException = (error: Error | string, metadata?: Record<string, unknown>) => {
  if (!rollbarInstance) {
    return
  }

  if (typeof error === 'string') {
    rollbarInstance.error(error, metadata)
  } else {
    rollbarInstance.error(error, metadata)
  }
}

export const rollbarCaptureExceptionWithContext = (
  error: Error,
  context: Record<string, unknown>,
  metadata?: Record<string, unknown>
) => {
  if (!rollbarInstance) return

  const enhancedError = new Error(error.message)
  enhancedError.stack = error.stack
  Object.assign(enhancedError, { context })

  rollbarInstance.error(enhancedError, { ...metadata, context })
}

export const rollbarMiddleware = (err: any, req: any, res: any, next: any) => {
  if (!rollbarInstance) {
    return next(err)
  }

  rollbarInstance.error(err, {
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

export const rollbarTrpcError = (error: unknown, context?: Record<string, unknown>) => {
  if (!rollbarInstance) return

  const err = error instanceof Error ? error : new Error(String(error))

  rollbarInstance.error(err, {
    trpc: true,
    ...context,
  })
}

// Экспортируем экземпляр для прямого доступа (опционально)
export const getRollbarInstance = () => rollbarInstance

// Для обратной совместимости
export default rollbarInstance


