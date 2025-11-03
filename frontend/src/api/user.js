// RUTA: frontend/src/api/user.js
import { api } from './axios'

export const getMe = () => api.get('/me').then(r=>r.data)
export const updateMe = (payload) => api.put('/me', payload).then(r=>r.data)
export const changePassword = (payload) => api.put('/me/password', payload).then(r=>r.data)
export const getMyShipments = () => api.get('/me/shipments').then(r=>r.data)
