import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// GET /api/employees?destination=Kashmir
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')

    let query = supabase
      .from('employees')
      .select('id, name, email, phone, destination, role, status')
      .order('name', { ascending: true })

    if (destination && destination !== 'all') {
      query = query.eq('destination', destination)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ employees: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



