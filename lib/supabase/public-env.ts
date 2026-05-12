/**
 * Variáveis públicas do Supabase no browser / build.
 * Aceita a chave anon clássica (JWT) ou a publishable key do painel novo.
 */
export function getSupabasePublicUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined
}

export function getSupabaseAnonOrPublishableKey(): string | undefined {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  return anon || publishable || undefined
}
