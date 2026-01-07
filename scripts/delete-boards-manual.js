// Script para deletar quadros manualmente
// Execute com: node scripts/delete-boards-manual.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdaquwghrifnuwvlnglj.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteBoards() {
  try {
    console.log('🔍 Buscando quadros para deletar...')

    // Buscar TODOS os quadros primeiro para ver o que existe
    const { data: allBoards, error: fetchAllError } = await supabase
      .from('boards')
      .select('id, name')

    if (fetchAllError) {
      console.error('Erro ao buscar todos os quadros:', fetchAllError)
      return
    }

    console.log('\n📋 Todos os quadros encontrados:')
    allBoards?.forEach((board, index) => {
      console.log(`${index + 1}. ${board.name} (${board.id})`)
    })

    // Buscar os quadros específicos pelos nomes (com flexibilidade)
    const { data: boards, error: fetchError } = await supabase
      .from('boards')
      .select('id, name')
      .or('name.ilike.%CHURN%,name.ilike.%links clicaveis%')

    if (fetchError) {
      console.error('Erro ao buscar quadros:', fetchError)
      return
    }

    if (!boards || boards.length === 0) {
      console.log('\n❌ Nenhum quadro encontrado com esses nomes')
      console.log('\n💡 Dica: Verifique os nomes exatos acima e ajuste o filtro se necessário')
      return
    }

    console.log(`\n🎯 Encontrados ${boards.length} quadro(s) para deletar:`)
    boards.forEach((board, index) => {
      console.log(`${index + 1}. ${board.name} (${board.id})`)
    })

    // Deletar cada quadro
    console.log('\n🗑️  Iniciando deleção...')
    for (const board of boards) {
      console.log(`\n   Deletando: ${board.name}...`)
      
      const { error: deleteError } = await supabase
        .from('boards')
        .delete()
        .eq('id', board.id)

      if (deleteError) {
        console.error(`   ❌ Erro: ${deleteError.message}`)
      } else {
        console.log(`   ✅ Quadro deletado com sucesso!`)
      }
    }

    console.log('\n✅ Processo concluído!')
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

deleteBoards()










