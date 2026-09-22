import { NextResponse } from 'next/server'
import {
  bookDates,
  bookServices,
  bookStaff,
  bookTimes,
  createRecord,
  sendCode
} from '@/shared/lib/yclients/booking'
import { isYclientsConfigured } from '@/shared/lib/yclients/config'

/**
 * One endpoint for the whole custom booking flow. The partner token lives in env
 * and never reaches the client. Body: { action, ...params }.
 */
export async function POST(req: Request) {
  if (!isYclientsConfigured())
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const action = String(body.action ?? '')
  const salon = String(body.salon ?? '')

  try {
    switch (action) {
      case 'services':
        return NextResponse.json(
          await bookServices(salon, body.staffId ? Number(body.staffId) : undefined)
        )
      case 'staff':
        return NextResponse.json({
          staff: await bookStaff(
            salon,
            body.serviceId ? Number(body.serviceId) : undefined
          )
        })
      case 'dates':
        return NextResponse.json({
          dates: await bookDates(salon, Number(body.serviceId), Number(body.staffId))
        })
      case 'times':
        return NextResponse.json({
          times: await bookTimes(
            salon,
            Number(body.staffId),
            String(body.date),
            Number(body.serviceId)
          )
        })
      case 'code':
        await sendCode(salon, String(body.phone), String(body.fullname))
        return NextResponse.json({ ok: true })
      case 'record': {
        const result = await createRecord({
          salon,
          phone: String(body.phone),
          fullname: String(body.fullname),
          email: body.email ? String(body.email) : undefined,
          code: String(body.code),
          comment: body.comment ? String(body.comment) : undefined,
          serviceId: Number(body.serviceId),
          staffId: Number(body.staffId),
          datetime: String(body.datetime)
        })
        return NextResponse.json({ ok: true, result })
      }
      default:
        return NextResponse.json({ error: 'unknown_action' }, { status: 400 })
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'yclients_error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
