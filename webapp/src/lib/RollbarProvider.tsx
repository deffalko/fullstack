// webapp/src/RollbarProvider.tsx
import React from 'react'
import { Provider, ErrorBoundary, useRollbar } from '@rollbar/react'
import Rollbar from 'rollbar'
import { env } from './env'

const rollbarConfig = {
  // accessToken: env.VITE_WEBAPP_ROLLBAR_DSN,
  accessToken: env.VITE_WEBAPP_ROLLBAR_CLIENT_TOKEN,
  environment: env.NODE_ENV || 'production',
  captureUncaught: true,
  captureUnhandledRejections: true,
  scrubFields: ['password', 'token', 'secret', 'authorization', 'cookie', 'csrf_token', 'credit_card'],
  enabled: true,
  payload: {
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: env.SOURCE_VERSION || '1.0.0', // ✅ Явно указываем версию
      },
    },
    // Добавляем явно версию в корень payload
    code_version: env.SOURCE_VERSION || '1.0.0',
  },
}

// Создаем экземпляр Rollbar
const rollbarInstance = new Rollbar(rollbarConfig)

// Сохраняем в глобальный объект
if (typeof window !== 'undefined') {
  ;(window as any).rollbar = rollbarInstance
  ;(window as any).__ROLLBAR__ = {
    global: {
      notifier: rollbarInstance,
    },
  }
  console.log('✅ Rollbar instance created and saved to window')
}

const ErrorFallback = ({ error }: any) => {
  console.log('🔴 ErrorBoundary caught error:', error)

  return (
    <div style={{ padding: '20px', color: 'red' }}>
      <h2>Oops, something went wrong.</h2>
      <p>We've been notified and are looking into it.</p>
      {error && (
        <details style={{ marginTop: '10px' }}>
          <summary>Error details</summary>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>{error.message}</pre>
        </details>
      )}
      <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Reload page
      </button>
    </div>
  )
}

export const RollbarProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('🔧 RollbarProvider rendering')

  return (
    <Provider instance={rollbarInstance}>
      <ErrorBoundary fallbackUI={ErrorFallback}>{children}</ErrorBoundary>
    </Provider>
  )
}

// ===== ЭКСПОРТЫ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ ФАЙЛАХ =====
export { useRollbar } from '@rollbar/react'

// Хук для ручного логирования ошибок
export const useRollbarError = () => {
  const rollbar = useRollbar()
  return (error: Error) => rollbar.error(error)
}

// Функция для отправки ошибок из TRPC
export const rollbarCaptureException = (error: unknown) => {
  const rollbar = (window as any).rollbar || (window as any).__ROLLBAR__?.global?.notifier

  if (env.VITE_WEBAPP_ROLLBAR_ACCESS_TOKEN) {
    rollbar.error(error)
  }

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
