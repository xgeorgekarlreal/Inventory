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
import ProductsPage from './pages/inventory/ProductsPage'
import ProductDetailPage from './pages/inventory/ProductDetailPage'
import CreateProductPage from './pages/inventory/CreateProductPage'
import LocationsPage from './pages/management/LocationsPage'
import CreateLocationPage from './pages/management/CreateLocationPage'
import EditLocationPage from './pages/management/EditLocationPage'
import SuppliersPage from './pages/management/SuppliersPage'
import CreateSupplierPage from './pages/management/CreateSupplierPage'
import EditSupplierPage from './pages/management/EditSupplierPage'
import EditProductPage from './pages/inventory/EditProductPage'
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
          
          {/* Inventory Routes */}
          <Route path="/inventory/products" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <ProductsPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/inventory/products/create" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <CreateProductPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/inventory/products/:productId" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <ProductDetailPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/inventory/products/:productId/edit" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <EditProductPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/inventory/products/create" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <CreateProductPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/inventory/products/:productId" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <ProductDetailPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/inventory/products/:productId/edit" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <EditProductPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          {/* Management Routes */}
          <Route path="/management/locations" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <LocationsPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/locations/create" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <CreateLocationPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/locations/:locationId/edit" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <EditLocationPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/management/suppliers" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <SuppliersPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/suppliers/create" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <CreateSupplierPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/suppliers/:supplierId/edit" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <EditSupplierPage
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/management/suppliers" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage 
                    title="Suppliers" 
                    description="Manage supplier information and relationships."
                    icon={FileText}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/management/categories" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <CategoriesPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/categories/create" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <CreateCategoryPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/categories/:categoryId/edit" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <EditCategoryPage />
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          {/* Placeholder Routes (if not yet implemented) */}
          <Route path="/inventory/stock" element={<ProtectedRoute><PersonaProtectedRoute><Layout><PlaceholderPage title="Stock on Hand" description="View current stock levels and inventory quantities." icon={FileText}/></Layout></PersonaProtectedRoute></ProtectedRoute>} />
          <Route path="/inventory/transactions" element={<ProtectedRoute><PersonaProtectedRoute><Layout><PlaceholderPage title="Transactions" description="View and manage inventory transactions and movements." icon={FileText}/></Layout></PersonaProtectedRoute></ProtectedRoute>} />

          {/* Reports Route */}
          <Route path="/reports" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage 
                    title="Reports" 
                    description="Generate and view inventory reports and analytics."
                    icon={BarChart3}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          {/* Settings and Admin Routes */}
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