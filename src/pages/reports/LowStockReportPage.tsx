import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { AlertTriangle, AlertCircle, ArrowLeft, Package, MapPin, TrendingDown } from 'lucide-react'

interface LowStockItem {
  product_id: number
  product_name: string
  sku: string
  category_name: string | null
  reorder_level: number
  total_quantity: number
  locations: Array<{
    location_name: string
    quantity: number
  }>
  status: 'out_of_stock' | 'critical' | 'low'
}

const LowStockReportPage: React.FC = () => {
  const { persona } = useAuth()
  const [items, setItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'out_of_stock' | 'critical' | 'low'>('all')

  useEffect(() => {
    loadLowStockItems()
  }, [])

  const loadLowStockItems = async () => {
    setLoading(true)
    try {
      const { data: products, error: productsError } = await supabase
        .from('inv_products')
        .select(`
          product_id,
          product_name,
          sku,
          reorder_level,
          inv_categories(name)
        `)

      if (productsError) throw productsError

      const { data: stockData, error: stockError } = await supabase
        .from('inv_stock_on_hand')
        .select(`
          product_id,
          quantity,
          inv_locations(name)
        `)

      if (stockError) throw stockError

      const productStockMap = new Map<number, { total: number; locations: Array<{ location_name: string; quantity: number }> }>()

      stockData?.forEach((stock: any) => {
        if (!productStockMap.has(stock.product_id)) {
          productStockMap.set(stock.product_id, { total: 0, locations: [] })
        }
        const productStock = productStockMap.get(stock.product_id)!
        productStock.total += stock.quantity
        productStock.locations.push({
          location_name: stock.inv_locations.name,
          quantity: stock.quantity
        })
      })

      const lowStockItems: LowStockItem[] = []

      products?.forEach((product: any) => {
        const stockInfo = productStockMap.get(product.product_id) || { total: 0, locations: [] }
        const totalQuantity = stockInfo.total

        if (totalQuantity === 0 || totalQuantity <= product.reorder_level) {
          let status: 'out_of_stock' | 'critical' | 'low'
          if (totalQuantity === 0) {
            status = 'out_of_stock'
          } else if (totalQuantity <= product.reorder_level * 0.5) {
            status = 'critical'
          } else {
            status = 'low'
          }

          lowStockItems.push({
            product_id: product.product_id,
            product_name: product.product_name,
            sku: product.sku,
            category_name: product.inv_categories?.name || null,
            reorder_level: product.reorder_level,
            total_quantity: totalQuantity,
            locations: stockInfo.locations,
            status
          })
        }
      })

      lowStockItems.sort((a, b) => {
        const statusOrder = { out_of_stock: 0, critical: 1, low: 2 }
        return statusOrder[a.status] - statusOrder[b.status]
      })

      setItems(lowStockItems)
    } catch (error) {
      console.error('Error loading low stock items:', error)
    } finally {
      setLoading(false)
    }
  }

  if (persona && !['admin', 'staff'].includes(persona.type)) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">Only administrators and staff can access reports.</p>
        </div>
      </div>
    )
  }

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })

  const outOfStockCount = items.filter(i => i.status === 'out_of_stock').length
  const criticalCount = items.filter(i => i.status === 'critical').length
  const lowCount = items.filter(i => i.status === 'low').length

  const getStatusBadge = (status: string) => {
    if (status === 'out_of_stock') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      )
    } else if (status === 'critical') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Critical
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading low stock report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/reports"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Low Stock Report</h1>
            <p className="mt-1 text-sm text-gray-600">
              Products that need restocking based on reorder levels
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{outOfStockCount}</p>
              <p className="text-xs text-gray-500 mt-1">Urgent restock needed</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Level</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{criticalCount}</p>
              <p className="text-xs text-gray-500 mt-1">Below 50% of reorder level</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{lowCount}</p>
              <p className="text-xs text-gray-500 mt-1">At or below reorder level</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter('out_of_stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'out_of_stock'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'critical'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'low'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low Stock ({lowCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reorder Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locations
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No items found matching the selected filter</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.product_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <Link
                            to={`/inventory/products/${item.product_id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            {item.product_name}
                          </Link>
                          <p className="text-xs text-gray-500">{item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.category_name || 'Uncategorized'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        item.total_quantity === 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.total_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.reorder_level}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {item.locations.map((loc, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-600">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            {loc.location_name}: <span className="font-medium ml-1">{loc.quantity}</span>
                          </div>
                        ))}
                        {item.locations.length === 0 && (
                          <span className="text-xs text-gray-500">No stock</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LowStockReportPage
