import React, { useState, useEffect } from 'react'
import { Product, Location, TransferStockFormData, StockOnHandItem } from '../../types/inventory'
import { InventoryService } from '../../services/inventoryService'
import { Package, MapPin, ArrowRightLeft, Tag, FileText, AlertCircle } from 'lucide-react'

interface TransferStockModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  products: Product[]
  locations: Location[]
  stockItems: StockOnHandItem[] // To help select existing batches and check available stock
}

const TransferStockModal: React.FC<TransferStockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  products,
  locations,
  stockItems,
}) => {
  const [formData, setFormData] = useState<TransferStockFormData>({
    product_id: null,
    source_location_id: null,
    destination_location_id: null,
    quantity: 1,
    batch_id: null,
    notes: null,
    reference_id: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [availableBatches, setAvailableBatches] = useState<StockOnHandItem[]>([])

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        product_id: null,
        source_location_id: null,
        destination_location_id: null,
        quantity: 1,
        batch_id: null,
        notes: null,
        reference_id: null,
      })
      setError('')
      setAvailableBatches([])
    }
  }, [isOpen])

  useEffect(() => {
    if (formData.product_id && formData.source_location_id) {
      const batches = stockItems.filter(
        (item) =>
          item.product_id === formData.product_id &&
          item.location_id === formData.source_location_id &&
          item.quantity > 0 // Only show batches with stock
      )
      setAvailableBatches(batches)
    } else {
      setAvailableBatches([])
    }
    // Reset batch_id if product or source location changes
    setFormData((prev) => ({ ...prev, batch_id: null }))
  }, [formData.product_id, formData.source_location_id, stockItems])

  const handleInputChange = (field: keyof TransferStockFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.product_id) {
      setError('Product is required.')
      return
    }
    if (!formData.source_location_id) {
      setError('Source location is required.')
      return
    }
    if (!formData.destination_location_id) {
      setError('Destination location is required.')
      return
    }
    if (formData.source_location_id === formData.destination_location_id) {
      setError('Source and destination locations cannot be the same.')
      return
    }
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0.')
      return
    }

    setLoading(true)
    try {
      const result = await InventoryService.recordStockTransfer(formData)
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to record stock transfer.')
      console.error('Transfer stock error:', err)
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
            <ArrowRightLeft className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">Transfer Stock</h3>
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* Source Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Location *
              </label>
              <select
                required
                value={formData.source_location_id || ''}
                onChange={(e) =>
                  handleInputChange('source_location_id', e.target.value ? parseInt(e.target.value) : null)
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select source location</option>
                {locations.map((location) => (
                  <option key={location.location_id} value={location.location_id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Location *
              </label>
              <select
                required
                value={formData.destination_location_id || ''}
                onChange={(e) =>
                  handleInputChange('destination_location_id', e.target.value ? parseInt(e.target.value) : null)
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select destination location</option>
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">No specific batch</option>
                  {availableBatches.map((batch) => (
                    <option key={batch.batch_id} value={batch.batch_id}>
                      {batch.lot_number} (Qty: {batch.quantity}){' '}
                      {batch.expiry_date ? \`Exp: ${batch.expiry_date}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Quantity to transfer"
              />
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Transferring...' : 'Transfer Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TransferStockModal