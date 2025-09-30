import React from 'react'
import { Link } from 'react-router-dom'

interface StatItem {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  href: string
  icon: string
}

interface ChartDataItem {
  month?: string
  city?: string
  value: number
  height: string
}

const AdminDashboard: React.FC = () => {
  const stats: StatItem[] = [
    { name: 'Total Leads', value: '1,000', change: '1.5% up from this week', changeType: 'increase', href: '/leads', icon: '👥' },
    { name: 'Pending Approvals', value: '4,900', change: '1.3% up from past week', changeType: 'increase', href: '/approvals', icon: '✓' },
    { name: 'Total Revenue', value: '₹87,000', change: '4.3% Down from this week', changeType: 'decrease', href: '/payments', icon: '📈' },
    { name: 'Active Cities', value: '12', change: '1.8% up from this week', changeType: 'increase', href: '/reports', icon: '📁' },
  ]

  const revenueData: ChartDataItem[] = [
    { month: 'Jan', value: 25, height: 'h-16' },
    { month: 'Feb', value: 35, height: 'h-20' },
    { month: 'Mar', value: 30, height: 'h-18' },
    { month: 'Apr', value: 45, height: 'h-24' },
    { month: 'May', value: 40, height: 'h-22' },
    { month: 'Jun', value: 50, height: 'h-28' },
    { month: 'Jul', value: 87, height: 'h-32' },
    { month: 'Aug', value: 65, height: 'h-26' },
    { month: 'Sep', value: 55, height: 'h-24' },
    { month: 'Oct', value: 70, height: 'h-28' },
    { month: 'Nov', value: 60, height: 'h-25' },
    { month: 'Dec', value: 75, height: 'h-30' }
  ]

  const cityData: ChartDataItem[] = [
    { city: 'Bangalore', value: 45, height: 'h-28' },
    { city: 'Delhi', value: 35, height: 'h-22' },
    { city: 'Vizag', value: 25, height: 'h-16' },
    { city: 'Chennai', value: 30, height: 'h-18' },
    { city: 'Hyderabad', value: 20, height: 'h-12' },
    { city: 'Pune', value: 15, height: 'h-10' }
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue Trends Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-base font-medium text-gray-900">Revenue Trends</h3>
          </div>
          <div className="p-4">
            <div className="h-56 flex items-end justify-between space-x-1.5">
              {revenueData.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-5 bg-primary rounded-t ${item.height} mb-2`}></div>
                  <span className="text-xs text-gray-500">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-600">Revenue in ₹ (Thousands)</p>
            </div>
          </div>
        </div>

        {/* City-wise Contributions Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-base font-medium text-gray-900">City-wise Contributions</h3>
          </div>
          <div className="p-4">
            <div className="h-56 flex items-end justify-between space-x-1.5">
              {cityData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className={`w-full bg-primary rounded-t ${item.height} mb-2`}></div>
                  <span className="text-[11px] text-gray-500 text-center">{item.city}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-600">Contributions in ₹ (Thousands)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900">Pending Approvals</h3>
            <button className="text-xs text-primary hover:opacity-80">View all</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Name/ID</th>
                <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">City/Division</th>
                <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full mr-2"></div>
                    <span className="text-xs text-gray-900">Volunteer</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs text-gray-900">Rajesh Shah - SCI02467</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs text-gray-900">Hyderabad - Engineering Unit</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs text-gray-900">02 August 2025</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button className="bg-primary text-white px-2.5 py-1 rounded text-xs hover:opacity-90">
                      Approve
                    </button>
                    <button className="bg-red-500 text-white px-2.5 py-1 rounded text-xs hover:bg-red-600">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
