import React, { useState } from 'react'

interface Booking {
  id: number
  customer: string
  email: string
  phone: string
  package: string
  destination: string
  duration: string
  travelers: number
  amount: number
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed'
  bookingDate: string
  travelDate: string
  paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Refunded'
  assignedAgent: string
}

type FilterType = 'all' | 'confirmed' | 'pending' | 'cancelled'

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      customer: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+1-555-0123',
      package: 'Bali Adventure',
      destination: 'Bali, Indonesia',
      duration: '7 days',
      travelers: 2,
      amount: 2500,
      status: 'Confirmed',
      bookingDate: '2024-01-15',
      travelDate: '2024-03-15',
      paymentStatus: 'Paid',
      assignedAgent: 'Mike Johnson'
    },
    {
      id: 2,
      customer: 'David Brown',
      email: 'david@example.com',
      phone: '+1-555-0124',
      package: 'European Tour',
      destination: 'Paris, Rome, Barcelona',
      duration: '10 days',
      travelers: 4,
      amount: 4200,
      status: 'Pending',
      bookingDate: '2024-01-14',
      travelDate: '2024-04-20',
      paymentStatus: 'Partial',
      assignedAgent: 'Sarah Wilson'
    },
    {
      id: 3,
      customer: 'Lisa Garcia',
      email: 'lisa@example.com',
      phone: '+1-555-0125',
      package: 'Thailand Discovery',
      destination: 'Bangkok, Chiang Mai',
      duration: '8 days',
      travelers: 2,
      amount: 1800,
      status: 'Confirmed',
      bookingDate: '2024-01-13',
      travelDate: '2024-02-28',
      paymentStatus: 'Paid',
      assignedAgent: 'Mike Johnson'
    },
    {
      id: 4,
      customer: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0126',
      package: 'Japan Experience',
      destination: 'Tokyo, Kyoto, Osaka',
      duration: '12 days',
      travelers: 1,
      amount: 3200,
      status: 'Cancelled',
      bookingDate: '2024-01-12',
      travelDate: '2024-05-10',
      paymentStatus: 'Refunded',
      assignedAgent: 'Sarah Wilson'
    }
  ])

  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredBookings = bookings.filter(booking => {
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

  const handleStatusUpdate = (bookingId: number, newStatus: Booking['status']): void => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ))
  }

  const openBookingDetails = (booking: Booking): void => {
    setSelectedBooking(booking)
    setShowModal(true)
  }

  const totalRevenue = bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, booking) => sum + booking.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600">Manage travel bookings and customer reservations</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors">
          Create New Booking
        </button>
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
                  <span className="text-white text-sm font-medium">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${totalRevenue.toLocaleString()}</dd>
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

      {/* Bookings Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
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
                      <div className="text-xs text-gray-400">{booking.destination} • {booking.duration} • {booking.travelers} travelers</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">${booking.amount.toLocaleString()}</div>
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
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-400">Booking ID: #{booking.id} • Agent: {booking.assignedAgent} • Booked on {booking.bookingDate}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
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
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-sm text-gray-900">{selectedBooking.customer}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Package</label>
                  <p className="text-sm text-gray-900">{selectedBooking.package}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination</label>
                  <p className="text-sm text-gray-900">{selectedBooking.destination}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration & Travelers</label>
                  <p className="text-sm text-gray-900">{selectedBooking.duration} for {selectedBooking.travelers} travelers</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-sm text-gray-900">${selectedBooking.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Travel Date</label>
                  <p className="text-sm text-gray-900">{selectedBooking.travelDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <p className="text-sm text-gray-900">{selectedBooking.paymentStatus}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Agent</label>
                  <p className="text-sm text-gray-900">{selectedBooking.assignedAgent}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90">
                  Send Itinerary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings
