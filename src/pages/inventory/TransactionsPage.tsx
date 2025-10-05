import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { InventoryService } from '../../services/inventoryService'
import { Transaction, TransactionFilters, Product, Location, TransactionType } from '../../types/inventory'
import { 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  MapPin, 
  User, 
  AlertCircle, 
  FileText,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react'
import { ArrowLeft } from 'lucide-react'

const TransactionsPage: React.FC = () => {
  const { persona } = useAuth()
  const { locationId } = useParams<{ locationId: string }>()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)

  // Filter state
  const [filters, setFilters] = useState<TransactionFilters>({
    start_date: null,
    end_date: null,
    transaction_types: [],
    product_id: null,
    location_id: null,
  })

  // UI state
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    // If locationId is provided in URL, set it as filter
    if (locationId) {
      const parsedLocationId = parseInt(locationId)
      setFilters(prev => ({
        ...prev,
        location_id: parsedLocationId
      }))
    }
    loadData()
  }, [locationId])

  useEffect(() => {
    applyFilters()
  }, [transactions, filters])

  useEffect(() => {
    // Find and set current location details
    if (filters.location_id && locations.length > 0) {
      const location = locations.find(loc => loc.location_id === filters.location_id)
      setCurrentLocation(location || null)
    } else {
      setCurrentLocation(null)
    }
  }, [filters.location_id, locations])

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [transactionsResult, productsResult, locationsResult] = await Promise.all([
        InventoryService.getAllTransactions(),
        InventoryService.getAllProducts(),
        InventoryService.getAllLocations()
      ])

      if (transactionsResult.success) {
        setTransactions(transactionsResult.data || [])
      } else {
        setError(transactionsResult.message)
      }

      if (productsResult.success) {
        setProducts(productsResult.data || [])
      }

      if (locationsResult.success) {
        setLocations(locationsResult.data || [])
      }
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = async () => {
    // If any filters are applied, fetch filtered data from server
    const hasFilters = filters.start_date || filters.end_date || 
                      filters.transaction_types.length > 0 || 
                      filters.product_id || filters.location_id

    if (hasFilters) {
      setLoading(true)
      try {
        const result = await InventoryService.getAllTransactions({
          start_date: filters.start_date,
          end_date: filters.end_date,
          transaction_types: filters.transaction_types.length > 0 ? filters.transaction_types : undefined,
          product_id: filters.product_id,
          location_id: filters.location_id,
        })

        if (result.success) {
          setFilteredTransactions(result.data || [])
        } else {
          setError(result.message)
        }
      } catch (err) {
        setError('Failed to apply filters')
      } finally {
        setLoading(false)
      }
    } else {
      setFilteredTransactions(transactions)
    }
  }

  const handleFilterChange = (field: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTransactionTypeToggle = (type: TransactionType) => {
    setFilters(prev => ({
      ...prev,
      transaction_types: prev.transaction_types.includes(type)
        ? prev.transaction_types.filter(t => t !== type)
        : [...prev.transaction_types, type]
    }))
  }

  const clearFilters = () => {
    setFilters({
      start_date: null,
      end_date: null,
      transaction_types: [],
      product_id: null,
      location_id: null,
      user_id: null
    })
  }

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'SALE':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'PURCHASE_RECEIPT':
        return <Package className="h-4 w-4 text-blue-600" />
      case 'ADJUSTMENT_ADD':
        return <Plus className="h-4 w-4 text-blue-600" />
      case 'ADJUSTMENT_SUB':
        return <Minus className="h-4 w-4 text-red-600" />
      case 'TRANSFER_OUT':
        return <TrendingDown className="h-4 w-4 text-orange-600" />
      case 'TRANSFER_IN':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'RETURN':
        return <RotateCcw className="h-4 w-4 text-purple-600" />
      case 'INITIAL_STOCK':
        return <ArrowUpDown className="h-4 w-4 text-gray-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTransactionType = (type: TransactionType) => {
    switch (type) {
      case 'SALE':
        return 'Sale'
      case 'PURCHASE_RECEIPT':
        return 'Purchase Receipt'
      case 'ADJUSTMENT_ADD':
        return 'Adjustment (Add)'
      case 'ADJUSTMENT_SUB':
        return 'Adjustment (Sub)'
      case 'TRANSFER_OUT':
        return 'Transfer Out'
      case 'TRANSFER_IN':
        return 'Transfer In'
      case 'RETURN':
        return 'Return'
      case 'INITIAL_STOCK':
        return 'Initial Stock'
      default:
        return type.replace('_', ' ')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Show access denied if not admin or staff
  if (persona && !['admin', 'staff'].includes(persona.type)) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">Only administrators and staff can view transaction logs.</p>
        </div>
      </div>
    )
  }

  if (loading && filteredTransactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
                  Transaction History - {currentLocation.name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Complete audit trail of inventory movements for this location.
                </p>
              </div>
            </div>
          )}
          {!locationId && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Transaction Log</h1>
              <p className="mt-1 text-sm text-gray-600">
                Complete audit trail of all inventory movements.
              </p>
            </>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filter Transactions</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value || null)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value || null)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Product Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product
              </label>
              <select
                value={filters.product_id || ''}
                onChange={(e) => handleFilterChange('product_id', e.target.value ? parseInt(e.target.value) : null)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All products</option>
                {products.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={filters.location_id || ''}
                onChange={(e) => handleFilterChange('location_id', e.target.value ? parseInt(e.target.value) : null)}
                disabled={!!locationId} // Disable if locationId is in URL
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All locations</option>
                {locations.map((location) => (
                  <option key={location.location_id} value={location.location_id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transaction Types */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Types
            </label>
            <div className="flex flex-wrap gap-2">
              {(['SALE', 'PURCHASE_RECEIPT', 'ADJUSTMENT_ADD', 'ADJUSTMENT_SUB', 'TRANSFER_OUT', 'TRANSFER_IN', 'RETURN', 'INITIAL_STOCK'] as TransactionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTransactionTypeToggle(type)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.transaction_types.includes(type)
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {getTransactionIcon(type)}
                  <span>{formatTransactionType(type)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {locationId && currentLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Location Details</h3>
              <p className="text-sm text-blue-700">
                {currentLocation.address || 'No address specified'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Transactions ({filteredTransactions.length})
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions found</p>
            <p className="text-sm text-gray-500 mt-1">
              {transactions.length === 0 
                ? "No transactions have been recorded yet"
                : "Try adjusting your filters"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch/Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.product_sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.location_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(transaction.transaction_type)}
                        <span className="text-sm text-gray-900">
                          {formatTransactionType(transaction.transaction_type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        transaction.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.quantity_change > 0 ? '+' : ''}{transaction.quantity_change}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.user_email || 'admin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {transaction.batch_lot_number && (
                          <div className="text-xs">Lot: {transaction.batch_lot_number}</div>
                        )}
                        {transaction.reference_id && (
                          <div className="text-xs">Ref: {transaction.reference_id}</div>
                        )}
                        {transaction.notes && (
                          <div className="text-xs truncate max-w-xs" title={transaction.notes}>
                            {transaction.notes}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionsPage