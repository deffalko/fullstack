import { z } from 'zod'
import { zEnvHost, zEnvNonemptyTrimmed, zEnvNonemptyTrimmedRequiredOnNotLocal } from '../../../shared/src/zod'

export const zEnv = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  HOST_ENV: zEnvHost,
  SOURCE_VERSION: zEnvNonemptyTrimmedRequiredOnNotLocal,
  VITE_BACKEND_TRPC_URL: zEnvNonemptyTrimmed,
  VITE_WEBAPP_URL: zEnvNonemptyTrimmed,
  VITE_WEBAPP_ROLLBAR_DSN: z.string().optional(), // Добавляем
  WEBAPP_ROLLBAR_ACCESS_TOKEN: z.string().optional(), // Добавляем
  VITE_WEBAPP_ROLLBAR_CLIENT_TOKEN: z.string().optional(), // Добавляем
  VITE_CLOUDINARY_CLOUD_NAME: zEnvNonemptyTrimmed,
})

const envFromBackend = (window as any).webappEnvFromBackend

// eslint-disable-next-line node/no-process-env
export const env = zEnv.parse(envFromBackend?.replaceMeWithPublicEnv ? process.env : envFromBackend)
