"use client"

import { useEffect, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Briefcase,
    Building2,
    CalendarDays,
    CheckCircle2,
    ExternalLink,
    Globe,
    HelpCircle,
    Landmark,
    Lightbulb,
    Loader2,
    MapPin,
    Network,
    Newspaper,
    Search,
    Sparkles,
    Star,
    Swords,
    Target,
    Trash2,
    TrendingUp,
    Users,
    type LucideIcon,
} from "lucide-react"
import { SubscriptionGate } from "@/components/subscription-gate"
import { researchService, type IResearchQuery } from "@/lib/api/research.service"
import { PageHeader } from "@/components/layout/page-header"
import { cn } from "@/lib/utils"
import { GoriyaLogoLoader } from "@/components/goriya-loader"

const initiales = (nom: string) =>
    nom
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((mot) => mot[0]?.toUpperCase() ?? "")
        .join("")

/** Les anciennes recherches stockaient « Information non disponible » : on ne l'affiche pas comme un contenu. */
const utile = (items?: string[]) => (items ?? []).filter((item) => item && !/non disponible|aucune actualité/i.test(item))

const lienSite = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

const domaine = (url: string) => {
    try {
        return new URL(lienSite(url)).hostname.replace(/^www\./, "")
    } catch {
        return url
    }
}

function Bloc({ icon: Icon, title, children, className }: { icon: LucideIcon; title: string; children: ReactNode; className?: string }) {
    return (
        <section className={cn("rounded-2xl border border-[#e8edf6] bg-white p-4 dark:border-border dark:bg-card sm:p-5", className)}>
            <h3 className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-[#1b2331] dark:text-foreground">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eff4ff] text-[#2f6de6] dark:bg-primary/10 dark:text-primary">
                    <Icon className="h-4 w-4" />
                </span>
                {title}
            </h3>
            {children}
        </section>
    )
}

const texteCls = "text-left text-[13.5px] leading-relaxed text-[#5b6474] dark:text-muted-foreground"

function Puces({ items, icon: Icon = CheckCircle2, color = "text-[#2f6de6] dark:text-primary" }: { items: string[]; icon?: LucideIcon; color?: string }) {
    return (
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex gap-2.5">
                    <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", color)} />
                    <span className={texteCls}>{item}</span>
                </li>
            ))}
        </ul>
    )
}

function Etiquettes({ items, className }: { items: string[]; className: string }) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
                <span key={i} className={cn("rounded-full px-3 py-1 text-[12.5px] font-medium", className)}>
                    {item}
                </span>
            ))}
        </div>
    )
}

function Resultat({ query, onFavorite, onDelete }: { query: IResearchQuery; onFavorite: () => void; onDelete: () => void }) {
    const r = query.result
    const fiche = [
        { icon: Briefcase, label: "Secteur", value: r.fiche?.secteur },
        { icon: CalendarDays, label: "Création", value: r.fiche?.creation },
        { icon: MapPin, label: "Siège", value: r.fiche?.siege },
        { icon: Users, label: "Effectif", value: r.fiche?.effectif },
        { icon: Network, label: "Groupe", value: r.fiche?.groupe },
    ].filter((ligne) => ligne.value)
    const site = r.fiche?.siteWeb
    const dirigeants = r.dirigeants ?? []
    const dates = r.dates ?? []
    const activites = utile(r.activites)
    const chiffres = utile(r.chiffres)
    const valeurs = utile(r.valeurs)
    const actualites = utile(r.actualites)
    const concurrents = utile(r.concurrents)
    const recommandations = utile(r.recommandations)
    const questions = utile(r.questions)
    const sources = r.sources ?? []

    return (
        <div className="space-y-4">
            {/* En-tête */}
            <div className="overflow-hidden rounded-2xl border border-[#e8edf6] bg-white dark:border-border dark:bg-card">
                <div className="h-16 bg-brand-gradient sm:h-20" />
                <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                    <div className="-mt-8 flex items-end justify-between gap-3">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#16264a] text-[20px] font-bold text-white dark:border-card">
                            {initiales(query.companyName) || <Building2 className="h-7 w-7" />}
                        </div>
                        <div className="flex items-center gap-1 pb-1">
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onFavorite} aria-label={query.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
                                <Star className={cn("h-4 w-4", query.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={onDelete} aria-label="Supprimer la recherche">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <h2 className="mt-3 text-[20px] font-bold leading-tight text-[#1b2331] dark:text-foreground sm:text-[22px]">{query.companyName}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        {r.mode === "web" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f7ef] px-2.5 py-1 text-[11px] font-medium text-[#1f9d63]">
                                <Globe className="h-3 w-3" />
                                Vérifié sur le web
                            </span>
                        )}
                        {r.mode === "connaissances" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4e0] px-2.5 py-1 text-[11px] font-medium text-[#b8730b]">
                                <Sparkles className="h-3 w-3" />
                                Connaissances de l&apos;IA, à vérifier
                            </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">Recherche du {new Date(query.createdAt).toLocaleDateString("fr-FR")}</span>
                        {site && (
                            <a href={lienSite(site)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2f6de6] hover:underline dark:text-primary">
                                <ExternalLink className="h-3 w-3" />
                                {domaine(site)}
                            </a>
                        )}
                    </div>

                    {r.presentation && <p className={cn(texteCls, "mt-3")}>{r.presentation}</p>}

                    {fiche.length > 0 && (
                        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {fiche.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="rounded-xl bg-[#f6f8fc] p-3 dark:bg-muted">
                                    <dt className="flex items-center gap-1.5 text-[11px] text-[#8b93a3] dark:text-muted-foreground">
                                        <Icon className="h-3.5 w-3.5" />
                                        {label}
                                    </dt>
                                    <dd className="mt-1 text-[13px] font-semibold leading-snug text-[#1b2331] dark:text-foreground">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>
            </div>

            {/* À retenir : le bloc le plus utile la veille de l'entretien. */}
            {r.synthese && (
                <section className="rounded-2xl bg-[#16264a] p-4 text-white sm:p-5">
                    <h3 className="mb-2 flex items-center gap-2 text-[14px] font-semibold">
                        <Target className="h-4 w-4 text-[#9db8f5]" />
                        À retenir pour ton entretien
                    </h3>
                    <p className="text-left text-[13.5px] leading-relaxed text-white/85">{r.synthese}</p>
                </section>
            )}

            {dirigeants.length > 0 && (
                <Bloc icon={Users} title="Dirigeants">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {dirigeants.map((d, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-xl border border-[#eef1f7] p-3 dark:border-border">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eff4ff] text-[13px] font-bold text-[#2f6de6] dark:bg-primary/10 dark:text-primary">
                                    {initiales(d.nom)}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-left text-[13.5px] font-semibold text-[#1b2331] dark:text-foreground">{d.nom}</p>
                                    {d.role && <p className="text-left text-[12px] leading-snug text-[#7f8796] dark:text-muted-foreground">{d.role}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Bloc>
            )}

            <Bloc icon={Landmark} title="Historique">
                <p className={texteCls}>{r.historique}</p>
                {dates.length > 0 && (
                    <ol className="mt-4 space-y-3 border-l-2 border-[#dde6f8] pl-4 dark:border-border">
                        {dates.map((d, i) => (
                            <li key={i} className="relative">
                                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#2f6de6] ring-4 ring-white dark:ring-card" />
                                {d.annee && <p className="text-left text-[12px] font-bold text-[#2f6de6] dark:text-primary">{d.annee}</p>}
                                <p className={texteCls}>{d.evenement}</p>
                            </li>
                        ))}
                    </ol>
                )}
            </Bloc>

            {(activites.length > 0 || chiffres.length > 0) && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {activites.length > 0 && (
                        <Bloc icon={Briefcase} title="Activités">
                            <Puces items={activites} />
                        </Bloc>
                    )}
                    {chiffres.length > 0 && (
                        <Bloc icon={TrendingUp} title="Chiffres clés">
                            <Puces items={chiffres} icon={TrendingUp} color="text-[#1f9d63]" />
                        </Bloc>
                    )}
                </div>
            )}

            <Bloc icon={Building2} title="Culture d'entreprise">
                <p className={texteCls}>{r.culture}</p>
                {valeurs.length > 0 && (
                    <div className="mt-3">
                        <Etiquettes items={valeurs} className="bg-[#f1ecff] text-[#6d3fd9] dark:bg-primary/10 dark:text-primary" />
                    </div>
                )}
            </Bloc>

            {actualites.length > 0 && (
                <Bloc icon={Newspaper} title="Actualités récentes">
                    <Puces items={actualites} icon={Newspaper} color="text-[#d97706]" />
                </Bloc>
            )}

            {concurrents.length > 0 && (
                <Bloc icon={Swords} title="Concurrents">
                    <Etiquettes items={concurrents} className="bg-[#f1f3f8] text-[#3d4a63] dark:bg-muted dark:text-foreground" />
                </Bloc>
            )}

            {(recommandations.length > 0 || questions.length > 0) && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {recommandations.length > 0 && (
                        <Bloc icon={Lightbulb} title="Conseils pour ton entretien">
                            <Puces items={recommandations} color="text-[#1f9d63]" />
                        </Bloc>
                    )}
                    {questions.length > 0 && (
                        <Bloc icon={HelpCircle} title="Questions à poser au recruteur">
                            <Puces items={questions} icon={HelpCircle} />
                        </Bloc>
                    )}
                </div>
            )}

            {sources.length > 0 && (
                <Bloc icon={Globe} title="Sources consultées">
                    <ul className="space-y-1.5">
                        {sources.map((source, i) => (
                            <li key={i} className="min-w-0">
                                <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 text-[12.5px] text-[#2f6de6] hover:underline dark:text-primary">
                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{source.title || domaine(source.url)}</span>
                                    <span className="shrink-0 text-[#8b93a3] dark:text-muted-foreground">{domaine(source.url)}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </Bloc>
            )}
        </div>
    )
}

function RechercheEntrepriseContent() {
    const [queries, setQueries] = useState<IResearchQuery[]>([])
    const [loading, setLoading] = useState(true)
    const [companyName, setCompanyName] = useState("")
    const [searching, setSearching] = useState(false)
    const [active, setActive] = useState<IResearchQuery | null>(null)

    const load = async () => {
        setLoading(true)
        try {
            const res = await researchService.list()
            const items = ((res as any)?.data ?? res) as IResearchQuery[]
            setQueries(Array.isArray(items) ? items : [])
            if (Array.isArray(items) && items.length > 0) setActive(items[0])
        } catch (err) {
            console.error("[recherche-entreprise] load error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleSearch = async () => {
        if (!companyName.trim() || searching) return
        setSearching(true)
        try {
            const res = await researchService.create(companyName.trim())
            const query = ((res as any)?.data ?? res) as IResearchQuery
            setQueries((prev) => [query, ...prev])
            setActive(query)
            setCompanyName("")
        } catch (err) {
            console.error("[recherche-entreprise] search error:", err)
            toast.error("La recherche n'a pas abouti. Réessaie dans un instant.")
        } finally {
            setSearching(false)
        }
    }

    const handleToggleFavorite = async (query: IResearchQuery) => {
        try {
            const res = await researchService.toggleFavorite(query.id)
            const updated = ((res as any)?.data ?? res) as IResearchQuery
            setQueries((prev) => prev.map((q) => q.id === updated.id ? updated : q))
            if (active?.id === updated.id) setActive(updated)
        } catch (err) {
            console.error("[recherche-entreprise] favorite error:", err)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await researchService.remove(id)
            const restantes = queries.filter((q) => q.id !== id)
            setQueries(restantes)
            if (active?.id === id) setActive(restantes[0] ?? null)
        } catch (err) {
            console.error("[recherche-entreprise] delete error:", err)
            toast.error("La suppression a échoué.")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title="Goriya IA Research"
                description="Un dossier complet sur l'entreprise avant ton entretien : dirigeants, histoire, chiffres, culture, actualités."
            />

            <div className="rounded-2xl bg-gradient-to-br from-[#eef4ff] to-[#f7f2ff] p-4 dark:from-primary/10 dark:to-primary/5 sm:p-5">
                <div className="flex flex-col gap-2.5 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            disabled={searching}
                            placeholder="Nom de l'entreprise (ex : Orange Côte d'Ivoire, MTN, Ecobank...)"
                            className="h-11 rounded-full border-white bg-white pl-10 shadow-sm dark:border-border dark:bg-card"
                        />
                    </div>
                    <Button disabled={searching || !companyName.trim()} onClick={handleSearch} className="h-11 gap-1.5 rounded-full bg-brand-gradient px-6 hover:bg-brand-gradient-hover">
                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {searching ? "Recherche en cours..." : "Rechercher"}
                    </Button>
                </div>
                <p className="mt-2.5 text-left text-[12px] text-[#5b6474] dark:text-muted-foreground" aria-live="polite">
                    {searching
                        ? "Goriya consulte le web (site officiel, presse, dirigeants...) : cela peut prendre jusqu'à une minute."
                        : "Astuce : précise le pays ou la ville si le nom est répandu, la recherche sera plus juste."}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
                {/* Historique : bandeau défilant sur mobile, colonne sur ordinateur. */}
                <div className="min-w-0">
                    <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#8b93a3] dark:text-muted-foreground">Mes recherches</p>
                    {queries.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-[#d8deeb] px-3 py-5 text-center text-[13px] text-muted-foreground dark:border-border">
                            Aucune recherche pour le moment.
                        </p>
                    ) : (
                        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
                            {queries.map((query) => {
                                const selected = active?.id === query.id
                                return (
                                    <button
                                        key={query.id}
                                        onClick={() => setActive(query)}
                                        aria-current={selected ? "true" : undefined}
                                        className={cn(
                                            "flex w-[210px] shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors lg:w-full",
                                            selected
                                                ? "border-[#2f6de6] bg-[#f3f7ff] dark:bg-primary/10"
                                                : "border-[#e8edf6] bg-white hover:bg-[#f8faff] dark:border-border dark:bg-card dark:hover:bg-muted",
                                        )}
                                    >
                                        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold", selected ? "bg-[#2f6de6] text-white" : "bg-[#eff4ff] text-[#2f6de6] dark:bg-primary/10 dark:text-primary")}>
                                            {initiales(query.companyName) || <Building2 className="h-4 w-4" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[13px] font-medium text-foreground">{query.companyName}</span>
                                            <span className="block text-[11px] text-muted-foreground">{new Date(query.createdAt).toLocaleDateString("fr-FR")}</span>
                                        </span>
                                        {query.isFavorite && <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="min-w-0">
                    {searching ? (
                        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-[#d8deeb] px-4 py-16 text-center dark:border-border">
                            <GoriyaLogoLoader width={90} />
                            <p className="text-[13px] text-muted-foreground">Goriya recherche l&apos;entreprise…</p>
                        </div>
                    ) : active ? (
                        <Resultat query={active} onFavorite={() => handleToggleFavorite(active)} onDelete={() => handleDelete(active.id)} />
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[#d8deeb] px-4 py-14 text-center dark:border-border">
                            <Building2 className="mx-auto mb-3 h-9 w-9 text-[#b6bfd2]" />
                            <p className="text-center text-[14px] text-muted-foreground">Lance une recherche pour obtenir le dossier d&apos;une entreprise.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <SubscriptionGate featureLabel="Goriya IA Research" feature="Recherche avancée sur une entreprise">
            <RechercheEntrepriseContent />
        </SubscriptionGate>
    )
}
