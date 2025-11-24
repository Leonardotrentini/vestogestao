import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Buscar usuários da tabela app_users
    const { data: appUsers, error } = await supabase
      .from('app_users')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Erro ao buscar usuários:', error)
      // Fallback: retornar lista básica
      return NextResponse.json([
        {
          id: 'user-raul',
          email: 'raul@vesto.com',
          name: 'Raul'
        },
        {
          id: 'user-model',
          email: 'model@vesto.com',
          name: 'Model'
        },
        {
          id: 'user-leo',
          email: 'leo@vesto.com',
          name: 'Leo'
        },
        {
          id: 'user-mika',
          email: 'mika@vesto.com',
          name: 'Mika'
        },
        {
          id: 'user-gutinho',
          email: 'gutinho@vesto.com',
          name: 'Gutinho'
        },
      ])
    }

    // Mapear para o formato esperado
    const users = appUsers?.map(u => ({
      id: u.auth_user_id || u.id, // Usar auth_user_id se disponível, senão usar id da tabela
      email: u.email,
      name: u.name,
    })) || []

    // Adicionar usuário padrão se não estiver na lista
    const { getDefaultUserId } = await import('@/lib/utils')
    const defaultUserId = getDefaultUserId()
    if (!users.find(u => u.id === defaultUserId)) {
      users.push({
        id: defaultUserId,
        email: 'usuario@interno.com',
        name: 'Usuário Padrão'
      })
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    // Fallback: retornar lista básica
    return NextResponse.json([
      {
        id: 'user-raul',
        email: 'raul@vesto.com',
        name: 'Raul'
      },
      {
        id: 'user-model',
        email: 'model@vesto.com',
        name: 'Model'
      },
      {
        id: 'user-leo',
        email: 'leo@vesto.com',
        name: 'Leo'
      },
      {
        id: 'user-mika',
        email: 'mika@vesto.com',
        name: 'Mika'
      },
      {
        id: 'user-gutinho',
        email: 'gutinho@vesto.com',
        name: 'Gutinho'
      },
    ])
  }
}
