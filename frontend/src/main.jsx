// RUTA: frontend/src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/tailwind.css'
import AuthProvider from './context/AuthContext.jsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  </BrowserRouter>
)
