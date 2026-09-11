import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CONTENT_TAG } from '@/shared/content'
import { writeContentOverride } from '@/shared/lib/siteContentStore'

export async function POST(req: Request) {
  const data = (await req.json().catch(() => null)) as unknown

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return NextResponse.json({ error: 'Ожидается объект контента' }, { status: 400 })
  }

  try {
    await writeContentOverride(data as Record<string, unknown>)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка сохранения'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // Push the change to the public site.
  revalidateTag(CONTENT_TAG)
  revalidatePath('/', 'layout')
  revalidatePath('/')
  revalidatePath('/privacy')
  revalidatePath('/rules')

  return NextResponse.json({ ok: true })
}
