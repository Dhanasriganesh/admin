import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabaseClient.js'

// GET - Fetch packages filtered by city location. Prefer exact match on `route` (stored location),
// then fallback to destination ILIKE for backwards compatibility.
export async function GET(request, { params }) {
  try {
    const { city } = await params
    if (!city) {
      return NextResponse.json({ error: 'city is required' }, { status: 400 })
    }

    const pattern = `%${city}%`
    // First try strict match by route (the stored location field)
    const byRoute = await supabase
      .from('packages')
      .select('*')
      .eq('route', city)
      .order('created_at', { ascending: false })

    if (byRoute.error) {
      return NextResponse.json({ error: byRoute.error.message }, { status: 500 })
    }

    let data = byRoute.data || []

    // If empty, fallback to destination ILIKE pattern
    if (!data.length) {
      const byDest = await supabase
        .from('packages')
        .select('*')
        .ilike('destination', pattern)
        .order('created_at', { ascending: false })
      if (byDest.error) {
        return NextResponse.json({ error: byDest.error.message }, { status: 500 })
      }
      data = byDest.data || []
    }

    return NextResponse.json({ packages: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



