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
      // { name: 'Dashboard', href: '/', icon: HomeIcon },
      { name: 'Employees', href: '/employees', icon: UserGroupIcon }
    ]
  },
  {
    title: 'CRM',
    items: [
      { name: 'Leads', href: '/leads', icon: UserGroupIcon },
      { name: 'Bookings', href: '/bookings', icon: ClipboardDocumentListIcon },
      // { name: 'Payments', href: '/payments', icon: CurrencyDollarIcon },
      { name: 'Reports', href: '/reports', icon: ChartBarIcon }
    ]
  },
  {
    title: 'CMS',
    items: [
      { name: 'Website Edit', href: '/website-edit', icon: DocumentTextIcon },
      { name: 'Itenarary Builder', href: '/packages', icon: ClipboardDocumentListIcon },
      { name: 'Settings', href: '/settings', icon: CogIcon }
    ]
  }
]

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Pass search query to children components
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('searchQuery', { detail: query }))
    }
  }

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
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
        {/* Logo Section */}
        <div className="flex items-center justify-between h-12 px-3 border-b border-gray-100">
          {!sidebarCollapsed && (
            <Link to="/" className="relative inline-flex items-center px-2 py-1 rounded-md">
              <div className="absolute inset-0 rounded-md bg-primary" />
              <Image src={logo} alt="Travloger.in" width={120} height={24} priority className="relative z-10" />
            </Link>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <button
              className="hidden lg:block p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
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
        <nav className="flex-1 mt-4 px-2">
          <div className="space-y-3">
            {navigationSections.map((section, idx) => (
              <div key={idx}>
                {section.title && !sidebarCollapsed && (
                  <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    {section.title}
                  </div>
                )}
                <div className="space-y-1">
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
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <item.icon className={`h-4 w-4 ${
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                        } ${sidebarCollapsed ? '' : 'mr-3'}`} />
                        {!sidebarCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="flex-shrink-0 p-2 border-t border-gray-100">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'}`}>
            <div className="h-7 w-7 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-gray-500 truncate capitalize">{user?.role || 'User'}</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full mt-2 px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
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
          <div className="flex items-center justify-between h-12 px-4">
            <button
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            
            <div className="flex items-center justify-between w-full">
              {/* Left side - empty for now */}
              <div className="flex-1"></div>
              
              {/* Center - Search Bar */}
              <div className="relative flex-1 max-w-md mx-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search sections, content, and more..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white shadow-sm"
                />
              </div>
              
              {/* Right side */}
              <div className="flex items-center space-x-2">
                {/* Notifications Bell Icon */}
                <button className="relative p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-6-6V4c0-1.657-1.343-3-3-3S9 2.343 9 4v7l-6 6v1h12v-1zM12 22c1.103 0 2-.897 2-2h-4c0 1.103.897 2 2 2z" />
                  </svg>
                  <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                </button>
                
                {/* User Avatar with Logout Modal */}
                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="h-6 w-6 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors"
                  title="Click to logout"
                >
                  <span className="text-white text-xs font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </button>
              </div>
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
