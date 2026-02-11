'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  FolderPlus,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Category } from '@/types'
import { authenticatedFetch } from '@/utils/api'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState<{
    type: 'error' | 'success' | null
    message: string | null
  }>({ type: null, message: null })
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await authenticatedFetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      showStatus('error', 'Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }

  const showStatus = (type: 'error' | 'success', message: string) => {
    setStatus({ type, message })
    setTimeout(() => setStatus({ type: null, message: null }), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const url = editMode
        ? `/api/categories/${formData.id}`
        : '/api/categories'
      const method = editMode ? 'PUT' : 'POST'
      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      })

      if (response.ok) {
        showStatus(
          'success',
          `Category ${editMode ? 'updated' : 'created'} successfully`,
        )
        fetchCategories()
        closeModal()
      } else {
        const data = await response.json()
        showStatus('error', data.message || 'Operation failed')
      }
    } catch (error) {
      showStatus('error', 'Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?'))
      return
    try {
      const response = await authenticatedFetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        showStatus('success', 'Category deleted successfully')
        fetchCategories()
      } else {
        showStatus('error', 'Failed to delete category')
      }
    } catch (error) {
      showStatus('error', 'Network error occurred')
    }
  }

  const openModal = (category: Category | null = null) => {
    if (category) {
      setEditMode(true)
      setFormData({
        id: category._id,
        name: category.name,
        description: category.description || '',
      })
    } else {
      setEditMode(false)
      setFormData({ id: '', name: '', description: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData({ id: '', name: '', description: '' })
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FolderPlus className="text-indigo-600" />
              Categories
            </h1>
            <button
              onClick={() => openModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Category
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Status Alert */}
        {status.message && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              status.type === 'error'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-green-50 text-green-600 border border-green-200'
            }`}
          >
            {status.type === 'error' ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            {status.message}
          </div>
        )}

        {/* Categories Grid */}
        {isLoading && !showModal ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {category.name}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(category)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  {category.description || 'No description'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Created:{' '}
                  {category.createdAt
                    ? new Date(category.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}

        {filteredCategories.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FolderPlus size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No categories found</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editMode ? 'Edit Category' : 'Add New Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : editMode ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
