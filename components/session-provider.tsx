"use client"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import type React from "react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // refetchInterval : force le passage régulier dans le callback `jwt`
  // (route /api/auth/session, seul endroit où le cookie de session est réécrit)
  // pour que le token backend soit tourné avant son expiration à 60 min.
  return (
    <NextAuthSessionProvider refetchInterval={20 * 60} refetchOnWindowFocus>
      {children}
    </NextAuthSessionProvider>
  )
}
