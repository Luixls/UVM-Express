// RUTA: frontend/src/pages/Rastreo.jsx
import { useState } from 'react'
import { api } from '../api/axios'
import { formatDateTime } from '../utils/format'

export default function Rastreo(){
  const [tracking, setTracking] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(''); setData(null); setLoading(true)
    try {
      const { data } = await api.get(`/tracking/${encodeURIComponent(tracking.trim())}`)
      setData(data)
    } catch (e) {
      setErr(e?.response?.data?.error || 'Tracking no encontrado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Rastrear envío</h1>

      <form onSubmit={onSubmit} className="flex gap-2 max-w-xl">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ingresa tu número de tracking (ej. UVXXXX...)"
          value={tracking}
          onChange={e=>setTracking(e.target.value)}
        />
        <button
          disabled={loading || !tracking.trim()}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {err && <p className="text-red-500 text-sm mt-3">{err}</p>}

      {data && (
        <div className="mt-6 space-y-4">
          <div className="p-4 border rounded">
            <p><b>Tracking:</b> {data.shipment.tracking}</p>
            <p><b>Estado actual:</b> {data.shipment.status}</p>
            {'etaDate' in data.shipment && data.shipment.etaDate && (
              <p><b>ETA:</b> {formatDateTime(data.shipment.etaDate)}</p>
            )}
            {'deliveredAt' in data.shipment && data.shipment.deliveredAt && (
              <p><b>Entregado:</b> {formatDateTime(data.shipment.deliveredAt)} — Firmado por: {data.shipment.deliveredSignature || 'N/D'}</p>
            )}
          </div>

          <div>
            <h2 className="font-semibold mb-2">Eventos</h2>
            {data.events.length === 0 ? (
              <p className="opacity-70">Aún no hay eventos para este envío.</p>
            ) : (
              <ul className="relative border-l pl-4">
                {data.events.map(ev => (
                  <li key={ev.id} className="mb-4">
                    <div className="absolute -left-[7px] bg-black rounded-full h-3 w-3 mt-1.5"></div>
                    <p className="text-sm opacity-70">{formatDateTime(ev.timestamp)} {ev.location ? `— ${ev.location}` : ''}</p>
                    <p><b>{ev.status}</b> {ev.note ? `— ${ev.note}` : ''}</p>
                    {ev.etaDate && <p className="text-sm opacity-70">ETA: {formatDateTime(ev.etaDate)}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
