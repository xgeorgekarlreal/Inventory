import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import PlaceholderPage from './pages/PlaceholderPage'
import { 
  BarChart3, 
  FileText, 
  Mail, 
  Calendar, 
  Settings 
} from 'lucide-react'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <PlaceholderPage 
                  title="Analytics" 
                  description="View detailed analytics and insights about your data."
                  icon={BarChart3}
                />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/documents" element={
            <ProtectedRoute>
              <Layout>
                <PlaceholderPage 
                  title="Documents" 
                  description="Manage and organize your documents and files."
                  icon={FileText}
                />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/messages" element={
            <ProtectedRoute>
              <Layout>
                <PlaceholderPage 
                  title="Messages" 
                  description="Send and receive messages with your team."
                  icon={Mail}
                />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Layout>
                <PlaceholderPage 
                  title="Calendar" 
                  description="Schedule and manage your events and appointments."
                  icon={Calendar}
                />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <PlaceholderPage 
                  title="Settings" 
                  description="Configure your application settings and preferences."
                  icon={Settings}
                />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App