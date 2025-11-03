// RUTA: frontend/src/api/admin.js
import { api } from './axios'

// Usuarios
export const adminListUsers = (q='') =>
  api.get('/admin/users', { params:{ q } }).then(r=>r.data)

export const adminUpdateUser = (id, payload) =>
  api.put(`/admin/users/${id}`, payload).then(r=>r.data)

// Envíos
export const adminListShipments = (params={}) =>
  api.get('/admin/shipments', { params }).then(r=>r.data)

export const adminGetShipment = (tracking) =>
  api.get(`/admin/shipments/${encodeURIComponent(tracking)}`).then(r=>r.data)

export const adminAddEvent = (tracking, payload) =>
  api.post(`/admin/shipments/${encodeURIComponent(tracking)}/events`, payload).then(r=>r.data)
