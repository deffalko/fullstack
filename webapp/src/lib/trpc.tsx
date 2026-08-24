import type { TrpcRouter } from '@ideanick/backend/src/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink, type TRPCLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import Cookies from 'js-cookie'
import superjson from 'superjson'
import { env } from './env'
import { observable } from '@trpc/server/observable'
import { rollbarCaptureException } from './RollbarProvider'

export const trpc = createTRPCReact<TrpcRouter>()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

const customTrpcLink: TRPCLink<TrpcRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value)
        },
        error(error) {
          // ===== ПРОВЕРКА НА ФЛАГ =====
          if (!(error as any)?.data?.isExpected) {
            // Отправляем в Rollbar только НЕОЖИДАННЫЕ ошибки
            rollbarCaptureException(error)
            if (env.NODE_ENV !== 'development') {
              console.error(error)
            }
          } else {
            // Ожидаемая ошибка - не отправляем в Rollbar
            console.log('ℹ️ Expected error, skipping Rollbar:', error.message)
          }

          observer.error(error)
        },
        complete() {
          observer.complete()
        },
      })
      return unsubscribe
    })
  }
}

const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    customTrpcLink, // Добавляем кастомный link
    loggerLink({
      enabled: () => env.NODE_ENV === 'development',
    }),
    httpBatchLink({
      url: env.VITE_BACKEND_TRPC_URL,
      headers: () => {
        const token = Cookies.get('token')
        return {
          ...(token && { authorization: `Bearer ${token}` }),
        }
      },
    }),
  ],
})

export const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
