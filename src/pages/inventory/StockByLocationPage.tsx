import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { InventoryService } from '../../services/inventoryService'
import { Location } from '../../types/inventory'
import { 
  MapPin, 
  Package, 
  AlertCircle, 
  Eye,
  CheckSquare,
  Square
} from 'lucide-react'

const StockByLocationPage: React.FC = () => {
  const { persona } = useAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await InventoryService.getAllLocations()
      
      if (result.success) {
        // Filter to only show active locations
        const activeLocations = (result.data || []).filter(location => location.is_active)
        setLocations(activeLocations)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = () => {
    setError('')
  }

  const isAdminOrStaff = persona?.type === 'admin' || persona?.type === 'staff'

  // Show access denied if not admin or staff
  if (!isAdminOrStaff) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">Only administrators and staff can view stock by location.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock by Location</h1>
        <p className="mt-1 text-sm text-gray-600">
          Select a location to view and manage its inventory.
        </p>
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

      {/* Locations Grid */}
      {locations.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg">
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active locations found</p>
            <p className="text-sm text-gray-500 mt-1">
              Add some locations to start managing inventory by location.
            </p>
            {persona?.type === 'admin' && (
              <div className="mt-4">
                <Link
                  to="/management/locations"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Manage Locations
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <div
              key={location.location_id}
              className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {location.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      {location.is_active ? (
                        <span className="inline-flex items-center text-xs text-green-600">
                          <CheckSquare className="h-3 w-3 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-red-600">
                          <Square className="h-3 w-3 mr-1" /> Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {location.address && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {location.address}
                  </p>
                )}

                <div className="space-y-3">
                  <Link
                    to={`/inventory/stock/${location.location_id}`}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Package className="h-4 w-4" />
                    <span>View Stock</span>
                  </Link>
                  
                  <Link
                    to={`/inventory/transactions/${location.location_id}`}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View History</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Package className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Location-Based Inventory Management</h3>
            <p className="text-sm text-blue-700 mt-1">
              Select a location to view its current stock levels, perform inventory operations 
              (receive, adjust, transfer, record sales), and review transaction history. 
              This simplified workflow helps you manage inventory more efficiently by focusing 
              on one location at a time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockByLocationPage