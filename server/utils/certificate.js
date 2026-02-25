/**
 * Certificate PDF Generator
 * Generates A4-landscape completion certificate PDFs using pdfkit.
 *
 * Template variables supported in bodyText:
 *   {{studentName}}, {{batchTitle}}, {{completionDate}}, {{instructorName}}
 */

import PDFDocument from 'pdfkit';

const PAGE_WIDTH = 841.89;  // A4 landscape width in pt
const PAGE_HEIGHT = 595.28; // A4 landscape height in pt

const MARGIN = 50;

/**
 * Fill template variables in a string.
 */
function fillVars(str = '', vars = {}) {
  return str
    .replace(/\{\{studentName\}\}/g, vars.studentName || '')
    .replace(/\{\{batchTitle\}\}/g, vars.batchTitle || '')
    .replace(/\{\{completionDate\}\}/g, vars.completionDate || '')
    .replace(/\{\{instructorName\}\}/g, vars.instructorName || '');
}

/**
 * Hex color to [r, g, b] (0–255).
 */
function hexToRgb(hex = '#7c3aed') {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return [124, 58, 237];
  return m.map(h => parseInt(h, 16));
}

/**
 * Generate a certificate PDF and pipe it to the response (or any writable stream).
 *
 * @param {{ title, subtitle, bodyText, instructorName, footerText, accentColor }} template
 * @param {{ studentName, batchTitle, instructorName, completionDate, certUuid }} cert
 * @param {import('stream').Writable} writableStream
 */
export function generateCertificatePdf(template, cert, writableStream) {
  const accent = template.accentColor || '#7c3aed';
  const [ar, ag, ab] = hexToRgb(accent);

  const vars = {
    studentName: cert.studentName,
    batchTitle: cert.batchTitle,
    completionDate: cert.completionDate
      ? new Date(cert.completionDate).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
      : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    instructorName: cert.instructorName || template.instructorName || '',
  };

  const doc = new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    info: {
      Title: `${template.title || 'Certificate of Completion'} — ${cert.studentName}`,
      Author: 'CodeQuarry',
    },
  });

  doc.pipe(writableStream);

  // ── Background ───────────────────────────────────────────────────────────────
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill('#0d1117');

  // Subtle dot-grid watermark
  doc.fillColor('#ffffff10');
  for (let x = 40; x < PAGE_WIDTH; x += 30) {
    for (let y = 40; y < PAGE_HEIGHT; y += 30) {
      doc.circle(x, y, 1).fill();
    }
  }

  // ── Accent border (thin frame) ────────────────────────────────────────────────
  doc.rect(18, 18, PAGE_WIDTH - 36, PAGE_HEIGHT - 36)
    .lineWidth(2)
    .strokeColor([ar, ag, ab])
    .stroke();

  // Inner frame
  doc.rect(24, 24, PAGE_WIDTH - 48, PAGE_HEIGHT - 48)
    .lineWidth(0.5)
    .strokeColor([ar, ag, ab, 0.4])
    .stroke();

  // ── Accent top bar ────────────────────────────────────────────────────────────
  doc.rect(18, 18, PAGE_WIDTH - 36, 6).fill([ar, ag, ab]);

  // ── Logo / Branding ───────────────────────────────────────────────────────────
  const logoText = 'CodeQuarry';
  doc.fontSize(11)
    .fillColor([ar, ag, ab])
    .font('Helvetica-Bold')
    .text(logoText, 0, 38, { align: 'center', width: PAGE_WIDTH });

  // ── Title ─────────────────────────────────────────────────────────────────────
  const title = template.title || 'Certificate of Completion';
  doc.fontSize(34)
    .fillColor('#f0f6fc')
    .font('Helvetica-Bold')
    .text(title, MARGIN, 85, { align: 'center', width: PAGE_WIDTH - MARGIN * 2 });

  // ── Decorative rule ───────────────────────────────────────────────────────────
  const ruleY = 135;
  const ruleX1 = PAGE_WIDTH / 2 - 120;
  const ruleX2 = PAGE_WIDTH / 2 + 120;
  doc.moveTo(ruleX1, ruleY).lineTo(ruleX2, ruleY)
    .lineWidth(1)
    .strokeColor([ar, ag, ab])
    .stroke();
  doc.circle(PAGE_WIDTH / 2, ruleY, 3).fill([ar, ag, ab]);

  // ── Subtitle ──────────────────────────────────────────────────────────────────
  const subtitle = template.subtitle || 'This certifies that';
  doc.fontSize(13)
    .fillColor('#8b949e')
    .font('Helvetica')
    .text(subtitle, MARGIN, 148, { align: 'center', width: PAGE_WIDTH - MARGIN * 2 });

  // ── Student Name ──────────────────────────────────────────────────────────────
  doc.fontSize(38)
    .fillColor('#f0f6fc')
    .font('Helvetica-BoldOblique')
    .text(cert.studentName, MARGIN, 172, { align: 'center', width: PAGE_WIDTH - MARGIN * 2 });

  // ── Body Text ─────────────────────────────────────────────────────────────────
  const bodyText = fillVars(
    template.bodyText || '{{studentName}} has successfully completed {{batchTitle}}.',
    vars,
  ).replace(/\{\{studentName\}\}/g, vars.studentName); // safety: strip leftover studentName since already shown

  // Replace the studentName usage in body to avoid duplication — just replace all vars
  const cleanBody = fillVars(
    template.bodyText || 'has successfully completed {{batchTitle}}.',
    { ...vars, studentName: vars.studentName },
  );

  doc.fontSize(14)
    .fillColor('#c9d1d9')
    .font('Helvetica')
    .text(cleanBody, MARGIN + 60, 228, {
      align: 'center',
      width: PAGE_WIDTH - (MARGIN + 60) * 2,
    });

  // ── Date line ─────────────────────────────────────────────────────────────────
  doc.fontSize(12)
    .fillColor('#8b949e')
    .font('Helvetica')
    .text(`Completed on ${vars.completionDate}`, MARGIN, 270, {
      align: 'center',
      width: PAGE_WIDTH - MARGIN * 2,
    });

  // ── Bottom rule ───────────────────────────────────────────────────────────────
  const bRuleY = 300;
  doc.moveTo(ruleX1, bRuleY).lineTo(ruleX2, bRuleY)
    .lineWidth(0.5)
    .strokeColor([ar, ag, ab, 0.5])
    .stroke();

  // ── Signature area ────────────────────────────────────────────────────────────
  const sigY = 340;
  const sigX = PAGE_WIDTH / 2 - 80;

  // Signature line
  doc.moveTo(sigX, sigY + 40).lineTo(sigX + 160, sigY + 40)
    .lineWidth(1)
    .strokeColor('#30363d')
    .stroke();

  // Instructor name
  const instructorLabel = vars.instructorName || cert.instructorName || 'Instructor';
  doc.fontSize(11)
    .fillColor('#c9d1d9')
    .font('Helvetica-Bold')
    .text(instructorLabel, sigX, sigY + 46, { width: 160, align: 'center' });

  doc.fontSize(9)
    .fillColor('#8b949e')
    .font('Helvetica')
    .text('Instructor', sigX, sigY + 60, { width: 160, align: 'center' });

  // ── Footer ────────────────────────────────────────────────────────────────────
  const footerText = template.footerText || 'CodeQuarry Online Learning Platform';
  doc.fontSize(8)
    .fillColor('#484f58')
    .font('Helvetica')
    .text(footerText, MARGIN, PAGE_HEIGHT - 52, {
      align: 'center',
      width: PAGE_WIDTH - MARGIN * 2,
    });

  // Verification UUID
  if (cert.certUuid) {
    doc.fontSize(7)
      .fillColor('#30363d')
      .text(`Certificate ID: ${cert.certUuid}`, MARGIN, PAGE_HEIGHT - 38, {
        align: 'center',
        width: PAGE_WIDTH - MARGIN * 2,
      });
  }

  doc.end();
}
