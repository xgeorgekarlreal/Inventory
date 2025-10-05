import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Home,
  Box,
  Briefcase,
  BarChart3,
  ChevronDown,
  ChevronRight,
  X,
  Shield,
  User,
  Settings,
  Package,
  Warehouse,
  ArrowUpDown,
  MapPin,
  Truck,
  Tag,
  DollarSign,
  Building
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavigationItem {
  name: string
  href?: string
  icon: React.ComponentType<any>
  children?: NavigationItem[]
  adminOnly?: boolean
}

const navigation: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home 
  },
  {
    name: 'Inventory',
    icon: Box,
    children: [
      { name: 'Products', href: '/inventory/products', icon: Package },
      { name: 'Stock on Hand', href: '/inventory/stock', icon: Warehouse},
      { name: 'Stock by Location', href: '/inventory/stock-by-location', icon: Building, adminOnly: true },
      { name: 'Transactions', href: '/inventory/transactions', icon: ArrowUpDown },
    ]
  },
  {
    name: 'Management',
    icon: Briefcase,
    children: [
      { name: 'Locations', href: '/management/locations', icon: MapPin, adminOnly: true },
      { name: 'Suppliers', href: '/management/suppliers', icon: Truck, adminOnly: true },
      { name: 'Categories', href: '/management/categories', icon: Tag, adminOnly: true },
    ]
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3
  }
]

const adminOnlyNavigation: NavigationItem[] = [
  { name: 'Persona Management', href: '/persona-management', icon: Shield },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { persona } = useAuth()
  const [expandedSections, setExpandedSections] = useState<string[]>(['Inventory', 'Management'])

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    )
  }

  const isActive = (href: string) => location.pathname === href
  const isParentActive = (children: NavigationItem[]) => 
    children.some(child => child.href && isActive(child.href))

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.includes(item.name)
    const isItemActive = item.href ? isActive(item.href) : false
    const isParentItemActive = hasChildren ? isParentActive(item.children!) : false

    // Admin-only check for sidebar items
    if (item.adminOnly && persona?.type !== 'admin') {
      return null
    }

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleSection(item.name)}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
              ${isParentItemActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <div className="flex items-center">
              <Icon className={`
                h-5 w-5 mr-3 flex-shrink-0
                ${isParentItemActive ? 'text-blue-700' : 'text-gray-400'}
              `} />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
          
          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.name}
        to={item.href!}
        onClick={onClose}
        className={`
          flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
          ${level > 0 ? 'ml-2' : ''}
          ${isItemActive
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }
        `}
      >
        <Icon className={`
          h-5 w-5 mr-3 flex-shrink-0
          ${isItemActive ? 'text-blue-700' : 'text-gray-400'}
        `} />
        {item.name}
      </Link>
    )
  }

  return (
    <>
      {/* Backdrop - shown on all screen sizes when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Inventory Pro</h1>
              {persona && (
                <p className="text-xs text-gray-500 capitalize">
                  {persona.type === 'admin' ? 'Admin' : (persona.personName || persona.loginName || 'Staff')} Portal
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navigation.map(item => renderNavigationItem(item))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Admin/User Navigation */}
            <div className="space-y-1">
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Account
                </p>
              </div>
              {adminOnlyNavigation.map(item => {
                // Show persona management only for admins
                if (item.name === 'Persona Management' && persona?.type !== 'admin') {
                  return null
                }
                return renderNavigationItem(item)
              })}
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar