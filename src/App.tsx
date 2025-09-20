import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PersonaProtectedRoute from './components/PersonaProtectedRoute'
import Layout from './components/layout/Layout'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import PlaceholderPage from './pages/PlaceholderPage'
import PersonaManagement from './pages/PersonaManagement'
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
              <PersonaProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage 
                    title="Analytics" 
                    description="View detailed analytics and insights about your data."
                    icon={BarChart3}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/documents" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage 
                    title="Documents" 
                    description="Manage and organize your documents and files."
                    icon={FileText}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/messages" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage 
                    title="Messages" 
                    description="Send and receive messages with your team."
                    icon={Mail}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/calendar" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage 
                    title="Calendar" 
                    description="Schedule and manage your events and appointments."
                    icon={Calendar}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage 
                    title="Settings" 
                    description="Configure your application settings and preferences."
                    icon={Settings}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/persona-management" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PersonaManagement />
                </Layout>
              </PersonaProtectedRoute>
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