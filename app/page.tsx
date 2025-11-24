import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getDefaultUserId } from "@/lib/utils"

export default async function Home() {
  const supabase = await createClient()
  const defaultUserId = getDefaultUserId()

  // Buscar o workspace "oficial" ou o primeiro disponível
  let workspace = null

  // Primeiro tenta encontrar o workspace "oficial"
  const { data: oficialWorkspaces } = await supabase
    .from('workspaces')
    .select('*')
    .ilike('name', '%oficial%')
    .limit(1)

  if (oficialWorkspaces && oficialWorkspaces.length > 0) {
    workspace = oficialWorkspaces[0]
  } else {
    // Se não encontrar, busca o primeiro workspace disponível
    const { data: firstWorkspaces } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)

    if (firstWorkspaces && firstWorkspaces.length > 0) {
      workspace = firstWorkspaces[0]
    }
  }

  // Se não tiver workspace, criar um chamado "oficial"
  if (!workspace) {
    const { data: newWorkspace } = await supabase
      .from('workspaces')
      .insert({
        name: 'oficial',
        description: 'Área de trabalho oficial',
        user_id: defaultUserId
      })
      .select()
      .single()

    if (newWorkspace) {
      workspace = newWorkspace
    }
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar workspace</h1>
        </div>
      </div>
    )
  }

  // Redirecionar para o workspace (que já redireciona para o primeiro board)
  redirect(`/workspaces/${workspace.id}`)
}

