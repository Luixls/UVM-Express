// RUTA: frontend/src/pages/RealizarEnvios.jsx
import { useEffect, useState } from 'react'
import { api } from '../api/axios'

const input = "border rounded px-3 py-2 bg-white"

export default function RealizarEnvios(){
  const [cities, setCities] = useState([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [citiesErr, setCitiesErr] = useState('')

  const [form, setForm] = useState({
    originCityId: '',
    destCityId: '',
    recipientName: '',
    recipientAddress: '',
    payAmount: '',
    packages: [
      { pesoKg: '', largoCm: '', anchoCm: '', altoCm: '', cantidad: 1, declaredValue: '' }
    ]
  })

  const [quoting, setQuoting] = useState(false)
  const [quoteErr, setQuoteErr] = useState('')
  const [quoteRes, setQuoteRes] = useState(null) // { total, eta, packages:[], quoteId? }

  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState('')
  const [createRes, setCreateRes] = useState(null) // { shipment, packages, labels }

  // Cargar ciudades
  useEffect(() => {
    (async () => {
      try {
        setCitiesLoading(true); setCitiesErr('')
        const { data } = await api.get('/cities?limit=200')
        setCities(data.items || [])
      } catch {
        setCitiesErr('No fue posible cargar ciudades')
      } finally {
        setCitiesLoading(false)
      }
    })()
  }, [])

  const addPkg = () => {
    setForm(f => ({ ...f, packages: [...f.packages, { pesoKg:'', largoCm:'', anchoCm:'', altoCm:'', cantidad:1, declaredValue:'' }] }))
  }
  const rmPkg = (idx) => {
    setForm(f => ({ ...f, packages: f.packages.filter((_,i)=>i!==idx) }))
  }
  const onPkgChange = (idx, key, val) => {
    setForm(f => {
      const arr = [...f.packages]
      arr[idx] = { ...arr[idx], [key]: val }
      return { ...f, packages: arr }
    })
  }

  const canQuote = () => {
    if (!form.originCityId || !form.destCityId) return false
    if (!form.packages.length) return false
    return form.packages.every(p => p.pesoKg && p.largoCm && p.anchoCm && p.altoCm && p.cantidad)
  }

  const onQuote = async (e) => {
    e?.preventDefault?.()
    if (!canQuote()) return
    setQuoteErr(''); setQuoteRes(null); setCreateRes(null)
    try {
      setQuoting(true)
      const payload = {
        originCityId: +form.originCityId,
        destCityId: +form.destCityId,
        packages: form.packages.map(p => ({
          pesoKg: +p.pesoKg,
          largoCm: +p.largoCm,
          anchoCm: +p.anchoCm,
          altoCm: +p.altoCm,
          cantidad: +p.cantidad || 1,
          declaredValue: +(p.declaredValue || 0)
        }))
      }
      const { data } = await api.post('/quote/multi', payload)
      // esperamos { ok, total, eta, packages:[...], (opcional) quoteId }
      setQuoteRes(data)
    } catch (e) {
      setQuoteErr(e?.response?.data?.error || 'Error al calcular cotización')
    } finally {
      setQuoting(false)
    }
  }

  const onCreate = async () => {
    setCreateErr(''); setCreateRes(null)
    try {
      if (!quoteRes?.quote?.id && !quoteRes?.quoteId) {
        // tu backend aún no devuelve quoteId. Evitamos llamar a /shipments porque fallará.
        setCreateErr('Falta quoteId. Ajusta el backend para que /api/quote/multi cree una Quote y devuelva su id.')
        return
      }
      setCreating(true)
      const quoteId = quoteRes?.quote?.id || quoteRes?.quoteId
      const payload = {
        quoteId: +quoteId,
        recipientName: form.recipientName.trim(),
        recipientAddress: form.recipientAddress.trim(),
        payAmount: form.payAmount ? +form.payAmount : 0,
        packages: form.packages.map(p => ({
          pesoKg: +p.pesoKg,
          largoCm: +p.largoCm,
          anchoCm: +p.anchoCm,
          altoCm: +p.altoCm,
          cantidad: +p.cantidad || 1
        }))
      }
      if (!payload.recipientName) throw new Error('Falta el nombre del destinatario')
      if (!payload.recipientAddress) throw new Error('Falta la dirección del destinatario')

      const { data } = await api.post('/shipments', payload)
      setCreateRes(data)
    } catch (e) {
      setCreateErr(e?.response?.data?.error || e.message || 'No se pudo crear el envío')
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Realizar Envíos</h1>

      <form onSubmit={onQuote} className="grid gap-4">
        {/* Origen/Destino */}
        <div className="grid md:grid-cols-2 gap-2">
          <select className={input} value={form.originCityId} onChange={e=>setForm({...form, originCityId:e.target.value})} required>
            <option value="">Ciudad de Origen</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.estado ? `(${c.estado})` : ''}</option>)}
          </select>
          <select className={input} value={form.destCityId} onChange={e=>setForm({...form, destCityId:e.target.value})} required>
            <option value="">Ciudad de Destino</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.estado ? `(${c.estado})` : ''}</option>)}
          </select>
        </div>
        {citiesLoading && <p className="text-sm opacity-70">Cargando ciudades…</p>}
        {citiesErr && <p className="text-sm text-red-500">{citiesErr}</p>}

        {/* Paquetes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Paquetes</h2>
            <button type="button" onClick={addPkg} className="px-3 py-1 border rounded hover:bg-gray-50">Agregar paquete</button>
          </div>
          {form.packages.map((p, idx) => (
            <div key={idx} className="grid md:grid-cols-6 gap-2 items-start">
              <input className={input} placeholder="Peso (kg)" value={p.pesoKg} onChange={e=>onPkgChange(idx,'pesoKg', e.target.value)} />
              <input className={input} placeholder="Largo (cm)" value={p.largoCm} onChange={e=>onPkgChange(idx,'largoCm', e.target.value)} />
              <input className={input} placeholder="Ancho (cm)" value={p.anchoCm} onChange={e=>onPkgChange(idx,'anchoCm', e.target.value)} />
              <input className={input} placeholder="Alto (cm)" value={p.altoCm} onChange={e=>onPkgChange(idx,'altoCm', e.target.value)} />
              <input className={input} placeholder="Cantidad" value={p.cantidad} onChange={e=>onPkgChange(idx,'cantidad', e.target.value)} />
              <div className="flex gap-2">
                <input className={`${input} w-full`} placeholder="Valor declarado (USD)" value={p.declaredValue} onChange={e=>onPkgChange(idx,'declaredValue', e.target.value)} />
                {form.packages.length > 1 && (
                  <button type="button" onClick={()=>rmPkg(idx)} className="px-3 py-2 border rounded hover:bg-gray-50">×</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Destinatario + Pago (se puede completar después de calcular) */}
        <div className="grid md:grid-cols-3 gap-2">
          <input className={input} placeholder="Nombre del destinatario"
            value={form.recipientName} onChange={e=>setForm({...form, recipientName:e.target.value})} />
          <input className={input} placeholder="Dirección del destinatario"
            value={form.recipientAddress} onChange={e=>setForm({...form, recipientAddress:e.target.value})} />
          <input className={input} placeholder="Abono inicial (opcional)"
            value={form.payAmount} onChange={e=>setForm({...form, payAmount:e.target.value})} />
        </div>

        {/* Acciones */}
        {quoteErr && <p className="text-red-500 text-sm">{quoteErr}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={quoting || !canQuote()} className="bg-black text-white px-4 py-2 rounded disabled:opacity-60">
            {quoting ? 'Calculando…' : 'Calcular'}
          </button>

          <button type="button"
            disabled={
              creating ||
              !quoteRes ||
              !(quoteRes?.quote?.id || quoteRes?.quoteId) // requiere quoteId del backend
            }
            onClick={onCreate}
            className="border px-4 py-2 rounded disabled:opacity-60"
          >
            {creating ? 'Creando envío…' : 'Confirmar y crear envío'}
          </button>
        </div>

        {!quoteRes?.quote?.id && !quoteRes?.quoteId && quoteRes && (
          <p className="text-xs opacity-70">
            Nota: tu backend de <code>/api/quote/multi</code> aún no devuelve <b>quoteId</b>.  
            Cuando lo haga, este botón se habilitará automáticamente.
          </p>
        )}
      </form>

      {/* Resultado de cotización */}
      {quoteRes && (
        <div className="mt-6 p-4 border rounded space-y-2">
          {'total' in quoteRes && <p><b>Total estimado:</b> ${quoteRes.total}</p>}
          {'eta' in quoteRes && <p><b>ETA:</b> {quoteRes.eta}</p>}

          {Array.isArray(quoteRes.packages) && (
            <div className="mt-3">
              <h3 className="font-semibold mb-1">Desglose por paquete</h3>
              <table className="w-full text-sm border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 border">#</th>
                    <th className="p-2 border">Peso total (kg)</th>
                    <th className="p-2 border">Costo peso</th>
                    <th className="p-2 border">Componente logístico</th>
                    <th className="p-2 border">Seguro</th>
                    <th className="p-2 border">Total paquete</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteRes.packages.map((p,i)=>(
                    <tr key={i}>
                      <td className="p-2 border">{p.index}</td>
                      <td className="p-2 border">{p.peso}</td>
                      <td className="p-2 border">${p.costoPeso}</td>
                      <td className="p-2 border">${p.compLog}</td>
                      <td className="p-2 border">${p.seguro}</td>
                      <td className="p-2 border font-medium">${p.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Resultado de creación */}
      {createRes && (
        <div className="mt-6 p-4 border rounded space-y-2">
          <h3 className="font-semibold">Envío creado</h3>
          <p><b>Estado:</b> {createRes.shipment.status}</p>

          {Array.isArray(createRes.packages) && (
            <div className="mt-2">
              <h4 className="font-semibold mb-1">Trackings por paquete</h4>
              <ul className="list-disc ml-6">
                {createRes.packages.map((p,idx)=>(
                  <li key={idx}>
                    <span className="font-mono">{p.tracking}</span>{' '}
                    — <a className="underline" href={`http://localhost:5000/labels/${p.tracking}.pdf`} target="_blank" rel="noreferrer">Etiqueta PDF</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
