import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import {
  BarChart3,
  DollarSign,
  Clock,
  AlertTriangle,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Package,
  Warehouse,
  ShoppingCart,
  ArrowRightLeft,
  Calendar,
  Activity
} from 'lucide-react'

interface InventoryAnalytics {
  total_products: number
  total_stock_quantity: number
  total_inventory_value: number
  low_stock_items: number
  out_of_stock_items: number
  expiring_soon_items: number
  expired_items: number
}

interface TransactionAnalytics {
  total_transactions: number
  total_purchases: number
  total_sales: number
  total_transfers: number
  total_adjustments: number
  purchase_value: number
  sales_value: number
  transactions_today: number
  transactions_this_week: number
  transactions_this_month: number
}

interface CategoryAnalytics {
  category_id: number
  category_name: string
  product_count: number
  total_quantity: number
  total_value: number
}

interface LocationAnalytics {
  location_id: number
  location_name: string
  product_count: number
  total_quantity: number
  total_value: number
}

const ReportsPage: React.FC = () => {
  const { persona } = useAuth()
  const [inventoryAnalytics, setInventoryAnalytics] = useState<InventoryAnalytics | null>(null)
  const [transactionAnalytics, setTransactionAnalytics] = useState<TransactionAnalytics | null>(null)
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalytics[]>([])
  const [locationAnalytics, setLocationAnalytics] = useState<LocationAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [invResult, txResult, catResult, locResult] = await Promise.all([
        supabase.rpc('get_inventory_analytics'),
        supabase.rpc('get_transaction_analytics'),
        supabase.rpc('get_category_analytics'),
        supabase.rpc('get_location_analytics')
      ])

      if (invResult.data && invResult.data.length > 0) {
        setInventoryAnalytics(invResult.data[0])
      }
      if (txResult.data && txResult.data.length > 0) {
        setTransactionAnalytics(txResult.data[0])
      }
      if (catResult.data) {
        setCategoryAnalytics(catResult.data)
      }
      if (locResult.data) {
        setLocationAnalytics(locResult.data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
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

  const reports = [
    {
      name: 'Inventory Valuation Report',
      description: 'View the total value of your inventory by product, location, and category.',
      icon: DollarSign,
      href: '/reports/inventory-valuation',
      color: 'bg-green-100 text-green-600'
    },
    {
      name: 'Expiration Report',
      description: 'Track products that are expiring soon to minimize waste.',
      icon: Clock,
      href: '/reports/expiration',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      name: 'Low Stock Report',
      description: 'Identify products that need to be restocked based on reorder levels.',
      icon: AlertTriangle,
      href: '/reports/low-stock',
      color: 'bg-red-100 text-red-600'
    },
    {
      name: 'Transaction History Report',
      description: 'Detailed transaction log with advanced filtering and export options.',
      icon: FileText,
      href: '/reports/transaction-history',
      color: 'bg-blue-100 text-blue-600'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">
          Real-time insights and comprehensive reports for your inventory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {inventoryAnalytics?.total_products || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {inventoryAnalytics?.total_stock_quantity || 0} units in stock
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${(inventoryAnalytics?.total_inventory_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total stock value</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Issues</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(inventoryAnalytics?.low_stock_items || 0) + (inventoryAnalytics?.out_of_stock_items || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {inventoryAnalytics?.low_stock_items || 0} low, {inventoryAnalytics?.out_of_stock_items || 0} out
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(inventoryAnalytics?.expiring_soon_items || 0) + (inventoryAnalytics?.expired_items || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {inventoryAnalytics?.expiring_soon_items || 0} soon, {inventoryAnalytics?.expired_items || 0} expired
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transaction Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Purchases</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{transactionAnalytics?.total_purchases || 0}</p>
                <p className="text-xs text-gray-500">
                  ${(transactionAnalytics?.purchase_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sales</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{transactionAnalytics?.total_sales || 0}</p>
                <p className="text-xs text-gray-500">
                  ${(transactionAnalytics?.sales_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <ArrowRightLeft className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Transfers</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{transactionAnalytics?.total_transfers || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Adjustments</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{transactionAnalytics?.total_adjustments || 0}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Today</p>
                <p className="text-lg font-semibold text-gray-900">{transactionAnalytics?.transactions_today || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">This Week</p>
                <p className="text-lg font-semibold text-gray-900">{transactionAnalytics?.transactions_this_week || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">This Month</p>
                <p className="text-lg font-semibold text-gray-900">{transactionAnalytics?.transactions_this_month || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          {categoryAnalytics.length > 0 ? (
            <div className="space-y-3">
              {categoryAnalytics.slice(0, 5).map((category) => (
                <div key={category.category_id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{category.category_name}</p>
                    <p className="text-xs text-gray-500">
                      {category.product_count} products • {category.total_quantity} units
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-gray-900">
                      ${category.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No category data available</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Location Overview</h3>
            <Warehouse className="h-5 w-5 text-gray-400" />
          </div>
          {locationAnalytics.length > 0 ? (
            <div className="space-y-3">
              {locationAnalytics.map((location) => (
                <div key={location.location_id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{location.location_name}</p>
                    <p className="text-xs text-gray-500">
                      {location.product_count} products • {location.total_quantity} units
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-gray-900">
                      ${location.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No location data available</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Quick Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">Profit Potential</p>
              <p className="text-lg font-bold text-green-600">
                ${((transactionAnalytics?.sales_value || 0) - (transactionAnalytics?.purchase_value || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-600">Based on last 30 days</p>
            </div>
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">Inventory Turnover</p>
              <p className="text-lg font-bold text-blue-600">
                {transactionAnalytics?.total_sales || 0} sales
              </p>
              <p className="text-xs text-gray-600">Last 30 days</p>
            </div>
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">Stock Health</p>
              <p className="text-lg font-bold text-teal-600">
                {inventoryAnalytics ?
                  Math.round((inventoryAnalytics.total_products - inventoryAnalytics.low_stock_items - inventoryAnalytics.out_of_stock_items) / inventoryAnalytics.total_products * 100)
                  : 0}%
              </p>
              <p className="text-xs text-gray-600">Products at healthy levels</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Reports</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {reports.map((report) => {
            const Icon = report.icon
            return (
              <Link
                key={report.name}
                to={report.href}
                className="bg-gray-50 overflow-hidden rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-12 w-12 rounded-lg ${report.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-base font-medium text-gray-900">
                        {report.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
