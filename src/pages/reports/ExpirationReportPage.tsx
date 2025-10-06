import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Clock, AlertCircle, ArrowLeft, Package, Calendar, MapPin } from 'lucide-react'

interface ExpiringItem {
  stock_on_hand_id: number
  product_id: number
  product_name: string
  sku: string
  batch_number: string
  expiry_date: string
  quantity: number
  location_name: string
  days_until_expiry: number
  status: 'expired' | 'expiring_soon' | 'expiring_later'
}

const ExpirationReportPage: React.FC = () => {
  const { persona } = useAuth()
  const [items, setItems] = useState<ExpiringItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'expired' | 'expiring_soon' | 'expiring_later'>('all')

  useEffect(() => {
    loadExpiringItems()
  }, [])

  const loadExpiringItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('inv_stock_on_hand')
        .select(`
          stock_on_hand_id,
          product_id,
          quantity,
          batch_id,
          location_id,
          inv_products!inner(product_name, sku),
          inv_locations!inner(name),
          inv_expiring_batches!inner(batch_number, expiry_date)
        `)
        .gt('quantity', 0)
        .not('inv_expiring_batches.expiry_date', 'is', null)
        .order('inv_expiring_batches(expiry_date)', { ascending: true })

      if (error) throw error

      const formattedItems: ExpiringItem[] = (data || []).map((item: any) => {
        const expiryDate = new Date(item.inv_expiring_batches.expiry_date)
        const today = new Date()
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        let status: 'expired' | 'expiring_soon' | 'expiring_later'
        if (daysUntilExpiry < 0) {
          status = 'expired'
        } else if (daysUntilExpiry <= 30) {
          status = 'expiring_soon'
        } else {
          status = 'expiring_later'
        }

        return {
          stock_on_hand_id: item.stock_on_hand_id,
          product_id: item.product_id,
          product_name: item.inv_products.product_name,
          sku: item.inv_products.sku,
          batch_number: item.inv_expiring_batches.batch_number,
          expiry_date: item.inv_expiring_batches.expiry_date,
          quantity: item.quantity,
          location_name: item.inv_locations.name,
          days_until_expiry: daysUntilExpiry,
          status
        }
      })

      setItems(formattedItems)
    } catch (error) {
      console.error('Error loading expiring items:', error)
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

  const expiredCount = items.filter(i => i.status === 'expired').length
  const expiringSoonCount = items.filter(i => i.status === 'expiring_soon').length
  const expiringLaterCount = items.filter(i => i.status === 'expiring_later').length

  const getStatusBadge = (status: string, daysUntilExpiry: number) => {
    if (status === 'expired') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired {Math.abs(daysUntilExpiry)} days ago
        </span>
      )
    } else if (status === 'expiring_soon') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Expires in {daysUntilExpiry} days
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Expires in {daysUntilExpiry} days
        </span>
      )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expiration report...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Expiration Report</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track products expiring soon to minimize waste
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired Items</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{expiredCount}</p>
              <p className="text-xs text-gray-500 mt-1">Immediate action required</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{expiringSoonCount}</p>
              <p className="text-xs text-gray-500 mt-1">Within 30 days</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Later</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{expiringLaterCount}</p>
              <p className="text-xs text-gray-500 mt-1">After 30 days</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
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
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'expired'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expired ({expiredCount})
            </button>
            <button
              onClick={() => setFilter('expiring_soon')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'expiring_soon'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expiring Soon ({expiringSoonCount})
            </button>
            <button
              onClick={() => setFilter('expiring_later')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'expiring_later'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expiring Later ({expiringLaterCount})
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
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                  <tr key={item.stock_on_hand_id} className="hover:bg-gray-50">
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
                      <span className="text-sm text-gray-900">{item.batch_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {item.location_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(item.expiry_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status, item.days_until_expiry)}
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

export default ExpirationReportPage
