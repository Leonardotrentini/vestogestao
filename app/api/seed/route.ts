import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { seedBoards } from '@/lib/seed-boards'
import { seedGestaoClientes } from '@/lib/seed-gestao-clientes'

export async function POST(request: Request) {
  try {
    const { workspaceId, boardType } = await request.json()

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId é obrigatório' }, { status: 400 })
    }

    // Se boardType for especificado, criar apenas aquele quadro
    if (boardType === 'gestao-clientes') {
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
    }

    // Caso contrário, criar todos os quadros
    await seedBoards(workspaceId)

    return NextResponse.json({ success: true, message: 'Quadros criados com sucesso!' })
  } catch (error: any) {
    console.error('Error seeding boards:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

