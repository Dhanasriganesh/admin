import { NextResponse } from 'next/server'

// Predefined destinations based on the locations used throughout the app
const PREDEFINED_DESTINATIONS = [
  'Kashmir',
  'Ladakh', 
  'Kerala',
  'Gokarna',
  'Meghalaya',
  'Mysore',
  'Singapore',
  'Hyderabad',
  'Bengaluru',
  'Manali'
]

export async function GET() {
  try {
    return NextResponse.json({ 
      destinations: PREDEFINED_DESTINATIONS.sort() 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
