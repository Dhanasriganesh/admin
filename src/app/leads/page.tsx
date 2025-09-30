'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface LeadRow {
  id: string
  source: string
  name: string | null
  phone: string | null
  email: string | null
  number_of_travelers?: string | null
  travel_dates?: string | null
  custom_notes?: string | null
  created_at: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true)
      setError(null)
      // Prefer direct Supabase read
      const { data, error } = await supabase
        .from('leads')
        .select('id, source, name, phone, email, number_of_travelers, travel_dates, custom_notes, created_at')
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) {
        setError(error.message)
      } else {
        setLeads((data as LeadRow[]) || [])
      }
      setLoading(false)
    }
    fetchLeads()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leads</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2">Created</th>
                <th className="text-left px-3 py-2">Source</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Phone</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Travelers</th>
                <th className="text-left px-3 py-2">Dates</th>
                <th className="text-left px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t">
                  <td className="px-3 py-2">{new Date(lead.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{lead.source}</td>
                  <td className="px-3 py-2">{lead.name || '-'}</td>
                  <td className="px-3 py-2">{lead.phone || '-'}</td>
                  <td className="px-3 py-2">{lead.email || '-'}</td>
                  <td className="px-3 py-2">{lead.number_of_travelers || '-'}</td>
                  <td className="px-3 py-2">{lead.travel_dates || '-'}</td>
                  <td className="px-3 py-2 max-w-[300px] truncate" title={lead.custom_notes || ''}>{lead.custom_notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}



