import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { InventoryService } from '../../services/inventoryService'
import { Product, ProductFormData } from '../../types/inventory'
import ProductForm from '../../components/inventory/ProductForm'
import { ArrowLeft, AlertCircle } from 'lucide-react'

const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const { persona } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
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
    if (productId) {
      loadProduct(parseInt(productId))
    }
  }, [productId])

  const loadProduct = async (id: number) => {
    setLoading(true)
    setError('')

    try {
      const result = await InventoryService.getProductById(id)
      
      if (result.success && result.data) {
        setProduct(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: ProductFormData) => {
    if (!product) return

    setSubmitLoading(true)
    
    try {
      const result = await InventoryService.updateProduct(product.product_id, data)
      
      if (result.success) {
        navigate(`/inventory/products/${product.product_id}`)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      throw error // Let ProductForm handle the error display
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleCancel = () => {
    if (product) {
      navigate(`/inventory/products/${product.product_id}`)
    } else {
      navigate('/inventory/products')
    }
  }

  // Show access denied if not admin
  if (persona && persona.type !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">Only administrators can edit products.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Product</h2>
          <p className="text-red-700 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/inventory/products')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Products
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update the details for {product.name}.
          </p>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={submitLoading}
        submitLabel="Update Product"
      />
    </div>
  )
}

export default EditProductPage