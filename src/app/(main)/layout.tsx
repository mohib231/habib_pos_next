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
  const { isAuthenticated } = useUser()
  const router = useRouter()
  const [isMounted, setIsMounted] = React.useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!isAuthenticated) {
      router.push('/sign-in')
    }
  }, [router])

  // Prevent flash of content before auth check
  if (!isMounted) return null

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto w-full relative">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
