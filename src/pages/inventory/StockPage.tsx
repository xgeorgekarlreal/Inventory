import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
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
  Minus,
  ArrowLeft,
  FileText,
  Search,
  X,
  TrendingDown,
  Calendar
} from 'lucide-react'

import ReceiveStockModal from '../../components/inventory/ReceiveStockModal'
import AdjustStockModal from '../../components/inventory/AdjustStockModal'
import TransferStockModal from '../../components/inventory/TransferStockModal'
import RecordSaleModal from '../../components/inventory/RecordSaleModal'
import StockCard from '../../components/inventory/StockCard'

const StockPage: React.FC = () => {
  const { persona } = useAuth()
  const { locationId } = useParams<{ locationId: string }>()
  const [stockOnHand, setStockOnHand] = useState<StockOnHandItem[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'fresh' | 'expiring-soon' | 'expired'>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')

  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)

  const [selectedItemForAction, setSelectedItemForAction] = useState<StockOnHandItem | null>(null)

  useEffect(() => {
    if (locationId) {
      const parsedLocationId = parseInt(locationId)
      setSelectedLocationId(parsedLocationId)
    }
    loadData()
  }, [selectedLocationId, locationId])

  useEffect(() => {
    if (selectedLocationId && locations.length > 0) {
      const location = locations.find(loc => loc.location_id === selectedLocationId)
      setCurrentLocation(location || null)
    } else {
      setCurrentLocation(null)
    }
  }, [selectedLocationId, locations])

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

  const handleQuickAction = (item: StockOnHandItem, action: 'adjust' | 'transfer' | 'sale') => {
    setSelectedItemForAction(item)
    if (action === 'adjust') {
      setShowAdjustModal(true)
    } else if (action === 'transfer') {
      setShowTransferModal(true)
    } else if (action === 'sale') {
      setShowSaleModal(true)
    }
  }

  const handleCloseModal = (setModalOpen: (value: boolean) => void) => {
    setModalOpen(false)
    setSelectedItemForAction(null)
  }

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return 'no-expiry'

    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return 'expired'
    if (daysUntilExpiry <= 30) return 'expiring-soon'
    return 'fresh'
  }

  const filteredStock = useMemo(() => {
    return stockOnHand.filter(item => {
      const matchesSearch = searchQuery === '' ||
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())

      const expiryStatus = getExpiryStatus(item.expiry_date)
      const matchesExpiry = expiryFilter === 'all' ||
        (expiryFilter === 'fresh' && expiryStatus === 'fresh') ||
        (expiryFilter === 'expiring-soon' && expiryStatus === 'expiring-soon') ||
        (expiryFilter === 'expired' && expiryStatus === 'expired')

      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'in-stock' && item.quantity > 10) ||
        (stockFilter === 'low-stock' && item.quantity > 0 && item.quantity <= 10) ||
        (stockFilter === 'out-of-stock' && item.quantity === 0)

      return matchesSearch && matchesExpiry && matchesStock
    })
  }, [stockOnHand, searchQuery, expiryFilter, stockFilter])

  const statistics = useMemo(() => {
    const totalProducts = stockOnHand.length
    const totalQuantity = stockOnHand.reduce((sum, item) => sum + item.quantity, 0)
    const lowStockCount = stockOnHand.filter(item => item.quantity > 0 && item.quantity <= 10).length
    const outOfStockCount = stockOnHand.filter(item => item.quantity === 0).length
    const expiringSoonCount = stockOnHand.filter(item => {
      const status = getExpiryStatus(item.expiry_date)
      return status === 'expiring-soon' || status === 'expired'
    }).length

    return { totalProducts, totalQuantity, lowStockCount, outOfStockCount, expiringSoonCount }
  }, [stockOnHand])

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
      <div className="flex items-center justify-between">
        <div>
          {locationId && currentLocation && (
            <div className="flex items-center space-x-4 mb-2">
              <Link
                to="/inventory/stock-by-location"
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Stock at {currentLocation.name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  View and manage inventory for this specific location.
                </p>
              </div>
            </div>
          )}
          {!locationId && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Stock on Hand</h1>
              <p className="mt-1 text-sm text-gray-600">
                View current inventory levels and perform stock operations.
              </p>
            </>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {locationId && currentLocation && (
            <Link
              to={`/inventory/transactions/${locationId}`}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>View History</span>
            </Link>
          )}
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
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={clearMessages} className="ml-auto text-red-500 hover:text-red-700">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
          <button onClick={clearMessages} className="ml-auto text-green-500 hover:text-green-700">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.totalQuantity}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Warehouse className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low/Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics.lowStockCount + statistics.outOfStockCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.expiringSoonCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Search & Filter</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <select
              value={selectedLocationId || ''}
              onChange={handleLocationFilterChange}
              disabled={!!locationId}
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

          <div>
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Expiry Status</option>
              <option value="fresh">Fresh</option>
              <option value="expiring-soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stock Levels</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Stock Items ({filteredStock.length})
          </h3>
        </div>

        {filteredStock.length === 0 ? (
          <div className="text-center py-12">
            <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No stock found</p>
            <p className="text-sm text-gray-500 mt-1">
              {stockOnHand.length === 0
                ? 'No stock recorded yet. Receive new stock to get started.'
                : 'No items match your current filters. Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStock.map((item) => (
              <StockCard
                key={item.stock_on_hand_id}
                item={item}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        )}
      </div>

      <ReceiveStockModal
        isOpen={showReceiveModal}
        p_persona_name={persona.personName}
        onClose={() => setShowReceiveModal(false)}
        onSuccess={() => {
          setSuccess('Stock received successfully!')
          loadData()
        }}
        products={products}
        locations={locations}
        preSelectedLocationId={selectedLocationId}
      />
      <AdjustStockModal
        isOpen={showAdjustModal}
        p_persona_name={persona.personName}
        onClose={() => handleCloseModal(setShowAdjustModal)}
        onSuccess={() => {
          setSuccess('Stock adjusted successfully!')
          loadData()
          setSelectedItemForAction(null)
        }}
        products={products}
        locations={locations}
        stockItems={stockOnHand}
        preSelectedLocationId={selectedLocationId}
        preSelectedItem={selectedItemForAction}
      />
      <TransferStockModal
        isOpen={showTransferModal}
        p_persona_name={persona.personName}
        onClose={() => handleCloseModal(setShowTransferModal)}
        onSuccess={() => {
          setSuccess('Stock transferred successfully!')
          loadData()
          setSelectedItemForAction(null)
        }}
        products={products}
        locations={locations}
        stockItems={stockOnHand}
        preSelectedLocationId={selectedLocationId}
        preSelectedItem={selectedItemForAction}
      />
      <RecordSaleModal
        isOpen={showSaleModal}
        p_persona_name={persona.personName}
        onClose={() => handleCloseModal(setShowSaleModal)}
        onSuccess={() => {
          setSuccess('Sale recorded successfully!')
          loadData()
          setSelectedItemForAction(null)
        }}
        products={products}
        locations={locations}
        stockItems={stockOnHand}
        preSelectedLocationId={selectedLocationId}
        preSelectedItem={selectedItemForAction}
      />
    </div>
  )
}

export default StockPage
