"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function Layout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Sur mobile, la sidebar est un panneau superposé (fixed + overlay) - sans
    // ceci elle restait ouverte après avoir suivi un lien, masquant la page
    // nouvellement chargée derrière l'overlay.
    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    // L'ossature applicative gère son propre défilement (<main> en
    // overflow-y-auto). Sans ce verrou, le document défilait lui aussi et deux
    // barres de défilement se retrouvaient côte à côte à droite. Restauré au
    // démontage : les pages publiques, elles, ont besoin du défilement du
    // document.
    useEffect(() => {
        const { style } = document.documentElement
        const precedent = style.overflow
        style.overflow = "hidden"
        return () => {
            style.overflow = precedent
        }
    }, [])

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    return (
        <ProtectedRoute>
        {/* `h-dvh` et non `h-screen` : 100vh dépasse la zone visible tant que le
            navigateur mobile affiche sa barre d'adresse, et le bas de
            l'ossature devenait alors inatteignable une fois le document figé. */}
        <div className="flex h-dvh overflow-hidden bg-background">
            {sidebarOpen && (
                <div className="fixed inset-0 z-[55] bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div
                className={`
                fixed inset-y-0 left-0 z-[60] transform transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:translate-x-0
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:block`}>
                <Sidebar />
            </div>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header onToggleSidebar={toggleSidebar} showMobileMenuButton={true} showLogo={false} />
                <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-background p-3 sm:p-6">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
        </ProtectedRoute>
    )
}

