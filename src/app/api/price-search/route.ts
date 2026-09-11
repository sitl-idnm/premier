import { NextResponse } from 'next/server'
import { PRICE_SALONS } from '@/shared/content/prices'

/**
 * AI-assisted price search. Takes a free-form query + salon key, asks the Gonka
 * (DeepSeek) endpoint to pick the best-matching service names from that salon's
 * catalogue, and returns the validated names. Key stays server-side.
 */
const GONKA_URL =
  process.env.GONKA_URL ||
  'https://hskyauefqcgbvgvxkluj.supabase.co/functions/v1/gonka/chat/completions'
const GONKA_KEY = process.env.GONKA_API_KEY || ''
const GONKA_MODEL =
  process.env.GONKA_MODEL || 'deepseek-ai/DeepSeek-V4-Flash-0731'

export async function POST(req: Request) {
  let body: { query?: string; salon?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ names: [] })
  }

  const query = (body.query ?? '').trim()
  if (query.length < 2 || !GONKA_KEY) return NextResponse.json({ names: [] })

  const salon =
    PRICE_SALONS.find((s) => s.key === body.salon) ?? PRICE_SALONS[0]

  const names = Array.from(
    new Set(
      salon.tabs.flatMap((t) => t.sections.flatMap((s) => s.rows.map((r) => r.name)))
    )
  )

  const system =
    'Ты — поисковый помощник салона красоты «Премьер». На вход даётся запрос клиента и список названий услуг. Верни ТОЛЬКО те услуги из списка, которые действительно соответствуют запросу по смыслу. Отвечай СТРОГО JSON-массивом точных строк ровно как в списке, без Markdown и любого текста вокруг. Если в этом списке подходящих нет — верни [].'

  // The flash model handles short lists well but chokes on the full catalogue,
  // so split into chunks and query them in parallel, then merge.
  const chunkSize = 24
  const chunks: string[][] = []
  for (let i = 0; i < names.length; i += chunkSize)
    chunks.push(names.slice(i, i + chunkSize))

  const askChunk = async (chunk: string[]): Promise<string[]> => {
    try {
      const res = await fetch(GONKA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GONKA_KEY}`
        },
        body: JSON.stringify({
          model: GONKA_MODEL,
          temperature: 0.1,
          messages: [
            { role: 'system', content: system },
            {
              role: 'user',
              content: `Запрос клиента: "${query}"\n\nСписок услуг:\n${chunk
                .map((n) => `- ${n}`)
                .join('\n')}`
            }
          ]
        })
      })
      if (!res.ok) return []
      const data = await res.json()
      const content: string =
        data?.choices?.[0]?.message?.content ?? data?.content ?? ''
      const match = content.match(/\[[\s\S]*\]/)
      const parsed = JSON.parse(match ? match[0] : content)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const known = new Set(names)
  const merged = (await Promise.all(chunks.map(askChunk))).flat()
  const valid = Array.from(
    new Set(merged.filter((n) => typeof n === 'string' && known.has(n)))
  ).slice(0, 6)

  return NextResponse.json({ names: valid })
}
