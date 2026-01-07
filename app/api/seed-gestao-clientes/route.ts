import { NextResponse } from 'next/server'
import { seedGestaoClientes } from '@/lib/seed-gestao-clientes'

export async function POST(request: Request) {
  try {
    const { workspaceId } = await request.json()

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId é obrigatório' }, { status: 400 })
    }

    const result = await seedGestaoClientes(workspaceId)

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Quadro Gestão de Clientes criado com sucesso!',
        boardId: result.boardId 
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error seeding Gestão de Clientes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}










