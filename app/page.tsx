import { createClient } from "@/lib/supabase/server"
import { getSupabaseAnonOrPublishableKey, getSupabasePublicUrl } from "@/lib/supabase/public-env"
import { redirect } from "next/navigation"
import { getDefaultUserId } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export default async function Home() {
  try {
    // Verificar variáveis de ambiente primeiro
    const supabaseUrl = getSupabasePublicUrl()
    const supabaseAnonKey = getSupabaseAnonOrPublishableKey()

    if (!supabaseUrl || !supabaseAnonKey) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Variáveis de ambiente não configuradas</h1>
            <p className="text-gray-600 mb-4">
              As variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) não estão configuradas na Vercel.
            </p>
            <div className="text-left bg-gray-100 p-4 rounded mb-4">
              <p className="text-sm font-semibold mb-2">Configure na Vercel:</p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Settings → Environment Variables</li>
                <li>• Adicione NEXT_PUBLIC_SUPABASE_URL</li>
                <li>• Adicione NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</li>
                <li>• Clique em "Redeploy" após adicionar</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500">
              URL configurada: {supabaseUrl ? '✅ Sim' : '❌ Não'}<br/>
              Key configurada: {supabaseAnonKey ? '✅ Sim' : '❌ Não'}
            </p>
          </div>
        </div>
      )
    }

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
      // Se for erro de conexão, mostrar mensagem específica
      if (errorOficial.message?.includes('fetch') || errorOficial.message?.includes('Failed to fetch')) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao conectar com o banco de dados</h1>
              <p className="text-gray-600 mb-4">
                Não foi possível conectar com o Supabase. Verifique:
              </p>
              <div className="text-left bg-gray-100 p-4 rounded mb-4">
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• O projeto Supabase está ativo?</li>
                  <li>• A URL do Supabase está correta?</li>
                  <li>• As variáveis de ambiente estão configuradas na Vercel?</li>
                  <li>• Você fez redeploy após configurar as variáveis?</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Erro: {errorOficial.message}
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
        // Se for erro de conexão, mostrar mensagem específica
        if (errorFirst.message?.includes('fetch') || errorFirst.message?.includes('Failed to fetch')) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center max-w-md p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao conectar com o banco de dados</h1>
                <p className="text-gray-600 mb-4">
                  Não foi possível conectar com o Supabase. Verifique:
                </p>
                <div className="text-left bg-gray-100 p-4 rounded mb-4">
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• O projeto Supabase está ativo?</li>
                    <li>• A URL do Supabase está correta?</li>
                    <li>• As variáveis de ambiente estão configuradas na Vercel?</li>
                    <li>• Você fez redeploy após configurar as variáveis?</li>
                  </ul>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Erro: {errorFirst.message}
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
        // Verificar se é erro de conexão
        const isConnectionError = errorCreate.message?.includes('fetch') || 
                                 errorCreate.message?.includes('Failed to fetch') ||
                                 errorCreate.message?.includes('TypeError')
        
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao conectar com o banco de dados</h1>
              <p className="text-gray-600 mb-4">
                {isConnectionError 
                  ? 'Não foi possível conectar com o Supabase. Verifique:'
                  : 'Erro ao criar workspace. Verifique:'}
              </p>
              <div className="text-left bg-gray-100 p-4 rounded mb-4">
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• O projeto Supabase está ativo?</li>
                  <li>• A URL do Supabase está correta na Vercel?</li>
                  <li>• A chave anon está correta na Vercel?</li>
                  <li>• Você fez redeploy após configurar as variáveis?</li>
                  {!isConnectionError && <li>• A tabela workspaces existe no banco?</li>}
                </ul>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Erro: {errorCreate.message || 'Erro desconhecido'}
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
    // O redirect() lança uma exceção especial que não deve ser capturada
    redirect(`/workspaces/${workspace.id}`)
  } catch (error: any) {
    // Ignorar erros de redirect do Next.js
    if (error.message === 'NEXT_REDIRECT' || error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    
    console.error('Erro na página inicial:', error)
    
    // Verificar se é erro de variáveis de ambiente
    const isEnvError = error.message?.includes('Missing Supabase') || 
                      error.message?.includes('environment variables')
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao inicializar aplicação</h1>
          <p className="text-gray-600 mb-4">
            {isEnvError 
              ? 'Variáveis de ambiente do Supabase não configuradas'
              : error.message || 'Erro desconhecido'}
          </p>
          <div className="text-left bg-gray-100 p-4 rounded mb-4">
            <p className="text-sm font-semibold mb-2">Solução:</p>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>1. Acesse o dashboard da Vercel</li>
              <li>2. Vá em Settings → Environment Variables</li>
              <li>3. Adicione NEXT_PUBLIC_SUPABASE_URL</li>
              <li>4. Adicione NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</li>
              <li>5. Clique em "Redeploy" para aplicar</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            {error.message && !isEnvError && `Detalhes: ${error.message}`}
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

