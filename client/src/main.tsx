import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster 
      position="bottom-right"
      toastOptions={{
        className: 'bg-slate-800 text-slate-200 border border-slate-700',
        duration: 3000,
        style: {
          background: '#1e293b',
          color: '#e2e8f0',
          border: '1px solid #334155',
        },
      }}
    />
    <App />
  </StrictMode>,
)
