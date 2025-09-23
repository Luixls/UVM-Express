// RUTA: backend/src/controllers/statusController.js
import { StatusCatalog } from '../models/index.js';

export const getStatusCatalog = async (_req, res, next) => {
  try {
    const items = await StatusCatalog.findAll({ order: [['isFinal', 'ASC'], ['code', 'ASC']] });
    res.json({ ok: true, items });
  } catch (e) { next(e); }
};
