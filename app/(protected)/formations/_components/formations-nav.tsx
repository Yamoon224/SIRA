"use client"

import type React from "react"
import Link from "next/link"
import { Bookmark, CloudOff, Compass, FolderKanban, PlayCircle, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { useT, type TranslationKey } from "@/contexts/i18n-context"

/** Paramètre ajouté au lien « Profil » : /profil garde la barre Formation quand on en vient. */
export const FROM_FORMATIONS_PARAM = "from=formations"

export const FORMATIONS_TABS: {
    /** Chemin comparé au pathname pour l'état actif. */
    path: string
    href: string
    key: TranslationKey
    icon: React.ComponentType<{ className?: string }>
    mobileOnly?: boolean
}[] = [
    { path: "/formations", href: "/formations", key: "training.tabs.discover", icon: Compass },
    { path: "/formations/mes-cours", href: "/formations/mes-cours", key: "training.tabs.myCourses", icon: PlayCircle },
    { path: "/formations/listes", href: "/formations/listes", key: "training.tabs.lists", icon: Bookmark },
    { path: "/formations/mes-projets", href: "/formations/mes-projets", key: "training.tabs.projects", icon: FolderKanban },
    { path: "/formations/hors-ligne", href: "/formations/hors-ligne", key: "training.tabs.downloads", icon: CloudOff },
    { path: "/profil", href: `/profil?${FROM_FORMATIONS_PARAM}`, key: "training.tabs.profile", icon: UserRound, mobileOnly: true },
]

export function isFormationsTabActive(pathname: string, path: string) {
    return path === "/formations" ? pathname === "/formations" : pathname.startsWith(path)
}

/** Barre fixe en bas sur mobile (l'app mobile est une webview de ce site). */
export function FormationsBottomNav({ pathname }: { pathname: string }) {
    const t = useT()

    return (
        <nav
            className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-full bg-brand-gradient px-2 py-1.5 shadow-lg lg:hidden"
            style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
            {FORMATIONS_TABS.filter((tab) => tab.path !== "/formations/hors-ligne").map((tab) => {
                const active = isFormationsTabActive(pathname, tab.path)
                return (
                    <Link
                        key={tab.path}
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
    )
}
