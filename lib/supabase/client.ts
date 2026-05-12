import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonOrPublishableKey, getSupabasePublicUrl } from '@/lib/supabase/public-env'

export function createClient() {
  const supabaseUrl = getSupabasePublicUrl()
  const supabaseAnonKey = getSupabaseAnonOrPublishableKey()

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}


