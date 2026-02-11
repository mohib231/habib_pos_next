'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderPlus,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import path from 'path'

export default function Sidebar() {
  const { user, logout } = useUser()
  const pathname = usePathname() // Next.js equivalent of useLocation
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    router.push('/sign-in')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/items', label: 'Inventory Items', icon: Package },
    { path: '/categories', label: 'Categories', icon: FolderPlus },
    { path: '/sales', label: 'Sales & Orders', icon: ShoppingCart },
    { path: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <aside
      className={`bg-white shadow-xl transition-all duration-300 z-20 flex flex-col ${
        isSidebarOpen ? 'w-64' : 'w-20'
      } fixed h-full md:relative`}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between h-16">
        <div
          className={`font-bold text-xl text-indigo-600 truncate ${!isSidebarOpen && 'hidden'}`}
        >
          Phone Fixer
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={20} />
                  <span
                    className={`whitespace-nowrap transition-opacity ${
                      !isSidebarOpen ? 'opacity-0 w-0 hidden' : 'opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div
          className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <User size={16} />
          </div>
          {isSidebarOpen && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors ${
              !isSidebarOpen && 'mx-auto'
            }`}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
