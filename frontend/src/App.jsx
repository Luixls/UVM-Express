// RUTA: frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Servicios from './pages/Servicios.jsx'
import Rastreo from './pages/Rastreo.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import RealizarEnvios from './pages/RealizarEnvios.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import { useAuth } from './context/AuthContext.jsx'

function Private({ children }){
  const { user } = useAuth() || {}
  return user ? children : <Navigate to="/login" replace />
}

function AdminOnly({ children }){
  const { user } = useAuth() || {}
  return (user && user.rol==='admin') ? children : <Navigate to="/" replace />
}

export default function App(){
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/rastreo" element={<Rastreo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/realizar-envios" element={<Private><RealizarEnvios/></Private>} />
          <Route path="/panel" element={<Private><Dashboard/></Private>} />
          <Route path="/admin" element={<AdminOnly><AdminPanel/></AdminOnly>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
