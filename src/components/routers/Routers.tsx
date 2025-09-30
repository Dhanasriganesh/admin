import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminDashboard from '../pages/AdminDashboard'
import Employeedashboard from '../pages/Employeedashboard'
import Leads from '../pages/crm/Leads'
import Bookings from '../pages/crm/Bookings'
import Payments from '../pages/crm/Payments'
import Reports from '../pages/crm/Reports'
import Packages from '../pages/cms/Packages'
import Blogs from '../pages/cms/Blogs'
import Settings from '../pages/Settings'
import WebsiteEdit from '../pages/cms/WebsiteEdit'
import Employees from '../pages/Employees'
import Login from '../../pages/Login'
import ProtectedRoute from '../auth/ProtectedRoute'

const Routers: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/employee" element={
        <ProtectedRoute>
          <Employeedashboard />
        </ProtectedRoute>
      } />
      <Route path="/leads" element={
        <ProtectedRoute>
          <Leads />
        </ProtectedRoute>
      } />
      <Route path="/bookings" element={
        <ProtectedRoute>
          <Bookings />
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute>
          <Payments />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/employees" element={
        <ProtectedRoute requiredRole="Super Admin">
          <Employees />
        </ProtectedRoute>
      } />
      <Route path="/packages" element={
        <ProtectedRoute>
          <Packages />
        </ProtectedRoute>
      } />
      <Route path="/blogs" element={
        <ProtectedRoute>
          <Blogs />
        </ProtectedRoute>
      } />
      <Route path="/website-edit" element={
        <ProtectedRoute>
          <WebsiteEdit />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute requiredRole="Super Admin">
          <Settings />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default Routers
