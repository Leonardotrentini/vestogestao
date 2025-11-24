import { NextResponse } from 'next/server'
import { seedFeedbackSemanal } from '@/lib/seed-feedback-semanal'

export async function POST(request: Request) {
  try {
    const { workspaceId } = await request.json()

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId é obrigatório' }, { status: 400 })
    }

    const result = await seedFeedbackSemanal(workspaceId)

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Quadro Feedback Semanal Por Cliente criado com sucesso!',
        boardId: result.boardId 
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error seeding Feedback Semanal:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


