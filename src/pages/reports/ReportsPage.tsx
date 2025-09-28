import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  BarChart3, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  FileText, 
  AlertCircle 
} from 'lucide-react'

const ReportsPage: React.FC = () => {
  const { persona } = useAuth()

  // Show access denied if not admin or staff
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-600">
          Generate insights and summaries from your inventory data.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Link
              key={report.name}
              to={report.href}
              className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-lg ${report.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
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

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Business Intelligence</h3>
            <p className="text-sm text-blue-700 mt-1">
              Use these reports to make informed decisions about your inventory management, 
              identify trends, and optimize your stock levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage