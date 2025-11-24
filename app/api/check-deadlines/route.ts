import { NextResponse } from 'next/server'
import { checkDeadlinesServer } from '@/lib/notifications-server'

export async function GET() {
  try {
    await checkDeadlinesServer()
    return NextResponse.json({ success: true, message: 'Deadlines checked' })
  } catch (error) {
    console.error('Erro ao verificar prazos:', error)
    return NextResponse.json({ success: false, error: 'Erro ao verificar prazos' }, { status: 500 })
  }
}

