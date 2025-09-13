import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, LogOut, User } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="ml-2 text-lg font-semibold text-gray-900 lg:hidden">
            Your App
          </h2>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex sm:flex-col sm:text-right">
              <span className="text-sm font-medium text-gray-900">
                {user?.email}
              </span>
              <span className="text-xs text-gray-500">
                {user ? 'Authenticated' : 'Not authenticated'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header