import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { InventoryService } from '../../services/inventoryService'
import { Product, Location, StockOnHandItem } from '../../types/inventory'
import { 
  Warehouse, 
  Filter, 
  Plus, 
  ArrowRightLeft, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Package,
  Clock,
  Minus
} from 'lucide-react'

import ReceiveStockModal from '../../components/inventory/ReceiveStockModal'
import AdjustStockModal from '../../components/inventory/AdjustStockModal'
import TransferStockModal from '../../components/inventory/TransferStockModal'
import RecordSaleModal from '../../components/inventory/RecordSaleModal'

const StockPage: React.FC = () => {
  const { persona } = useAuth()
  const [stockOnHand, setStockOnHand] = useState<StockOnHandItem[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)

  // Modal states
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedLocationId])

  const loadData = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const [stockResult, locationsResult, productsResult] = await Promise.all([
        InventoryService.getStockOnHand(selectedLocationId),
        InventoryService.getAllLocations(),
        InventoryService.getAllProducts()
      ])

      if (stockResult.success) {
        setStockOnHand(stockResult.data || [])
      } else {
        setError(stockResult.message)
      }

      if (locationsResult.success) {
        setLocations(locationsResult.data || [])
      } else {
        setError(locationsResult.message)
      }

      if (productsResult.success) {
        setProducts(productsResult.data || [])
      } else {
        setError(productsResult.message)
      }

    } catch (err) {
      setError('Failed to load inventory data.')
      console.error('StockPage loadData error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedLocationId(value ? parseInt(value) : null)
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const isAdminOrStaff = persona?.type === 'admin' || persona?.type === 'staff'

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stock data...</p>
        </div>
      </div>
    )
  }

  // Show access denied if not admin or staff
  if (!isAdminOrStaff) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">Only administrators and staff can view stock on hand.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock on Hand</h1>
          <p className="mt-1 text-sm text-gray-600">
            View current inventory levels and perform stock operations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowReceiveModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Receive Stock</span>
          </button>
          <button
            onClick={() => setShowAdjustModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Minus className="h-4 w-4" />
            <span>Adjust Stock</span>
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Transfer Stock</span>
          </button>
          <button
            onClick={() => setShowSaleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DollarSign className="h-4 w-4" />
            <span>Record Sale</span>
          </button>
        </div>
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

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filter Stock</h3>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={selectedLocationId || ''}
            onChange={handleLocationFilterChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location.location_id} value={location.location_id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock on Hand Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Current Stock ({stockOnHand.length})
          </h3>
        </div>

        {stockOnHand.length === 0 ? (
          <div className="text-center py-12">
            <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No stock found</p>
            <p className="text-sm text-gray-500 mt-1">
              {selectedLocationId
                ? 'No stock found at this location. Try another filter or receive new stock.'
                : 'No stock recorded yet. Receive new stock to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockOnHand.map((item) => (
                  <tr key={item.stock_on_hand_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.product_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.location_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.lot_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReceiveStockModal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        onSuccess={() => {
          setSuccess('Stock received successfully!')
          loadData()
        }}
        products={products}
        locations={locations}
      />
      <AdjustStockModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        onSuccess={() => {
          setSuccess('Stock adjusted successfully!')
          loadData()
        }}
        products={products}
        locations={locations}
        stockItems={stockOnHand}
      />
      <TransferStockModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSuccess={() => {
          setSuccess('Stock transferred successfully!')
          loadData()
        }}
        products={products}
        locations={locations}
        stockItems={stockOnHand}
      />
      <RecordSaleModal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        onSuccess={() => {
          setSuccess('Sale recorded successfully!')
          loadData()
        }}
        products={products}
        locations={locations}
        stockItems={stockOnHand}
      />
    </div>
  )
}

export default StockPage
