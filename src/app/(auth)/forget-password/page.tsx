'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  ArrowLeft,
  Loader2,
  KeyRound,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<{
    type: 'error' | 'success' | null
    message: string | null
  }>({ type: null, message: null })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: null, message: null })

    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address.' })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          type: 'success',
          message:
            'If an account exists with this email, you will receive a password reset link shortly.',
        })
        setEmail('') // Clear the input
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Something went wrong. Please try again.',
        })
      }
    } catch (error: any) {
      console.log(error)
      setStatus({ type: 'error', message: 'Failed to connect to the server.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500 mb-4 text-white">
            <KeyRound size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Forgot Password?
          </h2>
          <p className="text-indigo-100">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {status.message && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
                  status.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}
              >
                {status.type === 'error' ? (
                  <AlertCircle size={20} className="shrink-0" />
                ) : (
                  <CheckCircle size={20} className="shrink-0" />
                )}
                {status.message}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors focus:ring-4 focus:ring-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Sending Link...
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
