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

  useEffect(() => {
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
    fetchEmployees()
    fetchDestinations()
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage employees, roles, and statuses</p>
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
          
          {/* Location Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Location:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {availableDestinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            {getFilteredEmployees().filter(emp => emp.status === 'Inactive').length > 0 && (
              <button 
                onClick={() => {
                  const inactiveEmployees = getFilteredEmployees().filter(emp => emp.status === 'Inactive')
                  if (confirm(`Delete ${inactiveEmployees.length} inactive employee records? This action cannot be undone.`)) {
                    // Bulk delete inactive employees
                    inactiveEmployees.forEach(employee => {
                      handleDeleteEmployeeFromModal(employee.id)
                    })
                  }
                }}
                className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-sm"
              >
                Clean Inactive ({getFilteredEmployees().filter(emp => emp.status === 'Inactive').length})
              </button>
            )}
            <button
              className="bg-gray-600 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors text-sm"
              onClick={() => setShowCreateModal(true)}
            >
              Add Employee
            </button>
          </div>
        </div>
      </div>


      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {getFilteredEmployees().length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {getFilteredEmployees().map((emp) => (
              <li key={emp.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div 
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors flex-1"
                    onClick={() => openProfileModal(emp)}
                    title="Click to view employee profile and work statistics"
                  >
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                      <div className="text-sm text-gray-500">{emp.email}</div>
                      {emp.destination && <div className="text-xs text-gray-400">{emp.destination}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">{emp.role}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditEmployee(emp)
                      }}
                      className="text-primary text-sm hover:opacity-80"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        openDeleteModal(emp)
                      }}
                      className="text-red-500 text-xs hover:text-red-600"
                      title="Delete Employee Record"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedLocation !== 'all' 
                ? `No employees found in ${selectedLocation} location.`
                : selectedMonth !== 'all' || selectedYear !== 'all'
                ? 'No employees found matching the selected filters.'
                : 'No employees have been added yet.'
              }
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-medium text-gray-900">Add Employee</h3>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="\\d{10}"
                    maxLength={10}
                    value={newEmployee.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                      setNewEmployee({ ...newEmployee, phone: digitsOnly })
                    }}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="10-digit number"
                    title="Enter a 10-digit phone number"
                  />
                </div>
                <div className="relative" ref={createDestinationRef}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={newEmployee.destination}
                    onChange={(e) => handleCreateDestinationChange(e.target.value)}
                    onFocus={() => {
                      const filtered = filterDestinations(newEmployee.destination, availableDestinations)
                      setFilteredCreateDestinations(filtered)
                      setShowCreateDestinationDropdown(filtered.length > 0)
                    }}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Type to search destinations..."
                  />
                  {showCreateDestinationDropdown && filteredCreateDestinations.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEmployee}
                  className="px-3 py-1.5 bg-primary text-white rounded-md hover:opacity-90 text-sm"
                >
                  Create Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-medium text-gray-900">Edit Employee</h3>
                <button 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingEmployee(null)
                  }} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingEmployee.name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="\\d{10}"
                    maxLength={10}
                    value={editingEmployee.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                      setEditingEmployee({ ...editingEmployee, phone: digitsOnly })
                    }}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="10-digit number"
                    title="Enter a 10-digit phone number"
                  />
                </div>
                <div className="relative" ref={editDestinationRef}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={editingEmployee.destination}
                    onChange={(e) => handleEditDestinationChange(e.target.value)}
                    onFocus={() => {
                      const filtered = filterDestinations(editingEmployee.destination, availableDestinations)
                      setFilteredEditDestinations(filtered)
                      setShowEditDestinationDropdown(filtered.length > 0)
                    }}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Type to search destinations..."
                  />
                  {showEditDestinationDropdown && filteredEditDestinations.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
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
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editingEmployee.role}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingEmployee(null)
                  }} 
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEmployee}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={handleSaveEmployee}
                  className="px-3 py-1.5 bg-primary text-white rounded-md hover:opacity-90 text-sm"
                >
                  Save Changes
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
  )
}

export default Employees
