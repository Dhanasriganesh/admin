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

    // First, get the lead details and employee details
    const [leadResult, employeeResult] = await Promise.all([
      supabaseServer
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single(),
      supabaseServer
        .from('employees')
        .select('name, phone, email')
        .eq('id', employeeId)
        .single()
    ])

    if (leadResult.error) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (employeeResult.error) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const lead = leadResult.data
    const employee = employeeResult.data

    // Update the lead with assignment
    const { data, error } = await supabaseServer
      .from('leads')
      .update({
        assigned_employee_id: employeeId,
        assigned_employee_name: employeeName || employee.name,
        assigned_employee_email: employeeEmail || employee.email,
        assigned_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send email to customer with employee details
    console.log('=== EMAIL SENDING DEBUG ===')
    console.log('Lead data:', {
      email: lead.email,
      name: lead.name,
      destination: lead.destination
    })
    console.log('Employee data:', {
      name: employee.name,
      phone: employee.phone,
      email: employee.email
    })
    
    const emailUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-employee-details`
    console.log('Email API URL:', emailUrl)
    
    const emailPayload = {
      customerEmail: lead.email,
      customerName: lead.name,
      destination: lead.destination,
      employeeName: employee.name,
      employeePhone: employee.phone,
      employeeEmail: employee.email
    }
    console.log('Email payload:', emailPayload)
    
    try {
      console.log('Making email API call...')
      const emailResponse = await fetch(emailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      })

      console.log('Email API response status:', emailResponse.status)
      console.log('Email API response ok:', emailResponse.ok)

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json().catch(() => ({}))
        console.error('❌ Failed to send employee details email:', errorData.error || 'Unknown error')
        console.error('Full error response:', errorData)
      } else {
        const successData = await emailResponse.json()
        console.log('✅ Employee details email sent successfully:', successData.messageId)
        console.log('Full success response:', successData)
      }
    } catch (emailError) {
      console.error('❌ Error sending employee details email:', emailError)
      console.error('Error details:', {
        message: emailError.message,
        stack: emailError.stack
      })
    }
    console.log('=== END EMAIL DEBUG ===')

    return NextResponse.json({ lead: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}



