'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderPlus,
  TrendingUp,
  DollarSign,
  AlertCircle,
  BarChart3,
  LucideIcon,
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { authenticatedFetch } from '@/utils/api'

// --- Types ---
interface Sale {
  _id: string
  totalPrice: number
  quantity: number
  saleDate: string
  createdAt: string
  item?: {
    name: string
  }
}

interface Item {
  _id: string
  stock: number
}

interface Category {
  _id: string
}

interface DashboardStats {
  totalSales: number
  totalRevenue: number
  totalItems: number
  totalCategories: number
  lowStockItems: number
  recentSales: Sale[]
}

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  color: string
  link: string
}

export default function DashboardPage() {
  const { user, loading } = useUser()
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalItems: 0,
    totalCategories: 0,
    lowStockItems: 0,
    recentSales: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (loading) return // Wait for user loading to finish
    fetchDashboardData()
  }, [loading])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Use authenticatedFetch for secure data access
      const [salesRes, itemsRes, categoriesRes] = await Promise.all([
        authenticatedFetch('/api/sales'),
        authenticatedFetch('/api/items'),
        authenticatedFetch('/api/categories'),
      ])

      const [salesData, itemsData, categoriesData] = await Promise.all([
        salesRes.json(),
        itemsRes.json(),
        categoriesRes.json(),
      ])

      const sales: Sale[] = salesData?.sales || []
      const items: Item[] = itemsData?.items || []
      const categories: Category[] = categoriesData?.categories || []

      // Calculate stats
      const totalRevenue = sales.reduce(
        (sum, sale) => sum + (sale.totalPrice || 0),
        0,
      )

      const lowStockItems = items.filter((item) => item.stock <= 10).length
      // Get last 5 sales
      const recentSales = sales.slice(-5).reverse()

      setStats({
        totalSales: sales.length,
        totalRevenue,
        totalItems: items.length,
        totalCategories: categories.length,
        lowStockItems,
        recentSales,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({
    icon: Icon,
    title,
    value,
    color,
    link,
  }: StatCardProps) => (
    <Link href={link} className="block">
      <div
        className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${color}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
          <div
            className={`p-3 rounded-full ${color
              .replace('border-', 'bg-')
              .replace('600', '100')}`}
          >
            <Icon className={color.replace('border-', 'text-')} size={24} />
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
            <LayoutDashboard className="text-indigo-600" />
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.username || 'User'}! Here's your business
            overview.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={DollarSign}
                title="Total Revenue"
                value={`Rs${stats.totalRevenue.toFixed(2)}`}
                color="border-green-600"
                link="/sales"
              />
              <StatCard
                icon={ShoppingCart}
                title="Total Sales"
                value={stats.totalSales}
                color="border-blue-600"
                link="/sales"
              />
              <StatCard
                icon={Package}
                title="Total Items"
                value={stats.totalItems}
                color="border-purple-600"
                link="/items"
              />
              <StatCard
                icon={FolderPlus}
                title="Categories"
                value={stats.totalCategories}
                color="border-indigo-600"
                link="/categories"
              />
            </div>

            {/* Low Stock Alert */}
            {stats.lowStockItems > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="text-yellow-600 mr-3" size={24} />
                  <div>
                    <p className="font-semibold text-yellow-800">
                      Low Stock Alert!
                    </p>
                    <p className="text-yellow-700 text-sm">
                      {stats.lowStockItems} item
                      {stats.lowStockItems > 1 ? 's' : ''} running low on stock
                      (≤10 units)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  href="/sales"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg text-center font-medium transition-colors"
                >
                  <ShoppingCart className="mx-auto mb-2" size={24} />
                  New Sale
                </Link>
                <Link
                  href="/items"
                  className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg text-center font-medium transition-colors"
                >
                  <Package className="mx-auto mb-2" size={24} />
                  Manage Items
                </Link>
                <Link
                  href="/categories"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center font-medium transition-colors"
                >
                  <FolderPlus className="mx-auto mb-2" size={24} />
                  Categories
                </Link>
                <button
                  onClick={fetchDashboardData}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-center font-medium transition-colors"
                >
                  <BarChart3 className="mx-auto mb-2" size={24} />
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingCart />
                Recent Sales
              </h2>
              {stats.recentSales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No sales recorded yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.recentSales.map((sale, index) => (
                        <tr
                          key={sale._id || index}
                          className="hover:bg-gray-50"
                        >
                          <td className="text-left px-4 py-3 text-sm text-gray-900">
                            {sale.item?.name || 'N/A'}
                          </td>
                          <td className="text-left px-4 py-3 text-sm text-gray-900">
                            {sale.quantity}
                          </td>
                          <td className="text-left px-4 py-3 text-sm font-semibold text-green-600">
                            Rs{sale.totalPrice?.toFixed(2) || '0.00'}
                          </td>
                          <td className="text-left px-4 py-3 text-sm text-gray-500">
                            {new Date(
                              sale.saleDate || sale.createdAt,
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
