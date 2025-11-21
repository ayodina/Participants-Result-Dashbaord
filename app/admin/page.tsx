"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { AdminPanel } from "@/components/admin-panel"
import { isAdminAuthenticated } from "@/lib/auth"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // <CHANGE> Use the auth helper function with localStorage
    const authenticated = isAdminAuthenticated()

    if (authenticated) {
      setIsAuthenticated(true)
    } else {
      router.push("/admin/login")
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <AdminPanel />
}
