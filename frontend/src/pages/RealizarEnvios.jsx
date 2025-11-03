// RUTA: frontend/src/pages/RealizarEnvios.jsx

import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/axios'
import { toast } from 'sonner'

// Imágenes (galería de apoyo)
import Webp4 from '../imgs/webp4.webp'
import Webp5 from '../imgs/webp5.webp'

// estilos utilitarios
const inputCls =
  'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 ' +
  'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 ' +
  'px-3 py-2 outline-none placeholder:text-neutral-400 ' +
  'focus:ring-2 focus:ring-green-600'
const labelCls =
  'block h-5 text-sm font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap'

// Sanitizador: solo dígitos + punto
function sanitizeNumeric (value) {
  let v = String(value ?? '').replace(/[^\d.]/g, '')
  const parts = v.split('.')
  if (parts.length > 2) v = parts.shift() + '.' + parts.join('')
  return v
}

const emptyPkg = { largoCm:'', anchoCm:'', altoCm:'', pesoKg:'', cantidad:'1', declaredValue:'' }

export default function RealizarEnvios () {
  const [cities, setCities] = useState([])

  // Selectores por pasos
  const [origin, setOrigin] = useState({ country:'', state:'', cityId:'' })
  const [dest, setDest] = useState({ country:'', state:'', cityId:'' })

  const [form, setForm] = useState({ packages:[{...emptyPkg}] })
  const [quote, setQuote] = useState(null)
  const [recipient, setRecipient] = useState({ name:'', address:'' })
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(null) // { ok, labels:[...], shipment:{...} }

  // --- Pago simulado ---
  const [showPayment, setShowPayment] = useState(false)
  const [pay, setPay] = useState({
    name: '',
    number: '',
    expiry: '', // MM/YY
    cvc: '',
    docId: '',
    zip: ''
  })
  const [payErrors, setPayErrors] = useState({})

  // base root del API para armar URLs absolutas de /labels
  const apiRoot = useMemo(()=>{
    const base = api?.defaults?.baseURL || ''
    return base.replace(/\/api\/?$/,'')
  },[])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/cities')
        setCities(data.cities || [])
      } catch {
        toast.error('No se pudieron cargar las ciudades')
      }
    })()
  }, [])

  // Helpers cascada
  const countries = useMemo(()=>{
    const s = new Set()
    for(const c of cities) if (c.pais) s.add(c.pais)
    return Array.from(s).sort((a,b)=>a.localeCompare(b))
  },[cities])
  const statesByCountry = (country)=>{
    const s = new Set()
    for(const c of cities) if (c.pais===country && c.estado) s.add(c.estado)
    return Array.from(s).sort((a,b)=>a.localeCompare(b))
  }
  const citiesByCountryState = (country,state)=>
    cities.filter(c=>c.pais===country && c.estado===state)
          .sort((a,b)=>a.nombre.localeCompare(b.nombre))

  // paquetes
  const onChangePkg = (idx,key,val)=>{
    const pkgs = structuredClone(form.packages)
    if (['largoCm','anchoCm','altoCm','pesoKg','cantidad','declaredValue'].includes(key)) {
      pkgs[idx][key] = sanitizeNumeric(val)
    } else pkgs[idx][key] = val
    setForm({...form, packages:pkgs})
  }
  const addPackage = ()=> setForm(f=>({...f, packages:[...f.packages, {...emptyPkg}]}))
  const removePackage = (idx)=> setForm(f=>({...f, packages:f.packages.filter((_,i)=>i!==idx)}))

  const hasCitiesChosen = !!(origin.cityId && dest.cityId)
  const canQuote = useMemo(()=>{
    if(!hasCitiesChosen) return false
    return form.packages.every(p=>{
      const l=+parseFloat(p.largoCm), a=+parseFloat(p.anchoCm), h=+parseFloat(p.altoCm)
      const w=+parseFloat(p.pesoKg), q=+parseInt(p.cantidad||'1',10)
      return l>0&&a>0&&h>0&&w>0&&q>0
    })
  },[form, hasCitiesChosen])

  const handleQuote = async ()=>{
    try{
      const payload = {
        originCityId:+origin.cityId,
        destCityId:+dest.cityId,
        packages: form.packages.map(p=>({
          largoCm:+parseFloat(p.largoCm),
          anchoCm:+parseFloat(p.anchoCm),
          altoCm:+parseFloat(p.altoCm),
          pesoKg:+parseFloat(p.pesoKg),
          cantidad:+parseInt(p.cantidad||'1',10),
          declaredValue:+(parseFloat(p.declaredValue||'0')||0)
        }))
      }
      const { data } = await api.post('/quote/multi', payload)
      setQuote(data)
      setCreated(null)
      setShowPayment(false)
      toast.success('Cotización actualizada')
    }catch(e){
      toast.error(e?.response?.data?.error || 'No se pudo cotizar')
    }
  }

  const originLocationText = useMemo(()=>{
    if (!origin.cityId) return ''
    const city = cities.find(c=>String(c.id)===String(origin.cityId))
    if (!city) return ''
    const parts = [city.nombre, city.estado, city.pais].filter(Boolean)
    return parts.join(', ')
  },[origin, cities])

  // --- Crear envío (común para pago y para “saltar”) ---
  const createShipmentRequest = async (payAmount = 0)=>{
    setCreating(true)
    try{
      const expanded = form.packages.flatMap(p =>
        Array.from({length:+parseInt(p.cantidad||'1',10)}, ()=>({
          pesoKg:+parseFloat(p.pesoKg),
          largoCm:+parseFloat(p.largoCm),
          anchoCm:+parseFloat(p.anchoCm),
          altoCm:+parseFloat(p.altoCm),
          cantidad:1,
          declaredValue:+(parseFloat(p.declaredValue||'0')||0)
        }))
      )
      const body = {
        quoteId: quote.quote.id,
        recipientName: recipient.name.trim(),
        recipientAddress: recipient.address.trim(),
        packages: expanded,
        payAmount: Number(payAmount) || 0
      }
      const { data } = await api.post('/shipments', body)
      const labelsAbs = (data.labels||[]).map(u => u.startsWith('http') ? u : `${apiRoot}${u}`)
      setCreated({ ...data, labels: labelsAbs })
      toast.success('Envío creado')
    }catch(e){
      toast.error(e?.response?.data?.error || 'No se pudo crear el envío')
    }finally{
      setCreating(false)
    }
  }

  // --- Validación simple de pago simulado (no se guarda nada) ---
  const validatePayment = ()=>{
    const errs = {}
    const num = String(pay.number || '').replace(/\s+/g,'')
    const exp = String(pay.expiry || '').trim()
    const cvc = String(pay.cvc || '').trim()

    if (!pay.name.trim()) errs.name = 'Requerido'
    if (!/^\d{13,19}$/.test(num)) errs.number = 'Número inválido'
    if (!/^\d{2}\/\d{2}$/.test(exp)) errs.expiry = 'Formato MM/YY'
    if (!/^\d{3,4}$/.test(cvc)) errs.cvc = 'CVC inválido'
    setPayErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleContinueToPayment = ()=>{
    if (!quote?.quote?.id) return toast.error('Primero cotiza el envío')
    if (!recipient.name.trim() || !recipient.address.trim()) {
      return toast.error('Completa destinatario antes de continuar')
    }
    setShowPayment(true)
    // scroll suave al formulario de pago
    setTimeout(()=>{
      const el = document.getElementById('payment-form')
      if (el) el.scrollIntoView({ behavior:'smooth', block:'start' })
    }, 50)
  }

  const handlePayAndCreate = async ()=>{
    if (!validatePayment()) return
    const total = Number(quote?.total ?? quote?.quote?.precio ?? 0)
    await createShipmentRequest(total) // simula que se pagó el total
  }

  const handleSkipAndCreate = async ()=>{
    if (!quote?.quote?.id) return toast.error('Primero cotiza el envío')
    if (!recipient.name.trim() || !recipient.address.trim()) {
      return toast.error('Completa destinatario')
    }
    await createShipmentRequest(0)
  }

  const downloadAll = ()=>{
    if (!created?.labels?.length) return
    created.labels.forEach((u,i)=> setTimeout(()=>window.open(u,'_blank'), i*150))
  }

  // cascada handlers
  const originStates = origin.country ? statesByCountry(origin.country) : []
  const originCities = (origin.country && origin.state) ? citiesByCountryState(origin.country, origin.state) : []
  const destStates = dest.country ? statesByCountry(dest.country) : []
  const destCities = (dest.country && dest.state) ? citiesByCountryState(dest.country, dest.state) : []

  const canQuoteNow = useMemo(()=>{
    return canQuote
  },[canQuote])

  const subtotal = quote?.quote?.breakdown?.subtotalCore ?? quote?.quote?.breakdown?.subtotal ?? null
  const recargos = quote?.quote?.breakdown
    ? Number(quote.quote.breakdown.recargoCombustible||0)+Number(quote.quote.breakdown.segurosTotal||0)
    : null
  const total = Number(quote?.total ?? quote?.quote?.precio ?? 0)

  return (
    <section className="grid lg:grid-cols-3 gap-8">
      {/* Columna principal */}
      <div className="lg:col-span-2 rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
        <h1 className="text-2xl font-bold mb-4">Realizar Envíos</h1>

        {/* 1) Paquetes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Paquetes</h2>
            <button onClick={addPackage}
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-50 hover:bg-black/5 dark:hover:bg-white/10">
              Agregar paquete
            </button>
          </div>

          {form.packages.map((p,idx)=>(
            <div key={idx} className="grid md:grid-cols-6 gap-3 p-4 rounded-xl border border-neutral-200 dark:border-white/10 items-end">
              <div><label className={labelCls}>Largo (cm)</label>
                <input type="text" inputMode="decimal" className={inputCls} value={p.largoCm}
                  onChange={e=>onChangePkg(idx,'largoCm',e.target.value)} placeholder="Ej: 30"/></div>
              <div><label className={labelCls}>Ancho (cm)</label>
                <input type="text" inputMode="decimal" className={inputCls} value={p.anchoCm}
                  onChange={e=>onChangePkg(idx,'anchoCm',e.target.value)} placeholder="Ej: 30"/></div>
              <div><label className={labelCls}>Alto (cm)</label>
                <input type="text" inputMode="decimal" className={inputCls} value={p.altoCm}
                  onChange={e=>onChangePkg(idx,'altoCm',e.target.value)} placeholder="Ej: 20"/></div>
              <div><label className={labelCls}>Peso (kg)</label>
                <input type="text" inputMode="decimal" className={inputCls} value={p.pesoKg}
                  onChange={e=>onChangePkg(idx,'pesoKg',e.target.value)} placeholder="Ej: 1.5"/></div>
              <div><label className={labelCls}>Cantidad</label>
                <input type="text" inputMode="numeric" className={inputCls} value={p.cantidad}
                  onChange={e=>onChangePkg(idx,'cantidad',e.target.value)} placeholder="Ej: 1"/></div>
              <div><label className={labelCls}>Valor declarado</label>
                <input type="text" inputMode="decimal" className={inputCls} value={p.declaredValue}
                  onChange={e=>onChangePkg(idx,'declaredValue',e.target.value)} placeholder="Ej: 50"/></div>
              <div className="md:col-span-6 flex justify-end">
                {form.packages.length>1 && (
                  <button onClick={()=>removePackage(idx)}
                    className="inline-flex items-center justify-center rounded-lg px-3 py-2 font-medium text-red-600 hover:bg-red-600/10">
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 2) Origen/Destino + Destinatario */}
        <hr className="my-6 border-neutral-200 dark:border-white/10" />
        <h2 className="text-lg font-semibold mb-2">Origen y Destino</h2>

        {/* ORIGEN */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>País (origen)</label>
            <select className={inputCls} value={origin.country} onChange={e=>setOrigin({country:e.target.value, state:'', cityId:''})}>
              <option value="">Selecciona…</option>
              {countries.map(cty=><option key={cty} value={cty}>{cty}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Estado (origen)</label>
            <select className={inputCls} value={origin.state} onChange={e=>setOrigin(o=>({...o, state:e.target.value, cityId:''}))} disabled={!origin.country}>
              <option value="">Selecciona…</option>
              {statesByCountry(origin.country).map(st=><option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Ciudad (origen)</label>
            <select className={inputCls} value={origin.cityId} onChange={e=>setOrigin(o=>({...o, cityId:e.target.value}))} disabled={!origin.state}>
              <option value="">Selecciona…</option>
              {citiesByCountryState(origin.country, origin.state).map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* DESTINO + DESTINATARIO */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className={labelCls}>País (destino)</label>
            <select className={inputCls} value={dest.country} onChange={e=>setDest({country:e.target.value, state:'', cityId:''})}>
              <option value="">Selecciona…</option>
              {countries.map(cty=><option key={cty} value={cty}>{cty}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Estado (destino)</label>
            <select className={inputCls} value={dest.state} onChange={e=>setDest(d=>({...d, state:e.target.value, cityId:''}))} disabled={!dest.country}>
              <option value="">Selecciona…</option>
              {statesByCountry(dest.country).map(st=><option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Ciudad (destino)</label>
            <select className={inputCls} value={dest.cityId} onChange={e=>setDest(d=>({...d, cityId:e.target.value}))} disabled={!dest.state}>
              <option value="">Selecciona…</option>
              {citiesByCountryState(dest.country, dest.state).map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* Destinatario */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-1">
            <label className={labelCls}>Nombre del destinatario</label>
            <input className={inputCls} value={recipient.name} onChange={e=>setRecipient({...recipient, name:e.target.value})}/>
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Dirección del destinatario</label>
            <input className={inputCls} value={recipient.address} onChange={e=>setRecipient({...recipient, address:e.target.value})}/>
          </div>
        </div>

        {/* Acciones de cotización / continuación */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button disabled={!canQuoteNow} onClick={handleQuote}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-white bg-green-700 hover:bg-green-800 disabled:opacity-50">
            Calcular
          </button>

          {/* Solo aparece cuando ya hay cotización válida */}
          {!!quote?.quote?.id && (
            <>
              <button
                onClick={handleContinueToPayment}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-white bg-emerald-700 hover:bg-emerald-800"
              >
                Continuar a crear el envío…
              </button>

              <button
                onClick={handleSkipAndCreate}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/10"
                disabled={creating}
              >
                {creating ? 'Creando…' : 'Saltar pago y crear envío'}
              </button>
            </>
          )}
        </div>

        {/* ====== PAGO SIMULADO ====== */}
        {showPayment && !created?.ok && (
          <div id="payment-form" className="mt-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 p-6">
            <h3 className="text-lg font-semibold mb-4">Pago con tarjeta (simulado)</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
              Este es un pago de prueba. <strong>No se procesa ni se guarda ningún dato.</strong>
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelCls}>Nombre en la tarjeta</label>
                <input
                  className={`${inputCls} ${payErrors.name?'ring-2 ring-red-500':''}`}
                  placeholder="Ej: JUAN PÉREZ"
                  value={pay.name}
                  onChange={e=>setPay(p=>({...p, name:e.target.value}))}
                />
                {payErrors.name && <div className="text-xs text-red-500 mt-1">{payErrors.name}</div>}
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>Número de tarjeta</label>
                <input
                  className={`${inputCls} font-mono ${payErrors.number?'ring-2 ring-red-500':''}`}
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={pay.number}
                  onChange={e=>setPay(p=>({...p, number:e.target.value.replace(/[^\d\s]/g,'')}))}
                />
                {payErrors.number && <div className="text-xs text-red-500 mt-1">{payErrors.number}</div>}
              </div>

              <div>
                <label className={labelCls}>Vencimiento (MM/YY)</label>
                <input
                  className={`${inputCls} font-mono ${payErrors.expiry?'ring-2 ring-red-500':''}`}
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={pay.expiry}
                  onChange={e=>setPay(p=>({...p, expiry:e.target.value.toUpperCase()}))}
                />
                {payErrors.expiry && <div className="text-xs text-red-500 mt-1">{payErrors.expiry}</div>}
              </div>

              <div>
                <label className={labelCls}>CVC</label>
                <input
                  className={`${inputCls} font-mono ${payErrors.cvc?'ring-2 ring-red-500':''}`}
                  inputMode="numeric"
                  placeholder="CVC"
                  value={pay.cvc}
                  onChange={e=>setPay(p=>({...p, cvc:e.target.value.replace(/[^\d]/g,'')}))}
                />
                {payErrors.cvc && <div className="text-xs text-red-500 mt-1">{payErrors.cvc}</div>}
              </div>

              <div>
                <label className={labelCls}>Documento (opcional)</label>
                <input
                  className={inputCls}
                  placeholder="ID / DNI (simulado)"
                  value={pay.docId}
                  onChange={e=>setPay(p=>({...p, docId:e.target.value}))}
                />
              </div>

              <div>
                <label className={labelCls}>ZIP / Código postal (opcional)</label>
                <input
                  className={inputCls}
                  placeholder="Ej: 10001"
                  value={pay.zip}
                  onChange={e=>setPay(p=>({...p, zip:e.target.value}))}
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handlePayAndCreate}
                className="rounded-lg px-5 py-2 font-medium text-white bg-green-700 hover:bg-green-800 disabled:opacity-50"
                disabled={creating}
              >
                {creating ? 'Procesando…' : `Pagar y crear envío ($${total.toFixed(2)})`}
              </button>

              <button
                onClick={handleSkipAndCreate}
                className="rounded-lg px-5 py-2 font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
                disabled={creating}
              >
                {creating ? 'Creando…' : 'Saltar pago y crear envío'}
              </button>
            </div>
          </div>
        )}

        {/* Etiquetas + Pasos a seguir */}
        {created?.ok && (
          <div className="mt-6 space-y-4">
            {/* Pasos */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <h3 className="text-lg font-semibold mb-2">Siguientes pasos</h3>
              <p className="text-sm leading-relaxed">
                Adhiera la(s) etiqueta(s) a su(s) paquete(s) correspondiente(s).
                Luego, puede llevar sus paquetes al centro logístico
                {' '}<span className="font-medium">{originLocationText || 'seleccionado'}</span>{' '}
                donde nuestro equipo se encargará de procesar su encomienda.
              </p>
            </div>

            {/* Etiquetas */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Etiquetas</h3>
                {created.labels?.length > 1 && (
                  <button onClick={downloadAll}
                    className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/10">
                    Descargar todo
                  </button>
                )}
              </div>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                {created.labels?.map((u,i)=>(
                  <li key={u}>
                    <a className="underline" href={u} target="_blank" rel="noreferrer">Etiqueta #{i+1}</a>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <button onClick={()=>window.location.reload()}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/10">
                  Realizar otro envío
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resumen */}
      <aside className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6 h-fit">
        <h3 className="text-lg font-semibold mb-4">Resumen</h3>
        {!quote ? (
          <p className="text-neutral-600 dark:text-neutral-300">Cotiza para ver el precio estimado y ETA.</p>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{subtotal!=null?`$${Number(subtotal).toFixed(2)}`:'—'}</span></div>
            <div className="flex justify-between"><span>Recargos</span><span>{recargos!=null?`$${Number(recargos).toFixed(2)}`:'—'}</span></div>
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${Number(total).toFixed(2)}</span></div>
            <div className="pt-2 text-neutral-600 dark:text-neutral-300">ETA: {quote.eta || quote.quote?.breakdown?.eta || '—'}</div>
          </div>
        )}
      </aside>

      {/* Galería inferior (ocupa todo el ancho del grid) */}
      <div className="lg:col-span-3">
        <div className="grid md:grid-cols-2 gap-4">
          <img
            src={Webp4}
            alt="Etiquetado y preparación de paquetes"
            loading="lazy"
            className="w-full h-48 md:h-56 object-cover rounded-xl shadow"
          />
          <img
            src={Webp5}
            alt="Centro logístico UVM Express"
            loading="lazy"
            className="w-full h-48 md:h-56 object-cover rounded-xl shadow"
          />
        </div>
      </div>
    </section>
  )
}
