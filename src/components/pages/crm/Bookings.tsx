import React, { useState, useEffect } from 'react'

interface Booking {
  id: number
  customer: string
  email: string
  phone: string
  package: string
  package_name?: string
  destination: string
  duration: string
  travelers: number
  amount: number
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed'
  bookingDate: string
  booking_date?: string
  travelDate: string
  travel_date?: string
  paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Refunded'
  payment_status?: string
  assignedAgent: string
  assigned_agent?: string
  lead_id?: string
  itinerary_details?: any
  razorpay_payment_link?: string
}

type FilterType = 'all' | 'confirmed' | 'pending' | 'cancelled'

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bookings')
      const data = await response.json()
      
      if (response.ok) {
        // Normalize the booking data
        const normalizedBookings = (data.bookings || []).map((booking: any) => ({
          id: booking.id,
          customer: booking.customer,
          email: booking.email,
          phone: booking.phone || '',
          package: booking.package_name || booking.package || 'N/A',
          destination: booking.destination,
          duration: booking.duration || 'N/A',
          travelers: booking.travelers || 1,
          amount: parseFloat(booking.amount) || 0,
          status: booking.status || 'Pending',
          bookingDate: booking.booking_date || booking.bookingDate || new Date().toISOString().split('T')[0],
          travelDate: booking.travel_date || booking.travelDate || '',
          paymentStatus: booking.payment_status || booking.paymentStatus || 'Pending',
          assignedAgent: booking.assigned_agent || booking.assignedAgent || 'Unassigned',
          lead_id: booking.lead_id,
          itinerary_details: booking.itinerary_details,
          razorpay_payment_link: booking.razorpay_payment_link
        }))
        setBookings(normalizedBookings)
        setError(null)
      } else {
        setError(data.error || 'Failed to load bookings')
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  // Filter bookings based on month and year
  const getFilteredBookings = (): Booking[] => {
    if (selectedMonth === 'all' && selectedYear === 'all') return bookings

    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate)
      const bookingMonth = (bookingDate.getMonth() + 1).toString() // getMonth() returns 0-11, so add 1
      const bookingYear = bookingDate.getFullYear().toString()

      const monthMatch = selectedMonth === 'all' || bookingMonth === selectedMonth
      const yearMatch = selectedYear === 'all' || bookingYear === selectedYear

      return monthMatch && yearMatch
    })

    return filteredBookings
  }

  const filteredBookings = getFilteredBookings().filter(booking => {
    if (filter === 'all') return true
    return booking.status.toLowerCase() === filter.toLowerCase()
  })

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Confirmed': return 'bg-primary/10 text-primary'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      case 'Completed': return 'bg-primary/10 text-primary'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'Paid': return 'bg-primary/10 text-primary'
      case 'Partial': return 'bg-yellow-100 text-yellow-800'
      case 'Pending': return 'bg-orange-100 text-orange-800'
      case 'Refunded': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusUpdate = async (bookingId: number, newStatus: Booking['status']): Promise<void> => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: newStatus })
      })
      
      if (response.ok) {
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        ))
      } else {
        const data = await response.json()
        alert('Failed to update booking: ' + (data.error || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking status')
    }
  }

  const openBookingDetails = (booking: Booking): void => {
    setSelectedBooking(booking)
    setShowModal(true)
  }

  const handleDeleteBooking = async (bookingId: number): Promise<void> => {
    try {
      setDeleting(true)
      const response = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId })
      })
      
      if (response.ok) {
        setBookings(bookings.filter(booking => booking.id !== bookingId))
        setShowDeleteModal(false)
        setBookingToDelete(null)
        alert('Booking record deleted successfully')
      } else {
        const data = await response.json()
        alert('Failed to delete booking: ' + (data.error || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking record')
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteModal = (booking: Booking): void => {
    setBookingToDelete(booking)
    setShowDeleteModal(true)
  }

  const totalRevenue = bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, booking) => sum + booking.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Travel Bookings</h1>
          <p className="text-gray-600">Manage travel packages, itineraries, and customer details</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Month Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          
          {/* Year Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
          <div className="flex space-x-2">
            {getFilteredBookings().filter(b => b.status === 'Cancelled').length > 0 && (
              <button 
                onClick={() => {
                  const cancelledBookings = getFilteredBookings().filter(b => b.status === 'Cancelled')
                  if (confirm(`Delete ${cancelledBookings.length} cancelled booking records? This action cannot be undone.`)) {
                    // Bulk delete cancelled bookings
                    cancelledBookings.forEach(booking => {
                      handleDeleteBooking(booking.id)
                    })
                  }
                }}
                className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-sm"
              >
                Clean Cancelled ({getFilteredBookings().filter(b => b.status === 'Cancelled').length})
              </button>
            )}
            <button className="bg-gray-600 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors text-sm">
              Create New Booking
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">B</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                  <dd className="text-lg font-medium text-gray-900">{bookings.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Confirmed</dt>
                  <dd className="text-lg font-medium text-gray-900">{bookings.filter(b => b.status === 'Confirmed').length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">⏳</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">{bookings.filter(b => b.status === 'Pending').length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">₹</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'confirmed' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Confirmed ({bookings.filter(b => b.status === 'Confirmed').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'pending' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({bookings.filter(b => b.status === 'Pending').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'cancelled' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelled ({bookings.filter(b => b.status === 'Cancelled').length})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button onClick={fetchBookings} className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium">
            Try Again
          </button>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium mb-2">No bookings found</p>
              <p className="text-sm">Bookings will appear here once customers make payments.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
            <li key={booking.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-700">✈</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{booking.customer}</div>
                      <div className="text-sm text-gray-500">{booking.package}</div>
                      <div className="text-xs text-gray-400">
                        📍 {booking.destination} • ⏱️ {booking.duration} • 👥 {booking.travelers} travelers
                      </div>
                      {booking.email && (
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          📧 {booking.email}
                        </div>
                      )}
                      {booking.phone && (
                        <div className="text-xs text-gray-400 flex items-center">
                          📞 {booking.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">₹{booking.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Travel: {booking.travelDate}</div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusUpdate(booking.id, e.target.value as Booking['status'])}
                      className={`text-xs font-semibold rounded-full border-0 ${getStatusColor(booking.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      onClick={() => openBookingDetails(booking)}
                      className="text-primary hover:opacity-80 text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => openDeleteModal(booking)}
                      className="text-red-500 hover:text-red-600 text-xs font-medium"
                      title="Delete Booking Record"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-400">Booking ID: #{booking.id} • Agent: {booking.assignedAgent} • Booked on {booking.bookingDate}</p>
                </div>
              </div>
            </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer & Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Customer Information</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <p className="text-sm text-gray-900">{selectedBooking.customer}</p>
                  </div>
                  {selectedBooking.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedBooking.email}</p>
                    </div>
                  )}
                  {selectedBooking.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedBooking.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned Agent</label>
                    <p className="text-sm text-gray-900">{selectedBooking.assignedAgent}</p>
                  </div>
                </div>

                {/* Travel Package Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Travel Package Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Package Name</label>
                    <p className="text-sm text-gray-900">{selectedBooking.package}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destination</label>
                    <p className="text-sm text-gray-900">📍 {selectedBooking.destination}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <p className="text-sm text-gray-900">⏱️ {selectedBooking.duration}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Travelers</label>
                    <p className="text-sm text-gray-900">👥 {selectedBooking.travelers} travelers</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Travel Date</label>
                    <p className="text-sm text-gray-900">📅 {selectedBooking.travelDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Booking Date</label>
                    <p className="text-sm text-gray-900">📅 {selectedBooking.bookingDate}</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <p className="text-lg font-semibold text-gray-900">₹{selectedBooking.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                >
                  Close
                </button>
                <button className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
                  📧 Send Itinerary
                </button>
                <button className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm">
                  📋 View Full Itinerary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookingToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Booking Record</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Are you sure you want to delete this booking record?
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Customer:</strong> {bookingToDelete.customer}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Package:</strong> {bookingToDelete.package}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Destination:</strong> {bookingToDelete.destination}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Amount:</strong> ₹{bookingToDelete.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {bookingToDelete.status}
                  </p>
                </div>
                
                <p className="text-sm text-gray-500 mb-6">
                  This action cannot be undone. The booking record will be permanently removed from the database.
                </p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteBooking(bookingToDelete.id)}
                    className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50"
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Record'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings
