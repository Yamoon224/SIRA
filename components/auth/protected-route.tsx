"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ProtectedRouteProps {
    children: React.ReactNode
}

/**
 * Pages lisibles sans connexion internet : sans réseau, NextAuth ne peut pas
 * joindre /api/auth/session et considère l'utilisateur déconnecté. Pour ces
 * pages (contenu purement local, rien n'est demandé à l'API), on affiche le
 * contenu au lieu de renvoyer vers la connexion — qui échouerait de toute
 * façon hors ligne.
 */
const OFFLINE_CAPABLE_PATHS = ["/formations/hors-ligne"]

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [offline, setOffline] = useState(false)

    useEffect(() => {
        const update = () => setOffline(!navigator.onLine)
        update()
        window.addEventListener("online", update)
        window.addEventListener("offline", update)
        return () => {
            window.removeEventListener("online", update)
            window.removeEventListener("offline", update)
        }
    }, [])

    const offlineBypass = offline && OFFLINE_CAPABLE_PATHS.includes(pathname)

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !offlineBypass) {
            router.push("/auth/signin")
        }
    }, [isAuthenticated, isLoading, offlineBypass, router])

    if (offlineBypass) {
        return <>{children}</>
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}
