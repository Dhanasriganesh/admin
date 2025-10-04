import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import bcrypt from 'bcryptjs'

// Type definitions
interface Employee {
  id: number
  name: string
  email: string
  phone: string
  destination: string
  role: string
  status: 'Active' | 'Inactive'
}

interface NewEmployee {
  name: string
  email: string
  phone: string
  destination: string
  password: string
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeStats, setEmployeeStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState<boolean>(false)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [activeEmployeeIds, setActiveEmployeeIds] = useState<number[]>([])
  const [loadingActiveStatus, setLoadingActiveStatus] = useState<boolean>(false)
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({ 
    name: '', 
    email: '', 
    phone: '', 
    destination: '',
    password: ''
  })
  
  // Destination autocomplete states
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([])
  const [showCreateDestinationDropdown, setShowCreateDestinationDropdown] = useState<boolean>(false)
  const [showEditDestinationDropdown, setShowEditDestinationDropdown] = useState<boolean>(false)
  const [filteredCreateDestinations, setFilteredCreateDestinations] = useState<string[]>([])
  const [filteredEditDestinations, setFilteredEditDestinations] = useState<string[]>([])
  const createDestinationRef = useRef<HTMLInputElement>(null)
  const editDestinationRef = useRef<HTMLInputElement>(null)

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setShowEditModal(true)
  }

  const handleDeleteEmployee = async () => {
    if (!editingEmployee) return
    const ok = window.confirm(`Delete employee "${editingEmployee.name}" (${editingEmployee.email})? This cannot be undone.`)
    if (!ok) return
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', editingEmployee.id)
      if (error) {
        alert(`Failed to delete employee: ${error.message}`)
        return
      }
      setEmployees(prev => prev.filter(e => e.id !== editingEmployee.id))
      setShowEditModal(false)
      setEditingEmployee(null)
      alert('Employee deleted successfully')
    } catch (e: any) {
      alert('Failed to delete employee')
    }
  }

  const handleDeleteEmployeeFromModal = async (employeeId: number): Promise<void> => {
    try {
      setDeleting(true)
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId)
      
      if (error) throw error
      
      setEmployees(employees.filter(emp => emp.id !== employeeId))
      setShowDeleteModal(false)
      setEmployeeToDelete(null)
      alert('Employee record deleted successfully')
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Failed to delete employee record')
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteModal = (employee: Employee): void => {
    setEmployeeToDelete(employee)
    setShowDeleteModal(true)
  }

  const openProfileModal = async (employee: Employee): Promise<void> => {
    setSelectedEmployee(employee)
    setShowProfileModal(true)
    setLoadingStats(true)
    
    try {
      const response = await fetch(`/api/employees/${employee.id}/stats`)
      const data = await response.json()
      
      if (response.ok && data.stats) {
        setEmployeeStats(data.stats)
      } else {
        console.error('Failed to fetch employee stats:', data.error)
        setEmployeeStats(null)
      }
    } catch (error) {
      console.error('Error fetching employee stats:', error)
      setEmployeeStats(null)
    } finally {
      setLoadingStats(false)
    }
  }

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

  // Fetch active employee sessions
  const fetchActiveSessions = async () => {
    try {
      setLoadingActiveStatus(true)
      const response = await fetch('/api/employees/active-sessions')
      const data = await response.json()
      if (data.activeEmployeeIds) {
        setActiveEmployeeIds(data.activeEmployeeIds)
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error)
    } finally {
      setLoadingActiveStatus(false)
    }
  }

  // Filter destinations based on input
  const filterDestinations = (input: string, destinations: string[]): string[] => {
    if (!input.trim()) return destinations
    return destinations.filter(dest => 
      dest.toLowerCase().includes(input.toLowerCase())
    )
  }

  // Handle destination input change for create modal
  const handleCreateDestinationChange = (value: string) => {
    setNewEmployee({ ...newEmployee, destination: value })
    const filtered = filterDestinations(value, availableDestinations)
    setFilteredCreateDestinations(filtered)
    setShowCreateDestinationDropdown(filtered.length > 0 && value.trim() !== '')
  }

  // Handle destination input change for edit modal
  const handleEditDestinationChange = (value: string) => {
    if (editingEmployee) {
      setEditingEmployee({ ...editingEmployee, destination: value })
      const filtered = filterDestinations(value, availableDestinations)
      setFilteredEditDestinations(filtered)
      setShowEditDestinationDropdown(filtered.length > 0 && value.trim() !== '')
    }
  }

  // Select destination from dropdown
  const selectCreateDestination = (destination: string) => {
    setNewEmployee({ ...newEmployee, destination })
    setShowCreateDestinationDropdown(false)
  }

  const selectEditDestination = (destination: string) => {
    if (editingEmployee) {
      setEditingEmployee({ ...editingEmployee, destination })
      setShowEditDestinationDropdown(false)
    }
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createDestinationRef.current && !createDestinationRef.current.contains(event.target as Node)) {
        setShowCreateDestinationDropdown(false)
      }
      if (editDestinationRef.current && !editDestinationRef.current.contains(event.target as Node)) {
        setShowEditDestinationDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter employees based on month, year, and location
  const getFilteredEmployees = (): Employee[] => {
    if (selectedMonth === 'all' && selectedYear === 'all' && selectedLocation === 'all') return employees

    const filteredEmployees = employees.filter(employee => {
      // For employees, we'll use a mock date since we don't have created_at in the interface
      // You might want to add created_at or joined_date to your Employee interface
      const employeeDate = new Date() // This should be employee.created_at or employee.joined_date
      const employeeMonth = (employeeDate.getMonth() + 1).toString() // getMonth() returns 0-11, so add 1
      const employeeYear = employeeDate.getFullYear().toString()

      const monthMatch = selectedMonth === 'all' || employeeMonth === selectedMonth
      const yearMatch = selectedYear === 'all' || employeeYear === selectedYear
      const locationMatch = selectedLocation === 'all' || employee.destination === selectedLocation

      return monthMatch && yearMatch && locationMatch
    })

    return filteredEmployees
  }

  const handleSaveEmployee = async () => {
    if (!editingEmployee) return

    if (!editingEmployee.phone || editingEmployee.phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number')
      return
    }

    // Normalize fields
    const normalizedEmail = (editingEmployee.email || '').trim().toLowerCase()
    const normalizedPhone = (editingEmployee.phone || '').trim()

    // Skip pre-check; rely on DB unique constraint for phone

    try {
      const { data, error } = await supabase
        .from('employees')
        .update({
          name: editingEmployee.name,
          email: normalizedEmail,
          phone: normalizedPhone,
          destination: editingEmployee.destination,
          role: editingEmployee.role,
          status: editingEmployee.status
        })
        .eq('id', editingEmployee.id)
        .select()
        .single()

      if (error) {
        const msg = error.message || ''
        alert(`Failed to update employee: ${msg}`)
        return
      }

      if (data) {
        // Update the employees list
        setEmployees(prev => prev.map(emp => 
          emp.id === editingEmployee.id 
            ? {
                id: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                destination: data.destination,
                role: data.role,
                status: data.status
              }
            : emp
        ))
        
        setShowEditModal(false)
        setEditingEmployee(null)
        alert('Employee updated successfully!')
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('Failed to update employee. Please try again.')
    }
  }

  // Fetch employees function
  const fetchEmployees = async (): Promise<void> => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('id', { ascending: false })
    
    if (!error && data) {
      setEmployees(data.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
        phone: e.phone,
        destination: e.destination,
        role: e.role || 'employee',
        status: e.status || 'Active'
      })))
    } else if (error && (error.code === '42P01' || /relation .* employees .* does not exist/i.test(error.message))) {
      // Table missing → call our provisioning endpoint then retry
      try {
        await fetch('/api/provision-employees')
        const retry = await supabase
          .from('employees')
          .select('*')
          .order('id', { ascending: false })
        
        if (!retry.error && retry.data) {
          setEmployees(retry.data.map(e => ({
            id: e.id,
            name: e.name,
            email: e.email,
            phone: e.phone,
            destination: e.destination,
            role: e.role || 'employee',
            status: e.status || 'Active'
          })))
        }
      } catch (_) {
        // Silently handle provisioning errors
      }
    } else if (error) {
      alert(`Employees fetch failed: ${error.message || 'Unknown error'}`)
    }
  }

  useEffect(() => {
    fetchEmployees()
    fetchDestinations()
    fetchActiveSessions()
    
    // Set up polling for active sessions every 30 seconds
    const interval = setInterval(fetchActiveSessions, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleCreateEmployee = async (): Promise<void> => {
    if (!newEmployee.phone || newEmployee.phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number')
      return
    }
    if (!newEmployee.password || newEmployee.password.length < 6) {
      alert('Please enter a password with at least 6 characters')
      return
    }
    const normalizedEmail = (newEmployee.email || '').trim().toLowerCase()
    const normalizedPhone = (newEmployee.phone || '').trim()
    
    // Skip pre-check; rely on DB unique constraint for phone
    
    const passwordHash = await bcrypt.hash(newEmployee.password, 10)

    // Create employee record first
    const payload = { 
      name: newEmployee.name,
      email: normalizedEmail,
      phone: normalizedPhone,
      destination: newEmployee.destination,
      role: 'employee', 
      status: 'Active',
      password_hash: passwordHash
    }
    
    const { data, error } = await supabase
      .from('employees')
      .insert(payload)
      .select()
      .single()
    
    if (error) {
      const msg = error.message || ''
      alert(`Failed to save employee: ${msg}`)
      return
    }

    if (!data) {
      alert('Failed to save employee: No data returned')
      return
    }

    // Create Supabase Auth user using admin API
    try {
      console.log('Creating Supabase Auth user for:', newEmployee.email)
      const authResponse = await fetch('/api/auth/create-employee-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: newEmployee.password,
          name: newEmployee.name,
          employeeId: data.id
        }),
      })

      const authResult = await authResponse.json()
      
      if (!authResponse.ok) {
        console.error('Auth user creation failed:', authResult)
        // Employee was created but auth user failed - continue with email sending
      } else {
        console.log('Auth user created successfully:', authResult)
        // Update employee with Supabase user ID
        await supabase
          .from('employees')
          .update({ supabase_user_id: authResult.userId })
          .eq('id', data.id)
      }
    } catch (authError) {
      console.error('Error creating auth user:', authError)
      // Continue with email sending even if auth user creation fails
    }

    if (data) {
      // Send email with credentials
      try {
        const emailResponse = await fetch('/api/email/send-credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newEmployee.name,
            email: normalizedEmail,
            password: newEmployee.password,
            role: 'employee',
            destination: newEmployee.destination
          }),
        })

        const emailResult = await emailResponse.json()

        setEmployees(prev => [{
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          destination: data.destination,
          role: data.role,
          status: data.status
        }, ...prev])
        setShowCreateModal(false)
        setNewEmployee({ name: '', email: '', phone: '', destination: '', password: '' })
        
        if (emailResult.success) {
          alert('Employee created successfully! Credentials have been sent to their email.')
        } else {
          alert('Employee created successfully! However, there was an issue sending the email. Please share credentials manually.')
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        setEmployees(prev => [{
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          destination: data.destination,
          role: data.role,
          status: data.status
        }, ...prev])
        setShowCreateModal(false)
        setNewEmployee({ name: '', email: '', phone: '', destination: '', password: '' })
        alert('Employee created successfully! However, there was an issue sending the email. Please share credentials manually.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Employee Management</h1>
              <p className="mt-2 text-sm text-gray-600">Manage your team members, roles, and performance</p>
            </div>
            
            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={() => {
                  fetchActiveSessions()
                  fetchEmployees()
                }}
                disabled={loadingActiveStatus}
                className="h-9 px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className={`h-4 w-4 ${loadingActiveStatus ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
              </button>
              
              {/* Cleanup Button */}
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/employees/cleanup-sessions', { method: 'POST' })
                    fetchActiveSessions()
                  } catch (error) {
                    console.error('Error cleaning up sessions:', error)
                  }
                }}
                className="h-9 px-3 py-1 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Cleanup
              </button>
              
              {/* Location Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="h-9 px-3 py-1 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="all">All Locations</option>
                  {availableDestinations.map((destination) => (
                    <option key={destination} value={destination}>
                      {destination}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Employee List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {getFilteredEmployees().length > 0 ? (
            <div className="divide-y divide-gray-200">
              {getFilteredEmployees().map((emp) => (
                <div key={emp.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center space-x-4 cursor-pointer flex-1"
                      onClick={() => openProfileModal(emp)}
                      title="Click to view employee profile and work statistics"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-primary font-semibold text-lg">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-semibold text-gray-900 truncate">{emp.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            activeEmployeeIds.includes(emp.id)
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {activeEmployeeIds.includes(emp.id) ? 'Active' : 'Offline'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{emp.email}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{emp.destination}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="capitalize">{emp.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditEmployee(emp)
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteModal(emp)
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500">
                {selectedLocation !== 'all' 
                  ? `No employees found in ${selectedLocation} location.`
                  : 'No employees have been added yet.'
                }
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Employee
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Employee Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="bg-primary px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Add Employee</h3>
                    <p className="text-white/80 text-xs">Create a new team member</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-1">
                  <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Basic Information</span>
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={newEmployee.phone}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                        setNewEmployee({ ...newEmployee, phone: digitsOnly })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-1">
                  <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Work Information</span>
                </h4>
                <div className="relative" ref={createDestinationRef}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Destination *</label>
                  <input
                    type="text"
                    value={newEmployee.destination}
                    onChange={(e) => handleCreateDestinationChange(e.target.value)}
                    onFocus={() => {
                      const filtered = filterDestinations(newEmployee.destination, availableDestinations)
                      setFilteredCreateDestinations(filtered)
                      setShowCreateDestinationDropdown(filtered.length > 0)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                    placeholder="Type to search destinations..."
                  />
                  {showCreateDestinationDropdown && filteredCreateDestinations.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredCreateDestinations.map((destination, index) => (
                        <div
                          key={index}
                          onClick={() => selectCreateDestination(destination)}
                          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          {destination}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-primary/5 px-4 py-3 border-t border-primary/20">
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEmployee}
                  className="px-3 py-1.5 bg-primary hover:opacity-90 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Create Employee</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="bg-primary px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Edit Employee</h3>
                    <p className="text-white/80 text-xs">Update employee information</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingEmployee(null)
                  }}
                  className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-1">
                  <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Basic Information</span>
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={editingEmployee.name}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={editingEmployee.email}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={editingEmployee.phone}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                        setEditingEmployee({ ...editingEmployee, phone: digitsOnly })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-1">
                  <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Work Information</span>
                </h4>
                <div className="relative" ref={editDestinationRef}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Destination *</label>
                  <input
                    type="text"
                    value={editingEmployee.destination}
                    onChange={(e) => handleEditDestinationChange(e.target.value)}
                    onFocus={() => {
                      const filtered = filterDestinations(editingEmployee.destination, availableDestinations)
                      setFilteredEditDestinations(filtered)
                      setShowEditDestinationDropdown(filtered.length > 0)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                    placeholder="Type to search destinations..."
                  />
                  {showEditDestinationDropdown && filteredEditDestinations.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredEditDestinations.map((destination, index) => (
                        <div
                          key={index}
                          onClick={() => selectEditDestination(destination)}
                          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          {destination}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={editingEmployee.role}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editingEmployee.status}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value as 'Active' | 'Inactive' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-primary/5 px-4 py-3 border-t border-primary/20">
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingEmployee(null)
                  }}
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEmployee}
                  className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={handleSaveEmployee}
                  className="px-3 py-1.5 bg-primary hover:opacity-90 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && employeeToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Employee Record</h3>
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
                  Are you sure you want to delete this employee record?
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {employeeToDelete.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {employeeToDelete.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Phone:</strong> {employeeToDelete.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Role:</strong> {employeeToDelete.role}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {employeeToDelete.status}
                  </p>
                </div>
                
                <p className="text-sm text-gray-500 mb-6">
                  This action cannot be undone. The employee record will be permanently removed from the database.
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
                    onClick={() => handleDeleteEmployeeFromModal(employeeToDelete.id)}
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

      {/* Employee Profile Modal */}
      {showProfileModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-medium text-primary">
                      {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedEmployee.name}</h3>
                    <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
                    <p className="text-xs text-gray-400">{selectedEmployee.destination}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowProfileModal(false)
                    setSelectedEmployee(null)
                    setEmployeeStats(null)
                  }} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {loadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading statistics...</span>
                </div>
              ) : employeeStats ? (
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{employeeStats.overview.totalLeadsAssigned}</div>
                      <div className="text-sm text-blue-800">Total Leads</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{employeeStats.overview.totalBookings}</div>
                      <div className="text-sm text-green-800">Bookings</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{employeeStats.overview.conversionRate}%</div>
                      <div className="text-sm text-purple-800">Conversion Rate</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">₹{employeeStats.overview.totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-yellow-800">Revenue</div>
                    </div>
                  </div>

                  {/* Leads Status */}
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Leads Status</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{employeeStats.leads.byStatus.new}</div>
                        <div className="text-sm text-gray-500">New Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{employeeStats.leads.byStatus.contacted}</div>
                        <div className="text-sm text-gray-500">Contacted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{employeeStats.leads.byStatus.converted}</div>
                        <div className="text-sm text-gray-500">Converted</div>
                      </div>
                    </div>
                  </div>

                  {/* Bookings Status */}
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Bookings Status</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{employeeStats.bookings.byStatus.pending}</div>
                        <div className="text-sm text-gray-500">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{employeeStats.bookings.byStatus.confirmed}</div>
                        <div className="text-sm text-gray-500">Confirmed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{employeeStats.bookings.byStatus.cancelled}</div>
                        <div className="text-sm text-gray-500">Cancelled</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Status</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{employeeStats.payments.byStatus.pending}</div>
                        <div className="text-sm text-gray-500">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{employeeStats.payments.byStatus.paid}</div>
                        <div className="text-sm text-gray-500">Paid</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{employeeStats.payments.byStatus.failed}</div>
                        <div className="text-sm text-gray-500">Failed</div>
                      </div>
                    </div>
                  </div>

                  {/* Destination Performance */}
                  {Object.keys(employeeStats.destinations).length > 0 && (
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Performance by Destination</h4>
                      <div className="space-y-2">
                        {Object.entries(employeeStats.destinations).map(([destination, stats]: [string, any]) => (
                          <div key={destination} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{destination}</span>
                            <div className="flex gap-4 text-sm">
                              <span className="text-blue-600">{stats.leads} leads</span>
                              <span className="text-green-600">{stats.bookings} bookings</span>
                              <span className="text-purple-600">₹{stats.revenue.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Leads</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {employeeStats.leads.recent.length > 0 ? (
                          employeeStats.leads.recent.map((lead: any) => (
                            <div key={lead.id} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{lead.name}</div>
                              <div className="text-gray-500">{lead.destination} • {lead.email}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(lead.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No leads assigned yet</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Bookings</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {employeeStats.bookings.recent.length > 0 ? (
                          employeeStats.bookings.recent.map((booking: any) => (
                            <div key={booking.id} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{booking.customer}</div>
                              <div className="text-gray-500">{booking.destination} • ₹{booking.amount?.toLocaleString()}</div>
                              <div className="text-xs text-gray-400">
                                {booking.status} • {new Date(booking.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No bookings yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Failed to load employee statistics</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default Employees
