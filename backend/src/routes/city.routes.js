// RUTA: backend/src/routes/city.routes.js
import { Router } from 'express';
import { City } from '../models/index.js';
const r = Router();

r.get('/', async (_req, res, next)=>{
  try{
    const cities = await City.findAll({ order: [['pais','ASC'], ['estado','ASC'], ['nombre','ASC']] });
    res.json({ ok:true, cities });
  }catch(e){ next(e); }
});

export default r;
