import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { InventoryService } from '../../services/inventoryService'
import { ProductFormData } from '../../types/inventory'
import ProductForm from '../../components/inventory/ProductForm'
import { ArrowLeft, AlertCircle } from 'lucide-react'

const CreateProductPage: React.FC = () => {
  const { persona } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (persona && persona.type !== 'admin') {
      navigate('/dashboard')
    }
  }, [persona, navigate])

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true)
    
    try {
      console.log(data);
      const result = await InventoryService.createProduct(data)
      
      if (result.success) {
        navigate('/inventory/products')
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      throw error // Let ProductForm handle the error display
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/inventory/products')
  }

  // Show access denied if not admin
  if (persona && persona.type !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">Only administrators can create products.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
          <p className="mt-1 text-sm text-gray-600">
            Add a new product to your inventory catalog.
          </p>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading}
        submitLabel="Create Product"
      />
    </div>
  )
}

export default CreateProductPage