"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [student, setStudent] = useState<any>(null)

  const handleLogin = (studentData: any) => {
    setStudent(studentData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setStudent(null)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <LoginForm onLogin={handleLogin} />
      </div>
    )
  }

  return <Dashboard student={student} onLogout={handleLogout} />
}
