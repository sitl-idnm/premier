/** Email delivery channel for site leads, via SMTP (nodemailer). */

import nodemailer, { type Transporter } from 'nodemailer'
import { esc, LeadBody, leadFields, leadTitle } from './lead'
import type { DeliveryResult } from './telegram'

function buildHtml(b: LeadBody): string {
  const rows = leadFields(b)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#737373;white-space:nowrap;vertical-align:top">${esc(
          label
        )}</td><td style="padding:4px 0;color:#262626;font-weight:600">${esc(
          value
        )}</td></tr>`
    )
    .join('')

  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5">
  <h2 style="margin:0 0 12px">${esc(leadTitle(b.form))}</h2>
  <table style="border-collapse:collapse">${rows}</table>
</div>`
}

function subject(b: LeadBody): string {
  const who = b.name?.trim() ? ` — ${b.name.trim()}` : ''
  return `${leadTitle(b.form)}${who}`
}

/** Reuse one transporter across warm invocations. */
let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465)
    transporter = nodemailer.createTransport({
      host,
      port,
      // 465 → implicit TLS (SSL); 587/25 → STARTTLS.
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === 'true'
        : port === 465,
      auth: { user, pass }
    })
  }
  return transporter
}

export async function sendEmail(b: LeadBody): Promise<DeliveryResult> {
  const from = process.env.LEAD_EMAIL_FROM || process.env.SMTP_USER
  const to = (process.env.LEAD_EMAIL_TO ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const tx = getTransporter()
  if (!tx || !from || to.length === 0) {
    console.warn('[lead] SMTP env not set — skipping email delivery')
    return { ok: false, skipped: true }
  }

  try {
    await tx.sendMail({
      from,
      to,
      subject: subject(b),
      html: buildHtml(b),
      ...(b.email?.trim() ? { replyTo: b.email.trim() } : {})
    })
    return { ok: true }
  } catch (e) {
    console.error('[lead] SMTP send failed', e)
    return { ok: false, error: 'smtp send failed' }
  }
}
