// Script para criar usuário admin
// Execute: node scripts/create-admin-user.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Carregar variáveis de ambiente do .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        process.env[key] = value
      }
    })
  }
}

loadEnv()

async function createAdminUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Erro: Variáveis de ambiente não configuradas!')
    console.error('Certifique-se de que .env.local existe com:')
    console.error('  NEXT_PUBLIC_SUPABASE_URL=...')
    console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=...')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  console.log('🔄 Criando usuário admin...')
  console.log('   Email: leozikao50@gmail.com')
  console.log('   Nome: Leonardo')
  console.log('   Senha: Vesto@123')

  try {
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
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        console.log('✅ Usuário já existe!')
        console.log('   Você pode fazer login com:')
        console.log('   Email: leozikao50@gmail.com')
        console.log('   Senha: Vesto@123')
        return
      }
      throw error
    }

    if (data.user) {
      console.log('✅ Usuário admin criado com sucesso!')
      console.log('   ID:', data.user.id)
      console.log('   Email:', data.user.email)
      console.log('')
      console.log('📝 Próximos passos:')
      console.log('   1. Verifique seu email para confirmar a conta (se necessário)')
      console.log('   2. Faça login na aplicação com:')
      console.log('      Email: leozikao50@gmail.com')
      console.log('      Senha: Vesto@123')
    } else {
      console.log('⚠️  Usuário criado, mas precisa confirmar email')
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message)
    console.error('')
    console.error('💡 Dica: Se o usuário já existe, você pode:')
    console.error('   1. Fazer login diretamente na aplicação')
    console.error('   2. Ou resetar a senha no Supabase Dashboard')
    process.exit(1)
  }
}

createAdminUser()

