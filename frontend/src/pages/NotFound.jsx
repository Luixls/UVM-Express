// RUTA: frontend/src/pages/NotFound.jsx
import { Link } from 'react-router-dom'
export default function NotFound(){
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="opacity-80">La ruta solicitada no existe.</p>
      <Link className="underline" to="/">Ir al inicio</Link>
    </section>
  )
}
