// RUTA: backend/src/controllers/exportController.js
import { Parser } from 'json2csv';
import { Op } from 'sequelize';
import { Shipment, User } from '../models/index.js';

const buildQuery = ({ q, status }) => {
  const where = {};
  if (status) where.status = status;
  if (q) {
    where[Op.or] = [
      { tracking: { [Op.like]: `%${q}%` } },
      { recipientName: { [Op.like]: `%${q}%` } },
      { recipientAddress: { [Op.like]: `%${q}%` } }
    ];
  }
  return { where, include: [{ model: User, attributes: ['id','nombre','email'] }] };
};

export const exportShipmentsCsv = async (req, res, next) => {
  try {
    const { q, status } = req.query;
    const opts = buildQuery({ q, status });
    const rows = await Shipment.findAll(opts);

    const data = rows.map(s => ({
      tracking: s.tracking,
      status: s.status,
      etaDate: s.etaDate,
      deliveredAt: s.deliveredAt,
      deliveredSignature: s.deliveredSignature,
      amountTotal: s.amountTotal,
      amountPaid: s.amountPaid,
      paymentStatus: s.paymentStatus,
      recipientName: s.recipientName,
      recipientAddress: s.recipientAddress,
      userName: s.User?.nombre,
      userEmail: s.User?.email,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="shipments.csv"');
    res.status(200).send(csv);
  } catch (e) { next(e); }
};
