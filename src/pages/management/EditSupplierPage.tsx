import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { InventoryService } from '../../services/inventoryService'
import { Supplier, SupplierFormData } from '../../types/inventory'
import SupplierForm from '../../components/management/SupplierForm'
import { ArrowLeft, AlertCircle } from 'lucide-react'

const EditSupplierPage: React.FC = () => {
  const { supplierId } = useParams<{ supplierId: string }>()
  const { persona } = useAuth()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not admin
  useEffect(() => {
    if (persona && persona.type !== 'admin') {
      navigate('/dashboard')
    }
  }, [persona, navigate])

  useEffect(() => {
    if (supplierId) {
      loadSupplier(parseInt(supplierId))
    }
  }, [supplierId])

  const loadSupplier = async (id: number) => {
    setLoading(true)
    setError('')

    try {
      const result = await InventoryService.getSupplierById(id)
      
      if (result.success && result.data) {
        setSupplier(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to load supplier details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: SupplierFormData) => {
    if (!supplier) return

    setSubmitLoading(true)
    
    try {
      const result = await InventoryService.updateSupplier(supplier.supplier_id, data)
      
      if (result.success) {
        navigate(`/management/suppliers`) // Redirect to the list after update
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      throw error // Let SupplierForm handle the error display
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/management/suppliers')
  }

  // Show access denied if not admin
  if (persona && persona.type !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">Only administrators can edit suppliers.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading supplier details...</p>
        </div>
      </div>
    )
  }

  if (error || !supplier) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Supplier</h2>
          <p className="text-red-700 mb-4">{error || 'Supplier not found'}</p>
          <button
            onClick={() => navigate('/management/suppliers')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Suppliers
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleCancel}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Supplier</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update the details for {supplier.name}.
          </p>
        </div>
      </div>

      {/* Supplier Form */}
      <SupplierForm
        initialData={supplier}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={submitLoading}
        submitLabel="Update Supplier"
      />
    </div>
  )
}

export default EditSupplierPage
