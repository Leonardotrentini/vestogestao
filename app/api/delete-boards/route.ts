import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Buscar os quadros pelos nomes
    const { data: boards, error: fetchError } = await supabase
      .from('boards')
      .select('id, name')
      .or('name.ilike.%Controle_de_CHURN%,name.ilike.%links clicaveis%')

    if (fetchError) {
      console.error('Erro ao buscar quadros:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!boards || boards.length === 0) {
      return NextResponse.json({ message: 'Nenhum quadro encontrado' }, { status: 404 })
    }

    const deletedBoards = []

    // Deletar cada quadro
    for (const board of boards) {
      const { error: deleteError } = await supabase
        .from('boards')
        .delete()
        .eq('id', board.id)

      if (deleteError) {
        console.error(`Erro ao deletar quadro ${board.name}:`, deleteError)
        return NextResponse.json({ 
          error: `Erro ao deletar quadro ${board.name}: ${deleteError.message}` 
        }, { status: 500 })
      }

      deletedBoards.push({ id: board.id, name: board.name })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${deletedBoards.length} quadro(s) deletado(s) com sucesso`,
      deletedBoards 
    })
  } catch (error: any) {
    console.error('Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}










