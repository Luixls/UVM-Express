// RUTA: frontend/src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext'

export default function Dashboard(){
  const { user } = useAuth()
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Mi Panel</h1>
      <p className="opacity-80">Bienvenido, {user?.nombre}. Aquí verás tus envíos, cotizaciones y pagos.</p>
      <ul className="list-disc ml-6 text-sm opacity-80">
        <li>Próximo: listado de envíos (GET /api/shipments/mine)</li>
        <li>Próximo: cotizar y crear envío desde el frontend</li>
      </ul>
    </section>
  )
}
