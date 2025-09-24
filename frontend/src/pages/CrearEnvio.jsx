// RUTA: frontend/src/pages/CrearEnvio.jsx
import { useEffect, useState } from 'react'
import { api } from '../api/axios'
import { Link } from 'react-router-dom'

export default function CrearEnvio(){
  const [form, setForm] = useState({
    quoteId: '',
    recipientName: '',
    recipientAddress: '',
    payAmount: '',
    packages: [
      { pesoKg: '', largoCm: '', anchoCm: '', altoCm: '', cantidad: 1 }
    ]
  })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [resp, setResp] = useState(null)

  // Precargar quoteId desde el localStorage si existe
  useEffect(() => {
    const q = localStorage.getItem('lastQuoteId')
    if (q && !form.quoteId) {
      setForm(f => ({ ...f, quoteId: q }))
    }
  }, [])

  const addPkg = () => {
    setForm(f => ({
      ...f,
      packages: [...f.packages, { pesoKg: '', largoCm: '', anchoCm: '', altoCm: '', cantidad: 1 }]
    }))
  }

  const rmPkg = (idx) => {
    setForm(f => ({
      ...f,
      packages: f.packages.filter((_, i) => i !== idx)
    }))
  }

  const onPkgChange = (idx, key, val) => {
    setForm(f => {
      const arr = [...f.packages]
      arr[idx] = { ...arr[idx], [key]: val }
      return { ...f, packages: arr }
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(''); setResp(null); setLoading(true)
    try {
      // Normaliza payload
      const payload = {
        quoteId: +form.quoteId,
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
      // Validación rápida en cliente
      if (!payload.quoteId) throw new Error('Falta el ID de cotización')
      if (!payload.recipientName) throw new Error('Falta el nombre del destinatario')
      if (!payload.recipientAddress) throw new Error('Falta la dirección del destinatario')
      if (!payload.packages.length) throw new Error('Debes agregar al menos un paquete')

      const { data } = await api.post('/shipments', payload)
      setResp(data)
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || 'No se pudo crear el envío')
    } finally {
      setLoading(false)
    }
  }

  const input = "border rounded px-3 py-2 bg-white"

  return (
    <section className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">Crear Envío</h1>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid md:grid-cols-3 gap-3">
          <input className={input} placeholder="ID de Cotización"
                 value={form.quoteId} onChange={e=>setForm({...form, quoteId:e.target.value})} />
          <input className={input} placeholder="Nombre del destinatario"
                 value={form.recipientName} onChange={e=>setForm({...form, recipientName:e.target.value})} />
          <input className={input} placeholder="Pago inicial (opcional)"
                 value={form.payAmount} onChange={e=>setForm({...form, payAmount:e.target.value})} />
        </div>

        <input className={input} placeholder="Dirección del destinatario"
               value={form.recipientAddress} onChange={e=>setForm({...form, recipientAddress:e.target.value})} />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Paquetes</h2>
            <button type="button" onClick={addPkg} className="px-3 py-1 border rounded hover:bg-gray-50">Añadir paquete</button>
          </div>

          {form.packages.map((p, idx) => (
            <div key={idx} className="grid md:grid-cols-5 gap-2 items-start">
              <input className={input} placeholder="Peso (kg)" value={p.pesoKg}
                     onChange={e=>onPkgChange(idx,'pesoKg', e.target.value)} />
              <input className={input} placeholder="Largo (cm)" value={p.largoCm}
                     onChange={e=>onPkgChange(idx,'largoCm', e.target.value)} />
              <input className={input} placeholder="Ancho (cm)" value={p.anchoCm}
                     onChange={e=>onPkgChange(idx,'anchoCm', e.target.value)} />
              <input className={input} placeholder="Alto (cm)" value={p.altoCm}
                     onChange={e=>onPkgChange(idx,'altoCm', e.target.value)} />
              <div className="flex gap-2">
                <input className={`${input} w-full`} placeholder="Cantidad" value={p.cantidad}
                       onChange={e=>onPkgChange(idx,'cantidad', e.target.value)} />
                {form.packages.length > 1 && (
                  <button type="button" onClick={()=>rmPkg(idx)} className="px-3 py-2 border rounded hover:bg-gray-50">×</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {err && <p className="text-red-500 text-sm">{err}</p>}

        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded disabled:opacity-60">
          {loading ? 'Creando…' : 'Crear envío'}
        </button>
      </form>

      {resp && (
        <div className="mt-6 p-4 border rounded space-y-2">
          <p><b>Tracking:</b> {resp.shipment.tracking}</p>
          <p><b>Estado:</b> {resp.shipment.status}</p>
          <p>
            <a className="underline" href={`http://localhost:5000${resp.labelUrl}`} target="_blank" rel="noreferrer">
              Descargar etiqueta PDF
            </a>
          </p>
          <div className="text-sm mt-2">
            <Link className="underline" to="/rastreo">Rastrear otro envío</Link>
          </div>
        </div>
      )}
    </section>
  )
}
