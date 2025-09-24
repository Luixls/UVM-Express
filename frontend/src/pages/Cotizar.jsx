// RUTA: frontend/src/pages/Cotizar.jsx
import { useEffect, useState } from 'react'
import { api } from '../api/axios'

export default function Cotizar(){
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [errCities, setErrCities] = useState('')

  const [form, setForm] = useState({
    originCityId: '',
    destCityId: '',
    largoCm: '',
    anchoCm: '',
    altoCm: '',
    pesoKg: '',
    cantidad: 1,
    declaredValueTotal: 0
  })
  const [quoting, setQuoting] = useState(false)
  const [errQuote, setErrQuote] = useState('')
  const [result, setResult] = useState(null)

  // Cargar ciudades
  useEffect(() => {
    (async () => {
      try {
        setLoadingCities(true); setErrCities('')
        const { data } = await api.get('/cities?limit=200')
        setCities(data.items || [])
      } catch (e) {
        setErrCities('No fue posible cargar ciudades')
      } finally {
        setLoadingCities(false)
      }
    })()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setErrQuote(''); setResult(null); setQuoting(true)
    try {
      const payload = {
        originCityId: +form.originCityId,
        destCityId: +form.destCityId,
        largoCm: +form.largoCm,
        anchoCm: +form.anchoCm,
        altoCm: +form.altoCm,
        pesoKg: +form.pesoKg,
        cantidad: +form.cantidad,
        declaredValueTotal: +form.declaredValueTotal
      }
      const { data } = await api.post('/quote', payload)
      setResult(data)
      // Guarda el último quoteId para facilitar “Crear Envío”
      if (data?.quote?.id) localStorage.setItem('lastQuoteId', String(data.quote.id))
    } catch (e) {
      setErrQuote(e?.response?.data?.error || 'Error al calcular cotización')
    } finally {
      setQuoting(false)
    }
  }

  const input = "border rounded px-3 py-2 bg-white"
  const select = input

  return (
    <section className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Cotizar envío</h1>

      {loadingCities && <p className="opacity-70 mb-3">Cargando ciudades…</p>}
      {errCities && <p className="text-red-500 text-sm mb-3">{errCities}</p>}

      <form onSubmit={onSubmit} className="grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <select className={select} value={form.originCityId}
            onChange={e=>setForm({...form, originCityId:e.target.value})} required>
            <option value="">Origen</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.estado ? `(${c.estado})` : ''}</option>)}
          </select>
          <select className={select} value={form.destCityId}
            onChange={e=>setForm({...form, destCityId:e.target.value})} required>
            <option value="">Destino</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.estado ? `(${c.estado})` : ''}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input className={input} placeholder="Largo (cm)" value={form.largoCm}
            onChange={e=>setForm({...form, largoCm:e.target.value})} required />
          <input className={input} placeholder="Ancho (cm)" value={form.anchoCm}
            onChange={e=>setForm({...form, anchoCm:e.target.value})} required />
          <input className={input} placeholder="Alto (cm)" value={form.altoCm}
            onChange={e=>setForm({...form, altoCm:e.target.value})} required />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input className={input} placeholder="Peso (kg)" value={form.pesoKg}
            onChange={e=>setForm({...form, pesoKg:e.target.value})} required />
          <input className={input} placeholder="Cantidad" value={form.cantidad}
            onChange={e=>setForm({...form, cantidad:e.target.value})} required />
          <input className={input} placeholder="Valor declarado (USD)" value={form.declaredValueTotal}
            onChange={e=>setForm({...form, declaredValueTotal:e.target.value})} />
        </div>

        {errQuote && <p className="text-red-500 text-sm">{errQuote}</p>}

        <button
          disabled={quoting}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {quoting ? 'Calculando…' : 'Calcular'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 border rounded">
          <p><b>Precio:</b> ${result.quote?.precio}</p>
          <p><b>ETA:</b> {result.eta}</p>
          <p className="text-xs opacity-70 mt-2">ID Cotización: {result.quote?.id}</p>
          <p className="text-xs opacity-70">Peso cobrado: {result.quote?.pesoCobradoKg} kg</p>
          <div className="mt-3 text-sm opacity-80">
            <p>Subtotal: ${result.quote?.breakdown?.subtotal}</p>
            <p>Recargos: ${result.quote?.breakdown?.recargos}</p>
          </div>
          <p className="mt-3 text-sm">Se guardó <code>lastQuoteId</code> en tu navegador para facilitar la creación del envío.</p>
        </div>
      )}
    </section>
  )
}
