/**
 * Email Utility
 * Sends transactional emails (payment approval/rejection, receipts, etc.)
 *
 * Requires these env vars:
 *   SMTP_HOST       - e.g. smtp.gmail.com
 *   SMTP_PORT       - e.g. 587
 *   SMTP_USER       - e.g. codequarry.sammy@gmail.com
 *   SMTP_PASS       - app password or SMTP password
 *   EMAIL_FROM      - e.g. "CodeQuarry <codequarry.sammy@gmail.com>"
 *
 * If SMTP_HOST is not set, emails are silently skipped (dev mode).
 */

import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || '"CodeQuarry" <noreply@codequarry.app>';

let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  console.log(`📧 Email transport configured (${SMTP_HOST})`);
} else {
  console.log('📧 Email transport not configured — emails will be skipped');
}

/**
 * Send an email. Silently no-ops if SMTP is not configured.
 */
async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.log(`[Email] Skipped (no SMTP): to=${to} subject=${subject}`);
    return null;
  }
  try {
    const info = await transporter.sendMail({ from: EMAIL_FROM, to, subject, html, text });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
    return null; // Don't throw — email failures shouldn't break the main flow
  }
}

// ─────────────────────────────────────────────
// Template: Payment Approved
// ─────────────────────────────────────────────
export async function sendPaymentApprovedEmail({ email, displayName, batchTitle, amount }) {
  if (!email) return;
  const amountStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  return sendEmail({
    to: email,
    subject: `✅ Pembayaran Disetujui — ${batchTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#0d1117;color:#e6edf3;border-radius:12px;">
        <h2 style="color:#a855f7;margin:0 0 16px;">Pembayaran Disetujui 🎉</h2>
        <p>Halo <strong>${displayName || 'Student'}</strong>,</p>
        <p>Pembayaran kamu untuk <strong>${batchTitle}</strong> sebesar <strong>${amountStr}</strong> telah dikonfirmasi.</p>
        <p>Silakan buka tab <strong>"My Classes"</strong> di CodeQuarry untuk melihat jadwal sesi kamu.</p>
        <hr style="border:none;border-top:1px solid #30363d;margin:24px 0;" />
        <p style="color:#8b949e;font-size:12px;">— CodeQuarry Team<br/>Jangan balas email ini.</p>
      </div>
    `,
    text: `Halo ${displayName || 'Student'}, pembayaran kamu untuk ${batchTitle} sebesar ${amountStr} telah dikonfirmasi. Buka tab My Classes di CodeQuarry untuk melihat jadwal sesi kamu.`
  });
}

// ─────────────────────────────────────────────
// Template: Payment Rejected
// ─────────────────────────────────────────────
export async function sendPaymentRejectedEmail({ email, displayName, batchTitle, reason }) {
  if (!email) return;
  return sendEmail({
    to: email,
    subject: `❌ Pembayaran Ditolak — ${batchTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#0d1117;color:#e6edf3;border-radius:12px;">
        <h2 style="color:#f87171;margin:0 0 16px;">Pembayaran Ditolak</h2>
        <p>Halo <strong>${displayName || 'Student'}</strong>,</p>
        <p>Maaf, pembayaran kamu untuk <strong>${batchTitle}</strong> tidak dapat dikonfirmasi.</p>
        ${reason ? `<p><strong>Alasan:</strong> ${reason}</p>` : ''}
        <p>Silakan coba lagi atau hubungi kami jika ada pertanyaan.</p>
        <hr style="border:none;border-top:1px solid #30363d;margin:24px 0;" />
        <p style="color:#8b949e;font-size:12px;">— CodeQuarry Team<br/>Jangan balas email ini.</p>
      </div>
    `,
    text: `Halo ${displayName || 'Student'}, pembayaran kamu untuk ${batchTitle} ditolak.${reason ? ` Alasan: ${reason}` : ''} Silakan coba lagi atau hubungi kami.`
  });
}

export default { sendPaymentApprovedEmail, sendPaymentRejectedEmail, sendEmail };
