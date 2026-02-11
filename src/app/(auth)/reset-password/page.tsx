'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 1. Get token and email from the URL query parameters
  const token = searchParams.get('token')
  const email = searchParams.get('email') // Optional, mainly for display or double verification

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<{
    type: 'error' | 'success' | null
    message: string | null
  }>({ type: null, message: null })
  const [isLoading, setIsLoading] = useState(false)

  // Check if token exists on mount
  useEffect(() => {
    if (!token) {
      setStatus({ type: 'error', message: 'Invalid or missing reset token.' })
    }
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsLoading(true)
    setStatus({ type: null, message: null })

    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' })
      setIsLoading(false)
      return
    }

    if (passwords.newPassword.length < 6) {
      setStatus({
        type: 'error',
        message: 'Password must be at least 6 characters long.',
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token, // Sending the token we got from the URL query
          password: passwords.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Password reset successfully! Redirecting to login...',
        })
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Token is invalid or has expired.',
        })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to connect to server.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          Error: No reset token provided in the URL.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500 mb-4 text-white">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-indigo-100">
            {email ? `For ${email}` : 'Enter your new secure password below.'}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {status.message && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 text-sm ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}
              >
                {status.type === 'error' ? (
                  <AlertCircle size={20} />
                ) : (
                  <CheckCircle size={20} />
                )}
                {status.message}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  className="block w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="New Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Confirm New Password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors focus:ring-4 focus:ring-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Updating...
                </>
              ) : (
                'Set New Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Next.js requires components using useSearchParams to be wrapped in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
