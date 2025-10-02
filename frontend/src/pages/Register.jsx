// RUTA: frontend/src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const inputCls = "w-full rounded-lg border border-neutral-300 dark:border-neutral-700 " +
                 "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 " +
                 "px-3 py-2 outline-none placeholder:text-neutral-400 " +
                 "focus:ring-2 focus:ring-green-600"

export default function Register(){
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ nombre:'', email:'', password:'', telefono:'' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e)=>{
    e.preventDefault()
    setErr(''); setLoading(true)
    try{
      await register({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
        telefono: form.telefono.trim()
      })
      nav('/panel')
    }catch(e){
      setErr(e?.response?.data?.error || 'No fue posible registrar')
    }finally{ setLoading(false) }
  }

  return (
    <section className="max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-3">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className={inputCls} placeholder="Nombre"
               value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})}/>
        <input className={inputCls} placeholder="Email"
               value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className={inputCls} placeholder="Teléfono"
               value={form.telefono} onChange={e=>setForm({...form, telefono:e.target.value})}/>
        <input className={inputCls} type="password" placeholder="Contraseña"
               value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        {err && <p className="text-red-600 dark:text-red-400 text-sm">{err}</p>}
        <button disabled={loading}
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium
                     text-white bg-green-700 hover:bg-green-800 disabled:opacity-60">
          {loading ? 'Creando…' : 'Registrarse'}
        </button>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          ¿Ya tienes cuenta? <Link to="/login" className="underline">Entrar</Link>
        </p>
      </form>
    </section>
  )
}
