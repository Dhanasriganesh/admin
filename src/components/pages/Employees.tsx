import React, { useEffect, useState } from 'react'
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
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({ 
    name: '', 
    email: '', 
    phone: '', 
    destination: '',
    password: ''
  })

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
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
          onClick={() => setShowCreateModal(true)}
        >
          Add Employee
        </button>
      </div>


      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {employees.map((emp) => (
            <li key={emp.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
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
                    onClick={() => handleEditEmployee(emp)}
                    className="text-primary text-sm hover:opacity-80"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
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
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={newEmployee.destination}
                    onChange={(e) => setNewEmployee({ ...newEmployee, destination: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Preferred destination"
                  />
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
                  Save Employee
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
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={editingEmployee.destination}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, destination: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Preferred destination"
                  />
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
    </div>
  )
}

export default Employees
