/** Telegram delivery channel for site leads. */

import { esc, LeadBody, leadFields, leadTitle, utmEntries } from './lead'

function buildMessage(b: LeadBody): string {
  const lines = [`<b>${esc(leadTitle(b.form))}</b>`]

  // Main fields — Страница и UTM выносим в отдельные блоки ниже.
  for (const [label, value] of leadFields(b)) {
    if (label === 'Страница' || label === 'UTM') continue
    lines.push(`<b>${esc(label)}:</b> ${esc(value)}`)
  }

  // Блок «Страница» отделяем пустой строкой.
  if (b.page?.trim()) {
    lines.push('', `<b>Страница:</b> ${esc(b.page.trim())}`)
  }

  // UTM — каждая метка на своей строке, чтобы не было полотна.
  const utm = utmEntries(b)
  if (utm.length) {
    lines.push('', '<b>UTM-метки</b>')
    for (const [key, value] of utm) {
      lines.push(`  ${esc(key)}: <code>${esc(value)}</code>`)
    }
  }

  // Пустая строка-разделитель между заголовком и первым полем.
  lines.splice(1, 0, '')

  return lines.join('\n')
}

export type DeliveryResult = { ok: boolean; skipped?: boolean; error?: string }

export async function sendTelegram(b: LeadBody): Promise<DeliveryResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[lead] Telegram creds not set — skipping Telegram delivery')
    return { ok: false, skipped: true }
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: buildMessage(b),
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      }
    )

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[lead] Telegram error', res.status, detail)
      return { ok: false, error: `telegram ${res.status}` }
    }
    return { ok: true }
  } catch (e) {
    console.error('[lead] Telegram request failed', e)
    return { ok: false, error: 'telegram request failed' }
  }
}
