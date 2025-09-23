// RUTA: frontend/src/utils/format.js
export const formatDateTime = (iso) => {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return iso
  }
}
