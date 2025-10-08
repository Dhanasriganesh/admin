import React, { useEffect, useState } from 'react'

// Type definitions
interface Lead {
  id: number
  name: string
  email: string
  phone: string
  destination: string
  created_at: string
  assigned_employee_name?: string
  status?: string
}

const Users: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([])

  // Fetch available destinations
  const fetchDestinations = async () => {
    try {
      const response = await fetch('/api/destinations')
      const data = await response.json()
      if (data.destinations) {
        setAvailableDestinations(data.destinations)
      }
    } catch (error) {
      console.error('Failed to fetch destinations:', error)
    }
  }

  // Fetch leads data
  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leads')
      const data = await response.json()
      
      if (data.leads) {
        setLeads(data.leads)
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch bookings data to determine conversions
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      
      if (data.bookings) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    }
  }

  useEffect(() => {
    fetchLeads()
    fetchBookings()
    fetchDestinations()
  }, [])

  // Filter leads based on location
  const getFilteredLeads = (): Lead[] => {
    if (selectedLocation === 'all') return leads
    return leads.filter(lead => lead.destination === selectedLocation)
  }

  // Calculate converted leads (leads that have associated bookings)
  const getConvertedLeads = (): number => {
    const leadIds = leads.map(lead => lead.id)
    const convertedLeadIds = bookings
      .filter(booking => booking.lead_id && leadIds.includes(booking.lead_id))
      .map(booking => booking.lead_id)
    
    // Return unique converted lead IDs
    return new Set(convertedLeadIds).size
  }

  // Calculate assigned leads
  const getAssignedLeads = (): number => {
    return leads.filter(lead => lead.assigned_employee_name).length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">View all leads and customer information</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Location Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Location:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {availableDestinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
          <span className="ml-2 text-gray-600">Loading users...</span>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {getFilteredLeads().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredLeads().map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-900">{lead.name}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">{lead.email}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">{lead.phone}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                          {lead.destination}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          {lead.assigned_employee_name || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {lead.status ? (
                          <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                            {lead.status}
                          </span>
                        ) : (
                          <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                            New
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedLocation !== 'all' 
                  ? `No users found in ${selectedLocation} location.`
                  : 'No users have been registered yet.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && leads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-slate-800">{leads.length}</div>
            <div className="text-sm text-slate-800">Total Users</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-slate-800">
              {getAssignedLeads()}
            </div>
            <div className="text-sm text-slate-800">Assigned</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-slate-800">
              {getConvertedLeads()}
            </div>
            <div className="text-sm text-slate-800">Converted</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-slate-800">
              {new Set(leads.map(lead => lead.destination)).size}
            </div>
            <div className="text-sm text-slate-800">Destinations</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
