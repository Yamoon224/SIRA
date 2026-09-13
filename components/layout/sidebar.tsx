"use client"

import { useState } from "react"
import Link from "next/link"
import { AppLogo } from "@/components/app-logo"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useT, type TranslationKey } from "@/contexts/i18n-context"
import {
    Home,
    MessageSquare,
    Library,
    Briefcase,
    Building2,
    User,
    Settings,
    Search,
    FileText,
    Files,
    Bot,
    FolderPlus,
    HelpCircle,
    Sparkles,
    Mic,
    MessageCircle,
    Users2,
    Presentation,
    GraduationCap,
    Video,
    ChevronDown,
    ChevronUp,
    type LucideIcon,
} from "lucide-react"

type NavItem = { key: TranslationKey; href: string; icon: LucideIcon }
type NavSection = { labelKey?: TranslationKey; icon?: LucideIcon; items: NavItem[] }

// Regroupé par thématique plutôt qu'une longue liste plate : la première
// section (accueil) reste toujours visible, les suivantes sont des accordéons
// cliquables (repliés par défaut, sauf celui qui contient la page courante).
const navSections: NavSection[] = [
    {
        items: [
            { key: "nav.dashboard", href: "/dashboard", icon: Home },
            { key: "nav.messages", href: "/messages", icon: MessageSquare },
            { key: "nav.library", href: "/bibliotheque", icon: Library },
            { key: "nav.connect", href: "/connect", icon: Users2 },
            { key: "nav.videoCalls", href: "/appels", icon: Video },
            { key: "nav.goriyaChat", href: "/goriya-chat", icon: MessageCircle },
        ],
    },
    {
        labelKey: "nav.sectionJob",
        icon: Briefcase,
        items: [
            { key: "nav.searchJob", href: "/chercher-emploi", icon: Search },
            { key: "nav.myApplications", href: "/mes-offres", icon: Briefcase },
            { key: "nav.browseCompanies", href: "/entreprises", icon: Building2 },
            { key: "nav.aiCompanySearch", href: "/recherche-entreprise", icon: Sparkles },
        ],
    },
    {
        labelKey: "nav.sectionProfile",
        icon: User,
        items: [
            { key: "nav.myProfile", href: "/profil", icon: User },
            { key: "nav.createCv", href: "/creer-cv", icon: FileText },
            { key: "nav.myCvs", href: "/mes-cv", icon: Files },
            { key: "nav.analyzeCv", href: "/analyse-cv", icon: FileText },
            { key: "nav.myPortfolio", href: "/portfolio", icon: FolderPlus },
            { key: "nav.newDocument", href: "/nouveau-document", icon: FileText },
        ],
    },
    {
        labelKey: "nav.sectionPrep",
        icon: GraduationCap,
        items: [
            { key: "nav.interviewSimulation", href: "/simulation-entretien-config", icon: Bot },
            { key: "nav.goriyaPitch", href: "/pitch-goriya", icon: Mic },
            { key: "nav.aiPresentations", href: "/presentations-ia", icon: Presentation },
            { key: "nav.training", href: "/formations", icon: GraduationCap },
        ],
    },
]

const parameterItems: NavItem[] = [
    { key: "nav.helpCenter", href: "/centre-assistance", icon: HelpCircle },
    { key: "nav.settings", href: "/parametres", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const t = useT()

    const sectionHasActive = (section: NavSection) => section.items.some((it) => it.href === pathname)

    // Un seul groupe ouvert à la fois : en ouvrir un referme les autres.
    // Au chargement, priorité à celle qui contient la page courante, sinon
    // la première catégorie. La section est repérée par sa clé de traduction,
    // stable d'une langue à l'autre : changer de langue ne referme pas l'accordéon.
    const [openSection, setOpenSection] = useState<TranslationKey | null>(() => {
        const labeled = navSections.filter((s) => s.labelKey) as (NavSection & { labelKey: TranslationKey })[]
        return labeled.find((s) => sectionHasActive(s))?.labelKey ?? labeled[0]?.labelKey ?? null
    })

    const toggle = (key: TranslationKey) =>
        setOpenSection((prev) => (prev === key ? null : key))

    // Icône sur le menu (section) uniquement : les sous-menus (items d'une
    // section repliable) n'en affichent plus, pour ne pas doubler le repère
    // visuel déjà porté par l'icône du menu parent.
    const renderItem = (item: NavItem, showIcon = true) => {
        const Icon = item.icon
        return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                    pathname === item.href
                        ? "bg-brand-gradient text-white border border-transparent"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
            >
                {showIcon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                <span className="truncate">{t(item.key)}</span>
            </Link>
        )
    }

    return (
        <div className="w-72 max-w-[85vw]  bg-secondary border-r border-border h-screen flex flex-col overflow-hidden md:w-64">
            <div className="px-6 py-4 border-b border-border flex items-center justify-center">
                <Link href="/">
                    <AppLogo width={100} />
                </Link>
            </div>

            <nav className="flex-1 px-2 sm:px-4 py-4 overflow-y-auto scrollbar-thin">
                {navSections.map((section, i) => {
                    if (!section.labelKey) {
                        return (
                            <div key={`section-${i}`} className="space-y-1">
                                {section.items.map((item) => renderItem(item))}
                            </div>
                        )
                    }

                    const isOpen = openSection === section.labelKey
                    const hasActive = sectionHasActive(section)
                    const SectionIcon = section.icon

                    return (
                        // mt-1 : même espacement que les entrées sans sous-menu
                        // (space-y-1 sur "Tableau de bord" - "Messages", etc.) —
                        // c'était mt-4 (4x plus large) entre chaque section repliable.
                        <div key={section.labelKey} className="mt-1">
                            <button
                                type="button"
                                onClick={() => toggle(section.labelKey as TranslationKey)}
                                aria-expanded={isOpen}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-full px-3 py-2 text-sm font-medium transition-colors",
                                    hasActive
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                <span className="flex min-w-0 items-center gap-3">
                                    {SectionIcon && <SectionIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                                    <span className="truncate">{t(section.labelKey)}</span>
                                </span>

                                {isOpen ? (
                                    <ChevronUp className="h-4 w-4 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                )}
                            </button>
                            {/* Filet vertical derrière les sous-entrées, comme la
                                sidebar de l'app entreprise. */}
                            {isOpen && (
                                <div className="mt-1 ml-3 space-y-1 border-l border-border pl-3">
                                    {section.items.map((item) => renderItem(item, false))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            <div className="px-2 sm:px-4 pb-4 border-t border-border pt-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Paramètres</div>
                <div className="space-y-1">{parameterItems.map((item) => renderItem(item))}</div>
            </div>
        </div>
    )
}
