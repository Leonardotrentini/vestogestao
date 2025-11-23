import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { getDefaultUserId } from "@/lib/utils"

export default async function Home() {
  const supabase = await createClient()
  const defaultUserId = getDefaultUserId()

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Vestogestao</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Modo sem autenticação</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Áreas de Trabalho</h2>
          <Link
            href="/workspaces/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Nova Área de Trabalho
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces?.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/workspaces/${workspace.id}`}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {workspace.name}
              </h3>
              {workspace.description && (
                <p className="text-gray-600 text-sm">{workspace.description}</p>
              )}
            </Link>
          ))}

          {(!workspaces || workspaces.length === 0) && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">Nenhuma área de trabalho encontrada.</p>
              <Link
                href="/workspaces/new"
                className="text-blue-600 hover:text-blue-800"
              >
                Criar sua primeira área de trabalho
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

