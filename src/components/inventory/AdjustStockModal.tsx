import React, { useState, useEffect } from 'react'
import { Product, Location, AdjustStockFormData, StockOnHandItem } from '../../types/inventory'
import { InventoryService } from '../../services/inventoryService'
import { Package, MapPin, Plus, Minus, Tag, FileText, AlertCircle } from 'lucide-react'

interface AdjustStockModalProps {
  isOpen: boolean
  p_persona_name: string
  onClose: () => void
  onSuccess: () => void
  products: Product[]
  locations: Location[]
  stockItems: StockOnHandItem[]
  preSelectedLocationId?: number | null
  preSelectedItem?: StockOnHandItem | null
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  p_persona_name,
  onClose,
  onSuccess,
  products,
  locations,
  stockItems,
  preSelectedLocationId,
  preSelectedItem,
}) => {
  const [formData, setFormData] = useState<AdjustStockFormData>({
    product_id: null,
    location_id: null,
    quantity_change: 0,
    batch_id: null,
    notes: null,
    reference_id: null,
    persona_name: p_persona_name
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [availableBatches, setAvailableBatches] = useState<StockOnHandItem[]>([])

  useEffect(() => {
    if (isOpen) {
      setFormData({
        product_id: preSelectedItem?.product_id || null,
        location_id: preSelectedItem?.location_id || preSelectedLocationId || null,
        quantity_change: 0,
        batch_id: preSelectedItem?.batch_id || null,
        notes: null,
        reference_id: null,
        persona_name: p_persona_name
      })
      setError('')
      if (preSelectedItem) {
        const batches = stockItems.filter(
          (item) =>
            item.product_id === preSelectedItem.product_id &&
            item.location_id === preSelectedItem.location_id &&
            item.quantity > 0
        )
        setAvailableBatches(batches)
      } else {
        setAvailableBatches([])
      }
    }
  }, [isOpen, preSelectedLocationId, preSelectedItem, stockItems])

  useEffect(() => {
    if (formData.product_id && formData.location_id && !preSelectedItem) {
      const batches = stockItems.filter(
        (item) =>
          item.product_id === formData.product_id &&
          item.location_id === formData.location_id &&
          item.quantity > 0
      )
      setAvailableBatches(batches)
      setFormData((prev) => ({ ...prev, batch_id: null }))
    } else if (!preSelectedItem) {
      setAvailableBatches([])
    }
  }, [formData.product_id, formData.location_id, stockItems, preSelectedItem])

  const handleInputChange = (field: keyof AdjustStockFormData, value: any) => {
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
    if (formData.quantity_change === 0) {
      setError('Quantity change cannot be zero.')
      return
    }

    setLoading(true)
    try {
      const result = await InventoryService.recordStockAdjustment(formData)
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to record stock adjustment.')
      console.error('Adjust stock error:', err)
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

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <Plus className="h-6 w-6 text-orange-600" />
            <Minus className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-medium text-gray-900">Adjust Stock</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

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
                disabled={!!preSelectedItem}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={!!preSelectedLocationId || !!preSelectedItem}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.location_id} value={location.location_id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch (optional) */}
            {availableBatches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch (Optional)
                </label>
                <select
                  value={formData.batch_id || ''}
                  onChange={(e) =>
                    handleInputChange('batch_id', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">No specific batch</option>
                  {availableBatches.map((batch) => (
                    <option key={batch.batch_id} value={batch.batch_id}>
                      {batch.lot_number} (Qty: {batch.quantity}) {batch.expiry_date ? `Exp: ${batch.expiry_date}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity Change */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Change *
              </label>
              <input
                type="number"
                required
                value={formData.quantity_change}
                onChange={(e) => handleInputChange('quantity_change', parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., 5 for add, -3 for subtract"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a positive number to add stock, a negative number to remove stock.
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Optional reference ID"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Optional notes (e.g., reason for adjustment)"
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
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adjusting...' : 'Adjust Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdjustStockModal