// RUTA: frontend/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles?.length && !roles.includes(user.rol)) return <Navigate to="/" replace />
  return <>{children}</>
}
