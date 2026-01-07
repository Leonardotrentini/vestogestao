import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId é obrigatório' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: boards } = await supabase
      .from('boards')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    return NextResponse.json({ boards: boards || [] })
  } catch (error: any) {
    console.error('Error fetching boards:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}










