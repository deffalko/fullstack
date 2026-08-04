// webapp/src/RollbarProvider.tsx
import React from 'react'
import { Provider, ErrorBoundary } from '@rollbar/react'
import Rollbar from 'rollbar'
import { env } from './lib/env'

const rollbarConfig = {
  accessToken: env.VITE_WEBAPP_ROLLBAR_DSN || env.VITE_ROLLBAR_ACCESS_TOKEN,
  environment: env.NODE_ENV || 'production',
  captureUncaught: true,
  captureUnhandledRejections: true,
  scrubFields: ['password', 'token', 'secret', 'authorization', 'cookie', 'csrf_token', 'credit_card'],
  enabled: true,
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

const ErrorFallback = ({ error, resetErrorBoundary }: any) => {
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

export { useRollbar } from '@rollbar/react'
