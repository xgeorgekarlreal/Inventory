import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { InventoryService } from '../../services/inventoryService'
import { Product } from '../../types/inventory'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package, 
  Tag, 
  DollarSign, 
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Warehouse
} from 'lucide-react'

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const { persona } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

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

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!product) return

    setDeleteLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await InventoryService.deleteProduct(product.product_id)
      
      if (result.success) {
        setSuccess('Product deleted successfully')
        setTimeout(() => {
          navigate('/inventory/products')
        }, 1500)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to delete product')
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const isAdmin = persona?.type === 'admin'

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

  if (error && !product) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Product</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Link
            to="/inventory/products"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The requested product could not be found.</p>
          <Link
            to="/inventory/products"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/inventory/products"
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-1 text-sm text-gray-600">Product Details</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center space-x-3">
            <Link
              to={`/inventory/products/${product.product_id}/edit`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDeleteClick}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={clearMessages} className="ml-auto text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
          <button onClick={clearMessages} className="ml-auto text-green-500 hover:text-green-700">
            ×
          </button>
        </div>
      )}

      {/* Product Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Product Information</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900">{product.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900">{product.sku}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price
                  </label>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900">${product.unit_price.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <Warehouse className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900">{product.total_quantity || 0}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <span className="text-sm text-gray-900">{product.category_name || 'No category'}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier
                  </label>
                  <span className="text-sm text-gray-900">{product.supplier_name || 'No supplier'}</span>
                </div>
              </div>

              {product.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timestamps */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Timestamps</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created At
                </label>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {new Date(product.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Updated
                </label>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {new Date(product.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-900 font-mono">{product.user_id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <Link
                to="/inventory/products"
                className="w-full flex justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Products
              </Link>
              {isAdmin && (
                <Link
                  to={`/inventory/products/${product.product_id}/edit`}
                  className="w-full flex justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Product
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)}></div>
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">{product.name}</span>? 
                This action cannot be undone and you will be redirected to the products list.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetailPage