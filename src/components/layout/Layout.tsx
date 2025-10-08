'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import logo from '../../assets/images/logo.png'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  PhotoIcon,
  DocumentTextIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '../ui/Icons'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavigationSection {
  title?: string
  items: NavigationItem[]
}

interface LayoutProps {
  children: React.ReactNode
}

const navigationSections: NavigationSection[] = [
  {
    items: [
      { name: 'Dashboard', href: '/', icon: HomeIcon },
      { name: 'Employees', href: '/employees', icon: UserGroupIcon }
    ]
  },
  {
    items: [
    
      { name: 'Leads', href: '/leads', icon: UserGroupIcon },
      { name: 'Bookings', href: '/bookings', icon: ClipboardDocumentListIcon },
      { name: 'Payments', href: '/payments', icon: CurrencyRupeeIcon },
      { name: 'Reports', href: '/reports', icon: ChartBarIcon }
    ]
  },
  {
    items: [
      { name: 'Website Edit', href: '/website-edit', icon: DocumentTextIcon },
      { name: 'Itinarary Builder', href: '/packages', icon: ClipboardDocumentListIcon },
      { name: 'Users', href: '/users', icon: UserGroupIcon },
      { name: 'Settings', href: '/settings', icon: CogIcon }
    ]
  }
]

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  // Handle logout
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const confirmLogout = () => {
    setShowLogoutModal(false)
    handleLogout()
  }

  // Don't render layout for auth pages
  if (location.pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={() => setSidebarOpen(false)} 
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'w-20 bg-slate-800' : 'w-56 bg-slate-800 shadow-xl'}`}>
        {/* Logo Section */}
        <div className={`flex items-center justify-between h-14 px-3 py-2 border-b ${
          sidebarCollapsed ? 'bg-slate-800 border-gray-600' : 'bg-slate-800 border-gray-600'
        }`}>
          {!sidebarCollapsed && (
            <Link to="/" className="inline-flex items-center px-2 py-1">
              <Image src={logo} alt="Travloger.in" width={120} height={24} priority />
            </Link>
          )}
          {sidebarCollapsed && (
            <div className="flex items-center justify-center w-full">
              <span className="text-gray-200 text-[10px] font-medium">travloger</span>
            </div>
          )}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-1'}`}>
            <button
              className={`hidden lg:block p-1.5 rounded-md transition-colors ${
                sidebarCollapsed 
                  ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700' 
                  : 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
              }`}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="h-4 w-4" />
              ) : (
                <ChevronLeftIcon className="h-4 w-4" />
              )}
            </button>
            <button
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 flex flex-col ${sidebarCollapsed ? 'px-2 py-4' : 'px-3 py-4'}`}>
          <div className="flex flex-col justify-evenly flex-1">
            {navigationSections.map((section, idx) => (
              <React.Fragment key={idx}>
                {section.title && !sidebarCollapsed && (
                  <div className="px-3 pb-2 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => {
                        // Close mobile sidebar when navigation item is clicked
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false)
                        }
                      }}
                      className={`group flex items-center transition-all duration-200 relative ${
                        sidebarCollapsed 
                          ? `justify-center p-3 ${isActive ? 'bg-gray-300 rounded-lg' : ''}`
                          : `px-3 py-2.5 text-sm font-semibold rounded-lg ${
                              isActive
                                ? 'bg-gray-300 text-gray-800'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                            }`
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      {/* Active indicator line for expanded sidebar */}
                      {isActive && !sidebarCollapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                      )}
                      
                      <item.icon className={`flex-shrink-0 ${
                        sidebarCollapsed 
                          ? 'h-7 w-7' + (isActive ? ' text-gray-700' : ' text-gray-300')
                          : 'h-6 w-6' + (isActive ? ' text-gray-800' : ' text-gray-300 group-hover:text-gray-100')
                      } ${sidebarCollapsed ? '' : 'mr-3'}`} />
                      {!sidebarCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className={`flex-shrink-0 border-t ${
          sidebarCollapsed ? 'p-2 border-gray-600' : 'p-2 border-gray-600'
        }`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'}`}>
            <div className={`rounded-full flex items-center justify-center ${
              sidebarCollapsed ? 'h-8 w-8 bg-gray-600' : 'h-7 w-7 bg-primary'
            }`}>
              <span className={`text-white font-medium ${
                sidebarCollapsed ? 'text-sm' : 'text-xs'
              }`}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-200 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-gray-400 truncate capitalize">{user?.role || 'User'}</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full mt-2 px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
            >
              Sign out
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-3">
            <button
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            
            <div className="flex items-center justify-end w-full gap-4">
              {/* User Profile with Avatar and Info */}
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                title="Click to logout"
              >
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-700 text-sm font-semibold">
                    {user?.name?.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase() || 'AD'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || 'admin@travloger.com'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="w-full max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with light transparency */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Logout
              </h3>
              
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to logout? You will need to sign in again to access the admin panel.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout
