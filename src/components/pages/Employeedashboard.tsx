import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Image from 'next/image'

const Employeedashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [employeeDestination, setEmployeeDestination] = useState<string>('')
  const [packages, setPackages] = useState<Array<{
    id: number
    name: string
    destination: string
    duration: string
    price: number
    original_price: number
    category: string
    status: 'Active' | 'Inactive' | 'Draft'
    featured: boolean
    image?: string
  }>>([])
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [selected, setSelected] = useState<{
    id: number
    name: string
    destination: string
    duration: string
    price: number
    original_price: number
    category: string
    status: 'Active' | 'Inactive' | 'Draft'
    featured: boolean
    image?: string
  } | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [expandedLeads, setExpandedLeads] = useState<Set<number>>(new Set())
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false)
  const [assignedLeads, setAssignedLeads] = useState<Array<any>>([])
  const [activeSection, setActiveSection] = useState<'itineraries' | 'leads'>('itineraries')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedItinerary, setSelectedItinerary] = useState<any>(null)
  const [showPaymentPage, setShowPaymentPage] = useState<boolean>(false)

  // Location/asset resolution state (to mirror Packages page card fields)
  interface HotelLocation { id: string; name: string; city: string }
  interface VehicleLocation { id: string; name: string; city: string }
  interface Hotel { id: string; name: string; map_rate: number; eb: number; category: string; location_id: string }
  interface Vehicle { id: string; vehicle_type: string; rate: number; ac_extra: number; location_id: string }
  const [hotelLocations, setHotelLocations] = useState<HotelLocation[]>([])
  const [vehicleLocations, setVehicleLocations] = useState<VehicleLocation[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  // Fixed plan display state
  const [fixedDaysOptions, setFixedDaysOptions] = useState<Array<{ id: string; days: number; label: string }>>([])
  const [fixedLocations, setFixedLocations] = useState<Array<{ id: string; name: string; city: string }>>([])
  const [fixedPlansByLocation, setFixedPlansByLocation] = useState<Record<string, Array<{ id: string; name: string }>>>({})
  
  // Lead itineraries state
  const [leadItineraries, setLeadItineraries] = useState<any[]>([])
  const [leadItinerariesLoading, setLeadItinerariesLoading] = useState<boolean>(false)
  const [leadItinerariesError, setLeadItinerariesError] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  
  // Helper to normalize city name to slug (e.g., "Ladakh" -> "ladakh")
  const toSlug = (value: string): string => {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
  
  // Fetch employee destination and packages
  useEffect(() => {
    const fetchEmployeeData = async (): Promise<void> => {
      try {
        setLoading(true)
        
        // Fetch employee destination
        if (user?.email) {
          const employeeRes = await fetch(`/api/employees/by-email/${user.email}`)
          if (employeeRes.ok) {
            const employeeData = await employeeRes.json()
            const destination = employeeData.destination || ''
            setEmployeeDestination(destination)
            
            // Fetch packages based on destination
            const url = destination && destination !== 'all' ? `/api/packages/city/${destination}` : '/api/packages'
            const res = await fetch(url)
            const data = await res.json()
            if (res.ok) {
              setPackages(data.packages || [])
              setError(null)
            } else {
              setError(data.error || 'Failed to load packages')
            }

            // Fetch leads assigned to this employee
            if (employeeData?.id) {
              const assignedRes = await fetch(`/api/leads?assignedTo=${employeeData.id}`)
              const assignedJson = await assignedRes.json().catch(() => ({ leads: [] }))
              if (assignedRes.ok) setAssignedLeads(assignedJson.leads || [])
            }
          }
        }
      } catch (_) {
        setError('Failed to load packages')
      } finally {
        setLoading(false)
      }
    }
    fetchEmployeeData()
  }, [user?.email])

  // Load locations, hotels, vehicles for name resolution
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const [hotLocRes, vehLocRes] = await Promise.all([
          fetch('/api/locations/hotels'),
          fetch('/api/locations/vehicles')
        ])
        if (hotLocRes.ok) {
          const j = await hotLocRes.json(); setHotelLocations(j.locations || [])
        }
        if (vehLocRes.ok) {
          const j = await vehLocRes.json(); setVehicleLocations(j.locations || [])
        }
      } catch (_) {}

      try {
        const [hotRes, vehRes] = await Promise.all([
          fetch('/api/hotels'),
          fetch('/api/vehicles')
        ])
        if (hotRes.ok) {
          const j = await hotRes.json(); setHotels(j.hotels || [])
        }
        if (vehRes.ok) {
          const j = await vehRes.json(); setVehicles(j.vehicles || [])
        }
      } catch (_) {}
    }
    loadAssets()
  }, [])

  // Load fixed-days and fixed locations for the employee destination
  useEffect(() => {
    const loadFixedMeta = async () => {
      try {
        if (!employeeDestination) return
        // Fixed days
        const daysRes = await fetch(`/api/fixed-days?city=${toSlug(employeeDestination)}`)
        if (daysRes.ok) {
          const data = await daysRes.json()
          setFixedDaysOptions((data.options || []).map((o: any) => ({ id: o.id, days: o.days, label: o.label || '' })))
        } else {
          setFixedDaysOptions([])
        }
        // Fixed locations
        const locRes = await fetch(`/api/locations/fixed?city=${toSlug(employeeDestination)}`)
        if (locRes.ok) {
          const data = await locRes.json()
          setFixedLocations(data.locations || [])
        } else {
          setFixedLocations([])
        }
      } catch (_) {
        setFixedDaysOptions([])
        setFixedLocations([])
      }
    }
    loadFixedMeta()
  }, [employeeDestination])

  // Load fixed plans for all locations referenced in current packages
  useEffect(() => {
    const loadPlansForLocations = async () => {
      const locationIds = Array.from(new Set(
        (packages as any[])
          .map((p: any) => p.fixed_location_id)
          .filter((id: any) => typeof id === 'string' && id.length > 0)
      )) as string[]

      await Promise.all(locationIds.map(async (locId) => {
        if (fixedPlansByLocation[locId]) return
        try {
          const res = await fetch(`/api/fixed-plans?city=${toSlug(employeeDestination)}&locationId=${locId}`)
          if (res.ok) {
            const data = await res.json()
            setFixedPlansByLocation(prev => ({ ...prev, [locId]: (data.plans || []).map((p: any) => ({ id: p.id, name: p.name })) }))
          }
        } catch (_) {
          // ignore
        }
      }))
    }
    if (packages.length && employeeDestination) loadPlansForLocations()
  }, [packages, employeeDestination, fixedPlansByLocation])

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  // Load lead itineraries when a lead is selected
  const loadLeadItineraries = async (leadId: string) => {
    try {
      setLeadItinerariesLoading(true)
      setLeadItinerariesError(null)
      
      // Find the selected lead
      const lead = assignedLeads.find(l => l.id.toString() === leadId)
      setSelectedLead(lead)
      
      // Load lead details
      const leadRes = await fetch(`/api/leads/${leadId}`)
      const leadData = await leadRes.json().catch(() => ({ lead: null }))
      if (leadRes.ok) setSelectedLead(leadData.lead || lead)
      
      // Load itineraries
      const res = await fetch('/api/packages')
      const data = await res.json()
      if (res.ok) {
        setLeadItineraries(data.packages || [])
      } else {
        setLeadItinerariesError(data.error || 'Failed to load itineraries')
      }
    } catch (error) {
      setLeadItinerariesError('Failed to load itineraries')
    } finally {
      setLeadItinerariesLoading(false)
    }
  }

  // Assign itinerary function
  const assignItinerary = (itinerary: any) => {
    if (!selectedLeadId) return
    
    try {
      const map = JSON.parse(localStorage.getItem('leadItineraryAssignments') || '{}')
      map[selectedLeadId] = itinerary.id
      localStorage.setItem('leadItineraryAssignments', JSON.stringify(map))
      
      // Set the selected itinerary and show payment page
      setSelectedItinerary(itinerary)
      setShowPaymentPage(true)
    } catch (e: any) {
      alert('Failed to assign itinerary')
    }
  }

  // Generate and send payment link function
  const generatePaymentLink = () => {
    // Here you can implement the payment link generation logic
    alert('Payment link generated and sent to the member!')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-56 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="h-14 border-b border-gray-100 flex items-center px-4">
          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'E'}
          </div>
          <div className="ml-3">
            <div className="text-xs text-gray-500">Employee</div>
            <div className="text-sm font-semibold text-gray-900">{user?.name || 'Dashboard'}</div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          <div className="space-y-1">
            <button
              onClick={() => setActiveSection('itineraries')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeSection === 'itineraries'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${
                activeSection === 'itineraries' ? 'bg-blue-500' : 'bg-gray-400'
              }`}>
                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span>Itineraries</span>
              {packages.length > 0 && (
                <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {packages.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveSection('leads')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeSection === 'leads'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${
                activeSection === 'leads' ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span>Leads</span>
              {assignedLeads.length > 0 && (
                <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {assignedLeads.length}
                </span>
              )}
            </button>
          </div>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-7 w-7 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'E'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Employee'}</p>
                <p className="text-[11px] text-gray-500">{employeeDestination || 'No destination'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-56">
        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="h-14 px-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                className="md:hidden text-gray-500" 
                onClick={() => setSidebarOpen(s => !s)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-base font-semibold text-gray-900">Employee Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Destination: <span className="font-medium">{employeeDestination || 'All'}</span>
              </div>
              <div className="relative">
                <input 
                  className="pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                  placeholder="Search packages..." 
                />
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="h-7 w-7 bg-primary rounded-full flex items-center justify-center text-white text-xs hover:opacity-80 transition-opacity"
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'E'}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4">
          <div className="w-full">
            {/* Payment Page */}
            {showPaymentPage && selectedLead && selectedItinerary ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowPaymentPage(false)}
                        className="h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedItinerary.destination} assigning to {selectedLead.name}
                        </h2>
                        <p className="text-sm text-gray-600">Generate payment link for the assigned itinerary</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Member Details Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center">
                          <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Member Details</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {(selectedLead.name || 'Lead').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{selectedLead.name || 'Unnamed Lead'}</h4>
                            <p className="text-sm text-gray-500">Lead ID: #{selectedLead.id}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Information</label>
                            <div className="mt-1 space-y-2">
                              {selectedLead.email && (
                                <div className="flex items-center space-x-2">
                                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm text-gray-900">{selectedLead.email}</span>
                                </div>
                              )}
                              {selectedLead.phone && (
                                <div className="flex items-center space-x-2">
                                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span className="text-sm text-gray-900">{selectedLead.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {selectedLead.destination && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Travel Destination</label>
                              <div className="mt-1 flex items-center space-x-2">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm text-gray-900">{selectedLead.destination}</span>
                              </div>
                            </div>
                          )}
                          
                          {selectedLead.number_of_travelers && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Travel Details</label>
                              <div className="mt-1 flex items-center space-x-2">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-gray-900">{selectedLead.number_of_travelers} travelers</span>
                              </div>
                            </div>
                          )}
                          
                          {selectedLead.travel_dates && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Travel Dates</label>
                              <div className="mt-1">
                                <span className="text-sm text-gray-900">{selectedLead.travel_dates}</span>
                              </div>
                            </div>
                          )}
                          
                          {selectedLead.custom_notes && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
                              <div className="mt-1">
                                <p className="text-sm text-gray-700 bg-white p-3 rounded-md border">{selectedLead.custom_notes}</p>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lead Status</label>
                            <div className="mt-1">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Itinerary Details Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-8 w-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Itinerary Details</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 text-lg mb-2">{selectedItinerary.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{selectedItinerary.destination}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Package Information</label>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Plan Type:</span>
                                <span className="font-medium text-gray-900">{selectedItinerary.plan_type || 'Custom'}</span>
                              </div>
                              {selectedItinerary.service_type && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Service Type:</span>
                                  <span className="font-medium text-gray-900">{selectedItinerary.service_type}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Hotel Details */}
                          {selectedItinerary.selected_hotel_id && (() => {
                            const hotel = hotels.find(h => h.id === selectedItinerary.selected_hotel_id)
                            return hotel ? (
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hotel Information</label>
                                <div className="mt-2 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Hotel:</span>
                                    <span className="font-medium text-gray-900">{hotel.name}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Map Rate:</span>
                                    <span className="font-medium text-gray-900">₹{hotel.map_rate || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">EB:</span>
                                    <span className="font-medium text-gray-900">₹{hotel.eb || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Category:</span>
                                    <span className="font-medium text-gray-900">{hotel.category || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            ) : null
                          })()}
                          
                          {/* Vehicle Details */}
                          {selectedItinerary.selected_vehicle_id && (() => {
                            const vehicle = vehicles.find(v => v.id === selectedItinerary.selected_vehicle_id)
                            return vehicle ? (
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle Information</label>
                                <div className="mt-2 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Vehicle Type:</span>
                                    <span className="font-medium text-gray-900">{vehicle.vehicle_type}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Rate:</span>
                                    <span className="font-medium text-gray-900">₹{(vehicle as any).rate ?? 0}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">AC Extra:</span>
                                    <span className="font-medium text-gray-900">₹{(vehicle as any).ac_extra ?? 0}</span>
                                  </div>
                                </div>
                              </div>
                            ) : null
                          })()}
                          
                          {/* Fixed Plan Details */}
                          {selectedItinerary.fixed_days_id && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fixed Plan Details</label>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Duration:</span>
                                  <span className="font-medium text-gray-900">{fixedDaysOptions.find(d => d.id === selectedItinerary.fixed_days_id)?.days || '-'} days</span>
                                </div>
                                {selectedItinerary.fixed_adults && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Adults:</span>
                                    <span className="font-medium text-gray-900">{selectedItinerary.fixed_adults}</span>
                                  </div>
                                )}
                                {selectedItinerary.fixed_price_per_person && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Price per Person:</span>
                                    <span className="font-medium text-gray-900">₹{selectedItinerary.fixed_price_per_person}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Package Status</label>
                            <div className="mt-1">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                {selectedItinerary.status || 'Active'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Generate Payment Link Button */}
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={generatePaymentLink}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2 shadow-lg"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Generate and Send Payment Link</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Lead Itineraries Section */}
                {selectedLeadId ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedLeadId(null)}
                        className="h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Assign itinerary to {selectedLead?.name ? selectedLead.name : `Lead #${selectedLeadId}`}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {selectedLead?.phone ? `Phone: ${selectedLead.phone}` : selectedLead?.email ? `Email: ${selectedLead.email}` : ''}
                        </p>
                      </div>
                    </div>
                    {leadItinerariesLoading && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span>Loading itineraries...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  {leadItinerariesError ? (
                    <div className="bg-red-50 border border-red-200 text-sm text-red-700 px-3 py-2 rounded">
                      {leadItinerariesError}
                    </div>
                  ) : leadItinerariesLoading ? (
                    <div className="text-sm text-gray-600">Loading itineraries...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {leadItineraries.map((pkg: any) => {
                        const isAssigned = (() => {
                          try {
                            const map = JSON.parse(localStorage.getItem('leadItineraryAssignments') || '{}')
                            return map[selectedLeadId] === pkg.id
                          } catch (_) {
                            return false
                          }
                        })()
                        
                        return (
                          <div key={pkg.id} className="group bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-primary transition-all duration-200 overflow-hidden">
                            <div className="p-3">
                              <div className="mb-2">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                  {pkg.name}
                                </h3>
                                <div className="flex items-center text-xs text-gray-600 mb-1">
                                  <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="font-medium">{pkg.destination}</span>
                                </div>
                                {'route' in pkg && pkg.route && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{pkg.route}</span>
                                  </div>
                                )}
                              </div>

                              {/* Details similar to dashboard (compact) */}
                              <div className="space-y-1.5 mb-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">Plan</span>
                                  <span className="font-medium text-gray-900">{pkg.plan_type || 'Custom'}</span>
                                </div>
                                {pkg.service_type && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Service</span>
                                    <span className="font-medium text-gray-900">{pkg.service_type}</span>
                                  </div>
                                )}
                                {/* Custom-plan fields */}
                                {pkg.hotel_location_id && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Hotel Location</span>
                                    <span className="font-medium text-gray-900">{hotelLocations.find(l => l.id === pkg.hotel_location_id)?.name || pkg.hotel_location_id}</span>
                                  </div>
                                )}
                                {pkg.selected_hotel_id && (() => {
                                  const hotel = hotels.find(h => h.id === pkg.selected_hotel_id)
                                  return hotel ? (
                                    <>
                                      <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Hotel</span><span className="font-medium text-gray-900">{hotel.name}</span></div>
                                      <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Map Rate</span><span className="font-medium text-gray-900">₹{hotel.map_rate || 0}</span></div>
                                      <div className="flex items-center justify-between text-xs"><span className="text-gray-500">EB</span><span className="font-medium text-gray-900">₹{hotel.eb || 0}</span></div>
                                      <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Category</span><span className="font-medium text-gray-900">{hotel.category || 'N/A'}</span></div>
                                    </>
                                  ) : null
                                })()}
                                {pkg.vehicle_location_id && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Vehicle Location</span>
                                    <span className="font-medium text-gray-900">{vehicleLocations.find(l => l.id === pkg.vehicle_location_id)?.name || pkg.vehicle_location_id}</span>
                                  </div>
                                )}
                                {pkg.selected_vehicle_id && (() => {
                                  const vehicle = vehicles.find(v => v.id === pkg.selected_vehicle_id)
                                  return vehicle ? (
                                    <>
                                      <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Vehicle</span><span className="font-medium text-gray-900">{vehicle.vehicle_type}</span></div>
                                      <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Rate</span><span className="font-medium text-gray-900">₹{(vehicle as any).rate ?? 0}</span></div>
                                      <div className="flex items-center justify-between text-xs"><span className="text-gray-500">AC Extra</span><span className="font-medium text-gray-900">₹{(vehicle as any).ac_extra ?? 0}</span></div>
                                    </>
                                  ) : null
                                })()}
                                {pkg.fixed_days_id && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Fixed Days</span>
                                    <span className="font-medium text-gray-900">{fixedDaysOptions.find(d => d.id === pkg.fixed_days_id)?.days || '-'}</span>
                                  </div>
                                )}
                                {pkg.fixed_location_id && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Fixed Location</span>
                                    <span className="font-medium text-gray-900">{fixedLocations.find(l => l.id === pkg.fixed_location_id)?.name || pkg.fixed_location_id}</span>
                                  </div>
                                )}
                                {pkg.fixed_plan_id && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Fixed Plan</span>
                                    <span className="font-medium text-gray-900">{fixedPlansByLocation[pkg.fixed_location_id || '']?.find(p => p.id === pkg.fixed_plan_id)?.name || pkg.fixed_plan_id}</span>
                                  </div>
                                )}
                                {!!(pkg.fixed_adults ?? 0) && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Adults</span>
                                    <span className="font-medium text-gray-900">{pkg.fixed_adults}</span>
                                  </div>
                                )}
                                {!!(pkg.fixed_price_per_person ?? 0) && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Price/Person</span>
                                    <span className="font-medium text-gray-900">₹{pkg.fixed_price_per_person}</span>
                                  </div>
                                )}
                                {pkg.fixed_rooms_vehicle && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Rooms & Vehicle</span>
                                    <span className="font-medium text-gray-900">{pkg.fixed_rooms_vehicle}</span>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => assignItinerary(pkg)}
                                className={`w-full mt-2 py-1.5 text-xs rounded-md ${isAssigned ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-primary/10 text-primary hover:bg-primary/20'} transition-colors`}
                              >
                                {isAssigned ? 'Assigned' : 'Assign this itinerary'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Itineraries Section */}
                {activeSection === 'itineraries' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Travel Itineraries</h2>
                        <p className="text-sm text-gray-600">Manage and view all available packages</p>
                      </div>
                    </div>
                    {loading && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span>Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {error ? (
                  <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                      <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800">Error Loading Itineraries</p>
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </div>
              </div>
              ) : (
                  <div className="p-6">
                  {packages.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Itineraries Found</h3>
                        <p className="text-gray-500">No travel packages are available at the moment.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {packages.map((pkg: any) => {
                          const isExpanded = expandedCards.has(pkg.id)
                          return (
                            <div key={pkg.id} className="group bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-primary transition-all duration-200 overflow-hidden">
                              {/* Card Header */}
                              <div className="relative">
                                {pkg.image && (
                                  <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center relative">
                                    <Image src={pkg.image} alt={pkg.name} fill className="object-cover" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2">
                                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                    pkg.status === 'Active' 
                                      ? 'bg-primary/10 text-primary border border-primary/20' 
                                      : pkg.status === 'Draft' 
                                        ? 'bg-primary/10 text-primary border border-primary/20' 
                                        : 'bg-primary/10 text-primary border border-primary/20'
                                  }`}>
                                    {pkg.status}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Card Content */}
                              <div className="p-3">
                                <div className="mb-2">
                                  <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                    {pkg.name}
                                  </h3>
                                  {isExpanded && (
                                    <>
                                      <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="font-medium">{pkg.destination}</span>
                                      </div>
                                      {'route' in pkg && pkg.route && (
                                        <div className="flex items-center text-sm text-gray-500 mb-2">
                                          <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span>{pkg.route}</span>
                            </div>
                                      )}
                                    </>
                                  )}
                                </div>
                                
                                {/* Package Details - Only show when expanded */}
                                {isExpanded && (
                                  <div className="space-y-1.5 mb-3">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-500">Plan Type</span>
                                      <span className="font-medium text-gray-900">{pkg.plan_type || 'Custom'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-500">Service</span>
                                      <span className="font-medium text-gray-900">{pkg.service_type || '-'}</span>
                                    </div>
                                    {/* Fixed plan fields */}
                                    {pkg.fixed_days_id && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Fixed Days</span>
                                        <span className="font-medium text-gray-900">
                                          {fixedDaysOptions.find(d => d.id === pkg.fixed_days_id)?.days || '-'}
                                        </span>
                                      </div>
                                    )}
                                    {pkg.fixed_location_id && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Fixed Location</span>
                                        <span className="font-medium text-gray-900">
                                          {fixedLocations.find(l => l.id === pkg.fixed_location_id)?.name || pkg.fixed_location_id}
                                        </span>
                                      </div>
                                    )}
                                    {pkg.fixed_plan_id && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Fixed Plan</span>
                                        <span className="font-medium text-gray-900">
                                          {fixedPlansByLocation[(pkg as any).fixed_location_id || '']?.find(p => p.id === pkg.fixed_plan_id)?.name || pkg.fixed_plan_id}
                                        </span>
                                      </div>
                                    )}
                                    {!!(pkg.fixed_adults ?? 0) && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Adults</span>
                                        <span className="font-medium text-gray-900">{pkg.fixed_adults}</span>
                                      </div>
                                    )}
                                    {!!(pkg.fixed_price_per_person ?? 0) && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Price/Person</span>
                                        <span className="font-medium text-gray-900">₹{pkg.fixed_price_per_person}</span>
                                      </div>
                                    )}
                                    {pkg.fixed_rooms_vehicle && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Rooms & Vehicle</span>
                                        <span className="font-medium text-gray-900">{pkg.fixed_rooms_vehicle}</span>
                                      </div>
                                    )}
                                    {pkg.hotel_location_id && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Hotel Location</span>
                                        <span className="font-medium text-gray-900">
                                          {hotelLocations.find(l => l.id === pkg.hotel_location_id)?.name || pkg.hotel_location_id}
                                        </span>
                                      </div>
                                    )}
                                    {pkg.selected_hotel_id && (() => {
                                      const hotel = hotels.find(h => h.id === pkg.selected_hotel_id)
                                      return hotel ? (
                                        <>
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Hotel</span>
                                            <span className="font-medium text-gray-900">{hotel.name}</span>
                                          </div>
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Map Rate</span>
                                            <span className="font-medium text-gray-900">₹{hotel.map_rate || 0}</span>
                                          </div>
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">EB</span>
                                            <span className="font-medium text-gray-900">₹{hotel.eb || 0}</span>
                                          </div>
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Category</span>
                                            <span className="font-medium text-gray-900">{hotel.category || 'N/A'}</span>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">Hotel</span>
                                          <span className="font-medium text-gray-900">{pkg.selected_hotel_id}</span>
                                        </div>
                                      )
                                    })()}
                                    {pkg.vehicle_location_id && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Vehicle Location</span>
                                        <span className="font-medium text-gray-900">
                                          {vehicleLocations.find(l => l.id === pkg.vehicle_location_id)?.name || pkg.vehicle_location_id}
                                        </span>
                                      </div>
                                    )}
                                    {pkg.selected_vehicle_id && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Vehicle</span>
                                        <span className="font-medium text-gray-900">
                                          {vehicles.find(v => v.id === pkg.selected_vehicle_id)?.vehicle_type || pkg.selected_vehicle_id}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Card Footer */}
                                <div className="pt-2 border-t border-gray-100">
                                  <button
                                    onClick={() => {
                                      if (isExpanded) {
                                        setExpandedCards(prev => {
                                          const newSet = new Set(prev)
                                          newSet.delete(pkg.id)
                                          return newSet
                                        })
                                      } else {
                                        setExpandedCards(prev => new Set(prev).add(pkg.id))
                                      }
                                    }}
                                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-1.5 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1 text-xs"
                                  >
                                    <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                                    <svg className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Leads Section */}
            {activeSection === 'leads' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Assigned Leads</h2>
                        <p className="text-sm text-gray-600">Manage your customer inquiries and bookings</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                        {assignedLeads.length} Lead{assignedLeads.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {assignedLeads.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads Assigned</h3>
                      <p className="text-gray-500">You don&apos;t have any leads assigned to you yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {assignedLeads.map((lead) => {
                        const isExpanded = expandedLeads.has(lead.id)
                        return (
                          <div
                            key={lead.id}
                            className="group bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-primary transition-all duration-200 overflow-hidden cursor-pointer"
                            onClick={() => {
                              setSelectedLeadId(lead.id.toString())
                              loadLeadItineraries(lead.id.toString())
                            }}
                          >
                            {/* Card Header */}
                            <div className="p-3 pb-2">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-semibold text-xs">
                                      {(lead.name || 'Lead').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-sm">
                                      {lead.name || 'Unnamed Lead'}
                                    </h3>
                                    {isExpanded && (
                                      <p className="text-sm text-gray-500">
                                        {new Date(lead.created_at).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                                  <span className="text-xs text-gray-500">New</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Card Content - Only show when expanded */}
                            {isExpanded && (
                              <div className="px-3 pb-2">
                                <div className="space-y-2">
                                  {/* Destination */}
                                  <div className="flex items-center space-x-2">
                                    <div className="h-6 w-6 bg-primary/10 rounded-md flex items-center justify-center">
                                      <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Destination</p>
                                      <p className="text-xs font-medium text-gray-900">{lead.destination || 'Not specified'}</p>
                                    </div>
                                  </div>
                                  
                                  {/* Contact Info */}
                                  <div className="flex items-center space-x-2">
                                    <div className="h-6 w-6 bg-primary/10 rounded-md flex items-center justify-center">
                                      <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Contact</p>
                                      <p className="text-xs font-medium text-gray-900">{lead.email || 'No email'}</p>
                                      {lead.phone && (
                                        <p className="text-xs text-gray-600">{lead.phone}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Travel Details */}
                                  <div className="flex items-center space-x-2">
                                    <div className="h-6 w-6 bg-primary/10 rounded-md flex items-center justify-center">
                                      <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Travel Details</p>
                                      <p className="text-xs font-medium text-gray-900">
                                        {lead.number_of_travelers || 'N/A'} travelers
                                      </p>
                                      {lead.travel_dates && (
                                        <p className="text-xs text-gray-600">{lead.travel_dates}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Notes */}
                                  {lead.custom_notes && (
                                    <div className="flex items-start space-x-2">
                                      <div className="h-6 w-6 bg-primary/10 rounded-md flex items-center justify-center mt-0.5">
                                        <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Notes</p>
                                        <p className="text-xs text-gray-700 line-clamp-2">{lead.custom_notes}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Card Footer */}
                            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                                  <span className="text-xs text-gray-600">Active Lead</span>
                                </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation() // Prevent card click navigation
                                if (isExpanded) {
                                  setExpandedLeads(prev => {
                                    const newSet = new Set(prev)
                                    newSet.delete(lead.id)
                                    return newSet
                                  })
                                } else {
                                  setExpandedLeads(prev => new Set(prev).add(lead.id))
                                }
                              }}
                              className="text-primary hover:text-primary/80 text-xs font-medium flex items-center space-x-1 transition-colors"
                            >
                                  <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                                  <svg className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                  </div>
                )}
              </>
            )}

            {showDetails && selected && (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
                  <div className="mt-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{selected.name}</h3>
                      <button
                        onClick={() => setShowDetails(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="h-40 bg-gray-100 mb-3 flex items-center justify-center">
                      {selected.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-sm">No Image</span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div><span className="font-medium">Destination:</span> {selected.destination}</div>
                      <div><span className="font-medium">Duration:</span> {selected.duration}</div>
                      <div><span className="font-medium">Category:</span> {selected.category}</div>
                      <div><span className="font-medium">Price:</span> ${selected.price.toLocaleString()}</div>
                      {selected.original_price > selected.price && (
                        <div className="text-gray-500 text-xs">Original: ${selected.original_price.toLocaleString()}</div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setShowDetails(false)}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
                </>
              )}

            {/* Removed static "Assigned To You" list */}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Confirm Logout</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to logout? You will need to sign in again to access your dashboard.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employeedashboard
