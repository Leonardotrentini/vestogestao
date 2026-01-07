import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Esta rota cria o usuário admin
// IMPORTANTE: Use apenas em desenvolvimento ou com autenticação adequada
export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SUPABASE_URL não configurado' },
        { status: 500 }
      )
    }

    if (!supabaseServiceKey) {
      // Se não tiver service key, usar o client normal (pode não funcionar para criar usuários)
      const { createClient: createClientBrowser } = await import('@supabase/supabase-js')
      const supabase = createClientBrowser(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')

      const { data, error } = await supabase.auth.signUp({
        email: 'leozikao50@gmail.com',
        password: 'Vesto@123',
        options: {
          data: {
            name: 'Leonardo',
            role: 'admin'
          }
        }
      })

      if (error) {
        // Se o usuário já existe, tentar fazer login para verificar
        if (error.message.includes('already registered')) {
          return NextResponse.json({
            success: true,
            message: 'Usuário já existe. Tente fazer login.',
            user: { email: 'leozikao50@gmail.com' }
          })
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'Usuário admin criado com sucesso!',
        user: data.user
      })
    }

    // Se tiver service key, usar admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'leozikao50@gmail.com',
      password: 'Vesto@123',
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: 'Leonardo',
        role: 'admin'
      }
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return NextResponse.json({
          success: true,
          message: 'Usuário já existe. Tente fazer login.',
          user: { email: 'leozikao50@gmail.com' }
        })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário admin criado com sucesso!',
      user: data.user
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}









