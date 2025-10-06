import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import {
  FileText,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  ShoppingCart,
  TrendingUp,
  ArrowRightLeft,
  Settings
} from 'lucide-react'

interface Transaction {
  transaction_id: number
  transaction_type: string
  product_name: string
  sku: string
  location_name: string
  quantity_change: number
  purchase_price: number | null
  selling_price: number | null
  created_at: string
  notes: string | null
}

const TransactionHistoryReportPage: React.FC = () => {
  const { persona } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month')

  useEffect(() => {
    loadTransactions()
  }, [dateFilter])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('inv_transactions')
        .select(`
          transaction_id,
          transaction_type,
          quantity_change,
          purchase_price,
          selling_price,
          notes,
          created_at,
          inv_products!inner(product_name, sku),
          inv_locations!inner(name)
        `)
        .order('created_at', { ascending: false })

      const now = new Date()
      if (dateFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        query = query.gte('created_at', today.toISOString())
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        query = query.gte('created_at', weekAgo.toISOString())
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        query = query.gte('created_at', monthAgo.toISOString())
      }

      const { data, error } = await query.limit(500)

      if (error) throw error

      const formattedTransactions: Transaction[] = (data || []).map((tx: any) => ({
        transaction_id: tx.transaction_id,
        transaction_type: tx.transaction_type,
        product_name: tx.inv_products.product_name,
        sku: tx.inv_products.sku,
        location_name: tx.inv_locations.name,
        quantity_change: tx.quantity_change,
        purchase_price: tx.purchase_price,
        selling_price: tx.selling_price,
        created_at: tx.created_at,
        notes: tx.notes
      }))

      setTransactions(formattedTransactions)
    } catch (error) {
      console.error('Error loading transactions:', error)
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

  const filteredTransactions = transactions.filter(tx => {
    if (typeFilter === 'all') return true
    return tx.transaction_type === typeFilter
  })

  const purchaseCount = transactions.filter(t => t.transaction_type === 'PURCHASE_RECEIPT').length
  const saleCount = transactions.filter(t => t.transaction_type === 'SALE').length
  const transferCount = transactions.filter(t => t.transaction_type.includes('TRANSFER')).length
  const adjustmentCount = transactions.filter(t => t.transaction_type.includes('ADJUSTMENT')).length

  const totalPurchaseValue = transactions
    .filter(t => t.transaction_type === 'PURCHASE_RECEIPT')
    .reduce((sum, t) => sum + (Math.abs(t.quantity_change) * (t.purchase_price || 0)), 0)

  const totalSalesValue = transactions
    .filter(t => t.transaction_type === 'SALE')
    .reduce((sum, t) => sum + (Math.abs(t.quantity_change) * (t.selling_price || 0)), 0)

  const getTransactionIcon = (type: string) => {
    if (type === 'PURCHASE_RECEIPT') return <TrendingUp className="h-5 w-5 text-blue-600" />
    if (type === 'SALE') return <ShoppingCart className="h-5 w-5 text-green-600" />
    if (type.includes('TRANSFER')) return <ArrowRightLeft className="h-5 w-5 text-teal-600" />
    return <Settings className="h-5 w-5 text-orange-600" />
  }

  const getTransactionBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'PURCHASE_RECEIPT': { label: 'Purchase', color: 'bg-blue-100 text-blue-800' },
      'SALE': { label: 'Sale', color: 'bg-green-100 text-green-800' },
      'TRANSFER_IN': { label: 'Transfer In', color: 'bg-teal-100 text-teal-800' },
      'TRANSFER_OUT': { label: 'Transfer Out', color: 'bg-teal-100 text-teal-800' },
      'ADJUSTMENT_ADD': { label: 'Adjustment +', color: 'bg-orange-100 text-orange-800' },
      'ADJUSTMENT_SUB': { label: 'Adjustment -', color: 'bg-orange-100 text-orange-800' }
    }

    const badge = badges[type] || { label: type, color: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Product', 'SKU', 'Location', 'Quantity', 'Purchase Price', 'Selling Price', 'Notes']
    const rows = filteredTransactions.map(tx => [
      new Date(tx.created_at).toLocaleString(),
      tx.transaction_type,
      tx.product_name,
      tx.sku,
      tx.location_name,
      tx.quantity_change,
      tx.purchase_price || '',
      tx.selling_price || '',
      tx.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction history...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="mt-1 text-sm text-gray-600">
              Complete log of all inventory transactions
            </p>
          </div>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Purchases</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{purchaseCount}</p>
              <p className="text-xs text-gray-500 mt-1">${totalPurchaseValue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{saleCount}</p>
              <p className="text-xs text-gray-500 mt-1">${totalSalesValue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-teal-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transfers</p>
              <p className="text-2xl font-bold text-teal-600 mt-1">{transferCount}</p>
              <p className="text-xs text-gray-500 mt-1">Between locations</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Adjustments</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{adjustmentCount}</p>
              <p className="text-xs text-gray-500 mt-1">Manual adjustments</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex gap-2">
                <button
                  onClick={() => setDateFilter('today')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'today'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setDateFilter('week')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setDateFilter('month')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types ({transactions.length})</option>
                <option value="PURCHASE_RECEIPT">Purchases ({purchaseCount})</option>
                <option value="SALE">Sales ({saleCount})</option>
                <option value="TRANSFER_IN">Transfer In</option>
                <option value="TRANSFER_OUT">Transfer Out</option>
                <option value="ADJUSTMENT_ADD">Adjustment +</option>
                <option value="ADJUSTMENT_SUB">Adjustment -</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No transactions found matching the selected filters</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.transaction_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tx.created_at).toLocaleDateString()}<br />
                      <span className="text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(tx.transaction_type)}
                        {getTransactionBadge(tx.transaction_type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tx.product_name}</p>
                        <p className="text-xs text-gray-500">{tx.sku}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.location_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        tx.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.quantity_change > 0 ? '+' : ''}{tx.quantity_change}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.purchase_price && `$${(Math.abs(tx.quantity_change) * tx.purchase_price).toFixed(2)}`}
                      {tx.selling_price && `$${(Math.abs(tx.quantity_change) * tx.selling_price).toFixed(2)}`}
                      {!tx.purchase_price && !tx.selling_price && '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {tx.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionHistoryReportPage
