/**
 * Creates all Yandex.Metrika "JavaScript event" (reachGoal) goals via the
 * Management API — so you don't have to add them by hand in the dashboard.
 *
 * Usage (PowerShell):
 *   $env:YM_OAUTH_TOKEN="<token>"; node scripts/create-ym-goals.mjs
 *   # optional: $env:YM_COUNTER_ID="110512444"
 *
 * Get an OAuth token (scope `metrika:write`) for the account that owns the
 * counter: https://yandex.ru/dev/metrika/en/intro/authorization
 * The token is read from the environment and never stored.
 *
 * Idempotent-ish: existing goals with the same identifier are skipped.
 */

const TOKEN = process.env.YM_OAUTH_TOKEN
const COUNTER = process.env.YM_COUNTER_ID || '110512444'
const API = `https://api-metrika.yandex.net/management/v1/counter/${COUNTER}/goals`

// identifier (passed to ym reachGoal) → human-readable name in the dashboard
const GOALS = [
  ['open_booking_modal', 'Открытие модалки бронирования'],
  ['open_event_modal', 'Открытие модалки мероприятия'],
  ['submit_booking', 'Заявка: бронирование онлайн'],
  ['submit_event', 'Заявка: мероприятие'],
  ['submit_safety', 'Заявка: «Запишитесь прямо сейчас»'],
  ['submit_error', 'Ошибка отправки заявки'],
  ['click_phone', 'Клик по телефону'],
  ['click_telegram', 'Клик по Telegram'],
  ['click_vk', 'Клик по ВКонтакте'],
  ['cookie_accept', 'Принятие cookie']
]

if (!TOKEN) {
  console.error('✗ Set YM_OAUTH_TOKEN (scope metrika:write) in the environment.')
  process.exit(1)
}

const headers = {
  Authorization: `OAuth ${TOKEN}`,
  'Content-Type': 'application/json'
}

async function existingIdentifiers() {
  const res = await fetch(API, { headers })
  if (!res.ok) throw new Error(`list goals failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  // action goals keep the reachGoal id in conditions[].url
  return new Set(
    (data.goals || []).flatMap((g) => (g.conditions || []).map((c) => c.url))
  )
}

async function createGoal(identifier, name) {
  const res = await fetch(API, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      goal: {
        name,
        type: 'action', // "action" = JavaScript event (reachGoal)
        is_retargeting: 0,
        conditions: [{ type: 'exact', url: identifier }]
      }
    })
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
}

async function main() {
  console.log(`Counter ${COUNTER}: creating ${GOALS.length} goals…`)
  const existing = await existingIdentifiers()

  for (const [id, name] of GOALS) {
    if (existing.has(id)) {
      console.log(`  = skip (exists): ${id}`)
      continue
    }
    try {
      await createGoal(id, name)
      console.log(`  + created: ${id} — ${name}`)
    } catch (e) {
      console.error(`  ✗ failed: ${id} — ${e.message}`)
    }
  }
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
