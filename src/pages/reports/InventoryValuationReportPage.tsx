import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { InventoryService } from '../../services/inventoryService'
import { InventoryValuationItem, Category, Location } from '../../types/inventory'
import { 
  ArrowLeft, 
  DollarSign, 
  Filter, 
  Download, 
  AlertCircle, 
  Package 
} from 'lucide-react'

const InventoryValuationReportPage: React.FC = () => {
  const { persona } = useAuth()
  const [reportData, setReportData] = useState<InventoryValuationItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter state
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadReportData()
  }, [selectedLocationId, selectedCategoryId])

  const loadInitialData = async () => {
    try {
      const [categoriesResult, locationsResult] = await Promise.all([
        InventoryService.getAllCategories(),
        InventoryService.getAllLocations()
      ])

      if (categoriesResult.success) {
        setCategories(categoriesResult.data || [])
      }

      if (locationsResult.success) {
        setLocations(locationsResult.data || [])
      }
    } catch (err) {
      console.error('Error loading initial data:', err)
    }
  }

  const loadReportData = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await InventoryService.getInventoryValuationReport(
        selectedLocationId,
        selectedCategoryId
      )

      if (result.success) {
        setReportData(result.data || [])
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to load inventory valuation report')
      console.error('Error loading report:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateGrandTotal = () => {
    return reportData.reduce((total, item) => total + item.total_value, 0)
  }

  const clearMessages = () => {
    setError('')
  }

  // Show access denied if not admin or staff
  if (persona && !['admin', 'staff'].includes(persona.type)) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">Only administrators and staff can view reports.</p>
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
            to="/reports"
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Valuation Report</h1>
            <p className="mt-1 text-sm text-gray-600">
              View the total value of your inventory by product, location, and category.
            </p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={clearMessages} className="ml-auto text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              value={selectedLocationId || ''}
              onChange={(e) => setSelectedLocationId(e.target.value ? parseInt(e.target.value) : null)}
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

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(e.target.value ? parseInt(e.target.value) : null)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Data */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Inventory Valuation ({reportData.length} items)
          </h3>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-lg font-semibold text-green-600">
              Total: ${calculateGrandTotal().toFixed(2)}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading report data...</p>
          </div>
        ) : reportData.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No inventory data found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your filters or add some products to your inventory.
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
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.location_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${item.purchase_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {item.current_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      ${item.total_value.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    Grand Total:
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600 text-right">
                    ${calculateGrandTotal().toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryValuationReportPage