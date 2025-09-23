// backend/server.js
// RUTA: backend/server.js
import 'dotenv/config';
import http from 'http';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`UVM Express API escuchando en http://localhost:${PORT}`);
});
