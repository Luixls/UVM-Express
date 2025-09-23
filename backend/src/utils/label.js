// RUTA: backend/src/utils/label.js
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

export const generateLabel = async ({ tracking, from, to, pesoKg }) => {
  const dir = process.env.LABELS_DIR || 'labels';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${tracking}.pdf`);

  const doc = new PDFDocument({ size: 'A6', margin: 12 });
  const stream = fs.createWriteStream(file);
  doc.pipe(stream);

  doc.fontSize(14).text('UVM EXPRESS', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).text(`Tracking: ${tracking}`);

  // Código de barras
  const barcodePng = await bwipjs.toBuffer({
    bcid: 'code128',
    text: tracking,
    height: 10,
    scale: 3
  });
  doc.image(barcodePng, { fit: [260, 50] });

  // QR con URL de rastreo (puedes ajustar el dominio)
  const qrUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/tracking/${tracking}`;
  const qr = await QRCode.toBuffer(qrUrl);
  doc.image(qr, { width: 80, align: 'right' });

  doc.moveDown(0.3);
  doc.fontSize(9).text('Remitente:');
  doc.text(from);

  doc.moveDown(0.2);
  doc.text('Destinatario:');
  doc.text(to);

  doc.moveDown(0.2);
  doc.text(`Peso total: ${pesoKg} kg`);

  doc.end();
  await new Promise((res) => stream.on('finish', res));
  return file;
};
