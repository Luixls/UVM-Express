// RUTA: frontend/src/pages/Home.jsx
import { Link } from 'react-router-dom'
import { FaTruckMoving, FaShieldAlt, FaClock } from 'react-icons/fa'

export default function Home(){
  return (
    <section className="space-y-10">
      {/* Hero oscuro para máximo contraste */}
      <div className="rounded-2xl bg-neutral-900 text-neutral-50 shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8 md:p-12 text-center relative overflow-hidden">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Envíos simples, <span className="text-green-600">rápidos</span> y seguros
        </h1>
        <p className="mt-4 text-lg text-neutral-300">
          Cotiza, paga y genera tu etiqueta en minutos. Rastrea cada paquete con precisión.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            to="/realizar-envios"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-medium text-white bg-green-700 hover:bg-green-800"
          >
            Realizar Envíos
          </Link>
          <Link
            to="/rastreo"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-medium border border-neutral-700 text-neutral-100 hover:bg-white/5"
          >
            Rastrear paquete
          </Link>
        </div>
        <div className="pointer-events-none absolute -bottom-10 right-6 opacity-10 text-[180px] text-neutral-700">UVM</div>
      </div>

      {/* Tarjetas - buen contraste en ambos temas */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-6">
          <FaTruckMoving className="text-green-700 text-3xl" />
          <h3 className="mt-3 text-xl font-semibold">Cobertura</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-300">
            Red logística con centros en ciudades clave.
          </p>
        </div>

        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-6">
          <FaShieldAlt className="text-green-700 text-3xl" />
          <h3 className="mt-3 text-xl font-semibold">Seguro & trazabilidad</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-300">
            ETA estimada y eventos de tracking detallados.
          </p>
        </div>

        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-6">
          <FaClock className="text-green-700 text-3xl" />
          <h3 className="mt-3 text-xl font-semibold">Ahorra tiempo</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-300">
            Etiqueta PDF lista para imprimir en segundos.
          </p>
        </div>
      </div>
    </section>
  )
}
