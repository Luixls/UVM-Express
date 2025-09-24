// RUTA: backend/src/utils/label.js
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

/**
 * generateLabel(params)
 *  Soporta:
 *   - NUEVO: { tracking, fromName, fromAddress, originCenter, toName, toAddress, toCityStateCountry, pesoKg, dimensiones:{largoCm,anchoCm,altoCm}, boxIndex, boxTotal }
 *   - VIEJO: { tracking, from: 'texto', to: 'Nombre — Dirección', pesoKg, dimensiones:{...} | 'L×A×H cm', cajaInfo?: 'Caja #i de X' }
 */
export const generateLabel = async (params) => {
  // --- Normalización de parámetros (retrocompatible) ---
  const tracking = String(params.tracking || '').trim();

  // Remitente
  const fromName = params.fromName ?? null;
  const fromAddress = params.fromAddress ?? null;
  const originCenter = params.originCenter ?? null;
  const fromFallback = params.from ?? null; // texto mezclado (versión vieja)

  // Destinatario
  let toName = params.toName ?? null;
  let toAddress = params.toAddress ?? null;
  const toCityStateCountry = params.toCityStateCountry ?? null;
  // Si vino "to" en formato "Nombre — Dirección" (viejo), dividir
  if (!toName && !toAddress && typeof params.to === 'string') {
    const parts = params.to.split('—').map(s => s.trim());
    toName = parts[0] || null;
    toAddress = parts[1] || null;
  }

  // Paquete
  const pesoKg = Number(params.pesoKg || 0);
  let dimsText = '';
  if (params.dimensiones && typeof params.dimensiones === 'object') {
    const { largoCm, anchoCm, altoCm } = params.dimensiones;
    dimsText = `${largoCm} × ${anchoCm} × ${altoCm} cm`;
  } else if (typeof params.dimensiones === 'string') {
    dimsText = params.dimensiones;
  } else if ('largoCm' in params && 'anchoCm' in params && 'altoCm' in params) {
    // por si vinieron sueltos
    dimsText = `${params.largoCm} × ${params.anchoCm} × ${params.altoCm} cm`;
  }
  const boxIndex = params.boxIndex ?? null;
  const boxTotal = params.boxTotal ?? null;
  const cajaInfo = params.cajaInfo ?? (boxIndex && boxTotal ? `Caja #${boxIndex} de ${boxTotal}` : null);

  // --- Preparación de PDF ---
  const dir = process.env.LABELS_DIR || 'labels';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${tracking}.pdf`);

  const doc = new PDFDocument({ size: 'A6', margin: 12 }); // ~105×148mm
  const stream = fs.createWriteStream(file);
  doc.pipe(stream);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentWidth = pageWidth - doc.page.margins.left - doc.page.margins.right;

  // --- Encabezado ---
  doc.fontSize(14).text('UVM EXPRESS', { align: 'center' });
  doc.moveDown(0.2);
  doc.fontSize(10).text(`Tracking: ${tracking}`, { align: 'center' });

  // --- Código de barras (centrado y con altura fija) ---
  try {
    const barcodePng = await bwipjs.toBuffer({
      bcid: 'code128',
      text: tracking,
      height: 12,
      scale: 3,
      includetext: false
    });
    const barWidth = Math.min(270, contentWidth);
    const barHeight = 42; // altura fija para poder empujar el cursor
    const barX = doc.page.margins.left + (contentWidth - barWidth) / 2;
    const barY = doc.y + 6;
    doc.image(barcodePng, barX, barY, { width: barWidth, height: barHeight });
    // Empuja el cursor por debajo del código de barras
    doc.y = barY + barHeight + 10;
  } catch {
    doc.moveDown(2);
  }

  // --- Remitente ---
  doc.fontSize(9).text('Remitente:', { underline: true });
  if (fromName || fromAddress || originCenter) {
    if (fromName) doc.text(fromName);
    if (fromAddress) doc.text(fromAddress);
    if (originCenter) { doc.fontSize(8).fillColor('#555').text(originCenter); doc.fillColor('black'); }
  } else if (fromFallback) {
    doc.text(fromFallback);
  } else {
    doc.text('—');
  }
  doc.moveDown(0.4);

  // --- Destinatario ---
  doc.fontSize(9).text('Destinatario:', { underline: true });
  if (toName || toAddress || toCityStateCountry) {
    if (toName) doc.fontSize(10).text(toName);
    if (toAddress) doc.fontSize(9).text(toAddress);
    if (toCityStateCountry) doc.text(toCityStateCountry);
  } else if (typeof params.to === 'string') {
    doc.text(params.to);
  } else {
    doc.text('—');
  }
  doc.moveDown(0.4);

  // --- Información del paquete ---
  doc.fontSize(9).text('Paquete:', { underline: true });
  doc.text(`Peso: ${pesoKg.toFixed(2)} kg`);
  doc.text(`Dimensiones: ${dimsText || '—'}`);
  if (cajaInfo) {
    doc.moveDown(0.2);
    doc.fontSize(10).text(cajaInfo, { align: 'right' });
  }

  // --- QR (esquina inferior derecha) ---
  try {
    const qrSize = 70;
    const qr = await QRCode.toBuffer(`https://uvm-express.local/track/${tracking}`);
    const qrX = pageWidth - doc.page.margins.right - qrSize;
    const qrY = pageHeight - doc.page.margins.bottom - qrSize;
    doc.image(qr, qrX, qrY, { width: qrSize, height: qrSize });
  } catch { /* continuar */ }

  // --- Footer ---
  doc.moveDown(0.6);
  doc.fontSize(7).fillColor('#444').text(
    'Manipular con cuidado. Sujeto a términos de transporte UVM Express.',
    { align: 'center' }
  );
  doc.fillColor('black');

  doc.end();
  await new Promise((res) => stream.on('finish', res));
  return file;
};
