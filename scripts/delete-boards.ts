// Script para deletar quadros manualmente
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteBoards() {
  try {
    console.log('Buscando quadros para deletar...')

    // Buscar os quadros pelos nomes
    const { data: boards, error: fetchError } = await supabase
      .from('boards')
      .select('id, name')
      .or('name.ilike.%Controle_de_CHURN%,name.ilike.%links clicaveis%')

    if (fetchError) {
      console.error('Erro ao buscar quadros:', fetchError)
      return
    }

    if (!boards || boards.length === 0) {
      console.log('Nenhum quadro encontrado com esses nomes')
      return
    }

    console.log(`Encontrados ${boards.length} quadros:`)
    boards.forEach(board => {
      console.log(`- ${board.name} (${board.id})`)
    })

    // Deletar cada quadro
    for (const board of boards) {
      console.log(`\nDeletando quadro: ${board.name}...`)
      
      const { error: deleteError } = await supabase
        .from('boards')
        .delete()
        .eq('id', board.id)

      if (deleteError) {
        console.error(`Erro ao deletar quadro ${board.name}:`, deleteError)
      } else {
        console.log(`✓ Quadro ${board.name} deletado com sucesso!`)
      }
    }

    console.log('\n✅ Processo concluído!')
  } catch (error: any) {
    console.error('Erro:', error.message)
  }
}

deleteBoards()


