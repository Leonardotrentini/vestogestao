import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

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
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Voltar
          </Link>
        </div>
      </div>
    )
  }

  const { data: boards } = await supabase
    .from('boards')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Voltar
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Modo sem autenticação</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Quadros</h2>
          <Link
            href={`/workspaces/${workspaceId}/boards/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Novo Quadro
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards?.map((board) => (
            <Link
              key={board.id}
              href={`/workspaces/${workspaceId}/boards/${board.id}`}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {board.name}
              </h3>
              {board.description && (
                <p className="text-gray-600 text-sm">{board.description}</p>
              )}
            </Link>
          ))}

          {(!boards || boards.length === 0) && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">Nenhum quadro encontrado.</p>
              <Link
                href={`/workspaces/${workspaceId}/boards/new`}
                className="text-blue-600 hover:text-blue-800"
              >
                Criar seu primeiro quadro
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

