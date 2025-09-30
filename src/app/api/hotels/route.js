import { NextResponse } from 'next/server'
import { supabaseServerServer } from '@/lib/supabaseServerServer'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')

    let query = supabaseServer
      .from('hotels')
      .select('*')
      .order('name', { ascending: true })

    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ hotels: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, mapRate, eb, category, locationId } = await request.json()

    if (!name || !locationId) {
      return NextResponse.json({ error: 'Name and locationId are required' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('hotels')
      .insert([
        {
          name: name.trim(),
          map_rate: mapRate || 0,
          eb: eb || 0,
          category: category.trim() || '',
          location_id: locationId
        }
      ])
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ hotel: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

