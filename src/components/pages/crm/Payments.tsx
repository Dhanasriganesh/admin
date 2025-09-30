import React, { useState } from 'react'

interface VendorPayment {
  vendor: string
  amount: number
  status: 'Paid' | 'Pending'
  date: string
}

interface Payment {
  id: number
  bookingId: number
  customer: string
  package: string
  amount: number
  paidAmount: number
  remainingAmount: number
  paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Overdue'
  paymentMethod: string
  paymentDate: string | null
  dueDate: string
  transactionId: string | null
  vendorPayments: VendorPayment[]
}

type FilterType = 'all' | 'paid' | 'partial' | 'pending'

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 1,
      bookingId: 101,
      customer: 'Sarah Wilson',
      package: 'Bali Adventure',
      amount: 2500,
      paidAmount: 2500,
      remainingAmount: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
      paymentDate: '2024-01-15',
      dueDate: '2024-01-15',
      transactionId: 'TXN-001234',
      vendorPayments: [
        { vendor: 'Hotel Paradise', amount: 800, status: 'Paid', date: '2024-01-20' },
        { vendor: 'Transport Co', amount: 400, status: 'Pending', date: '2024-01-25' },
        { vendor: 'Guide Services', amount: 300, status: 'Paid', date: '2024-01-18' }
      ]
    },
    {
      id: 2,
      bookingId: 102,
      customer: 'David Brown',
      package: 'European Tour',
      amount: 4200,
      paidAmount: 2100,
      remainingAmount: 2100,
      paymentStatus: 'Partial',
      paymentMethod: 'Bank Transfer',
      paymentDate: '2024-01-14',
      dueDate: '2024-02-14',
      transactionId: 'TXN-001235',
      vendorPayments: [
        { vendor: 'Hotel Chain', amount: 1200, status: 'Paid', date: '2024-01-22' },
        { vendor: 'Airline Co', amount: 1800, status: 'Pending', date: '2024-01-30' },
        { vendor: 'Tour Guide', amount: 500, status: 'Pending', date: '2024-02-05' }
      ]
    },
    {
      id: 3,
      bookingId: 103,
      customer: 'Lisa Garcia',
      package: 'Thailand Discovery',
      amount: 1800,
      paidAmount: 1800,
      remainingAmount: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'PayPal',
      paymentDate: '2024-01-13',
      dueDate: '2024-01-13',
      transactionId: 'TXN-001236',
      vendorPayments: [
        { vendor: 'Resort Thailand', amount: 600, status: 'Paid', date: '2024-01-19' },
        { vendor: 'Local Transport', amount: 300, status: 'Paid', date: '2024-01-17' },
        { vendor: 'Activities Co', amount: 400, status: 'Paid', date: '2024-01-16' }
      ]
    },
    {
      id: 4,
      bookingId: 104,
      customer: 'John Doe',
      package: 'Japan Experience',
      amount: 3200,
      paidAmount: 0,
      remainingAmount: 3200,
      paymentStatus: 'Pending',
      paymentMethod: 'Credit Card',
      paymentDate: null,
      dueDate: '2024-01-20',
      transactionId: null,
      vendorPayments: []
    }
  ])

  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true
    return payment.paymentStatus.toLowerCase() === filter.toLowerCase()
  })

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Paid': return 'bg-primary/10 text-primary'
      case 'Partial': return 'bg-yellow-100 text-yellow-800'
      case 'Pending': return 'bg-red-100 text-red-800'
      case 'Overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVendorStatusColor = (status: string): string => {
    switch (status) {
      case 'Paid': return 'bg-primary/10 text-primary'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openPaymentDetails = (payment: Payment): void => {
    setSelectedPayment(payment)
    setShowModal(true)
  }

  const totalRevenue = payments
    .filter(p => p.paymentStatus === 'Paid')
    .reduce((sum, payment) => sum + payment.paidAmount, 0)

  const pendingAmount = payments
    .filter(p => p.paymentStatus !== 'Paid')
    .reduce((sum, payment) => sum + payment.remainingAmount, 0)

  const overduePayments = payments.filter(p => 
    p.paymentStatus !== 'Paid' && 
    new Date(p.dueDate) < new Date()
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-600">Track payments and vendor transactions</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors">
          Record Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Amount</dt>
                  <dd className="text-lg font-medium text-gray-900">${pendingAmount.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">!</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                  <dd className="text-lg font-medium text-gray-900">{overduePayments.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Paid</dt>
                  <dd className="text-lg font-medium text-gray-900">{payments.filter(p => p.paymentStatus === 'Paid').length}</dd>
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
            All ({payments.length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'paid' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paid ({payments.filter(p => p.paymentStatus === 'Paid').length})
          </button>
          <button
            onClick={() => setFilter('partial')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'partial' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Partial ({payments.filter(p => p.paymentStatus === 'Partial').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'pending' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({payments.filter(p => p.paymentStatus === 'Pending').length})
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredPayments.map((payment) => (
            <li key={payment.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">💰</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{payment.customer}</div>
                      <div className="text-sm text-gray-500">{payment.package}</div>
                      <div className="text-xs text-gray-400">Booking ID: #{payment.bookingId}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">${payment.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        Paid: ${payment.paidAmount.toLocaleString()}
                        {payment.remainingAmount > 0 && (
                          <span className="text-red-500"> • Due: ${payment.remainingAmount.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                      {payment.paymentStatus}
                    </span>
                    <span className="text-xs text-gray-500">{payment.paymentMethod}</span>
                    <button
                      onClick={() => openPaymentDetails(payment)}
                      className="text-primary hover:opacity-80 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-400">
                    {payment.transactionId && `Transaction: ${payment.transactionId} • `}
                    Due: {payment.dueDate}
                    {payment.paymentDate && ` • Paid: ${payment.paymentDate}`}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Payment Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Customer Payment</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <p className="text-sm text-gray-900">{selectedPayment.customer}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Package</label>
                    <p className="text-sm text-gray-900">{selectedPayment.package}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <p className="text-sm text-gray-900">${selectedPayment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                    <p className="text-sm text-gray-900">${selectedPayment.paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remaining</label>
                    <p className="text-sm text-gray-900">${selectedPayment.remainingAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <p className="text-sm text-gray-900">{selectedPayment.paymentMethod}</p>
                  </div>
                  {selectedPayment.transactionId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                      <p className="text-sm text-gray-900">{selectedPayment.transactionId}</p>
                    </div>
                  )}
                </div>

                {/* Vendor Payments */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Vendor Payments</h4>
                  {selectedPayment.vendorPayments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPayment.vendorPayments.map((vendor, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{vendor.vendor}</p>
                              <p className="text-xs text-gray-500">Due: {vendor.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">${vendor.amount}</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVendorStatusColor(vendor.status)}`}>
                                {vendor.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No vendor payments recorded</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
                {selectedPayment.paymentStatus !== 'Paid' && (
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90">
                    Record Payment
                  </button>
                )}
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90">
                  Pay Vendors
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments
