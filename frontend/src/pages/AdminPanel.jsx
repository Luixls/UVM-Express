// RUTA: frontend/src/pages/AdminPanel.jsx
import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/axios'
import { toast } from 'sonner'

const STATUS = {
  ORDER_CREATED: 'Orden creada',
  IN_POSSESSION: 'En posesión',
  IN_TRANSIT: 'En tránsito',
  DELIVERED: 'Entregado',
  EX_DELAY_WEATHER: 'Retraso por clima',
  EX_MISSED_SCAN_24H: '24h sin escaneo',
  EX_LOST: 'Extravío',
  EX_CANCELLED_RETURN: 'Cancelado/retorno',
  EX_BAD_ADDRESS_RETRY: 'Dirección errónea',
  EX_UNDELIVERABLE_3X: 'No entregado (3x)',
}
const STATUS_OPTIONS = Object.entries(STATUS).map(([k,v])=>({value:k,label:v}))
const input = 'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 px-3 py-2 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-green-600'

function Tabs({ value, onChange, items }) {
  return (
    <>
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {items.map(it=>(
          <button
            key={it.value}
            onClick={()=>onChange(it.value)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
              value===it.value
                ? 'bg-green-700 text-white'
                : 'bg-transparent text-neutral-700 dark:text-neutral-300 hover:bg-green-50 dark:hover:bg-green-900/10'
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>
      <div className="pt-4" />
    </>
  )
}

export default function AdminPanel(){
  const [tab, setTab] = useState('users') // default a Usuarios

  /* ================== USERS ================== */
  const [users, setUsers] = useState([])
  const [uQ, setUQ] = useState('')
  const [uLoading, setULoading] = useState(false)

  const fetchUsers = async ()=>{
    try{
      setULoading(true)
      const { data } = await api.get('/admin/users', { params:{ q: uQ, page:1, limit:50 } })
      if(!data?.ok) throw new Error(data?.error || 'Error')
      setUsers(data.users||[])
    }catch(e){
      toast.error(e?.response?.data?.error || e.message || 'Error')
    }finally{ setULoading(false) }
  }
  useEffect(()=>{ fetchUsers() },[]) // ⬅ por defecto lista todos

  const updateUser = async (row)=>{
    try{
      const { data } = await api.put(`/admin/users/${row.id}`, {
        nombre: row.nombre, email: row.email, rol: row.rol, activo: !!row.activo
      })
      if(!data?.ok) throw new Error(data?.error||'No se pudo actualizar')
      toast.success('Usuario actualizado')
      await fetchUsers()
    }catch(e){
      toast.error(e?.response?.data?.error || 'Error al actualizar')
    }
  }

  /* ================== PACKAGES ================== */
  const [pkList, setPkList] = useState([])
  const [pkQ, setPkQ] = useState('')
  const [pkStatus, setPkStatus] = useState('')
  const [pkLoading, setPkLoading] = useState(false)

  const fetchPackages = async ()=>{
    try{
      setPkLoading(true)
      const { data } = await api.get('/admin/packages', { params:{ q: pkQ, status: pkStatus, page:1, limit:50 } })
      if(!data?.ok) throw new Error(data?.error || 'Error')
      setPkList(data.packages||[])
    }catch(e){
      toast.error(e?.response?.data?.error || e.message || 'Error')
    }finally{ setPkLoading(false) }
  }
  useEffect(()=>{ fetchPackages() },[]) // ⬅ por defecto lista todos

  /* ================== SHIPMENTS ================== */
  const [shipmentTracking, setShipmentTracking] = useState('')
  const [packages, setPackages] = useState([])
  const [applyAll, setApplyAll] = useState(false)
  const [packageTracking, setPackageTracking] = useState('')
  const [status, setStatus] = useState('ORDER_CREATED')
  const [note, setNote] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [time, setTime] = useState(() => {
    const d = new Date(); const hh = String(d.getHours()).padStart(2,'0'); const mm = String(d.getMinutes()).padStart(2,'0')
    return `${hh}:${mm}`
  })
  const [shipLoading, setShipLoading] = useState(false)

  const loadShipmentPackages = async ()=>{
    if(!shipmentTracking.trim()) return toast.error('Indica tracking de envío o de paquete')
    try{
      setShipLoading(true)
      const { data } = await api.get(`/admin/shipments/${encodeURIComponent(shipmentTracking.trim())}/packages`)
      if(!data?.ok) throw new Error(data?.error || 'No se pudo obtener paquetes')
      setPackages(data.packages || [])
      setPackageTracking('')
      toast.success(`Se encontraron ${data.packages?.length ?? 0} paquetes`)
    }catch(e){
      toast.error(e?.response?.data?.error || e.message || 'Error')
      setPackages([])
    }finally{ setShipLoading(false) }
  }

  const canSubmit = useMemo(()=>{
    if(!shipmentTracking.trim()) return false
    if(!date) return false
    if(!status) return false
    if(!applyAll && !packageTracking) return false
    return true
  },[shipmentTracking, packageTracking, applyAll, status, date])

  const submitEvent = async ()=>{
    try{
      if(!canSubmit) return
      setShipLoading(true)
      const payload = {
        shipmentTracking: shipmentTracking.trim(), // puede ser maestro o paquete
        status,
        note: note.trim(),
        location: location.trim(),
        date,
        time: time || '00:00',
        applyToAll: !!applyAll,
        ...(applyAll ? {} : { packageTracking })
      }
      const { data } = await api.post('/admin/events', payload)
      if(!data?.ok) throw new Error(data?.error || 'No se pudo aplicar el cambio')
      toast.success(`Actualizados ${data.updated} paquete(s)`)
      await loadShipmentPackages()
    }catch(e){
      toast.error(e?.response?.data?.error || e.message || 'Error')
    }finally{ setShipLoading(false) }
  }

  const downloadAllLabelsZip = async ()=>{
    if(!shipmentTracking.trim()) return toast.error('Indica tracking de envío maestro')
    try{
      const url = `/admin/shipments/${encodeURIComponent(shipmentTracking.trim())}/labels.zip`
      const res = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/zip' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `labels_${shipmentTracking.trim()}.zip`
      a.click()
      URL.revokeObjectURL(a.href)
    }catch(e){
      toast.error(e?.response?.data?.error || 'No se pudo descargar el ZIP')
    }
  }

  const STATUS_BADGE = (s)=>
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
      {STATUS[s] || s}
    </span>

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Panel de Administración</h1>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value:'users',     label:'Usuarios' },
          { value:'packages',  label:'Paquetes' },
          { value:'shipments', label:'Gestión de encomiendas' },
        ]}
      />

      {/* ====== TAB: USUARIOS ====== */}
      {tab==='users' && (
        <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex gap-2 w-full">
              <input
                className={`${input} md:max-w-2xl`} // ⬅ más ancho
                placeholder="Buscar por nombre o email…"
                value={uQ}
                onChange={(e)=>setUQ(e.target.value)}
              />
              <button
                onClick={fetchUsers}
                className="shrink-0 rounded-lg px-4 py-2 font-medium text-white bg-green-700 hover:bg-green-800"
              >
                {uLoading ? 'Buscando…' : 'Buscar'}
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500">
                  <th className="py-2">Nombre</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Rol</th>
                  <th className="py-2">Activo</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u=>(
                  <UserRow key={u.id} u={u} onSave={updateUser} />
                ))}
                {!users.length && (
                  <tr><td colSpan={5} className="py-6 text-center text-neutral-500">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====== TAB: PAQUETES ====== */}
      {tab==='packages' && (
        <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          <div className="grid md:grid-cols-[1fr_240px_auto] gap-3">
            <input className={`${input} md:max-w-2xl`} placeholder="Tracking de paquete…" value={pkQ} onChange={(e)=>setPkQ(e.target.value)} />
            <select className={input} value={pkStatus} onChange={(e)=>setPkStatus(e.target.value)}>
              <option value="">Todos los estados</option>
              {STATUS_OPTIONS.map(o=>(
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={fetchPackages}
              className="rounded-lg px-4 py-2 font-medium text-white bg-green-700 hover:bg-green-800"
            >
              {pkLoading ? 'Cargando…' : 'Buscar'}
            </button>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pkList.map(p=>(
              <div key={p.id} className="rounded-xl border border-neutral-200/70 dark:border-neutral-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono">{p.tracking}</div>
                  {STATUS_BADGE(p.status)}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-300 mt-2">
                  <div><span className="font-medium">Tracking maestro:</span> {p.shipmentTracking || '—'}</div>
                  <div><span className="font-medium">Remitente:</span> {p.senderName || '—'}</div>
                  <div><span className="font-medium">Destinatario:</span> {p.recipientName || '—'}</div>
                  <div className="truncate"><span className="font-medium">Destino:</span> {p.recipientAddress || '—'}</div>
                  <div><span className="font-medium">Peso / Tamaño:</span> {Number(p.pesoKg||0).toFixed(2)} kg — {p.dimensiones?.largoCm}×{p.dimensiones?.anchoCm}×{p.dimensiones?.altoCm} cm</div>
                </div>
                <div className="mt-3">
                  <a
                    href={`/labels/${encodeURIComponent(p.tracking)}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-md px-3 py-1.5 text-sm font-medium border border-green-600/40 text-green-800 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    Descargar etiqueta
                  </a>
                </div>
              </div>
            ))}
            {!pkList.length && <div className="text-sm text-neutral-500">Sin resultados</div>}
          </div>
        </div>
      )}

      {/* ====== TAB: GESTIÓN DE ENCOMIENDAS ====== */}
      {tab==='shipments' && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
            <h2 className="text-lg font-semibold">Buscar encomienda</h2>
            <div className="mt-3 grid md:grid-cols-[1fr_auto] gap-3">
              <input
                className={`${input} md:max-w-2xl`}
                placeholder="Tracking del envío (maestro) o tracking de paquete"
                value={shipmentTracking}
                onChange={(e)=>setShipmentTracking(e.target.value)}
              />
              <button
                onClick={loadShipmentPackages}
                className="rounded-lg px-4 py-2 font-medium text-white bg-green-700 hover:bg-green-800"
                disabled={shipLoading}
              >
                {shipLoading ? 'Cargando…' : 'Cargar paquetes'}
              </button>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {packages.map(p=>(
                <div key={p.id} className="rounded-xl border border-neutral-200/70 dark:border-neutral-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm">{p.tracking}</div>
                    {STATUS_BADGE(p.status)}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-300 mt-2">
                    <div><span className="font-medium">Tracking maestro:</span> {p.masterTracking}</div>
                    <div><span className="font-medium">Remitente:</span> {p.senderName || '—'}</div>
                    <div><span className="font-medium">Destinatario:</span> {p.recipientName || '—'}</div>
                    <div className="truncate"><span className="font-medium">Destino:</span> {p.recipientAddress || '—'}</div>
                    <div><span className="font-medium">Peso / Tamaño:</span> {Number(p.pesoKg||0).toFixed(2)} kg — {p.dimensiones?.largoCm}×{p.dimensiones?.anchoCm}×{p.dimensiones?.altoCm} cm</div>
                  </div>
                  <div className="mt-3">
                    <a
                      href={`/labels/${encodeURIComponent(p.tracking)}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-md px-3 py-1.5 text-sm font-medium border border-green-600/40 text-green-800 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      Descargar etiqueta
                    </a>
                  </div>
                </div>
              ))}
              {!packages.length && (
                <div className="text-sm text-neutral-500">Sin paquetes cargados.</div>
              )}
            </div>

            {packages.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={downloadAllLabelsZip}
                  className="rounded-lg px-4 py-2 font-medium border border-green-600/40 text-green-800 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  Descargar TODO (ZIP)
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
            <h2 className="text-lg font-semibold">Actualizar estado / agregar evento</h2>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block h-5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Paquete a actualizar
                </label>
                <select
                  className={
                    'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 ' +
                    'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 ' +
                    'px-3 py-2 outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50'
                  }
                  value={packageTracking}
                  onChange={(e)=>setPackageTracking(e.target.value)}
                  disabled={applyAll || !packages.length}
                >
                  <option value="">Selecciona un paquete…</option>
                  {packages.map(p=>(
                    <option key={p.id} value={p.tracking}>
                      {p.tracking} — {STATUS[p.status] || p.status}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    id="applyAll"
                    type="checkbox"
                    className="h-4 w-4 accent-green-700"
                    checked={applyAll}
                    onChange={(e)=>setApplyAll(e.target.checked)}
                  />
                  <label htmlFor="applyAll" className="text-sm">
                    Aplicar a todos los paquetes de la encomienda
                  </label>
                </div>
              </div>

              <div>
                <label className="block h-5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Estado
                </label>
                <select
                  className={
                    'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 ' +
                    'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 ' +
                    'px-3 py-2 outline-none focus:ring-2 focus:ring-green-600'
                  }
                  value={status}
                  onChange={(e)=>setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map(o=>(
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block h-5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Fecha
                </label>
                <input type="date" className={input} value={date} onChange={(e)=>setDate(e.target.value)} />
              </div>

              <div>
                <label className="block h-5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Hora
                </label>
                <input type="time" className={input} value={time} onChange={(e)=>setTime(e.target.value)} />
              </div>

              <div>
                <label className="block h-5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Ubicación (opcional)
                </label>
                <input className={input} placeholder="Centro, ciudad, etc." value={location} onChange={(e)=>setLocation(e.target.value)} />
              </div>

              <div>
                <label className="block h-5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Nota (opcional)
                </label>
                <input className={input} placeholder="Detalle del evento" value={note} onChange={(e)=>setNote(e.target.value)} />
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={submitEvent}
                className="rounded-lg px-5 py-2 font-medium text-white bg-green-700 hover:bg-green-800 disabled:opacity-50"
                disabled={!canSubmit || shipLoading}
              >
                {shipLoading ? 'Aplicando…' : 'Aplicar evento / estado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function UserRow({ u, onSave }){
  const [row, setRow] = useState(u)
  useEffect(()=>{ setRow(u) }, [u])

  return (
    <tr className="border-t border-neutral-200/60 dark:border-neutral-800">
      <td className="py-2 pr-2">
        <input className="w-full bg-transparent border-b border-transparent focus:border-green-600 outline-none"
          value={row.nombre} onChange={e=>setRow(r=>({...r, nombre:e.target.value}))} />
      </td>
      <td className="py-2 pr-2">
        <input className="w-full bg-transparent border-b border-transparent focus:border-green-600 outline-none"
          value={row.email} onChange={e=>setRow(r=>({...r, email:e.target.value}))} />
      </td>
      <td className="py-2 pr-2">
        <select className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1"
          value={row.rol} onChange={e=>setRow(r=>({...r, rol:e.target.value}))}>
          <option value="usuario">usuario</option>
          <option value="admin">admin</option>
        </select>
      </td>
      <td className="py-2 pr-2">
        <input type="checkbox" className="h-4 w-4 accent-green-700"
          checked={!!row.activo} onChange={e=>setRow(r=>({...r, activo:e.target.checked}))} />
      </td>
      <td className="py-2">
        <button
          onClick={()=>onSave(row)}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-white bg-green-700 hover:bg-green-800"
        >
          Guardar
        </button>
      </td>
    </tr>
  )
}
