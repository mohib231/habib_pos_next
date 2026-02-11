'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading } = useUser()

  useEffect(() => {
    if (loading) return

    router.replace(isAuthenticated ? '/dashboard' : '/sign-in')
  }, [router, isAuthenticated, loading])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )
}
