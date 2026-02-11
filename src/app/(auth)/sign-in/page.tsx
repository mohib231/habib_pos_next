'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
  LayoutDashboard,
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useUser()
  const [status, setStatus] = useState<{
    type: 'error' | 'success' | null
    message: string | null
  }>({ type: null, message: null })
  const [isLoading, setIsLoading] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: null, message: null })

    const email = emailRef.current?.value
    const password = passwordRef.current?.value

    if (!email || !password) {
      setStatus({ type: 'error', message: 'Please fill in all fields.' })
      setIsLoading(false)
      return
    }

    try {
      // We point to the local Next.js API route
      // Make sure you have created src/app/api/sign-in/route.ts

      console.log('Sending login request for email:', email)
      const response = await fetch('/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log('Login response data:', data)

      if (response.ok) {
        const token = data?.data?.token || data?.token || undefined

        if (!token) {
          setStatus({
            type: 'error',
            message: 'Login successful but no token received.',
          })
          setIsLoading(false)
          return
        }

        // ✅ Always persist token (authenticatedFetch relies on this)
        localStorage.setItem('token', token)

        setStatus({
          type: 'success',
          message: 'Login successful! Redirecting...',
        })

        // Call login from context, which will fetch the profile (optional)
        await login(token)

        setTimeout(() => {
          router.push('/sales')
        }, 1000)
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Invalid credentials.',
        })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Unable to connect to server.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500 mb-4 text-white">
            <LayoutDashboard size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-indigo-100">Sign in to manage your detailed POS</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
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
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  ref={emailRef}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  ref={passwordRef}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your password"
                />
              </div>
              <Link
                href="/forget-password"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forget Password
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors focus:ring-4 focus:ring-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
