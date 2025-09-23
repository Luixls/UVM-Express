// RUTA: backend/src/controllers/authController.js
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/index.js';

const sign = (uid, rol) =>
  jwt.sign({ uid, rol }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '8h' });

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

    const { nombre, email, password, telefono } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ ok: false, error: 'Email ya registrado' });

    const user = await User.create({ nombre, email, telefono, rol: 'usuario', passwordHash: 'temp' });
    await user.setPassword(password);
    await user.save();

    const token = sign(user.id, user.rol);
    res.status(201).json({
      ok: true,
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
    });
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ ok: false, error: 'Credenciales inválidas' });

    const ok = await user.validatePassword(password);
    if (!ok) return res.status(400).json({ ok: false, error: 'Credenciales inválidas' });

    const token = sign(user.id, user.rol);
    res.json({
      ok: true,
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
    });
  } catch (e) { next(e); }
};

export const me = async (req, res) => {
  res.json({ ok: true, user: req.user });
};
