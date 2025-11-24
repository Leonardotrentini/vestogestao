import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey)
    const serverSupabase = await createServerClient()

    const users = [
      { name: 'Raul', email: 'raul@vesto.com', password: 'Vesto@123' },
      { name: 'Model', email: 'model@vesto.com', password: 'Vesto@123' },
      { name: 'Leo', email: 'leo@vesto.com', password: 'Vesto@123' },
      { name: 'Mika', email: 'mika@vesto.com', password: 'Vesto@123' },
      { name: 'Gutinho', email: 'gutinho@vesto.com', password: 'Vesto@123' },
    ]

    const results = []

    for (const user of users) {
      try {
        // Verificar se o usuário já existe na tabela app_users
        const { data: existingUser } = await serverSupabase
          .from('app_users')
          .select('*')
          .eq('email', user.email)
          .single()

        if (existingUser) {
          results.push({
            name: user.name,
            email: user.email,
            status: 'já existe',
            id: existingUser.id,
            auth_user_id: existingUser.auth_user_id,
          })
          continue
        }

        // Criar usuário no Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              name: user.name,
            },
          },
        })

        if (error) {
          // Se o usuário já existe no Auth, tentar buscar
          if (error.message.includes('already registered') || error.message.includes('already exists')) {
            // Buscar usuário existente e criar na tabela app_users
            // Como não temos admin access, vamos criar com auth_user_id null por enquanto
            const { data: newAppUser } = await serverSupabase
              .from('app_users')
              .insert({
                email: user.email,
                name: user.name,
                auth_user_id: null, // Será atualizado depois se necessário
              })
              .select()
              .single()

            results.push({
              name: user.name,
              email: user.email,
              status: 'criado na tabela (já existia no Auth)',
              id: newAppUser?.id,
            })
            continue
          }
          results.push({
            name: user.name,
            email: user.email,
            status: 'erro',
            error: error.message,
          })
        } else if (data.user) {
          // Criar registro na tabela app_users
          const { data: appUser, error: appUserError } = await serverSupabase
            .from('app_users')
            .insert({
              email: user.email,
              name: user.name,
              auth_user_id: data.user.id,
            })
            .select()
            .single()

          if (appUserError) {
            results.push({
              name: user.name,
              email: user.email,
              status: 'criado no Auth, mas erro ao criar na tabela',
              error: appUserError.message,
              auth_user_id: data.user.id,
            })
          } else {
            results.push({
              name: user.name,
              email: user.email,
              status: 'criado',
              id: appUser.id,
              auth_user_id: data.user.id,
            })
          }
        }
      } catch (err: any) {
        results.push({
          name: user.name,
          email: user.email,
          status: 'erro',
          error: err.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usuários processados',
      results,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar usuários' },
      { status: 500 }
    )
  }
}
