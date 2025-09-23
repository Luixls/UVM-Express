// RUTA: backend/src/controllers/shipmentListController.js
import { Op } from 'sequelize';
import { Shipment, User } from '../models/index.js';

/**
 * Normaliza paginación y filtros compartidos
 */
const buildQuery = ({ q, status, limit = 20, offset = 0 }) => {
  const where = {};
  if (status) where.status = status;

  if (q) {
    where[Op.or] = [
      { tracking: { [Op.like]: `%${q}%` } },
      { recipientName: { [Op.like]: `%${q}%` } },
      { recipientAddress: { [Op.like]: `%${q}%` } }
    ];
  }

  return {
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [['createdAt', 'DESC']]
  };
};

/**
 * GET /api/shipments/mine  (usuario)
 * Query: q, status, limit, offset
 */
export const listMyShipments = async (req, res, next) => {
  try {
    const base = buildQuery(req.query);
    base.where.userId = req.user.id;

    const { rows, count } = await Shipment.findAndCountAll({
      ...base,
      attributes: [
        'id', 'tracking', 'status', 'amountTotal', 'amountPaid',
        'recipientName', 'recipientAddress', 'createdAt', 'updatedAt'
      ]
    });

    res.json({
      ok: true,
      total: count,
      limit: base.limit,
      offset: base.offset,
      items: rows
    });
  } catch (e) { next(e); }
};

/**
 * GET /api/admin/shipments  (admin)
 * Query: q, status, userId, limit, offset
 */
export const adminListShipments = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const base = buildQuery(req.query);
    if (userId) base.where.userId = Number(userId);

    const { rows, count } = await Shipment.findAndCountAll({
      ...base,
      include: [
        { model: User, attributes: ['id', 'nombre', 'email'], required: false }
      ],
      attributes: [
        'id', 'tracking', 'status', 'amountTotal', 'amountPaid',
        'recipientName', 'recipientAddress', 'createdAt', 'updatedAt', 'userId'
      ]
    });

    res.json({
      ok: true,
      total: count,
      limit: base.limit,
      offset: base.offset,
      items: rows
    });
  } catch (e) { next(e); }
};
