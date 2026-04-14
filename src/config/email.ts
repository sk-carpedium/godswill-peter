import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

/**
 * Email Service
 * Supports: SMTP (SendGrid, Postmark, AWS SES, custom)
 * Used by: ClientReports (auto-delivery), UserInvitation, Auth (password reset)
 */

let transport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  if (transport) return transport;

  // Choose transport based on env
  if (env.SENDGRID_API_KEY) {
    transport = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: { user: 'apikey', pass: env.SENDGRID_API_KEY },
    });
  } else if (env.SMTP_HOST) {
    transport = nodemailer.createTransport({
      host:   env.SMTP_HOST,
      port:   parseInt(env.SMTP_PORT  || '587'),
      secure: env.SMTP_SECURE === 'true',
      auth:   env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  } else {
    // Dev fallback: Ethereal mail (catches all, never delivers)
    logger.warn('No SMTP configured — using Ethereal test account');
    transport = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, auth: { user: 'ethereal_user', pass: 'ethereal_pass' } });
  }

  return transport;
}

interface EmailOptions {
  to:       string | string[];
  subject:  string;
  html?:    string;
  text?:    string;
  from?:    string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string }>;
}

export async function sendEmail(opts: EmailOptions): Promise<{ messageId: string }> {
  const t = getTransport();
  const from = opts.from || env.EMAIL_FROM || 'noreply@nexussocial.io';

  const info = await t.sendMail({
    from,
    to:          Array.isArray(opts.to) ? opts.to.join(', ') : opts.to,
    subject:     opts.subject,
    html:        opts.html,
    text:        opts.text || opts.html?.replace(/<[^>]+>/g, ''),
    replyTo:     opts.replyTo,
    attachments: opts.attachments,
  });

  logger.info('Email sent', { to: opts.to, subject: opts.subject, messageId: info.messageId });
  return { messageId: info.messageId };
}

// ─── TEMPLATE BUILDERS ────────────────────────────────────────────────────────

export function buildReportEmail(reportName: string, clientEmail: string, pdfUrl?: string, customMessage?: string): EmailOptions {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#d4af37">📊 ${reportName}</h2>
      ${customMessage ? `<p style="color:#374151">${customMessage}</p>` : ''}
      <p style="color:#6b7280">Your performance report is ready.</p>
      ${pdfUrl ? `<a href="${pdfUrl}" style="background:#d4af37;color:#0f172a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin:16px 0">Download Report</a>` : ''}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="color:#9ca3af;font-size:12px">Nexus Social — Social Media Management Platform</p>
    </div>
  `;
  return { to: clientEmail, subject: `Your Report: ${reportName}`, html };
}

export function buildInviteEmail(workspaceName: string, inviterName: string, inviteUrl: string, recipientEmail: string): EmailOptions {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#d4af37">You're invited to join ${workspaceName}</h2>
      <p style="color:#374151"><strong>${inviterName}</strong> has invited you to collaborate on Nexus Social.</p>
      <a href="${inviteUrl}" style="background:#d4af37;color:#0f172a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin:16px 0">Accept Invitation</a>
      <p style="color:#9ca3af;font-size:12px">Link expires in 7 days. If you didn't expect this, you can safely ignore it.</p>
    </div>
  `;
  return { to: recipientEmail, subject: `You're invited to ${workspaceName} on Nexus Social`, html };
}

export function buildPasswordResetEmail(resetUrl: string, recipientEmail: string): EmailOptions {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#d4af37">Reset your password</h2>
      <p style="color:#374151">Click the button below to reset your Nexus Social password.</p>
      <a href="${resetUrl}" style="background:#d4af37;color:#0f172a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin:16px 0">Reset Password</a>
      <p style="color:#9ca3af;font-size:12px">Link expires in 1 hour. If you didn't request this, you can safely ignore it.</p>
    </div>
  `;
  return { to: recipientEmail, subject: 'Reset your Nexus Social password', html };
}
