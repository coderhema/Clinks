"use client"

import { TamboProvider } from "@tambo-ai/react"
import { type ReactNode, useEffect, useState } from "react"

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const [apiKey, setApiKey] = useState<string>("")
  const [isValidKey, setIsValidKey] = useState<boolean>(false)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TAMBO_TOKEN || ""
    setApiKey(key)

    // Validate API key format
    if (!key || key === "your_api_key_here") {
      console.warn("⚠️ Tambo API key not configured. Please add NEXT_PUBLIC_TAMBO_TOKEN to your .env.local file.")
      setIsValidKey(false)
    } else if (key.length < 10) {
      console.error("❌ Tambo API key appears invalid (too short). Please check your key.")
      setIsValidKey(false)
    } else {
      console.log("✅ Tambo API key configured")
      setIsValidKey(true)
    }
  }, [])

  // Always render children, but only wrap with TamboProvider if key is valid
  if (!apiKey || !isValidKey) {
    return <>{children}</>
  }

  return <TamboProvider apiKey={apiKey}>{children}</TamboProvider>
}
