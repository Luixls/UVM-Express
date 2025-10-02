// RUTA: frontend/src/components/Header.jsx
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Header(){
  const { user, logout } = useAuth() || {}

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 dark:bg-neutral-900/80 border-b border-black/5 dark:border-white/5">
      {/* Más ancho: max-w-7xl */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-neutral-50">
          UVM Express
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <NavLink to="/servicios" className={({isActive}) =>
            `hover:text-neutral-900/80 dark:hover:text-neutral-100/80 ${isActive ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-300'}`
          }>
            Servicios
          </NavLink>
          <NavLink to="/rastreo" className={({isActive}) =>
            `hover:text-neutral-900/80 dark:hover:text-neutral-100/80 ${isActive ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-300'}`
          }>
            Rastrear
          </NavLink>
          <NavLink to="/realizar-envios" className={({isActive}) =>
            `hover:text-neutral-900/80 dark:hover:text-neutral-100/80 ${isActive ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-300'}`
          }>
            Realizar Envíos
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-neutral-600 dark:text-neutral-300">
                {user.nombre || user.username}
              </span>
              {/* Botón de salir visible */}
              <button
                onClick={logout}
                className="text-sm rounded-lg px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/10"
                title="Cerrar sesión"
              >
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
