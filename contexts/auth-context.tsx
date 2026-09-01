"use client"

import type React from "react"

import { createContext, useContext, useEffect } from "react"
import { useSession, signOut as nextAuthSignOut } from "next-auth/react"
import { IUser } from "@/lib/@types/entities"
import { authService } from "@/lib/api/auth.service"

interface AuthContextType {
    user: IUser | null
    isLoading: boolean
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// La session NextAuth (httpOnly, gérée côté serveur) est l'unique source de vérité pour
// l'authentification. Plus aucune duplication du JWT en localStorage ou cookie JS-readable.
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()

    const user = (session?.user as unknown as IUser) ?? null
    const isLoading = status === "loading"

    // Le rafraîchissement du token backend a échoué (session trop ancienne) :
    // on déconnecte proprement plutôt que de laisser l'app enchaîner les 401.
    useEffect(() => {
        if ((session as any)?.error === "RefreshAccessTokenError") {
            nextAuthSignOut({ redirect: false }).then(() => {
                window.location.href = "/auth/signin"
            })
        }
    }, [session])

    const logout = async () => {
        try {
            await authService.logout()
        } catch {}
        await nextAuthSignOut({ redirect: false })
        window.location.href = "/auth/signin"
    }

    const value: AuthContextType = {
        user,
        isLoading,
        logout,
        isAuthenticated: !!user,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
