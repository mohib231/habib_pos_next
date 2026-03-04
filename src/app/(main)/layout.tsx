'use client'

import React, { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/sign-in')
    }
  }, [loading, isAuthenticated, router])

  // Wait for auth check to complete before rendering or redirecting
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto w-full relative">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
