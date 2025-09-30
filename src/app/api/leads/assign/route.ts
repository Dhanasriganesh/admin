import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '../../../../lib/supabaseServer.js'

// POST /api/leads/assign
// Body: { leadId: string, employeeId: string, employeeName: string, employeeEmail: string }
export async function POST(request: NextRequest) {
  try {
    const { leadId, employeeId, employeeName, employeeEmail } = await request.json()

    if (!leadId || !employeeId) {
      return NextResponse.json({ error: 'leadId and employeeId are required' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('leads')
      .update({
        assigned_employee_id: employeeId,
        assigned_employee_name: employeeName || null,
        assigned_employee_email: employeeEmail || null,
        assigned_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ lead: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}



