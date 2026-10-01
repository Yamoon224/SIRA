"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useT } from "@/contexts/i18n-context"
import { FORMATIONS_TABS, FormationsBottomNav, isFormationsTabActive } from "./_components/formations-nav"

/** Pages de l'espace Formation qui ne sont pas des fiches/lecteurs de cours. */
const SECTION_PATHS = FORMATIONS_TABS.map((tab) => tab.path)

/**
 * Navigation propre au module Formation, calquée sur la maquette Dev/School :
 * onglets en haut sur ordinateur, barre fixe en bas sur mobile (l'app mobile
 * est une webview de ce site). Masquée dans le lecteur pour lui laisser tout
 * l'écran.
 */
export default function FormationsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const t = useT()
    const inPlayer = pathname.endsWith("/apprendre")
    const onSectionPage = SECTION_PATHS.includes(pathname)

    return (
        <div className={cn(!inPlayer && "pb-24 lg:pb-0")}>
            {onSectionPage && (
                <nav className="mb-5 hidden gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 lg:inline-flex">
                    {FORMATIONS_TABS.filter((tab) => !tab.mobileOnly).map((tab) => {
                        const active = isFormationsTabActive(pathname, tab.path)
                        return (
                            <Link
                                key={tab.path}
                                href={tab.href}
                                className={cn(
                                    "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                                    active ? "bg-brand-gradient text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {t(tab.key)}
                            </Link>
                        )
                    })}
                </nav>
            )}

            {children}

            {!inPlayer && <FormationsBottomNav pathname={pathname} />}
        </div>
    )
}
