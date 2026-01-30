import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getDefaultUserId } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export default async function Home() {
  try {
    const supabase = await createClient()
    const defaultUserId = getDefaultUserId()

    // Buscar o workspace "oficial" ou o primeiro disponível
    let workspace = null

    // Primeiro tenta encontrar o workspace "oficial"
    const { data: oficialWorkspaces, error: errorOficial } = await supabase
      .from('workspaces')
      .select('*')
      .ilike('name', '%oficial%')
      .limit(1)

    if (errorOficial) {
      console.error('Erro ao buscar workspace oficial:', errorOficial)
    }

    if (oficialWorkspaces && oficialWorkspaces.length > 0) {
      workspace = oficialWorkspaces[0]
    } else {
      // Se não encontrar, busca o primeiro workspace disponível
      const { data: firstWorkspaces, error: errorFirst } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)

      if (errorFirst) {
        console.error('Erro ao buscar primeiro workspace:', errorFirst)
      }

      if (firstWorkspaces && firstWorkspaces.length > 0) {
        workspace = firstWorkspaces[0]
      }
    }

    // Se não tiver workspace, criar um chamado "oficial"
    if (!workspace) {
      const { data: newWorkspace, error: errorCreate } = await supabase
        .from('workspaces')
        .insert({
          name: 'oficial',
          description: 'Área de trabalho oficial',
          user_id: defaultUserId
        })
        .select()
        .single()

      if (errorCreate) {
        console.error('Erro ao criar workspace:', errorCreate)
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao conectar com o banco de dados</h1>
              <p className="text-gray-600 mb-4">
                Verifique se as variáveis de ambiente estão configuradas corretamente na Vercel.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Erro: {errorCreate.message}
              </p>
              <a 
                href="/workspaces/new" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Tentar criar workspace manualmente
              </a>
            </div>
          </div>
        )
      }

      if (newWorkspace) {
        workspace = newWorkspace
      }
    }

    if (!workspace) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar workspace</h1>
            <p className="text-gray-600 mb-4">
              Não foi possível criar ou encontrar um workspace.
            </p>
            <a 
              href="/workspaces/new" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Criar novo workspace
            </a>
          </div>
        </div>
      )
    }

    // Redirecionar para o workspace (que já redireciona para o primeiro board)
    redirect(`/workspaces/${workspace.id}`)
  } catch (error: any) {
    console.error('Erro na página inicial:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao inicializar aplicação</h1>
          <p className="text-gray-600 mb-4">
            {error.message || 'Erro desconhecido'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Verifique se as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão configuradas na Vercel.
          </p>
          <a 
            href="/workspaces/new" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Tentar criar workspace manualmente
          </a>
        </div>
      </div>
    )
  }
}

