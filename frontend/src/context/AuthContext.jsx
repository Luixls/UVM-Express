// RUTA: frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { api, setAuthToken } from '../api/axios'

const AuthCtx = createContext()
export const useAuth = () => useContext(AuthCtx)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Al cargar la app, verifica si hay token guardado
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setAuthToken(token)

    (async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get('/auth/me')
        setUser(data.user)
      } catch {
        localStorage.removeItem('token')
        setAuthToken(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // funciones expuestas
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setAuthToken(data.token)
    setUser(data.user)
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('token', data.token)
    setAuthToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setAuthToken(null)
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}
