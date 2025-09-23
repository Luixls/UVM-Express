// RUTA: frontend/src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header(){
  const { user, logout } = useAuth()
  const nav = useNavigate()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">UVM Express</Link>
        <nav className="flex gap-4 items-center">
          <Link to="/rastreo" className="hover:underline">Rastrear</Link>

          {!user ? (
            <>
              <Link to="/login" className="hover:underline">Entrar</Link>
              <Link to="/registro" className="hover:underline">Registrarse</Link>
            </>
          ) : (
            <>
              <Link to="/panel" className="hover:underline">Mi Panel</Link>
              {user.rol === 'admin' && (
                <Link to="/admin" className="hover:underline">Admin</Link>
              )}
              <span className="text-sm opacity-70">Hola, {user.nombre}</span>
              <button
                onClick={()=>{ logout(); nav('/') }}
                className="px-3 py-1 border rounded hover:bg-gray-50"
              >
                Salir
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
