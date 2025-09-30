import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../../lib/supabaseServer.js'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { data, error } = await supabaseServer
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ lead: data })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



