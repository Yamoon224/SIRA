"use client"

import { useState } from "react"
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
    ChevronDown,
    type LucideIcon,
} from "lucide-react"

type NavItem = { title: string; href: string; icon: LucideIcon }
type NavSection = { label?: string; items: NavItem[] }

// Regroupé par thématique plutôt qu'une longue liste plate : la première
// section (accueil) reste toujours visible, les suivantes sont des accordéons
// cliquables (repliés par défaut, sauf celui qui contient la page courante).
const navSections: NavSection[] = [
    {
        items: [
            { title: "Tableau de bord", href: "/dashboard", icon: Home },
            { title: "Messages", href: "/messages", icon: MessageSquare },
            { title: "GORIYA Connect", href: "/connect", icon: Users2 },
            { title: "Appels vidéo", href: "/appels", icon: Video },
        ],
    },
    {
        label: "Emploi",
        items: [
            { title: "Chercher un emploi", href: "/chercher-emploi", icon: Search },
            { title: "Mes candidatures", href: "/mes-offres", icon: Briefcase },
            { title: "Parcourir les entreprises", href: "/entreprises", icon: Building2 },
            { title: "Recherche entreprise IA", href: "/recherche-entreprise", icon: Sparkles },
        ],
    },
    {
        label: "Profil & CV",
        items: [
            { title: "Mon Profil", href: "/profil", icon: User },
            { title: "Créer CV", href: "/creer-cv", icon: FileText },
            { title: "Analyser CV", href: "/analyser-cv", icon: FileText },
            { title: "Mon portfolio", href: "/portfolio", icon: FolderPlus },
            { title: "Nouveau document", href: "/nouveau-document", icon: FileText },
        ],
    },
    {
        label: "Préparation",
        items: [
            { title: "Simulation d'entretien", href: "/simulation-entretien-config", icon: Bot },
            { title: "Pitch Goriya", href: "/pitch-goriya", icon: Mic },
            { title: "Présentations IA", href: "/presentations-ia", icon: Presentation },
            { title: "Formations", href: "/formations", icon: GraduationCap },
        ],
    },
    {
        label: "Assistant & outils",
        items: [
            { title: "GORIYA Chat", href: "/goriya-chat", icon: MessageCircle },
            { title: "Enquêtes internes", href: "/enquetes-employe", icon: ClipboardList },
        ],
    },
]

const parameterItems: NavItem[] = [
    { title: "Centre d'assistance", href: "/centre-assistance", icon: HelpCircle },
    { title: "Paramètres", href: "/parametres", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    const sectionHasActive = (section: NavSection) => section.items.some((it) => it.href === pathname)

    // Ouvre d'emblée la section qui contient la page courante, les autres repliées.
    const [openLabels, setOpenLabels] = useState<string[]>(() =>
        navSections.filter((s) => s.label && sectionHasActive(s)).map((s) => s.label as string),
    )

    const toggle = (label: string) =>
        setOpenLabels((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))

    const renderItem = (item: NavItem) => {
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
    }

    return (
        <div className="w-72 max-w-[85vw] bg-background border-r border-border h-screen flex flex-col overflow-hidden md:w-64">
            <div className="px-6 py-4 border-b border-border flex items-center justify-center">
                <Link href="/">
                    <AppLogo width={100} />
                </Link>
            </div>

            <nav className="flex-1 px-2 sm:px-4 py-4 overflow-y-auto scrollbar-thin">
                {navSections.map((section, i) => {
                    if (!section.label) {
                        return (
                            <div key={`section-${i}`} className="space-y-1">
                                {section.items.map(renderItem)}
                            </div>
                        )
                    }

                    const isOpen = openLabels.includes(section.label)
                    const hasActive = sectionHasActive(section)

                    return (
                        <div key={section.label} className="mt-4">
                            <button
                                type="button"
                                onClick={() => toggle(section.label as string)}
                                aria-expanded={isOpen}
                                className={cn(
                                    "flex w-full items-center justify-between px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors",
                                    hasActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                <span className="truncate">{section.label}</span>
                                <ChevronDown
                                    className={cn("w-4 h-4 flex-shrink-0 transition-transform", isOpen && "rotate-180")}
                                />
                            </button>
                            {isOpen && <div className="mt-1 space-y-1">{section.items.map(renderItem)}</div>}
                        </div>
                    )
                })}
            </nav>

            <div className="px-2 sm:px-4 pb-4 border-t border-border pt-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Paramètres</div>
                <div className="space-y-1">{parameterItems.map(renderItem)}</div>
            </div>
        </div>
    )
}
