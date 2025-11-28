"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { setTokens } from "@/lib/api-client"
import { useAuthStore } from "@/lib/store"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")
    const errorParam = searchParams.get("error")

    if (errorParam) {
      setError(errorParam)
      setTimeout(() => router.push("/login"), 3000)
      return
    }

    if (accessToken && refreshToken) {
      // Store tokens
      setTokens(accessToken, refreshToken)

      // Update auth state
      checkAuth()

      // Redirect to dashboard
      router.push("/dashboard")
    } else {
      setError("Missing authentication tokens")
      setTimeout(() => router.push("/login"), 3000)
    }
  }, [searchParams, router, checkAuth])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-bold text-destructive">Authentication Error</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <p className="mt-4 text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
