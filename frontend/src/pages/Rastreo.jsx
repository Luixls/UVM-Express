// RUTA: frontend/src/pages/Rastreo.jsx
import { useState } from 'react'
import { api } from '../api/axios'

const formatDateTime = (iso) => {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

export default function Rastreo(){
  const [tracking, setTracking] = useState('')
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e)=>{
    e.preventDefault()
    setErr(''); setData(null); setLoading(true)
    try{
      const { data } = await api.get(`/tracking/${encodeURIComponent(tracking.trim())}`)
      setData(data)
    }catch(e){
      setErr(e?.response?.data?.error || 'Tracking no encontrado')
    }finally{
      setLoading(false)
    }
  }

  return (
    <section className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">Rastrear envío</h1>

      <form onSubmit={onSubmit} className="flex gap-2 max-w-xl">
        <input className="flex-1 border rounded px-3 py-2" placeholder="Tracking #"
               value={tracking} onChange={e=>setTracking(e.target.value)} />
        <button className="bg-black text-white px-4 py-2 rounded" disabled={loading || !tracking.trim()}>
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {err && <p className="text-red-500 text-sm mt-3">{err}</p>}

      {data && data.type === 'package' && (
        <div className="mt-6 space-y-4">
          <div className="p-4 border rounded">
            <p><b>Paquete:</b> {data.package.tracking}</p>
            <p><b>Estado:</b> {data.package.status}</p>
            <p><b>Destinatario:</b> {data.shipment.recipientName} — {data.shipment.recipientAddress}</p>
          </div>

          {Array.isArray(data.packages) && (
            <div className="p-4 border rounded">
              <h2 className="font-semibold mb-2">Paquetes de esta encomienda</h2>
              <ul className="list-disc ml-6">
                {data.packages.map((p)=>(
                  <li key={p.id} className={p.tracking === data.package.tracking ? 'font-semibold' : ''}>
                    <span className="font-mono">{p.tracking}</span> — {p.status} {p.tracking === data.package.tracking ? '(consultado)' : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="font-semibold mb-2">Eventos del paquete</h2>
            {data.events.length === 0 ? (
              <p className="opacity-70">Aún no hay eventos.</p>
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

      {data && data.type === 'shipment' && (
        <div className="mt-6 space-y-4">
          <div className="p-4 border rounded">
            <p><b>Tracking (envío):</b> {data.shipment.tracking}</p>
            <p><b>Estado:</b> {data.shipment.status}</p>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Eventos</h2>
            {data.events.length === 0 ? (
              <p className="opacity-70">Aún no hay eventos.</p>
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
