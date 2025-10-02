// RUTA: frontend/src/pages/Servicios.jsx
export default function Servicios(){
  return (
    <section className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">Soluciones de envío confiables</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
          En UVM Express movemos tus paquetes con seguridad y trazabilidad de punta a punta.
          Operamos con una red de centros logísticos estratégicos, seguro de mercancía y
          seguimiento en tiempo real.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
          <h3 className="text-xl font-semibold">Cobertura</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-300">
            Centros logísticos en ciudades clave para consolidación y distribución eficiente.
          </p>
        </div>

        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
          <h3 className="text-xl font-semibold">Seguro</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-300">
            Protegemos tu mercancía con cobertura opcional basada en el valor declarado.
          </p>
        </div>

        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
          <h3 className="text-xl font-semibold">Trazabilidad</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-300">
            ETA estimada y eventos de tracking detallados durante todo el trayecto.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-900 text-neutral-50 p-6 text-center">
        <p className="text-lg">
          ¿Listo para enviar? Cotiza, paga y genera tu etiqueta en minutos desde la sección
          <span className="font-semibold"> “Realizar Envíos”</span>.
        </p>
      </div>
    </section>
  )
}
