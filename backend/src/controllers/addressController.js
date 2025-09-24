// RUTA: backend/src/controllers/addressController.js
import { Address } from '../models/index.js';

/**
 * GET /api/addresses/mine
 * Lista las direcciones del usuario autenticado.
 */
export const listMyAddresses = async (req, res, next) => {
  try {
    const items = await Address.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['id', 'DESC']]
    });
    res.json({ ok: true, items });
  } catch (e) { next(e); }
};

/**
 * POST /api/addresses
 * Crea una nueva dirección del usuario.
 * Body: { alias?, linea1, linea2?, ciudad, estado?, pais, postal?, isDefault? }
 */
export const createAddress = async (req, res, next) => {
  try {
    const { alias, linea1, linea2, ciudad, estado, pais, postal, isDefault } = req.body;
    if (!linea1 || !ciudad || !pais) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios (linea1, ciudad, pais)' });
    }

    // Si viene isDefault=true, desmarca anteriores
    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    const a = await Address.create({
      userId: req.user.id,
      alias: alias || null,
      linea1, linea2: linea2 || null,
      ciudad, estado: estado || null, pais,
      postal: postal || null,
      isDefault: !!isDefault
    });

    res.status(201).json({ ok: true, address: a });
  } catch (e) { next(e); }
};

/**
 * PUT /api/addresses/:id
 * Actualiza una dirección del usuario.
 */
export const updateAddress = async (req, res, next) => {
  try {
    const id = +req.params.id;
    const a = await Address.findByPk(id);
    if (!a || a.userId !== req.user.id) {
      return res.status(404).json({ ok: false, error: 'Dirección no encontrada' });
    }

    const { alias, linea1, linea2, ciudad, estado, pais, postal, isDefault } = req.body;

    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    a.alias = alias ?? a.alias;
    a.linea1 = linea1 ?? a.linea1;
    a.linea2 = linea2 ?? a.linea2;
    a.ciudad = ciudad ?? a.ciudad;
    a.estado = estado ?? a.estado;
    a.pais = pais ?? a.pais;
    a.postal = postal ?? a.postal;
    if (typeof isDefault === 'boolean') a.isDefault = isDefault;

    await a.save();

    res.json({ ok: true, address: a });
  } catch (e) { next(e); }
};

/**
 * POST /api/addresses/:id/default
 * Marca una dirección como predeterminada.
 */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const id = +req.params.id;
    const a = await Address.findByPk(id);
    if (!a || a.userId !== req.user.id) {
      return res.status(404).json({ ok: false, error: 'Dirección no encontrada' });
    }

    await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    a.isDefault = true;
    await a.save();
    res.json({ ok: true, address: a });
  } catch (e) { next(e); }
};

/**
 * DELETE /api/addresses/:id
 * Elimina una dirección del usuario.
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const id = +req.params.id;
    const a = await Address.findByPk(id);
    if (!a || a.userId !== req.user.id) {
      return res.status(404).json({ ok: false, error: 'Dirección no encontrada' });
    }
    await a.destroy();
    res.json({ ok: true });
  } catch (e) { next(e); }
};
