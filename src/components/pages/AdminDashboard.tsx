import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface StatItem {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  href: string
  icon: string
}

const AdminDashboard: React.FC = () => {
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(true)
  
  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    totalLeads: 0,
    activeItineraries: 0,
    totalRevenue: 0,
    totalEmployees: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoadingStats(true)
        
        // Fetch all data in parallel
        const [leadsResponse, packagesResponse, bookingsResponse, employeesResponse] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/packages'),
          fetch('/api/bookings'),
          fetch('/api/employees')
        ])
        
        const [leadsData, packagesData, bookingsData, employeesData] = await Promise.all([
          leadsResponse.json(),
          packagesResponse.json(),
          bookingsResponse.json(),
          employeesResponse.json()
        ])
        
        // Calculate stats
        const totalLeads = leadsData.leads?.length || 0
        const activeItineraries = packagesData.packages?.length || 0
        const totalRevenue = bookingsData.bookings?.reduce((sum: number, booking: any) => {
          // Only include bookings that are paid
          if (booking.payment_status === 'Paid' || booking.paymentStatus === 'Paid') {
            return sum + (parseFloat(booking.amount) || 0)
          }
          return sum
        }, 0) || 0
        
        // Get total employees count
        const totalEmployees = employeesData.employees?.length || 0
        
        setDashboardStats({
          totalLeads,
          activeItineraries,
          totalRevenue,
          totalEmployees
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }
    
    fetchDashboardStats()
  }, [])

  // Fetch recent leads
  useEffect(() => {
    const fetchRecentLeads = async () => {
      try {
        const response = await fetch('/api/leads')
        const data = await response.json()
        if (response.ok) {
          // Get the 3 most recent leads
          const sortedLeads = (data.leads || [])
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
          setRecentLeads(sortedLeads)
        }
      } catch (error) {
        console.error('Error fetching leads:', error)
      } finally {
        setLoadingLeads(false)
      }
    }
    fetchRecentLeads()
  }, [])

  // Fetch upcoming bookings
  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      try {
        const response = await fetch('/api/bookings?status=Confirmed')
        const data = await response.json()
        if (response.ok) {
          // Get confirmed bookings sorted by travel date
          const sortedBookings = (data.bookings || [])
            .filter((b: any) => b.travel_date && new Date(b.travel_date) > new Date())
            .sort((a: any, b: any) => new Date(a.travel_date).getTime() - new Date(b.travel_date).getTime())
            .slice(0, 2)
          setUpcomingBookings(sortedBookings)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoadingBookings(false)
      }
    }
    fetchUpcomingBookings()
  }, [])

  const stats: StatItem[] = [
    { 
      name: 'Total Leads', 
      value: loadingStats ? '...' : (dashboardStats.totalLeads || 0).toString(), 
      change: '0% change from this week', 
      changeType: 'increase', 
      href: '/leads', 
      icon: '👥' 
    },
    { 
      name: 'Active Itineraries', 
      value: loadingStats ? '...' : (dashboardStats.activeItineraries || 0).toString(), 
      change: '0% change from past week', 
      changeType: 'increase', 
      href: '/packages', 
      icon: '🗺️' 
    },
    { 
      name: 'Total Revenue', 
      value: loadingStats ? '...' : `₹${(dashboardStats.totalRevenue || 0).toLocaleString()}`, 
      change: '0% change from this week', 
      changeType: 'increase', 
      href: '/payments', 
      icon: '📈' 
    },
    { 
      name: 'Total Employees', 
      value: loadingStats ? '...' : (dashboardStats.totalEmployees || 0).toString(), 
      change: '0% change from this week', 
      changeType: 'increase', 
      href: '/employees', 
      icon: '👨‍💼' 
    },
  ]

  // Quick Actions
  const quickActions = [
    {
      name: 'New Itinerary',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/packages'
    },
    {
      name: 'Add Lead',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: '/leads'
    },
    {
      name: 'Payment Link',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/payments'
    },
    {
      name: 'View Reports',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      href: '/reports'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome to your Travloger Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.href} className="block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-xs ${
                      stat.changeType === 'increase' ? 'text-primary' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className="text-2xl">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Leads and Upcoming Bookings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Leads */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Recent Leads</h3>
            <p className="text-sm text-gray-600">Latest inquiries from potential customers</p>
          </div>
          <div className="p-6">
            {loadingLeads ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading leads...</p>
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm text-gray-500">No recent leads</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900">{lead.name || 'Unknown'}</h4>
                          {lead.email && (
                            <p className="text-xs text-gray-600 flex items-center mt-1">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {lead.email}
                            </p>
                          )}
                          {lead.phone && (
                            <p className="text-xs text-gray-600 flex items-center mt-1">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {lead.phone}
                            </p>
                          )}
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                            {lead.source && <span>{lead.source}</span>}
                            {lead.destination && (
                              <>
                                <span>•</span>
                                <span>{lead.destination}</span>
                              </>
                            )}
                            {lead.created_at && (
                              <>
                                <span>•</span>
                                <span>{new Date(lead.created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} {Math.floor((Date.now() - new Date(lead.created_at).getTime()) / 3600000)} hours ago</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {lead.status && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              {lead.status}
                            </span>
                          )}
                          <Link
                            to={`/leads`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Upcoming Bookings</h3>
            <p className="text-sm text-gray-600">Confirmed trips starting soon</p>
          </div>
          <div className="p-6">
            {loadingBookings ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading bookings...</p>
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">No upcoming bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{booking.customer || booking.package_name}</h4>
                            <p className="text-sm text-gray-600">{booking.destination}</p>
                            {booking.travel_date && (
                              <p className="text-xs text-gray-500 mt-1">
                                Start: {new Date(booking.travel_date).toISOString().split('T')[0]} • {booking.travelers || 1} guests
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              confirmed
                            </span>
                            <Link
                              to="/bookings"
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              ))}
                <Link
                  to="/bookings"
                  className="block text-center py-3 text-sm font-medium text-gray-700 hover:text-blue-600 border-t border-gray-200"
                >
                  View All Bookings
                </Link>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
            >
              <div className="text-gray-700 group-hover:text-blue-600 transition-colors mb-3">
                {action.icon}
                  </div>
              <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {action.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}

export default AdminDashboard
