import React, { useState, useEffect } from 'react'
import { Product, Category, Supplier, ProductFormData } from '../../types/inventory'
import { InventoryService } from '../../services/inventoryService'
import { Package, DollarSign, FileText, Tag, Truck, AlertCircle } from 'lucide-react'

interface ProductFormProps {
  initialData?: Product | null
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Product'
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    description: '',
    unit_price: 0,
    supplier_id: null,
    category_id: null,
    metadata: null
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFormData()
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        description: initialData.description || '',
        unit_price: initialData.unit_price || 0,
        supplier_id: initialData.supplier_id || null,
        category_id: initialData.category_id || null,
        metadata: initialData.metadata || null
      })
    }
  }, [initialData])

  const loadFormData = async () => {
    setLoadingData(true)
    setError('')

    try {
      const [categoriesResult, suppliersResult] = await Promise.all([
        InventoryService.getAllCategories(),
        InventoryService.getAllSuppliers()
      ])

      if (categoriesResult.success) {
        setCategories(categoriesResult.data || [])
      } else {
        setError(categoriesResult.message)
      }

      if (suppliersResult.success) {
        setSuppliers(suppliersResult.data || [])
      } else {
        setError(suppliersResult.message)
      }
    } catch (err) {
      setError('Failed to load form data')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.name.trim()) {
      setError('Product name is required')
      return
    }

    if (!formData.sku.trim()) {
      setError('SKU is required')
      return
    }

    if (formData.unit_price <= 0) {
      setError('Unit price must be greater than 0')
      return
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      setError('Failed to save product')
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loadingData) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {initialData ? 'Edit Product' : 'Create New Product'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter SKU"
              />
            </div>
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Price *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => handleInputChange('category_id', e.target.value ? parseInt(e.target.value) : null)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier
            </label>
            <select
              value={formData.supplier_id || ''}
              onChange={(e) => handleInputChange('supplier_id', e.target.value ? parseInt(e.target.value) : null)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product description"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm