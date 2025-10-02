// RUTA: backend/src/routes/tracking.routes.js
import { Router } from 'express'
import { getTracking } from '../controllers/trackingController.js'

const r = Router()
// público: rastreo por tracking
r.get('/:tracking', getTracking)

export default r
