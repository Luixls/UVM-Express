// RUTA: frontend/src/pages/Servicios.jsx
import imgHero from '../imgs/img1.jpg'
import imgStack from '../imgs/img2.jpg'
import imgSMB from '../imgs/img3.jpeg'
import imgCourier from '../imgs/img4.jpg'
import imgExpert from '../imgs/png1.png'

export default function Servicios(){
  return (
    <section className="space-y-12">
      {/* Hero con foto + overlay verde */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800">
        <img
          src={imgHero}
          alt="Recepción de paquetes en UVM Express"
          loading="eager"
          className="h-[320px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950/80 via-neutral-900/60 to-green-700/40" />
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
              Soluciones de envío con <span className="text-green-400">cobertura</span>, <span className="text-green-400">seguro</span> y <span className="text-green-400">trazabilidad</span>
            </h1>
            <p className="mt-3 text-neutral-200">
              Operamos una red de centros logísticos, integraciones flexibles y un servicio que
              prioriza la experiencia del cliente. Desde un sobre hasta carga fraccionada,
              nos ocupamos del trayecto completo con visibilidad y soporte.
            </p>
          </div>
        </div>
      </div>

      {/* Bloques de valor */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-3 py-1 text-xs font-semibold">
            Cobertura
          </div>
          <h3 className="mt-3 text-xl font-semibold">Red de centros estratégicos</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Disponemos de hubs en ciudades clave para consolidación y distribución inteligente.
            Esto reduce tiempos de tránsito, optimiza rutas y nos permite reaccionar ante
            eventualidades operativas con planes alternos.
          </p>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            También trabajamos con ventanas de recepción extendidas para que tu operación no se
            detenga, y acuerdos con última milla cuando se requiere.
          </p>
        </div>

        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-3 py-1 text-xs font-semibold">
            Seguro
          </div>
          <h3 className="mt-3 text-xl font-semibold">Protección a tu medida</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Tu mercancía puede viajar con cobertura según el valor declarado. Te acompañamos en
            la documentación y mantenemos un canal de soporte para reportes y aclaratorias.
          </p>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Nuestro equipo de atención evalúa cada caso con trazabilidad de eventos verificados,
            lo que agiliza cualquier gestión de reclamación.
          </p>
        </div>

        <div className="rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200/70 dark:border-neutral-800 p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-3 py-1 text-xs font-semibold">
            Trazabilidad
          </div>
          <h3 className="mt-3 text-xl font-semibold">Visibilidad y ETA confiable</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Cada paquete genera un timeline de eventos con estimación de entrega (ETA) dinámica.
            Podrás compartir el tracking con tus clientes para evitar fricción post-venta.
          </p>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            A nivel operativo, ofrecemos agrupación por encomienda y alertas ante incidencias
            comunes (reintentos, dirección inválida, clima, etc.).
          </p>
        </div>
      </div>

      {/* Imagen + copy largo */}
      <div className="grid lg:grid-cols-2 gap-6 items-center">
        <div className="overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800">
          <img
            src={imgStack}
            alt="Clasificación de cajas en centro logístico"
            loading="lazy"
            className="h-[320px] w-full object-cover"
          />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Pensado para negocios en crecimiento</h2>
          <p className="text-neutral-600 dark:text-neutral-300">
            Si vendes en línea o administras múltiples destinos, UVM Express se integra a tu flujo:
            cotizas, generas etiquetas PDF y rastreas en un mismo lugar. Nuestro esquema de
            tarifas prioriza la claridad para que proyectes costos sin sorpresas.
          </p>
          <p className="text-neutral-600 dark:text-neutral-300">
            ¿Volúmenes variables? Ajustamos calendario de recolecciones y diseñamos rutas para
            picos estacionales. Nuestro objetivo: que el envío deje de ser un dolor y se vuelva
            una ventaja competitiva.
          </p>
        </div>
      </div>

      {/* Casos de uso + imagen (incluye Acompañamiento experto como tarjeta con imagen) */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          <img
            src={imgSMB}
            alt="Comercio preparando pedidos"
            loading="lazy"
            className="h-40 w-full object-cover rounded-xl"
          />
          <h3 className="mt-4 text-lg font-semibold">Comercios & eCommerce</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Soluciones para pequeños y medianos negocios: etiquetas en minutos, consolidación
            por días, y comunicación simple con tus compradores.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          <img
            src={imgCourier}
            alt="Operador de última milla"
            loading="lazy"
            className="h-40 w-full object-cover rounded-xl"
          />
          <h3 className="mt-4 text-lg font-semibold">Última milla y B2B</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Operación híbrida con aliados de última milla, cross-dock y entregas B2B entre
            ciudades con ventanas horarias acordadas.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          <img
            src={imgExpert}
            alt="Asesoría para empaque y documentación"
            loading="lazy"
            className="h-40 w-full object-cover rounded-xl"
          />
          <h3 className="mt-4 text-lg font-semibold">Acompañamiento experto</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Nuestro equipo te asesora en empaque, documentación y mejores prácticas para reducir
            mermas y costos. Si necesitas algo más específico, lo diseñamos contigo.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-neutral-900 text-neutral-50 p-6 text-center">
        <p className="text-lg">
          ¿Listo para enviar? Cotiza, paga y genera tu etiqueta en minutos desde
          <span className="font-semibold"> “Realizar Envíos”.</span>
        </p>
      </div>
    </section>
  )
}
