typescript
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { InventoryService } from '../../services/inventoryService'
import { Supplier } from '../../types/inventory'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Truck, 
  AlertCircle, 
  CheckCircle,
  Mail,
  Phone
} from 'lucide-react'

const SuppliersPage: React.FC = () => {
  const { persona } = useAuth()
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [suppliers, searchTerm])

  const loadSuppliers = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await InventoryService.getAllSuppliers()
      
      if (result.success) {
        setSuppliers(result.data || [])
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...suppliers]

    // Search filter
    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        supplier.contact_person?.toLowerCase().includes(lowerCaseSearchTerm) ||
        supplier.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        supplier.phone?.toLowerCase().includes(lowerCaseSearchTerm)
      )
    }

    setFilteredSuppliers(filtered)
  }

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!supplierToDelete) return

    setDeleteLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await InventoryService.deleteSupplier(supplierToDelete.supplier_id)
      
      if (result.success) {
        setSuccess('Supplier deleted successfully')
        setShowDeleteModal(false)
        setSupplierToDelete(null)
        await loadSuppliers() // Reload the data
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to delete supplier')
    } finally {
      setDeleteLoading(false)
    }
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const isAdmin = persona?.type === 'admin'

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product suppliers.
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/management/suppliers/create"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Supplier</span>
          </Link>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={clearMessages} className="ml-auto text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
          <button onClick={clearMessages} className="ml-auto text-green-500 hover:text-green-700">
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Search Suppliers</h3>
        </div>
        
        <div>
          <label htmlFor="search" className="sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by name, contact, email, or phone..."
            />
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Suppliers ({filteredSuppliers.length})
          </h3>
        </div>

        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No suppliers found</p>
            <p className="text-sm text-gray-500 mt-1">
              {suppliers.length === 0 
                ? "Add your first supplier to get started"
                : "Try adjusting your search filters"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.supplier_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier.contact_person || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        {supplier.email && (
                          <span className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-1" /> {supplier.email}
                          </span>
                        )}
                        {supplier.phone && (
                          <span className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-1" /> {supplier.phone}
                          </span>
                        )}
                        {!supplier.email && !supplier.phone && '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {isAdmin && (
                          <>
                            <Link
                              to={`/management/suppliers/${supplier.supplier_id}/edit`}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Supplier"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(supplier)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Supplier"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && supplierToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)}></div>
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-medium text-gray-900">Delete Supplier</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">{supplierToDelete.name}</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuppliersPage
