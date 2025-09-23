// RUTA: frontend/src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e)=>{
    e.preventDefault()
    setErr(''); setLoading(true)
    try{
      await login(form.email.trim(), form.password)
      nav('/panel') // luego crearemos esta ruta protegida
    }catch(e){
      setErr(e?.response?.data?.error || 'Credenciales inválidas')
    }finally{ setLoading(false) }
  }

  return (
    <section className="max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-3">Entrar</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Email"
          value={form.email}
          onChange={e=>setForm({...form, email:e.target.value})}
        />
        <input
          className="border rounded px-3 py-2"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={e=>setForm({...form, password:e.target.value})}
        />
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded disabled:opacity-60">
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
        <p className="text-sm">
          ¿No tienes cuenta? <Link to="/registro" className="underline">Regístrate</Link>
        </p>
      </form>
    </section>
  )
}
