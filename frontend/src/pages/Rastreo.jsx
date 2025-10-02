import { useState } from 'react'
import { api } from '../api/axios'

// Imágenes (galería de apoyo)
import Img5 from '../imgs/img5.jpeg'
import Img6 from '../imgs/img6.jpg'

// Mapa de estados a texto/estilos (ES)
const STATUS = {
  ORDER_CREATED: { es: 'Orden creada', cls: 'bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-gray-100' },
  IN_POSSESSION: { es: 'En posesión',  cls: 'bg-blue-200 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200' },
  IN_TRANSIT:    { es: 'En tránsito',   cls: 'bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200' },
  DELIVERED:     { es: 'Entregado',     cls: 'bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-200' },
  EX_DELAY_WEATHER:    { es: 'Retraso por clima', cls: 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-200' },
  EX_MISSED_SCAN_24H:  { es: '24h sin escaneo',   cls: 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-200' },
  EX_LOST:             { es: 'Extravío',          cls: 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-200' },
  EX_CANCELLED_RETURN: { es: 'Cancelado/retorno', cls: 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-200' },
  EX_BAD_ADDRESS_RETRY:{ es: 'Dirección errónea', cls: 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-200' },
  EX_UNDELIVERABLE_3X: { es: 'No entregado (3x)', cls: 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-200' },
}
const S = (code)=> STATUS[code]?.es || code
const Badge = ({status}) =>
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS[status]?.cls || STATUS.ORDER_CREATED.cls}`}>
    {S(status)}
  </span>

export default function Rastreo(){
  const [tracking, setTracking] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const fetchTracking = async (trk)=>{
    setLoading(true); setError(''); setData(null)
    try{
      const { data } = await api.get(`/tracking/${encodeURIComponent(trk)}`)
      setData(data)
    }catch(e){
      setError(e?.response?.data?.error || 'No se encontró información para ese tracking.')
    }finally{
      setLoading(false)
    }
  }
  const buscar = (e)=>{
    e?.preventDefault?.()
    if(!tracking.trim()) return
    fetchTracking(tracking.trim())
  }
  const openOther = (trk)=>{
    setTracking(trk)
    fetchTracking(trk)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fmtDateTime = (d)=> new Date(d).toLocaleString('es-ES', { hour12:false })
  const fmtEtaDate = (d)=> new Date(d).toLocaleDateString('es-ES', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  })

  return (
    <section className="max-w-3xl mx-auto">
      {/* Encabezado de búsqueda */}
      <div className="rounded-2xl bg-neutral-900 text-neutral-50 border border-neutral-800 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <h1 className="text-3xl font-extrabold">
          <span className="text-green-500">Rastrear</span> Paquete
        </h1>
        <p className="mt-1 text-neutral-300">Consulta el avance de tu envío y los eventos más recientes.</p>
        <form onSubmit={buscar} className="mt-5 flex gap-2">
          <input
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Ej: UVM1234567890Z77"
            value={tracking}
            onChange={(e)=>setTracking(e.target.value)}
          />
          <button className="rounded-lg px-4 py-2 font-medium text-white bg-green-700 hover:bg-green-800">Buscar</button>
        </form>
      </div>

      {loading && <div className="p-6 text-center">Buscando…</div>}
      {error && <div className="p-6 text-center text-red-600 dark:text-red-400">{error}</div>}

      {data?.ok && (
        <div className="mt-6 space-y-6">
          {/* Resumen */}
          <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-green-700/30 dark:border-green-700/40 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500">Tracking consultado</div>
                <div className="text-2xl md:text-3xl font-extrabold">
                  {data.queriedTracking || data.shipment.tracking}
                </div>
                <div className="mt-2"><Badge status={data.shipment.status} /></div>

                {(data.queriedTracking && data.queriedTracking !== data.shipment.tracking) && (
                  <div className="mt-2 text-sm text-neutral-400">
                    Tracking maestro:{' '}
                    <span className="font-semibold text-green-500">{data.shipment.tracking}</span>
                  </div>
                )}
                {typeof data.totalPackages === 'number' && (
                  <div className="mt-1 text-base md:text-lg text-neutral-400">
                    Total de{' '}
                    <span className="text-green-600 font-extrabold">
                      {data.totalPackages}
                    </span>{' '}
                    paquete{data.totalPackages===1?'':'s'}
                  </div>
                )}

                {data.etaDate && (
                  <div className="mt-3 text-base md:text-xl text-neutral-300">
                    <span className="text-neutral-400">ETA</span>{' '}
                    <span className="font-extrabold text-green-500">
                      {fmtEtaDate(data.etaDate)}
                    </span>
                    <div className="text-xs md:text-sm opacity-80 mt-1">
                      El ETA está sujeto a cambios; se calcula considerando tránsito, clima y condiciones estándar.
                    </div>
                  </div>
                )}
              </div>

              {/* Destinatario (sin dirección) */}
              <div className="text-right text-sm text-gray-600 dark:text-gray-300">
                <div className="font-medium">Destinatario:</div>
                <div className="text-green-500 font-semibold">{data.shipment.recipientName || '—'}</div>
                {data.recipientLocation && (
                  <div className="opacity-80">
                    {[
                      data.recipientLocation.city,
                      data.recipientLocation.state,
                      data.recipientLocation.country
                    ].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Centros logísticos */}
            {(data.originCenter || data.destCenter) && (
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                {data.originCenter && (
                  <div className="rounded-xl border border-green-700/30 dark:border-green-700/40 p-3">
                    <div className="text-xs uppercase tracking-wide text-neutral-500">Origen</div>
                    <div className="mt-1 font-medium">{data.originCenter}</div>
                  </div>
                )}
                {data.destCenter && (
                  <div className="rounded-xl border border-green-700/30 dark:border-green-700/40 p-3">
                    <div className="text-xs uppercase tracking-wide text-neutral-500">Centro de destino</div>
                    <div className="mt-1 font-medium">{data.destCenter}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline – SOLO del paquete consultado */}
          <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-green-700/30 dark:border-green-700/40 p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-600">Eventos</h3>
            <ol className="relative border-s border-gray-200 dark:border-white/10 text-[15px]">
              {data.events.map(ev=>(
                <li key={ev.id} className="ms-4 pb-6">
                  <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-green-700"></div>
                  <div className="flex items-center justify-between">
                    <Badge status={ev.status} />
                    <div className="text-xs text-gray-500">{fmtDateTime(ev.timestamp)}</div>
                  </div>
                  <div className="mt-1">
                    {ev.location && <div className="text-gray-700 dark:text-gray-300"><span className="font-medium">Ubicación:</span> {ev.location}</div>}
                    {ev.note && <div className="text-gray-700 dark:text-gray-300"><span className="font-medium">Nota:</span> {ev.note}</div>}
                  </div>
                </li>
              ))}
              {/* Evento futuro ETA con título claro */}
              {data.etaDate && (
                <li className="ms-4 pb-2 opacity-90">
                  <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-green-400"></div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                      Fecha aproximada de entrega
                    </span>
                    <div className="text-sm font-semibold text-green-500">{fmtEtaDate(data.etaDate)}</div>
                  </div>
                </li>
              )}
            </ol>
          </div>

          {/* Relacionados – clicables */}
          {Array.isArray(data.groupEvents) && data.groupEvents.length > 0 && (
            <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-green-700/30 dark:border-green-700/40 p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-600">Otros paquetes de la misma encomienda</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.groupEvents.map(g=>(
                  <button
                    key={g.tracking}
                    onClick={()=>openOther(g.tracking)}
                    className="text-left rounded-xl border p-3 border-green-700/20 dark:border-green-700/30 hover:bg-green-50 dark:hover:bg-green-900/10 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{g.tracking}</div>
                      <Badge status={g.currentStatus} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Último evento: {S(g.lastEvent?.status) || '—'} — {g.lastEvent?.timestamp ? fmtDateTime(g.lastEvent.timestamp) : '—'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Galería inferior */}
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <img
          src={Img5}
          alt="Escaneo y control de etiquetas"
          loading="lazy"
          className="w-full h-48 md:h-56 object-cover rounded-xl shadow ring-1 ring-green-700/20"
        />
        <img
          src={Img6}
          alt="Entrega y manejo de paquetes"
          loading="lazy"
          className="w-full h-48 md:h-56 object-cover rounded-xl shadow ring-1 ring-green-700/20"
        />
      </div>
    </section>
  )
}
