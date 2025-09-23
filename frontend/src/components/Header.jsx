// RUTA: frontend/src/components/Header.jsx
import { Link } from 'react-router-dom'

export default function Header(){
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">UVM Express</Link>
        <nav className="flex gap-4">
          <Link to="/rastreo" className="hover:underline">Rastrear</Link>
          <Link to="/login" className="hover:underline">Entrar</Link>
          <Link to="/registro" className="hover:underline">Registrarse</Link>
        </nav>
      </div>
    </header>
  )
}
