// RUTA: frontend/src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      nav('/panel') // luego crearemos esta ruta protegida
    }catch(e){
      setErr(e?.response?.data?.error || 'No fue posible registrar')
    }finally{ setLoading(false) }
  }

  return (
    <section className="max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-3">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded px-3 py-2" placeholder="Nombre"
          value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})}/>
        <input className="border rounded px-3 py-2" placeholder="Email"
          value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="border rounded px-3 py-2" placeholder="Teléfono"
          value={form.telefono} onChange={e=>setForm({...form, telefono:e.target.value})}/>
        <input className="border rounded px-3 py-2" type="password" placeholder="Contraseña"
          value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded disabled:opacity-60">
          {loading ? 'Creando…' : 'Registrarse'}
        </button>
        <p className="text-sm">
          ¿Ya tienes cuenta? <Link to="/login" className="underline">Entrar</Link>
        </p>
      </form>
    </section>
  )
}
