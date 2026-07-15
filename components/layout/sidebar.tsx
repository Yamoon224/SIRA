"use client"

import Link from "next/link"
import { AppLogo } from "@/components/app-logo"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    Home,
    MessageSquare,
    Briefcase,
    Building2,
    User,
    Settings,
    Search,
    FileText,
    Bot,
    FolderPlus,
    HelpCircle,
    Sparkles,
    Mic,
    MessageCircle,
    Users2,
    Presentation,
    GraduationCap,
    ClipboardList,
    Video,
} from "lucide-react"

const sidebarItems = [
    {
        title: "Tableau de bord",
        href: "/dashboard",
        icon: Home,
    },
    {
        title: "Messages",
        href: "/messages",
        icon: MessageSquare,
    },
    {
        title: "Mes offres",
        href: "/mes-offres",
        icon: Briefcase,
    },
    {
        title: "Chercher un emploi",
        href: "/chercher-emploi",
        icon: Search,
    },
    {
        title: "Parcourir les entreprises",
        href: "/entreprises",
        icon: Building2,
    },
    {
        title: "Mon Profil",
        href: "/profil",
        icon: User,
    },
    {
        title: "Simulation d'entretien",
        href: "/simulation-entretien-config",
        icon: Bot,
    },
    {
        title: "Recherche entreprise IA",
        href: "/recherche-entreprise",
        icon: Sparkles,
    },
    {
        title: "Pitch Goriya",
        href: "/pitch-goriya",
        icon: Mic,
    },
    {
        title: "GORIYA Chat",
        href: "/goriya-chat",
        icon: MessageCircle,
    },
    {
        title: "GORIYA Connect",
        href: "/connect",
        icon: Users2,
    },
    {
        title: "Présentations IA",
        href: "/presentations-ia",
        icon: Presentation,
    },
    {
        title: "Formations",
        href: "/formations",
        icon: GraduationCap,
    },
    {
        title: "Enquêtes internes",
        href: "/enquetes-employe",
        icon: ClipboardList,
    },
    {
        title: "Appels vidéo",
        href: "/appels",
        icon: Video,
    },
    {
        title: "Créer CV",
        href: "/creer-cv",
        icon: FileText,
    },
    {
        title: "Créer Portfolio",
        href: "/creer-portfolio",
        icon: FolderPlus,
    },
    {
        title: "Nouveau document",
        href: "/nouveau-document",
        icon: FileText,
    },
    {
        title: "Analyser CV",
        href: "/analyser-cv",
        icon: FileText,
    },
]

const parameterItems = [
    {
        title: "Centre d'assistance",
        href: "/centre-assistance",
        icon: HelpCircle,
    },
    {
        title: "Paramètres",
        href: "/parametres",
        icon: Settings,
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="w-72 max-w-[85vw] bg-background border-r border-border h-screen flex flex-col overflow-hidden md:w-64">
            <div className="px-6 py-4 border-b border-border flex items-center justify-center">
                <Link href="/">
                    <AppLogo width={100} />
                </Link>
            </div>

            <nav className="flex-1 px-2 sm:px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin">
                {sidebarItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-blue-700 text-white border border-blue-700"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            )}
                        >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="px-2 sm:px-4 pb-4 border-t border-border pt-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Paramètres</div>
                <div className="space-y-1">
                    {parameterItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors",
                                    pathname === item.href
                                        ? "bg-blue-700 text-white border border-blue-700"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                )}>
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                <span className="truncate">{item.title}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
