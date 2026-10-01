"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bookmark, CloudOff, Compass, FolderKanban, PlayCircle, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { useT, type TranslationKey } from "@/contexts/i18n-context"

const TABS: { href: string; key: TranslationKey; icon: React.ComponentType<{ className?: string }>; mobileOnly?: boolean }[] = [
    { href: "/formations", key: "training.tabs.discover", icon: Compass },
    { href: "/formations/mes-cours", key: "training.tabs.myCourses", icon: PlayCircle },
    { href: "/formations/listes", key: "training.tabs.lists", icon: Bookmark },
    { href: "/formations/mes-projets", key: "training.tabs.projects", icon: FolderKanban },
    { href: "/formations/hors-ligne", key: "training.tabs.downloads", icon: CloudOff },
    { href: "/profil", key: "training.tabs.profile", icon: UserRound, mobileOnly: true },
]

/** Pages de l'espace Formation qui ne sont pas des fiches/lecteurs de cours. */
const SECTION_PATHS = TABS.map((tab) => tab.href)

function isActive(pathname: string, href: string) {
    return href === "/formations" ? pathname === "/formations" : pathname.startsWith(href)
}

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
                    {TABS.filter((tab) => !tab.mobileOnly).map((tab) => {
                        const active = isActive(pathname, tab.href)
                        return (
                            <Link
                                key={tab.href}
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

            {!inPlayer && (
                <nav
                    className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-full bg-brand-gradient px-2 py-1.5 shadow-lg lg:hidden"
                    style={{ marginBottom: "env(safe-area-inset-bottom)" }}
                >
                    {TABS.filter((tab) => tab.href !== "/formations/hors-ligne").map((tab) => {
                        const active = isActive(pathname, tab.href)
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full py-1 text-[10px] font-medium text-white/75",
                                    active && "bg-white/20 text-white",
                                )}
                            >
                                <tab.icon className="h-5 w-5" />
                                <span className="truncate">{t(tab.key)}</span>
                            </Link>
                        )
                    })}
                </nav>
            )}
        </div>
    )
}
