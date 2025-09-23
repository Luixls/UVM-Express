// RUTA: backend/src/controllers/cityController.js
import { Op } from 'sequelize';
import { City } from '../models/index.js';

export const listCities = async (req, res, next) => {
  try {
    const {
      q = '',         // búsqueda por nombre/estado/país
      pais,           // filtro exacto por país (e.g., VE)
      estado,         // filtro exacto por estado
      limit = 20,     // paginación
      offset = 0
    } = req.query;

    const where = {};

    if (pais) where.pais = pais;
    if (estado) where.estado = estado;

    if (q) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${q}%` } },
        { estado: { [Op.like]: `%${q}%` } },
        { pais:   { [Op.like]: `%${q}%` } }
      ];
    }

    const { rows, count } = await City.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['nombre', 'ASC']]
    });

    res.json({
      ok: true,
      total: count,
      limit: Number(limit),
      offset: Number(offset),
      items: rows
    });
  } catch (e) { next(e); }
};

export const getCityById = async (req, res, next) => {
  try {
    const c = await City.findByPk(req.params.id);
    if (!c) return res.status(404).json({ ok: false, error: 'Ciudad no encontrada' });
    res.json({ ok: true, city: c });
  } catch (e) { next(e); }
};
