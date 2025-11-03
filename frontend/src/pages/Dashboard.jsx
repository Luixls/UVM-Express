// RUTA: frontend/src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/axios'
import { toast } from 'sonner'

// Mapa de estados → legible (igual que Rastreo)
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
const S = (code)=> STATUS[code] || code

const inputCls =
  'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 ' +
  'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 ' +
  'px-3 py-2 outline-none placeholder:text-neutral-400 ' +
  'focus:ring-2 focus:ring-green-600'

const labelCls =
  'block h-5 text-sm font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap'

export default function Dashboard(){
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  const [me, setMe] = useState(null)
  const [form, setForm] = useState({ nombre:'', telefono:'' })
  const [pw, setPw] = useState({ currentPassword:'', newPassword:'' })

  const [shipments, setShipments] = useState([])

  useEffect(()=>{
    ;(async ()=>{
      try{
        setLoading(true)
        const [{ data:meRes }, { data:shipRes }] = await Promise.all([
          api.get('/me'),
          api.get('/me/shipments')
        ])
        if (meRes?.ok) {
          setMe(meRes.user)
          setForm({
            nombre: meRes.user?.nombre || '',
            telefono: meRes.user?.telefono || ''
          })
        }
        if (shipRes?.ok) setShipments(shipRes.shipments || [])
      }catch(e){
        toast.error(e?.response?.data?.error || 'No se pudo cargar el panel')
      }finally{
        setLoading(false)
      }
    })()
  },[])

  const onSaveProfile = async ()=>{
    try{
      setSaving(true)
      // Solo enviamos los campos que existen en el modelo actual
      const { data } = await api.put('/me', {
        nombre: form.nombre,
        telefono: form.telefono
      })
      if (data?.ok) {
        setMe(data.user)        // ← Refresca estado con lo devuelto por el backend
        setForm({
          nombre: data.user?.nombre || '',
          telefono: data.user?.telefono || ''
        })
        toast.success('Perfil actualizado')
      }
    }catch(e){
      toast.error(e?.response?.data?.error || 'No se pudo actualizar el perfil')
    }finally{
      setSaving(false)
    }
  }

  const onChangePassword = async ()=>{
    if (!pw.currentPassword || !pw.newPassword) {
      return toast.error('Completa ambas contraseñas')
    }
    try{
      setChangingPw(true)
      const { data } = await api.put('/me/password', {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword
      })
      if (data?.ok) {
        toast.success('Contraseña actualizada')
        setPw({ currentPassword:'', newPassword:'' })
      }
    }catch(e){
      toast.error(e?.response?.data?.error || 'No se pudo cambiar la contraseña')
    }finally{
      setChangingPw(false)
    }
  }

  const fmtDateTime = (d)=> new Date(d).toLocaleString('es-ES', { hour12:false })

  const apiRoot = useMemo(()=>{
    const base = api?.defaults?.baseURL || ''
    return base.replace(/\/api\/?$/,'')
  },[])

  if (loading) return <div className="p-6 text-center">Cargando…</div>

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mi panel</h1>
      </div>

      {/* Perfil */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Tu información</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nombre</label>
              <input
                className={inputCls}
                value={form.nombre}
                onChange={e=>setForm(f=>({...f, nombre:e.target.value}))}
              />
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input
                className={inputCls}
                value={form.telefono}
                onChange={e=>setForm(f=>({...f, telefono:e.target.value}))}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Email (solo lectura)</label>
              <input className={inputCls} value={me?.email || ''} disabled />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={onSaveProfile}
              disabled={saving}
              className={`rounded-lg px-4 py-2 font-medium text-white ${saving ? 'bg-neutral-500 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Cambiar contraseña</h2>
          <div className="grid gap-4">
            <div>
              <label className={labelCls}>Contraseña actual</label>
              <input
                type="password"
                className={inputCls}
                value={pw.currentPassword}
                onChange={e=>setPw(p=>({...p, currentPassword:e.target.value}))}
              />
            </div>
            <div>
              <label className={labelCls}>Nueva contraseña</label>
              <input
                type="password"
                className={inputCls}
                value={pw.newPassword}
                onChange={e=>setPw(p=>({...p, newPassword:e.target.value}))}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={onChangePassword}
              disabled={changingPw}
              className={`rounded-lg px-4 py-2 font-medium text-white ${changingPw ? 'bg-neutral-500 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
            >
              {changingPw ? 'Actualizando…' : 'Actualizar contraseña'}
            </button>
          </div>
        </div>
      </div>

      {/* Tus envíos */}
      <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Tus envíos</h2>

        {shipments.length === 0 ? (
          <div className="text-neutral-500">Aún no tienes envíos.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-2 pr-4">Tracking</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4">Paquetes</th>
                  <th className="py-2 pr-4">Creado</th>
                  <th className="py-2 pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map(sh=>(
                  <tr key={sh.id} className="border-b border-neutral-200/70 dark:border-neutral-800/70">
                    <td className="py-2 pr-4">
                      <a
                        className="text-green-700 dark:text-green-400 underline"
                        href={`/rastreo?trk=${encodeURIComponent(sh.tracking)}`}
                        onClick={(e)=>{
                          e.preventDefault()
                          // navegación SPA (si tienes router, reemplázalo por navigate())
                          window.location.href = `/rastreo?trk=${encodeURIComponent(sh.tracking)}`
                        }}
                      >
                        {sh.tracking}
                      </a>
                      {sh.masterTracking && sh.masterTracking !== sh.tracking && (
                        <div className="text-xs text-neutral-500">Maestro: {sh.masterTracking}</div>
                      )}
                    </td>
                    <td className="py-2 pr-4">{sh.statusText || S(sh.status)}</td>
                    <td className="py-2 pr-4">{sh.packageCount}</td>
                    <td className="py-2 pr-4">{fmtDateTime(sh.createdAt)}</td>
                    <td className="py-2 pr-4">
                      {Array.isArray(sh.labels) && sh.labels.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {sh.labels.map((lb,i)=>(
                            <a
                              key={lb.tracking}
                              className="inline-flex items-center rounded-lg px-2.5 py-1 border border-neutral-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/10"
                              href={lb.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Descargar Etiqueta #{i+1}
                            </a>
                          ))}
                          {sh.labels.length > 1 && (
                            <button
                              className="inline-flex items-center rounded-lg px-2.5 py-1 border border-neutral-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/10"
                              onClick={()=>{
                                // abre todas con un pequeño delay para evitar bloqueo de popups
                                sh.labels.forEach((lb,idx)=> setTimeout(()=>window.open(lb.url,'_blank'), idx*150))
                              }}
                            >
                              Descargar todo
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
