import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { RollbarProvider } from './lib/RollbarProvider'
import './styles/global.scss'

console.log('🚀 Application started')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RollbarProvider>
      <App />
    </RollbarProvider>
  </React.StrictMode>
)
