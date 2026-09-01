"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession, signOut as nextAuthSignOut } from "next-auth/react"
import { IUser } from "@/lib/@types/entities"
import { authService } from "@/lib/api/auth.service"
import { userService } from "@/lib/api/user.service"

interface AuthContextType {
    user: IUser | null
    isLoading: boolean
    logout: () => void
    isAuthenticated: boolean
    refreshProfile: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// La session NextAuth (httpOnly, gérée côté serveur) est l'unique source de vérité pour
// l'authentification. Plus aucune duplication du JWT en localStorage ou cookie JS-readable.
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()

    const sessionUser = (session?.user as unknown as IUser) ?? null
    const isLoading = status === "loading"

    // La session NextAuth ne porte pas l'avatar (voir lib/auth.ts) — on le
    // récupère via le profil backend et on le fusionne dans `user` pour que le
    // header et les autres consommateurs l'affichent (et le mettent à jour
    // après un changement de photo).
    const [avatar, setAvatar] = useState<string | null>(null)

    const refreshProfile = () => {
        userService.getProfile()
            .then((res: any) => setAvatar((res?.data ?? res)?.avatar ?? null))
            .catch(() => {})
    }

    useEffect(() => {
        if (!sessionUser?.id) {
            setAvatar(null)
            return
        }
        refreshProfile()
    }, [sessionUser?.id])

    const user = sessionUser ? { ...sessionUser, avatar: avatar ?? sessionUser.avatar ?? null } : null

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
        refreshProfile,
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
