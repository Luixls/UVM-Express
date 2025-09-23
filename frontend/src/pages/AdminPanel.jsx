// RUTA: frontend/src/pages/AdminPanel.jsx
export default function AdminPanel(){
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Panel Admin</h1>
      <p className="opacity-80">Aquí podrás listar envíos, filtrar por estado y actualizar tracking.</p>
      <ul className="list-disc ml-6 text-sm opacity-80">
        <li>Próximo: listado admin (GET /api/admin/shipments)</li>
        <li>Próximo: catálogo de estados (GET /api/status-catalog)</li>
        <li>Próximo: actualizar estado (POST /api/admin/shipments/:tracking/status)</li>
      </ul>
    </section>
  )
}
