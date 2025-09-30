import React, { useState } from 'react'

interface LeadSource {
  source: string
  count: number
  percentage: number
  revenue: number
}

interface AgentPerformance {
  name: string
  leads: number
  bookings: number
  revenue: number
  conversion: number
}

interface MonthlyRevenue {
  month: string
  revenue: number
  bookings: number
}

interface PackagePerformance {
  package: string
  bookings: number
  revenue: number
  avgPrice: number
}

type PeriodType = 'week' | 'month' | 'quarter' | 'year'

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month')

  const leadSources: LeadSource[] = [
    { source: 'Google Ads', count: 245, percentage: 35, revenue: 12500 },
    { source: 'Website', count: 180, percentage: 26, revenue: 9800 },
    { source: 'WhatsApp', count: 150, percentage: 21, revenue: 7500 },
    { source: 'Phone', count: 125, percentage: 18, revenue: 6200 }
  ]

  const agentPerformance: AgentPerformance[] = [
    { name: 'Sarah Wilson', leads: 45, bookings: 12, revenue: 15600, conversion: 26.7 },
    { name: 'Mike Johnson', leads: 38, bookings: 15, revenue: 18900, conversion: 39.5 },
    { name: 'Lisa Davis', leads: 42, bookings: 11, revenue: 14200, conversion: 26.2 },
    { name: 'David Brown', leads: 35, bookings: 9, revenue: 11800, conversion: 25.7 }
  ]

  const monthlyRevenue: MonthlyRevenue[] = [
    { month: 'Jan', revenue: 12500, bookings: 12 },
    { month: 'Feb', revenue: 18900, bookings: 18 },
    { month: 'Mar', revenue: 14200, bookings: 14 },
    { month: 'Apr', revenue: 21800, bookings: 22 },
    { month: 'May', revenue: 16200, bookings: 16 },
    { month: 'Jun', revenue: 19500, bookings: 19 }
  ]

  const packagePerformance: PackagePerformance[] = [
    { package: 'Bali Adventure', bookings: 15, revenue: 37500, avgPrice: 2500 },
    { package: 'European Tour', bookings: 12, revenue: 50400, avgPrice: 4200 },
    { package: 'Thailand Discovery', bookings: 18, revenue: 32400, avgPrice: 1800 },
    { package: 'Japan Experience', bookings: 8, revenue: 25600, avgPrice: 3200 },
    { package: 'Dubai Luxury', bookings: 6, revenue: 24000, avgPrice: 4000 }
  ]

  const getConversionColor = (rate: number): string => {
    if (rate >= 35) return 'text-primary'
    if (rate >= 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Track performance and business insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">$103,200</dd>
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
                  <span className="text-white text-sm font-medium">📈</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">29.5%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                  <dd className="text-lg font-medium text-gray-900">700</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✈️</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                  <dd className="text-lg font-medium text-gray-900">59</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Lead Sources */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lead Sources</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {leadSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">{source.source}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{source.count} leads</span>
                    <span className="text-sm font-medium text-gray-900">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Agent Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {agentPerformance.map((agent, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.leads} leads • {agent.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${agent.revenue.toLocaleString()}</p>
                    <p className={`text-xs font-medium ${getConversionColor(agent.conversion)}`}>
                      {agent.conversion}% conversion
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Monthly Revenue Trend</h3>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end justify-between space-x-2">
            {monthlyRevenue.map((month, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-primary rounded-t mb-2" 
                  style={{ height: `${(month.revenue / 25000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500">{month.month}</span>
                <span className="text-xs text-gray-400">${month.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Package Performance */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Package Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packagePerformance.map((pkg, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pkg.package}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pkg.bookings}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pkg.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pkg.avgPrice.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
