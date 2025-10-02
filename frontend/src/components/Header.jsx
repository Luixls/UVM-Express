// RUTA: frontend/src/components/Header.jsx
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import UvmLogo from '../imgs/LOGO_UVM_EXPRESS.png'

export default function Header(){
  const { user, logout } = useAuth() || {}

  return (
    <header className="sticky top-0 z-40 border-b border-green-600/20 bg-white/90 dark:bg-neutral-900/85 backdrop-blur">
      {/* Barra superior con gradiente verde y mayor altura */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-16 md:h-18 flex items-center justify-between">
        {/* Logo + marca */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={UvmLogo}
            alt="UVM Express"
            className="h-8 md:h-9 w-auto drop-shadow-[0_2px_10px_rgba(16,185,129,0.35)]"
          />
          <span className="sr-only">UVM Express</span>
        </Link>

        {/* Navegación */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <NavLink
            to="/servicios"
            className={({isActive}) =>
              `hover:text-green-700 dark:hover:text-green-400 ${
                isActive ? 'text-green-700 dark:text-green-400' : 'text-neutral-700 dark:text-neutral-300'
              }`
            }
          >
            Servicios
          </NavLink>
          <NavLink
            to="/rastreo"
            className={({isActive}) =>
              `hover:text-green-700 dark:hover:text-green-400 ${
                isActive ? 'text-green-700 dark:text-green-400' : 'text-neutral-700 dark:text-neutral-300'
              }`
            }
          >
            Rastrear
          </NavLink>
          <NavLink
            to="/realizar-envios"
            className={({isActive}) =>
              `hover:text-green-700 dark:hover:text-green-400 ${
                isActive ? 'text-green-700 dark:text-green-400' : 'text-neutral-700 dark:text-neutral-300'
              }`
            }
          >
            Realizar Envíos
          </NavLink>
        </nav>

        {/* Acciones / sesión */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-neutral-700 dark:text-neutral-300">
                {user.nombre || user.username}
              </span>
              <button
                onClick={logout}
                className="text-sm rounded-lg px-3 py-1.5 border border-green-600/30 text-green-800 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                title="Cerrar sesión"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm rounded-lg px-3 py-1.5 border border-green-600/30 text-green-800 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>

      {/* Línea verde inferior sutil */}
      <div className="h-[3px] w-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 opacity-70" />
    </header>
  )
}
