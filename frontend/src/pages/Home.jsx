// RUTA: frontend/src/pages/Home.jsx
import { Link } from 'react-router-dom'
import { FaTruckMoving, FaShieldAlt, FaClock } from 'react-icons/fa'
import bannerDriver from '../imgs/webp1.webp'
import stackBoxes from '../imgs/webp2.webp'
import handoff from '../imgs/webp3.webp'

export default function Home(){
  return (
    <section className="space-y-12">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <img
          src={bannerDriver}
          alt="Conductor entregando paquetes"
          loading="eager"
          className="h-[360px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950/85 via-neutral-900/60 to-green-700/35" />
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
              Envíos simples, <span className="text-green-400">rápidos</span> y seguros
            </h1>
            <p className="mt-4 text-lg text-neutral-200">
              Cotiza, paga y genera tu etiqueta en minutos. Rastrea cada paquete con precisión y
              comparte el estado con tus clientes sin fricción.
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
          </div>
        </div>
      </div>

      {/* 3 features */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
          <FaTruckMoving className="text-green-700 text-3xl" />
          <h3 className="mt-3 text-xl font-semibold">Cobertura</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-300">
            Red logística con centros en ciudades clave. Consolidamos, optimizamos rutas y nos
            adaptamos a tus picos de demanda.
          </p>
        </div>

        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
          <FaShieldAlt className="text-green-700 text-3xl" />
          <h3 className="mt-3 text-xl font-semibold">Seguro & trazabilidad</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-300">
            Cobertura según valor declarado, línea de soporte y un timeline de eventos que puedes
            compartir con tus clientes.
          </p>
        </div>

        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
          <FaClock className="text-green-700 text-3xl" />
          <h3 className="mt-3 text-xl font-semibold">Ahorra tiempo</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-300">
            Genera etiquetas PDF en segundos y evita filas con ventanas de recepción extendidas.
          </p>
        </div>
      </div>

      {/* Cómo funciona + imágenes */}
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Cómo funciona</h2>
          <ol className="space-y-3 text-neutral-700 dark:text-neutral-300">
            <li>
              <span className="font-semibold text-green-700 dark:text-green-400">1. Cotiza</span> — Ingresa origen, destino y dimensiones. Obtenemos un costo claro con ETA (tiempo aproximado de entrega).
            </li>
            <li>
              <span className="font-semibold text-green-700 dark:text-green-400">2. Genera etiqueta</span> — Descarga tu etiqueta en formato PDF listo para imprimir y adhiérelo al paquete correspondiente.
            </li>
            <li>
              <span className="font-semibold text-green-700 dark:text-green-400">3. Entrega o recolección</span> — Llévalo a un centro logístico o agenda un pick-up según disponibilidad.
            </li>
            <li>
              <span className="font-semibold text-green-700 dark:text-green-400">4. Rastrea</span> — Comparte el tracking y sigue cada evento hasta la entrega.
            </li>
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <img
            src={stackBoxes}
            alt="Cajas listas para despacho"
            loading="lazy"
            className="h-44 w-full object-cover rounded-xl border border-neutral-200/70 dark:border-neutral-800"
          />
          <img
            src={handoff}
            alt="Entrega de paquete al destinatario"
            loading="lazy"
            className="h-44 w-full object-cover rounded-xl border border-neutral-200/70 dark:border-neutral-800"
          />
          <div className="col-span-2">
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/70 dark:border-green-900/40 p-4">
              <p className="text-sm text-green-900/80 dark:text-green-200">
                ¿Volúmenes constantes? Podemos programar recolecciones y dar seguimiento
                operativo a tus órdenes para que te concentres en vender.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="rounded-2xl bg-neutral-900 text-neutral-50 p-6 text-center">
        <p className="text-lg">
          UVM Express es tu aliado logístico. Empieza ahora desde
          <span className="font-semibold"> “Realizar Envíos”.</span>
        </p>
      </div>
    </section>
  )
}
