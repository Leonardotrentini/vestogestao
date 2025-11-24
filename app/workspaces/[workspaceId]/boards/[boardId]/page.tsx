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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[rgba(255,255,255,0.95)] mb-2">Board não encontrado</h1>
            <a href={`/workspaces/${workspaceId}`} className="text-[#C79D45] hover:text-[#D4AD5F]">
              ← Voltar
            </a>
          </div>
        </div>
      )
    }

    return (
      <div className="flex min-h-screen bg-[#0F1711]">
      <Sidebar workspaceId={workspaceId} currentBoardId={boardId} />
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        <BoardView boardId={boardId} workspaceId={workspaceId} boardName={board.name} />
      </div>
    </div>
  )
}

