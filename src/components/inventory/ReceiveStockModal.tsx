import React, { useState, useEffect } from 'react'
import { Product, Location, Supplier, ReceiveStockFormData } from '../../types/inventory'
import { InventoryService } from '../../services/inventoryService'
import { Package, MapPin, Plus, Calendar, FileText, AlertCircle, DollarSign, Truck } from 'lucide-react'

interface ReceiveStockModalProps {
  isOpen: boolean
  p_persona_name: string
  onClose: () => void
  onSuccess: () => void
  products: Product[]
  locations: Location[]
  preSelectedLocationId?: number | null
}

const ReceiveStockModal: React.FC<ReceiveStockModalProps> = ({
  isOpen,
  p_persona_name,
  onClose,
  onSuccess,
  products,
  locations,
  preSelectedLocationId,
}) => {
  const [formData, setFormData] = useState<ReceiveStockFormData>({
    product_id: null,
    location_id: null,
    quantity: 1,
    lot_number: null,
    expiry_date: null,
    notes: null,
    reference_id: null,
    purchase_price: 0,
    selling_price: 0,
    supplier_id: null,
    persona_name: p_persona_name
  })
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    if (isOpen) {
      setFormData({
        product_id: null,
        location_id: preSelectedLocationId || null,
        quantity: 1,
        lot_number: null,
        expiry_date: null,
        notes: null,
        reference_id: null,
        purchase_price: 0,
        selling_price: 0,
        supplier_id: null,
        persona_name: p_persona_name

      })
      setError('')
    }
  }, [isOpen, preSelectedLocationId])

  const loadSuppliers = async () => {
    setLoadingSuppliers(true)
    try {
      const result = await InventoryService.getAllSuppliers()
      if (result.success) {
        setSuppliers(result.data || [])
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err)
    } finally {
      setLoadingSuppliers(false)
    }
  }

  const handleInputChange = (field: keyof ReceiveStockFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.product_id) {
      setError('Product is required.')
      return
    }
    if (!formData.location_id) {
      setError('Location is required.')
      return
    }
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0.')
      return
    }
    if (formData.purchase_price < 0) {
      setError('Purchase price cannot be negative.')
      return
    }
    if (formData.selling_price < 0) {
      setError('Selling price cannot be negative.')
      return
    }

    setLoading(true)
    try {
      const result = await InventoryService.recordPurchaseReceipt(formData)
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to record purchase receipt.')
      console.error('Receive stock error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <Plus className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Receive Stock</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product *
                </label>
                <select
                  required
                  value={formData.product_id || ''}
                  onChange={(e) =>
                    handleInputChange('product_id', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.product_id} value={product.product_id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <select
                  required
                  value={formData.location_id || ''}
                  onChange={(e) =>
                    handleInputChange('location_id', e.target.value ? parseInt(e.target.value) : null)
                  }
                  disabled={!!preSelectedLocationId}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select location</option>
                  {locations.map((location) => (
                    <option key={location.location_id} value={location.location_id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Quantity"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <select
                  value={formData.supplier_id || ''}
                  onChange={(e) =>
                    handleInputChange('supplier_id', e.target.value ? parseInt(e.target.value) : null)
                  }
                  disabled={loadingSuppliers}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.supplier_id} value={supplier.supplier_id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.purchase_price}
                    onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value) || 0)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Cost per unit</p>
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.selling_price}
                    onChange={(e) => handleInputChange('selling_price', parseFloat(e.target.value) || 0)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Price per unit to sell</p>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiry_date || ''}
                onChange={(e) => handleInputChange('expiry_date', e.target.value || null)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Items with the same expiry date will be stored together. Different expiry dates create separate batches.
              </p>
            </div>

            {/* Reference ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference ID
              </label>
              <input
                type="text"
                value={formData.reference_id || ''}
                onChange={(e) => handleInputChange('reference_id', e.target.value || null)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional reference ID (e.g., PO number)"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value || null)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional notes"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Receiving...' : 'Receive Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReceiveStockModal
