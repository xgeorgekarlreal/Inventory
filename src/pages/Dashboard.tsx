import React from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BarChart3, Users, TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Activity, Clock } from 'lucide-react'

interface DashboardData {
  low_stock_count: number
  expiring_soon_count: number
  my_recent_activity: Array<{
    created_at: string
    transaction_type: string
    quantity_change: number
    product_name: string
    location_name: string
  }>
}

const Dashboard: React.FC = () => {
  const { user, persona } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.rpc('get_user_dashboard_data')
      
      if (error) {
        console.error('Dashboard data error:', error)
        setError('Failed to load dashboard data')
        return
      }
      
      setDashboardData(data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'SALE':
        return 'Sale'
      case 'ADJUSTMENT_SUB':
        return 'Adjustment'
      case 'ADJUSTMENT_ADD':
        return 'Restock'
      case 'PURCHASE':
        return 'Purchase'
      default:
        return type.replace('_', ' ')
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'SALE':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'ADJUSTMENT_SUB':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'ADJUSTMENT_ADD':
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'PURCHASE':
        return <Package className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-6 py-8 sm:px-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-6 py-8 sm:px-8">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.email?.split('@')[0]}
                {persona && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({persona.type === 'admin' ? 'Administrator' : 'Staff Member'})
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {persona?.type === 'admin' 
                  ? "Here's your administrative dashboard overview."
                  : "Here's your staff dashboard overview."
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Real Data */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Low Stock Items
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {dashboardData?.low_stock_count || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Expiring Soon
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {dashboardData?.expiring_soon_count || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Recent Activities
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {dashboardData?.my_recent_activity?.length || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    System Status
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-green-600">
                      Online
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Areas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity - Real Data */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <button
              onClick={fetchDashboardData}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
          <div className="p-6">
            {dashboardData?.my_recent_activity && dashboardData.my_recent_activity.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.my_recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getTransactionIcon(activity.transaction_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.product_name}
                        </p>
                        <span className={`text-sm font-medium ${
                          activity.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {activity.quantity_change > 0 ? '+' : ''}{activity.quantity_change}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {formatTransactionType(activity.transaction_type)} • {activity.location_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
                <p className="text-sm text-gray-500 mt-1">Activity will appear here as you use the system</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Alerts & Notifications</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData?.low_stock_count && dashboardData.low_stock_count > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      {dashboardData.low_stock_count} items are running low on stock
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Consider restocking these items soon
                    </p>
                  </div>
                </div>
              )}
              
              {dashboardData?.expiring_soon_count && dashboardData.expiring_soon_count > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      {dashboardData.expiring_soon_count} items are expiring soon
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Check expiration dates and plan accordingly
                    </p>
                  </div>
                </div>
              )}
              
              {(!dashboardData?.low_stock_count || dashboardData.low_stock_count === 0) &&
               (!dashboardData?.expiring_soon_count || dashboardData.expiring_soon_count === 0) && (
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-gray-600">All systems running smoothly</p>
                  <p className="text-sm text-gray-500 mt-1">No alerts at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

export default Dashboard