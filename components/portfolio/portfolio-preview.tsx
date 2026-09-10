"use client"

import { ExternalLink, Github, Globe, Linkedin, Mail, MapPin, Phone, Twitter, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IPortfolioDetails, PortfolioTheme } from "@/lib/@types/entities"
import { cn, formatFileUrl } from "@/lib/utils"

/** Thèmes de l'éditeur : classes littérales pour que Tailwind les génère. */
export const PORTFOLIO_THEMES: Record<PortfolioTheme, { label: string; swatch: string; cover: string; bar: string }> = {
    default: { label: "Défaut", swatch: "bg-gray-800", cover: "bg-gradient-to-r from-gray-800 to-gray-600", bar: "bg-gray-800 dark:bg-gray-300" },
    blue: { label: "Bleu", swatch: "bg-blue-500", cover: "bg-gradient-to-r from-blue-700 to-sky-400", bar: "bg-blue-500" },
    purple: { label: "Violet", swatch: "bg-purple-500", cover: "bg-gradient-to-r from-purple-700 to-fuchsia-400", bar: "bg-purple-500" },
    green: { label: "Vert", swatch: "bg-green-500", cover: "bg-gradient-to-r from-emerald-700 to-green-400", bar: "bg-green-500" },
}

export interface PortfolioPreviewData {
    title: string
    description: string
    theme: PortfolioTheme
    photo: string | null
    skills: { name: string; level: number | null }[]
    details: IPortfolioDetails | null
}

/** Normalise un portfolio (API ou éditeur) pour l'aperçu. */
export function toPreviewData(portfolio: {
    title: string
    description?: string | null
    theme?: string | null
    photo?: string | null
    skills?: string[] | null
    details?: IPortfolioDetails | null
}): PortfolioPreviewData {
    const levels = portfolio.details?.skillLevels ?? {}
    const theme = (portfolio.theme && portfolio.theme in PORTFOLIO_THEMES ? portfolio.theme : "default") as PortfolioTheme

    return {
        title: portfolio.title,
        description: portfolio.description ?? "",
        theme,
        photo: portfolio.photo ?? null,
        skills: (portfolio.skills ?? []).map((name) => ({ name, level: typeof levels[name] === "number" ? levels[name] : null })),
        details: portfolio.details ?? null,
    }
}

const LINKS = [
    { key: "linkedin", label: "LinkedIn", icon: Linkedin },
    { key: "github", label: "GitHub", icon: Github },
    { key: "twitter", label: "X / Twitter", icon: Twitter },
    { key: "website", label: "Site web", icon: Globe },
] as const

/** Rendu du portfolio tel que le verront les visiteurs (aperçu éditeur et profil public). */
export function PortfolioPreview({ data }: { data: PortfolioPreviewData }) {
    const theme = PORTFOLIO_THEMES[data.theme] ?? PORTFOLIO_THEMES.default
    const details = data.details ?? {}
    const projects = details.projects ?? []
    const links = LINKS.filter((link) => details.links?.[link.key])
    const name = details.fullName?.trim() || data.title

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className={cn("h-24", theme.cover)} />
            <div className="space-y-5 px-5 pb-6">
                <div className="-mt-10 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-muted">
                        {data.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={formatFileUrl(data.photo)} alt={name} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-8 w-8 text-muted-foreground" />
                        )}
                    </div>
                    <div className="min-w-0 pb-1">
                        <h3 className="text-lg font-bold text-foreground">{name}</h3>
                        {details.fullName?.trim() && data.title && <p className="text-sm text-muted-foreground">{data.title}</p>}
                    </div>
                </div>

                {(details.location || details.email || details.phone) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {details.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {details.location}
                            </span>
                        )}
                        {details.email && (
                            <a href={`mailto:${details.email}`} className="flex items-center gap-1 hover:text-primary">
                                <Mail className="h-3.5 w-3.5" />
                                {details.email}
                            </a>
                        )}
                        {details.phone && (
                            <span className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                {details.phone}
                            </span>
                        )}
                    </div>
                )}

                {data.description && <p className="whitespace-pre-line text-sm text-foreground">{data.description}</p>}

                {data.skills.length > 0 && (
                    <section>
                        <h4 className="mb-2 text-sm font-semibold text-foreground">Compétences</h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {data.skills.map((skill) =>
                                skill.level === null ? (
                                    <Badge key={skill.name} variant="secondary" className="w-fit">
                                        {skill.name}
                                    </Badge>
                                ) : (
                                    <div key={skill.name}>
                                        <div className="mb-1 flex justify-between text-xs">
                                            <span className="font-medium text-foreground">{skill.name}</span>
                                            <span className="text-muted-foreground">{skill.level}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted">
                                            <div className={cn("h-2 rounded-full", theme.bar)} style={{ width: `${skill.level}%` }} />
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </section>
                )}

                {projects.length > 0 && (
                    <section>
                        <h4 className="mb-2 text-sm font-semibold text-foreground">Projets</h4>
                        <div className="space-y-3">
                            {projects.map((project, index) => (
                                <div key={project.id ?? index} className="rounded-lg border border-border p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium text-foreground">{project.title}</p>
                                        {project.status && (
                                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                                                {project.status === "TERMINE" ? "Terminé" : "En cours"}
                                            </Badge>
                                        )}
                                    </div>
                                    {project.description && <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{project.description}</p>}
                                    {(project.previewUrl || project.codeUrl) && (
                                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                                            {project.previewUrl && (
                                                <a href={project.previewUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1 font-medium text-primary hover:underline">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Aperçu
                                                </a>
                                            )}
                                            {project.codeUrl && (
                                                <a href={project.codeUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1 font-medium text-primary hover:underline">
                                                    <Github className="h-3.5 w-3.5" />
                                                    Code
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {links.map(({ key, label, icon: Icon }) => (
                            <a
                                key={key}
                                href={details.links?.[key] ?? "#"}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
