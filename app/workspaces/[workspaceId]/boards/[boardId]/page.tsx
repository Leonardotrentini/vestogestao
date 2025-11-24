import { createClient } from "@/lib/supabase/server"
import BoardView from "@/components/board/BoardView"
import Sidebar from "@/components/layout/Sidebar"

export default async function BoardPage({
  params,
}: {
  params: Promise<{ workspaceId: string; boardId: string }>
}) {
  const { workspaceId, boardId } = await params
  const supabase = await createClient()

  const { data: board } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single()

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Board não encontrado</h1>
          <a href={`/workspaces/${workspaceId}`} className="text-blue-600 hover:text-blue-800">
            ← Voltar
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar workspaceId={workspaceId} currentBoardId={boardId} />
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        <BoardView boardId={boardId} workspaceId={workspaceId} boardName={board.name} />
      </div>
    </div>
  )
}

