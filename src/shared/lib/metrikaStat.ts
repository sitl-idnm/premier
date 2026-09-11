import 'server-only'

/** Yandex.Metrika Stat API — last-30-days summary + daily visits/users series. */

export type MetrikaPoint = { date: string; visits: number; users: number }
export type MetrikaBar = { label: string; value: number }
export type MetrikaGoal = { name: string; reaches: number; conversion: number }

export type MetrikaStats = {
  configured: boolean
  error?: string
  counterId?: string
  totals?: {
    visits: number
    users: number
    pageviews: number
    bounceRate: number
  }
  series?: MetrikaPoint[]
  sources?: MetrikaBar[]
  devices?: MetrikaBar[]
  topPages?: MetrikaBar[]
  goals?: MetrikaGoal[]
}

const API = 'https://api-metrika.yandex.net/stat/v1/data'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function query(
  token: string,
  params: Record<string, string>
): Promise<{ data: { dimensions: { name: string }[]; metrics: number[] }[]; totals: number[] }> {
  const qs = new URLSearchParams(params).toString()

  // Metrika caps *parallel* requests per user, so we call sequentially and
  // retry a couple of times if we still hit the 429 quota.
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}?${qs}`, {
      headers: { Authorization: `OAuth ${token}` },
      cache: 'no-store'
    })
    if (res.ok) return res.json()

    if (res.status === 429 && attempt < 3) {
      await sleep(500 * (attempt + 1))
      continue
    }

    const text = await res.text().catch(() => '')
    throw new Error(`Metrika API ${res.status}: ${text.slice(0, 200)}`)
  }
}

type GoalDef = { id: number; name: string }

/** Read the counter's goals (Management API) and their reaches over the period. */
async function getGoals(
  token: string,
  counter: string,
  common: Record<string, string>,
  visits: number
): Promise<MetrikaGoal[]> {
  const listRes = await fetch(
    `https://api-metrika.yandex.net/management/v1/counter/${counter}/goals`,
    { headers: { Authorization: `OAuth ${token}` }, cache: 'no-store' }
  )
  if (!listRes.ok) return []
  const list = (await listRes.json()) as { goals?: GoalDef[] }
  const goals = (list.goals ?? []).slice(0, 12)
  if (!goals.length) return []

  const metrics = goals.map((g) => `ym:s:goal${g.id}reaches`).join(',')
  const data = await query(token, { ...common, metrics })
  const totals = data.totals || []

  return goals
    .map((g, i) => {
      const reaches = Math.round(totals[i] ?? 0)
      return {
        name: g.name,
        reaches,
        conversion: visits ? Math.round((reaches / visits) * 1000) / 10 : 0
      }
    })
    .filter((g) => g.reaches > 0)
    .sort((a, b) => b.reaches - a.reaches)
}

// Short-lived in-memory cache so repeated admin loads don't re-hit the API.
let memo: { key: string; at: number; data: MetrikaStats } | null = null
const MEMO_TTL = 45_000

export async function getMetrikaStats(counterOverride?: string): Promise<MetrikaStats> {
  const token = process.env.YANDEX_METRIKA_OAUTH_TOKEN
  const counter = counterOverride || process.env.YANDEX_METRIKA_COUNTER_ID

  if (!token || !counter) return { configured: false, counterId: counter }

  if (memo && memo.key === counter && Date.now() - memo.at < MEMO_TTL) {
    return memo.data
  }

  const common = { ids: counter, date1: '30daysAgo', date2: 'today', lang: 'ru' }
  const toBars = (raw: { data: { dimensions: { name: string }[]; metrics: number[] }[] }): MetrikaBar[] =>
    (raw.data || []).map((r) => ({
      label: r.dimensions[0]?.name ?? '—',
      value: Math.round(r.metrics[0] ?? 0)
    }))

  try {
    // Sequential (not Promise.all) — Metrika limits parallel requests per user.
    const summary = await query(token, {
      ...common,
      metrics: 'ym:s:visits,ym:s:users,ym:s:pageviews,ym:s:bounceRate'
    })
    const byDate = await query(token, {
      ...common,
      metrics: 'ym:s:visits,ym:s:users',
      dimensions: 'ym:s:date',
      sort: 'ym:s:date',
      limit: '100'
    })
    const sourcesRaw = await query(token, {
      ...common,
      metrics: 'ym:s:visits',
      dimensions: 'ym:s:lastTrafficSource',
      sort: '-ym:s:visits',
      limit: '8'
    })
    const devicesRaw = await query(token, {
      ...common,
      metrics: 'ym:s:visits',
      dimensions: 'ym:s:deviceCategory',
      sort: '-ym:s:visits',
      limit: '8'
    })
    const pagesRaw = await query(token, {
      ...common,
      metrics: 'ym:pv:pageviews',
      dimensions: 'ym:pv:URLPathFull',
      sort: '-ym:pv:pageviews',
      limit: '8'
    })

    const t = summary.totals || []
    const visits = Math.round(t[0] ?? 0)
    const series: MetrikaPoint[] = (byDate.data || []).map((row) => ({
      date: row.dimensions[0]?.name ?? '',
      visits: Math.round(row.metrics[0] ?? 0),
      users: Math.round(row.metrics[1] ?? 0)
    }))

    const goals = await getGoals(token, counter, common, visits).catch(() => [])

    const data: MetrikaStats = {
      configured: true,
      counterId: counter,
      totals: {
        visits,
        users: Math.round(t[1] ?? 0),
        pageviews: Math.round(t[2] ?? 0),
        bounceRate: Math.round((t[3] ?? 0) * 10) / 10
      },
      series,
      sources: toBars(sourcesRaw),
      devices: toBars(devicesRaw),
      topPages: toBars(pagesRaw),
      goals
    }
    memo = { key: counter, at: Date.now(), data }
    return data
  } catch (err) {
    return {
      configured: true,
      counterId: counter,
      error: err instanceof Error ? err.message : 'Ошибка запроса к Метрике'
    }
  }
}
