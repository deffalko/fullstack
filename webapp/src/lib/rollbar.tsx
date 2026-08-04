// webapp/src/lib/rollbar.tsx
import React from 'react'
import { Provider, ErrorBoundary, useRollbar } from '@rollbar/react'
import { env } from './env'

// Конфигурация Rollbar
export const rollbarConfig = {
  accessToken: env.VITE_WEBAPP_ROLLBAR_DSN || env.VITE_ROLLBAR_ACCESS_TOKEN,
  environment: env.NODE_ENV || 'production',
  captureUncaught: true,
  captureUnhandledRejections: true,
}

// Создаем экземпляр Rollbar
let rollbarInstance: any = null

// Компонент-обёртка для приложения
export const RollbarProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider config={rollbarConfig}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Provider>
  )
}

// Хук для ручного логирования ошибок
export const useRollbarError = () => {
  const rollbar = useRollbar()
  return (error: Error) => rollbar.error(error)
}

// ===== ФУНКЦИЯ ДЛЯ ОТПРАВКИ ОШИБОК ИЗ TRPC =====
export const rollbarCaptureException = (error: unknown) => {
  // Пробуем получить rollbar из разных мест
  const rollbar = (window as any).rollbar || (window as any).__ROLLBAR__?.global?.notifier || (window as any).Rollbar

  if (!rollbar) {
    console.error('❌ Rollbar not available')
    console.error('Original error:', error)
    return
  }

  console.log('📤 Sending error to Rollbar:', error)

  try {
    if (error instanceof Error) {
      rollbar.error(error)
    } else if (typeof error === 'string') {
      rollbar.error(new Error(error))
    } else if (error && typeof error === 'object' && 'message' in error) {
      rollbar.error(new Error(String(error.message)))
    } else {
      rollbar.error(new Error(String(error)))
    }
    console.log('✅ Error sent to Rollbar')
  } catch (e) {
    console.error('❌ Failed to send to Rollbar:', e)
  }
}
