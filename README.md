# UVM Express — Manual de Usuario (README.md)

## 1) ¿Qué es UVM Express?
UVM Express es una aplicación web de logística y envíos que permite cotizar, crear y rastrear encomiendas, así como gestionar usuarios y operaciones desde un panel de administración. El proyecto incluye:
- **Frontend** (SPA con React + Vite + TailwindCSS).
- **Backend** (API REST con Node.js + Express).
- **Base de datos** (MySQL vía Sequelize ORM).
- **Generación de etiquetas PDF** con código de barras y QR.
- **Rastreo por tracking** (maestro y por paquete).
- **Autenticación JWT** y control de acceso por roles (usuario/admin).

---

## 2) Requisitos previos

### Software
- **Node.js** 18+ (recomendado 20+).
- **npm** 8+ (o **pnpm**/**yarn** si lo prefieres).
- **MySQL** 8.x (recomendado).
- **Git** (opcional, para clonar el repositorio).
- **VS Code** u otro editor.

### Conocimientos (recomendado)
- Nociones básicas de terminal/CLI.
- SQL básico (crear BD/usuario).
- React y Node.js a nivel básico.

---

## 3) Estructura del proyecto

```
UVM-Express/
├─ backend/
│  ├─ src/
│  │  ├─ app.js                # App Express
│  │  ├─ server.js             # Punto de arranque
│  │  ├─ config/
│  │  │  └─ db.js              # Conexión Sequelize
│  │  ├─ models/               # Modelos Sequelize
│  │  ├─ routes/               # Rutas Express (auth, shipments, tracking, admin, me, etc.)
│  │  ├─ controllers/          # Controladores
│  │  ├─ middlewares/          # requireAuth, isAdmin, etc.
│  │  ├─ seed/                 # Semillas (admin, ciudades, catálogo status)
│  │  └─ utils/                # Etiquetas PDF, generación tracking, etc.
│  └─ .env                     # Variables de entorno del backend
│
└─ frontend/
   ├─ src/
   │  ├─ api/axios.js          # Cliente HTTP con baseURL
   │  ├─ context/AuthContext   # Manejo de sesión (token)
   │  ├─ components/           # Header, UI
   │  ├─ pages/                # Home, Login, Register, RealizarEnvios, Rastreo, Dashboard, AdminPanel
   │  └─ imgs/                 # Imágenes y logos
   ├─ index.html
   └─ .env                     # Variables del frontend (opcional)
```

---

## 4) Configuración de la Base de Datos

1. **Crear base de datos y usuario** en MySQL (ejemplo):
   ```sql
   CREATE DATABASE uvm_express CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'uvm'@'localhost' IDENTIFIED BY 'uvm1234!';
   GRANT ALL PRIVILEGES ON uvm_express.* TO 'uvm'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. Asegúrate de que MySQL esté **en ejecución** y que las credenciales coincidan con el archivo `.env` del backend.

---

## 5) Variables de entorno (Backend)

Crea `backend/.env` con, por ejemplo:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=uvm_express
DB_USER=uvm
DB_PASS=uvm1234!

# JWT
JWT_SECRET=02712440274supersecretoUVMexpress
JWT_EXPIRES=8h

# Admin por defecto (seed)
ADMIN_EMAIL=admin@uvmexpress.com
ADMIN_NOMBRE=UVM Express ADMIN
ADMIN_PASSWORD=uvmadmin123
ADMIN_TELEFONO=+58 000-0000000

# Etiquetas PDF
LABELS_DIR=./labels
BASE_URL=http://localhost:5000

# Semillas automáticas al arrancar
SEED_ON_BOOT=true
```

> Nota: Cuando `SEED_ON_BOOT=true`, al arrancar el backend se crean: catálogo de estados, ciudades base, y un usuario admin. Puedes desactivarlo en producción o después de un primer bootstrap.

---

## 6) Instalación y arranque

### Backend
```bash
cd backend
npm install
npm run dev   # o: npm start
```
- Levanta la API en `http://localhost:5000`.
- Endpoints principales bajo `/api/*`.
- Sirve archivos de etiquetas PDF desde `/labels`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
- Vite abrirá la app en `http://localhost:5173` (por defecto).
- El cliente `axios` debe apuntar a la baseURL del backend (revisa `frontend/src/api/axios.js`).

---

## 7) Uso de la aplicación (flujo principal)

### Autenticación
1. **Registro** o **Login** desde la UI.
2. El token **JWT** se guarda en el contexto del front; se incluye automáticamente como `Authorization: Bearer ...` a las rutas privadas.

### Cotizar y Crear envío
1. Ir a **Realizar Envíos**.
2. Completar **paquetes** (largo, ancho, alto, peso, cantidad, valor declarado).
3. Seleccionar **origen** y **destino**.
4. Presionar **Calcular** para generar una **cotización**:
   - Muestra subtotal, recargos, total y **ETA** (tiempo aproximado).
5. **Simulación de pago**:
   - Tras cotizar, la página muestra el **formulario falso** de tarjeta (solo visual; no se guarda ni se procesa).
   - Puedes usar **“Crear envío”** tras llenar los campos simulados, o **“Saltar pago y crear envío”** (útil en pruebas).
6. En la confirmación se muestran:
   - **Tracking(s)** creados (maestro + por paquete).
   - **Botones para descargar etiquetas** PDF por cada paquete.

### Rastreo
- Ir a **Rastreo**, introducir **tracking** (maestro o de paquete).
- Ver **línea de tiempo** de eventos.
- Si el tracking es maestro, se muestra un **disclaimer** (“este es el tracking maestro de la encomienda”).
- Si es de **paquete**, se muestran **solo los eventos** de ese paquete.

### Panel de Usuario (requiere login)
- **Editar perfil** (nombre, apellido, teléfono, dirección, etc.).
- **Cambiar contraseña**.
- **Ver tus envíos** con estado legible y enlaces a rastreo.
- **Descargar etiquetas** de envíos pasados.

### Panel Admin (solo rol admin)
- **Usuarios**: listar, buscar, editar rol/activo.
- **Paquetes**: listar/buscar por estado o tracking; ver datos ampliados (remitente, destinatario, origen/destino, dimensiones/peso, tracking maestro).
- **Gestión de encomiendas**:
  - Cargar paquetes por **tracking** (maestro o de paquete).
  - **Actualizar estado / agregar evento**:
    - Seleccionar paquete individual (desde un **dropdown**) o aplicar a **todos** en la encomienda.
    - Indicador de **fecha y hora** del evento; ubicación y nota opcionales.
  - **Descargar etiquetas**: por paquete o **descargar todo (ZIP)** para la encomienda.

---

## 8) Estados y textos legibles

El backend maneja estados internos (ej. `ORDER_CREATED`, `IN_TRANSIT`, etc.). En la UI se muestran con un **mapeo legible**:
- `ORDER_CREATED` → “Orden creada”
- `IN_POSSESSION` → “En posesión”
- `IN_TRANSIT` → “En tránsito”
- `DELIVERED` → “Entregado”
- … y códigos de excepción (`EX_*`) como “Retraso por clima”, “Extravío”, etc.

---

## 9) Tracking maestro vs. tracking de paquete

- Al crear una encomienda con **N** paquetes:
  - Se genera **un tracking maestro** (en la entidad `Shipment`).
  - Cada paquete (`Package`) obtiene su **tracking individual**.
- El rastreo por **tracking maestro**:
  - Muestra eventos **del envío** (no duplica por número de paquetes).
  - Indica que es el **tracking maestro** con un **disclaimer**.
- El rastreo por **tracking de paquete**:
  - Muestra **solo** los eventos de ese paquete.

---

## 10) Generación de Etiquetas PDF

- Cada paquete genera una **etiqueta** (A6) con:
  - **Código de barras** (Code128) y **QR**.
  - Remitente (si lo hay), centro logístico de origen, destinatario, dirección, peso y dimensiones, numeración “Caja #i de N”.
- Se guardan en la carpeta `labels/` del backend (configurable con `LABELS_DIR`).

---

## 11) Semillas (seeding) y reinicio de BD

- Con `SEED_ON_BOOT=true` el backend:
  - **Sincroniza** la BD y crea (si faltan) catálogo de estados, ciudades, y un **usuario admin** según `.env`.
- Para **reiniciar** la BD durante desarrollo (limpiar y recrear):
  - Arrancar una vez con `force: true` (temporal) en `app.js` o usar un script de migraciones.
  - Alternativamente, dropear tablas manualmente y volver a iniciar con `SEED_ON_BOOT=true`.

> En producción, usa **migraciones** (Sequelize CLI) y evita `force:true`/`alter:true`.

---

## 12) Solución de problemas (FAQ)

**No conecta a MySQL**
- Verifica host/puerto/usuario/clave en `backend/.env`.
- Asegúrate de que el usuario de MySQL tenga permisos sobre la BD.

**“Too many keys specified; max 64 keys allowed”**
- Sucede al acumular índices repetidos con `sync({ alter:true })`.
- Solución: eliminar índices duplicados o **recrear** tablas con `force:true` **una vez**, luego pasar a migraciones.

**Etiqueta/QR no se genera**
- Verifica dependencias `pdfkit`, `bwip-js`, `qrcode`.
- Revisa permisos de escritura en `LABELS_DIR`.

**Se duplica la línea de tiempo**
- Asegúrate de pedir eventos por **paquete** cuando el tracking es de paquete, y por **shipment** cuando es maestro (esto ya está resuelto en el controlador de tracking).

**No se guardan cambios en el perfil**
- Verifica que el front llame a `/api/me` con `PUT` y que el token JWT esté presente.
- Comprueba validaciones y que el backend devuelve el objeto actualizado.

---

## 13) Seguridad y roles

- **JWT** en cabecera `Authorization: Bearer <token>`.
- **requireAuth** protege rutas privadas.
- **isAdmin** protege rutas administrativas.
- Los **tokens** expiran según `JWT_EXPIRES`.

---

## 14) Personalización

- Colores y marca: `frontend/src/imgs/LOGO_UVM_EXPRESS.png` y TailwindCSS.
- Textos de estados: mapear en el front (AdminPanel y rastreo).
- Centros logísticos/ciudades: semillas `seed/cities.seed.js`.

---

## 15) Licencia
Proyecto académico/demostrativo. Ajusta términos según tus necesidades antes de publicación pública.

---

## 16) Contacto y soporte
- Reporta incidencias y mejoras abriendo issues en el repositorio.
- Adjunta logs de backend y capturas de pantalla del frontend para acelerar el diagnóstico.

---

### Comandos útiles (resumen)

```bash
# Backend
cd backend
npm install
npm run dev     # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev     # http://localhost:5173
```

> Si necesitas reiniciar la BD y re-sembrar datos, activa temporalmente `SEED_ON_BOOT=true` en `backend/.env` y/o usa sincronización con `force:true` una única vez durante desarrollo.
