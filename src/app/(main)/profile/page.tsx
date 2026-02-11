'use client'

import React, { useState, useEffect } from 'react'
import {
  User,
  Lock,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { authenticatedFetch } from '@/utils/api'

export default function ProfilePage() {
  const { user, login } = useUser() // We will use login() to update the local context after saving

  // Form States
  const [username, setUsername] = useState('')
  const [passwords, setPasswords] = useState({ new: '', confirm: '' })

  // UI States
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'error' | 'success' | null
    message: string | null
  }>({ type: null, message: null })

  // Load current username when user context is ready
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: null, message: null })

    console.log(user)

    if (!user?.id) {
      setStatus({ type: 'error', message: 'You must be logged in.' })
      setIsLoading(false)
      return
    }

    // 1. Client-side Validation
    if (passwords.new && passwords.new !== passwords.confirm) {
      setStatus({ type: 'error', message: 'Passwords do not match.' })
      setIsLoading(false)
      return
    }

    if (passwords.new && passwords.new.length < 6) {
      setStatus({
        type: 'error',
        message: 'Password must be at least 6 characters.',
      })
      setIsLoading(false)
      return
    }

    try {
      // 2. Prepare Payload (Only send fields that have values)
      const payload: { username: string; password?: string } = { username }
      if (passwords.new) {
        payload.password = passwords.new
      }

      // 3. API Call
      const response = await authenticatedFetch(`/api/profile/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: 'Profile updated successfully!' })

        // 4. Update Local Context so Sidebar updates immediately
        // We re-use the login function to update the state without refreshing
        if (user) {
          // We need the token to keep the session valid in the context helper
          const currentToken = localStorage.getItem('token') || ''
          login({
            id: user.id,
            email: user.email, // Email didn't change
            token: currentToken,
          })
        }

        // Clear password fields for security
        setPasswords({ new: '', confirm: '' })
      } else {
        setStatus({ type: 'error', message: data.message || 'Update failed.' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to connect to server.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
          <ShieldCheck className="text-indigo-600" />
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account credentials and security.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Status Alert */}
        {status.message && (
          <div
            className={`p-4 ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
          >
            <div className="flex items-center gap-2">
              {status.type === 'error' ? (
                <AlertCircle size={20} />
              ) : (
                <CheckCircle size={20} />
              )}
              <p>{status.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Section 1: Public Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Public Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  This is how you will appear on receipts and logs.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="block w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Email cannot be changed directly.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Change Password
            </h3>
            <p className="text-sm text-gray-500">
              Leave these blank if you do not want to change your password.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
