import React from 'react'
import { StockOnHandItem } from '../../types/inventory'
import { Package, MapPin, Calendar, AlertCircle, Clock, TrendingDown } from 'lucide-react'

interface StockCardProps {
  item: StockOnHandItem
  onQuickAction?: (item: StockOnHandItem, action: 'adjust' | 'transfer' | 'sale') => void
}

const StockCard: React.FC<StockCardProps> = ({ item, onQuickAction }) => {
  const getExpiryStatus = () => {
    if (!item.expiry_date) return null

    const today = new Date()
    const expiryDate = new Date(item.expiry_date)
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'red', label: 'Expired', days: Math.abs(daysUntilExpiry) }
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring-soon', color: 'yellow', label: 'Expiring Soon', days: daysUntilExpiry }
    } else if (daysUntilExpiry <= 90) {
      return { status: 'approaching', color: 'blue', label: 'Approaching Expiry', days: daysUntilExpiry }
    }
    return { status: 'fresh', color: 'green', label: 'Fresh', days: daysUntilExpiry }
  }

  const expiryStatus = getExpiryStatus()

  const getQuantityStatus = () => {
    if (item.quantity === 0) return { color: 'red', label: 'Out of Stock' }
    if (item.quantity <= 10) return { color: 'yellow', label: 'Low Stock' }
    return { color: 'green', label: 'In Stock' }
  }

  const quantityStatus = getQuantityStatus()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {item.product_name}
              </h3>
              <p className="text-sm text-gray-500 truncate">SKU: {item.sku}</p>
            </div>
          </div>

          <div className="flex-shrink-0 ml-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              quantityStatus.color === 'green' ? 'bg-green-100 text-green-800' :
              quantityStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {item.quantity}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
            <span className="truncate">{item.location_name}</span>
          </div>

          {item.lot_number && (
            <div className="flex items-center text-sm text-gray-600">
              <Package className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
              <span className="truncate">Lot: {item.lot_number}</span>
            </div>
          )}

          {item.expiry_date && expiryStatus && (
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
              <span className="text-gray-600">
                {new Date(item.expiry_date).toLocaleDateString()}
              </span>
              <span className={`ml-2 text-xs font-medium ${
                expiryStatus.color === 'red' ? 'text-red-600' :
                expiryStatus.color === 'yellow' ? 'text-yellow-600' :
                expiryStatus.color === 'blue' ? 'text-blue-600' :
                'text-green-600'
              }`}>
                {expiryStatus.status === 'expired'
                  ? `${expiryStatus.days}d ago`
                  : `${expiryStatus.days}d left`
                }
              </span>
            </div>
          )}
        </div>

        {expiryStatus && (expiryStatus.status === 'expired' || expiryStatus.status === 'expiring-soon') && (
          <div className={`mt-3 flex items-center space-x-2 p-2 rounded-lg ${
            expiryStatus.status === 'expired' ? 'bg-red-50' : 'bg-yellow-50'
          }`}>
            <AlertCircle className={`h-4 w-4 flex-shrink-0 ${
              expiryStatus.status === 'expired' ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <span className={`text-xs font-medium ${
              expiryStatus.status === 'expired' ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {expiryStatus.status === 'expired' ? 'EXPIRED - Remove from stock' : 'Expiring soon - Priority sale'}
            </span>
          </div>
        )}

        {quantityStatus.color === 'red' && (
          <div className="mt-3 flex items-center space-x-2 p-2 rounded-lg bg-red-50">
            <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="text-xs font-medium text-red-700">
              Out of Stock - Reorder needed
            </span>
          </div>
        )}

        {quantityStatus.color === 'yellow' && quantityStatus.label === 'Low Stock' && (
          <div className="mt-3 flex items-center space-x-2 p-2 rounded-lg bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <span className="text-xs font-medium text-yellow-700">
              Low Stock - Consider reordering
            </span>
          </div>
        )}
      </div>

      {onQuickAction && item.quantity > 0 && (
        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between space-x-2">
            <button
              onClick={() => onQuickAction(item, 'adjust')}
              className="flex-1 text-xs font-medium text-gray-700 hover:text-gray-900 py-1.5 px-2 rounded hover:bg-gray-100 transition-colors"
            >
              Adjust
            </button>
            <button
              onClick={() => onQuickAction(item, 'transfer')}
              className="flex-1 text-xs font-medium text-gray-700 hover:text-gray-900 py-1.5 px-2 rounded hover:bg-gray-100 transition-colors"
            >
              Transfer
            </button>
            <button
              onClick={() => onQuickAction(item, 'sale')}
              className="flex-1 text-xs font-medium text-gray-700 hover:text-gray-900 py-1.5 px-2 rounded hover:bg-gray-100 transition-colors"
            >
              Sale
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StockCard
