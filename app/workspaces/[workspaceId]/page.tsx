import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PopulateBoardsButton from "@/components/workspace/PopulateBoardsButton"
import SeedGestaoClientesButton from "@/components/workspace/SeedGestaoClientesButton"
import SeedFeedbackSemanalButton from "@/components/workspace/SeedFeedbackSemanalButton"
import SeedFeedbackMensalButton from "@/components/workspace/SeedFeedbackMensalButton"

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Workspace não encontrado</h1>
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Voltar
          </a>
        </div>
      </div>
    )
  }

  // Buscar quadros
  const { data: boards } = await supabase
    .from('boards')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

    // Se não tiver quadros, mostrar opções
    if (!boards || boards.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Nenhum quadro encontrado</h1>
            <p className="text-gray-600 mb-6">Escolha uma opção:</p>
            <div className="space-y-3">
              <SeedGestaoClientesButton workspaceId={workspaceId} />
              <SeedFeedbackSemanalButton workspaceId={workspaceId} />
              <SeedFeedbackMensalButton workspaceId={workspaceId} />
              <div className="text-sm text-gray-500">ou</div>
              <PopulateBoardsButton workspaceId={workspaceId} autoRedirect={false} />
            </div>
          </div>
        </div>
      )
    }

  // Redirecionar automaticamente para o primeiro quadro
  redirect(`/workspaces/${workspaceId}/boards/${boards[0].id}`)
}
