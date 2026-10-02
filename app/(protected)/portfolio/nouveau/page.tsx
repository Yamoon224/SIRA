"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, LayoutTemplate, PenLine } from "lucide-react"
import { PORTFOLIO_THEMES } from "@/components/portfolio/portfolio-preview"
import { PORTFOLIO_TEMPLATES, type PortfolioTemplate } from "@/lib/portfolio-templates"
import { cn } from "@/lib/utils"

/** Aperçu miniature d'un modèle : couverture au thème, photo, texte et jauges. */
function TemplateThumbnail({ template }: { template: PortfolioTemplate }) {
    const theme = PORTFOLIO_THEMES[template.theme]
    return (
        <div aria-hidden className="overflow-hidden rounded-t-2xl border-b border-[#e8edf6] bg-white dark:border-border">
            <div className={cn("h-14", theme.cover)} />
            <div className="px-4 pb-4">
                <div className="-mt-5 h-10 w-10 rounded-full border-2 border-white bg-[#dfe6f5]" />
                <p className="mt-2 truncate text-[11px] font-semibold text-[#1b2331]">{template.title}</p>
                <div className="mt-2 space-y-1">
                    <div className="h-1 rounded-full bg-[#e6ebf5]" />
                    <div className="h-1 w-4/5 rounded-full bg-[#e6ebf5]" />
                </div>
                <div className="mt-3 space-y-1.5">
                    {template.skills.slice(0, 3).map((skill) => (
                        <div key={skill.name} className="h-1.5 rounded-full bg-[#eef1f7]">
                            <div className={cn("h-1.5 rounded-full", theme.bar)} style={{ width: `${skill.level}%` }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Première étape de la création d'un portfolio : partir d'un modèle ou d'une
 * page blanche. Le choix est transmis à l'éditeur (/portfolio/creer).
 */
export default function NouveauPortfolioPage() {
    const router = useRouter()
    const [showTemplates, setShowTemplates] = useState(false)
    const galleryRef = useRef<HTMLDivElement>(null)

    const openTemplates = () => {
        setShowTemplates(true)
        // Laisse la galerie se monter avant de dérouler la page jusqu'à elle.
        setTimeout(() => galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50)
    }

    const choices = [
        {
            id: "modele",
            title: "Utiliser un modèle",
            description: "Pars d'une trame pensée pour ton métier : thème, bio et compétences déjà en place.",
            icon: LayoutTemplate,
            art: "from-[#1f4ec2] via-[#2f6de6] to-[#7cc4ff]",
            onClick: openTemplates,
            active: showTemplates,
        },
        {
            id: "vierge",
            title: "Créer moi-même",
            description: "Commence avec une page vierge, préremplie avec les informations de ton profil.",
            icon: PenLine,
            art: "from-[#4c1d95] via-[#7c3aed] to-[#f0abfc]",
            onClick: () => router.push("/portfolio/creer"),
            active: false,
        },
    ]

    return (
        <div className="min-h-[calc(100vh-80px)] rounded-3xl bg-gradient-to-b from-[#fbfcff] via-[#eaf2ff] to-[#cfe3ff] px-4 pb-14 pt-5 dark:from-background dark:via-background dark:to-primary/10 sm:px-8">
            <Link
                href="/portfolio"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe5f1] bg-white px-3 py-1.5 text-[13px] font-medium text-[#1b2331] hover:bg-[#f4f7ff] dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted"
            >
                <ArrowLeft className="h-4 w-4" />
                Mes portfolios
            </Link>

            <div className="mx-auto mt-8 max-w-3xl text-center sm:mt-10">
                <h1 className="text-3xl font-bold tracking-tight text-[#12244f] dark:text-foreground sm:text-[44px] sm:leading-tight">
                    Créer ton portfolio
                </h1>
                <p className="mt-3 text-center text-[15px] text-[#5b6474] dark:text-muted-foreground">
                    Veux-tu utiliser un modèle ou le créer toi-même ?
                </p>
            </div>

            <div className="mx-auto mt-9 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
                {choices.map(({ id, title, description, icon: Icon, art, onClick, active }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={onClick}
                        aria-expanded={id === "modele" ? showTemplates : undefined}
                        className={cn(
                            "group rounded-2xl bg-white p-5 text-left shadow-[0_8px_30px_rgba(31,78,194,0.10)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(31,78,194,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6de6] dark:bg-card",
                            active && "ring-2 ring-[#2f6de6]",
                        )}
                    >
                        <div className={cn("relative flex h-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br", art)}>
                            <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/15" />
                            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20" />
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/95 text-[#1f4ec2] shadow-lg transition-transform group-hover:scale-105">
                                <Icon className="h-7 w-7" strokeWidth={1.8} />
                            </div>
                        </div>
                        <h2 className="mt-4 text-[19px] font-bold text-[#12244f] dark:text-foreground">{title}</h2>
                        <p className="mt-1.5 text-left text-[14px] leading-relaxed text-[#5b6474] dark:text-muted-foreground">{description}</p>
                    </button>
                ))}
            </div>

            {showTemplates && (
                <div ref={galleryRef} className="mx-auto mt-12 max-w-5xl scroll-mt-6">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-[#b9cdee] dark:bg-border" />
                        <p className="text-[14px] font-medium text-[#3d4a63] dark:text-muted-foreground">Choisis ton modèle</p>
                        <div className="h-px flex-1 bg-[#b9cdee] dark:bg-border" />
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {PORTFOLIO_TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                type="button"
                                onClick={() => router.push(`/portfolio/creer?modele=${template.id}`)}
                                className="group overflow-hidden rounded-2xl bg-white text-left shadow-[0_6px_24px_rgba(31,78,194,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_34px_rgba(31,78,194,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6de6] dark:bg-card"
                            >
                                <TemplateThumbnail template={template} />
                                <div className="p-4">
                                    <h3 className="text-[15px] font-semibold text-[#12244f] dark:text-foreground">{template.nom}</h3>
                                    <p className="mt-1 text-left text-[12.5px] leading-snug text-[#7f8796] dark:text-muted-foreground">{template.description}</p>
                                    <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-[#2f6de6] dark:text-primary">
                                        Utiliser ce modèle
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
