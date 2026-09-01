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

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    return (
        <ProtectedRoute>
        <div className="flex h-screen overflow-hidden bg-background">
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div
                className={`
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
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

