"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Bookmark, BookmarkX, Download, ExternalLink, FileText, MoreVertical, RefreshCw, Search, Undo2, Zap } from "lucide-react"
import { cvService } from "@/lib/api/cv.service"
import { candidatureService } from "@/lib/api/candidature.service"
import { jobService } from "@/lib/api/job.service"
import { brouillonNonVide, formatDerniereSauvegarde } from "@/lib/cv-draft"
import { DataPagination, DEFAULT_PAGE_SIZE } from "@/components/ui/data-pagination"
import { PageHeader } from "@/components/layout/page-header"
import { jobHref } from "@/lib/public-links"
import { cn, formatFileUrl } from "@/lib/utils"

type TabId = "all" | "interviews" | "applications" | "favorites" | "hired"
type SortOrder = "recent" | "oldest"

/** Une ligne du tableau : une candidature, ou une offre sauvegardée sans candidature. */
interface LibraryRow {
    key: string
    candidatureId: string | null
    jobId: string | null
    jobSlug: string | null
    company: string
    logo: string | null
    role: string
    date: string | null
    /** Statut de candidature (App\Enums\CandidatureStatus) ou SAVED. */
    status: string
    saved: boolean
}

/** Offre telle que renvoyée dans CandidatureResource (avec son entreprise). */
interface CandidatureJob {
    id: string
    slug?: string | null
    title: string
    company?: { name?: string | null; logo?: string | null } | null
}

const TABS: { id: TabId; label: string; matches: (row: LibraryRow) => boolean }[] = [
    { id: "all", label: "Tous", matches: () => true },
    { id: "interviews", label: "Entretiens", matches: (row) => row.status === "EN_COURS" },
    { id: "applications", label: "Candidatures", matches: (row) => row.candidatureId !== null },
    { id: "favorites", label: "Favoris", matches: (row) => row.saved },
    { id: "hired", label: "Embauche", matches: (row) => row.status === "APPROUVEE" },
]

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
    EN_ATTENTE: { label: "Candidature envoyée", className: "bg-[#eff4ff] border-[#cfdcfb] text-[#2f6de6] dark:bg-muted dark:border-border dark:text-primary" },
    EN_COURS: { label: "Entrevue prévue", className: "bg-[#fff3e0] border-[#ffe0b2] text-[#f57c00] dark:bg-muted dark:border-[#6a5026]" },
    APPROUVEE: { label: "Embauché", className: "bg-[#e8f5e9] border-[#c8e6c9] text-[#2e7d32] dark:bg-muted dark:border-[#2e5a33] dark:text-[#81c784]" },
    REJETEE: { label: "Refusé", className: "bg-[#fce4ec] border-[#f8bbd0] text-[#c2185b] dark:bg-muted dark:border-[#764356] dark:text-[#ff88a8]" },
    SAVED: { label: "Sauvegardée", className: "bg-[#f4f5f7] border-[#e8edf6] text-[#5b6474] dark:bg-muted dark:border-border dark:text-muted-foreground" },
}

const formatDate = (iso: string | null) => {
    if (!iso) return "-"
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export default function BibliothequePage() {
    const router = useRouter()
    const [selectedTab, setSelectedTab] = useState<TabId>("all")
    const [search, setSearch] = useState("")
    const [sort, setSort] = useState<SortOrder>("recent")
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    /** Date de dernière modification du brouillon de CV, `null` s'il n'y en a pas. */
    const [cvDraftAt, setCvDraftAt] = useState<string | null>(null)

    const [rows, setRows] = useState<LibraryRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [busyKey, setBusyKey] = useState<string | null>(null)
    const [toWithdraw, setToWithdraw] = useState<LibraryRow | null>(null)

    useEffect(() => {
        let cancelled = false
        cvService
            .get()
            .then((res) => {
                if (cancelled) return
                const draft = res?.data
                // La ligne est créée par le GET : seul le contenu dit s'il y a
                // quelque chose à reprendre.
                if (brouillonNonVide(draft)) setCvDraftAt(draft?.updatedAt ?? null)
            })
            .catch(() => {
                // Sans brouillon lisible, la carte garde son libellé « Créer ».
            })
        return () => {
            cancelled = true
        }
    }, [])

    const load = useCallback(async () => {
        setLoading(true)
        setError(false)
        try {
            const [candidaturesRes, savedRes] = await Promise.all([
                candidatureService.getCandidatures(),
                jobService.getSavedJobIds().catch(() => null),
            ])

            const candidatures = (((candidaturesRes as any)?.data ?? []) as any[]).filter(Boolean)
            const savedIds: string[] = (savedRes as any)?.data?.jobIds ?? (savedRes as any)?.jobIds ?? []
            const savedSet = new Set(savedIds)

            const applicationRows: LibraryRow[] = candidatures.map((candidature) => {
                const job = candidature.jobOffer as CandidatureJob | null | undefined
                return {
                    key: `c-${candidature.id}`,
                    candidatureId: candidature.id,
                    jobId: job?.id ?? null,
                    jobSlug: job?.slug ?? null,
                    company: job?.company?.name ?? "Entreprise",
                    logo: job?.company?.logo ?? null,
                    role: job?.title ?? "Offre supprimée",
                    date: candidature.appliedDate ?? candidature.createdAt ?? null,
                    status: String(candidature.status ?? "EN_ATTENTE"),
                    saved: !!job?.id && savedSet.has(job.id),
                }
            })

            // Offres sauvegardées sans candidature : leurs détails ne sont pas
            // dans la liste des candidatures, on les récupère une à une.
            const appliedJobIds = new Set(applicationRows.map((row) => row.jobId).filter(Boolean))
            const savedOnlyIds = savedIds.filter((id) => !appliedJobIds.has(id)).slice(0, 50)
            const savedJobs = await Promise.all(
                savedOnlyIds.map((id) =>
                    jobService
                        .getJobById(id)
                        .then((res) => ((res as any)?.data?.id ? (res as any).data : res) as any)
                        .catch(() => null),
                ),
            )

            const savedRows: LibraryRow[] = savedJobs
                .filter((job): job is any => !!job?.id)
                .map((job) => ({
                    key: `s-${job.id}`,
                    candidatureId: null,
                    jobId: job.id,
                    jobSlug: job.slug ?? null,
                    company: job.company?.name ?? "Entreprise",
                    logo: job.company?.logo ?? null,
                    role: job.title ?? "Offre",
                    date: job.createdAt ?? null,
                    status: "SAVED",
                    saved: true,
                }))

            setRows([...applicationRows, ...savedRows])
        } catch (err) {
            console.error("[bibliotheque] load error:", err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const counts = useMemo(
        () => Object.fromEntries(TABS.map((tab) => [tab.id, rows.filter(tab.matches).length])) as Record<TabId, number>,
        [rows],
    )

    const visibleRows = useMemo(() => {
        const tab = TABS.find((t) => t.id === selectedTab) ?? TABS[0]
        const query = search.trim().toLowerCase()
        return rows
            .filter(tab.matches)
            .filter((row) => !query || row.company.toLowerCase().includes(query) || row.role.toLowerCase().includes(query))
            .sort((a, b) => {
                const diff = new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
                return sort === "recent" ? diff : -diff
            })
    }, [rows, selectedTab, search, sort])

    // Changer d'onglet, de recherche ou de tri ramène en première page.
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedTab, search, sort])

    const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize))
    const pagedRows = visibleRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const toggleSaved = async (row: LibraryRow) => {
        if (!row.jobId) return
        setBusyKey(row.key)
        try {
            if (row.saved) {
                await jobService.unsaveJob(row.jobId)
                // Une offre seulement sauvegardée disparaît ; une candidature reste.
                setRows((prev) => (row.candidatureId ? prev.map((r) => (r.key === row.key ? { ...r, saved: false } : r)) : prev.filter((r) => r.key !== row.key)))
                toast.success("Offre retirée des favoris.")
            } else {
                await jobService.saveJob(row.jobId)
                setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, saved: true } : r)))
                toast.success("Offre ajoutée aux favoris.")
            }
        } catch (err: any) {
            toast.error(err?.message ?? "L'action n'a pas pu aboutir.")
        } finally {
            setBusyKey(null)
        }
    }

    const withdraw = async (row: LibraryRow) => {
        if (!row.candidatureId) return
        setBusyKey(row.key)
        try {
            await candidatureService.withdrawCandidature(row.candidatureId)
            toast.success("Candidature retirée.")
            await load()
        } catch (err: any) {
            toast.error(err?.message ?? "Le retrait de la candidature a échoué.")
        } finally {
            setBusyKey(null)
            setToWithdraw(null)
        }
    }

    const quickActions = [
        cvDraftAt
            ? {
                  icon: FileText,
                  title: "Reprendre mon CV",
                  description: `Brouillon modifié ${formatDerniereSauvegarde(cvDraftAt)}`,
                  action: "Reprendre",
                  href: "/creer-cv",
              }
            : {
                  icon: FileText,
                  title: "Créer un CV",
                  description: "Créer un CV à partir de ton profil",
                  action: "Créer mon CV",
                  href: "/creer-cv",
              },
        {
            icon: Zap,
            title: "Simulation d'entretien",
            description: "Prépare-toi pour l'entretien",
            action: "Lancer une simulation",
            href: "/simulation-entretien-config",
        },
        {
            icon: FileText,
            title: "Nouveau document",
            description: "Créer un nouveau document",
            action: "Nouveau document",
            href: "/nouveau-document",
        },
        {
            icon: Download,
            title: "Créer un portfolio",
            description: "Créer ton portfolio professionnel",
            action: "Créer un portfolio",
            href: "/portfolio/nouveau",
        },
    ]

    const emptyMessage: Record<TabId, string> = {
        all: "Aucune candidature ni offre sauvegardée pour le moment.",
        interviews: "Aucun entretien prévu pour le moment.",
        applications: "Tu n'as encore postulé à aucune offre.",
        favorites: "Aucune offre sauvegardée. Clique sur le signet d'une offre pour la retrouver ici.",
        hired: "Aucune embauche pour le moment - courage, ça vient !",
    }

    /** Menu d'actions d'une ligne, partagé par le tableau et la liste mobile. */
    const renderActions = (row: LibraryRow, href: string | null) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    disabled={busyKey === row.key}
                    className="rounded p-1 hover:bg-[#e8edf6] disabled:opacity-50 dark:hover:bg-muted"
                    aria-label={`Actions pour ${row.role}`}
                >
                    <MoreVertical className="h-4 w-4 text-[#9aa3b2] dark:text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {href && (
                    <DropdownMenuItem onClick={() => router.push(href)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir l'offre
                    </DropdownMenuItem>
                )}
                {row.jobId && (
                    <DropdownMenuItem onClick={() => toggleSaved(row)}>
                        {row.saved ? <BookmarkX className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
                        {row.saved ? "Retirer des favoris" : "Ajouter aux favoris"}
                    </DropdownMenuItem>
                )}
                {row.candidatureId && row.status === "EN_ATTENTE" && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setToWithdraw(row)} className="text-destructive focus:text-destructive">
                            <Undo2 className="mr-2 h-4 w-4" />
                            Retirer la candidature
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )

    return (
        <div className="bg-white dark:bg-background">
            <div className="mx-auto max-w-6xl">
                <PageHeader title="Bibliothèque" />

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-[16px] font-bold text-[#1b2331] dark:text-foreground mb-4">Nouvelles fonctionnalités</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {quickActions.map((action, i) => {
                            const Icon = action.icon
                            return (
                                <Card key={i} className="border border-[#e8edf6] dark:border-border hover:shadow-md transition-shadow">
                                    <CardContent className="flex h-full flex-col items-center p-4 text-center sm:p-6">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#eff4ff] dark:bg-primary/10 sm:h-16 sm:w-16">
                                            <Icon className="h-6 w-6 text-[#2f6de6] dark:text-primary sm:h-8 sm:w-8" />
                                        </div>
                                        <h3 className="font-bold text-[13px] text-[#1b2331] dark:text-foreground mb-1">{action.title}</h3>
                                        <p className="text-[11px] text-[#7f8796] dark:text-muted-foreground mb-4">{action.description}</p>
                                        <button
                                            onClick={() => router.push(action.href)}
                                            className="mt-auto min-h-8 rounded-full bg-brand-gradient px-3 py-1.5 text-[11px] font-medium text-white hover:bg-brand-gradient-hover sm:px-4"
                                        >
                                            {action.action}
                                        </button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* Onglets : même gabarit que ceux du centre d'assistance (piste pleine
                    largeur, une seule ligne), l'onglet actif en dégradé de la marque.
                    Sur mobile les onglets passent à la ligne : une piste défilante plus
                    large que l'écran faisait dézoomer toute la page dans la webview iOS. */}
                <div
                    role="tablist"
                    aria-label="Filtrer la bibliothèque"
                    className="mb-4 flex w-full flex-wrap gap-1 rounded-3xl bg-[#f4f7ff] p-1.5 sm:flex-nowrap sm:overflow-x-auto sm:rounded-full dark:bg-muted"
                >
                    {TABS.map((tab) => {
                        const active = selectedTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setSelectedTab(tab.id)}
                                className={cn(
                                    "inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:shrink-0 sm:px-5 sm:py-2.5 sm:text-sm",
                                    active
                                        ? "bg-brand-gradient text-white shadow-sm"
                                        : "text-[#7f8796] hover:text-[#1b2331] dark:text-muted-foreground dark:hover:text-foreground",
                                )}
                            >
                                {tab.label}
                                <span
                                    className={cn(
                                        "min-w-[1.5rem] rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                                        active ? "bg-white/25 text-white" : "bg-white text-[#5b6474] dark:bg-background dark:text-muted-foreground",
                                    )}
                                >
                                    {loading ? "…" : counts[tab.id]}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Recherche & tri */}
                <div className="mb-6 flex justify-end">
                    <div className="flex w-full gap-2 sm:w-auto">
                        <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-initial">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3b2] dark:text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Entreprise ou poste"
                                aria-label="Rechercher une entreprise ou un poste"
                                className="h-9 rounded-2xl border-[#e8edf6] bg-white pl-9 text-[13px] dark:border-border dark:bg-card"
                            />
                        </div>
                        <Select value={sort} onValueChange={(value) => setSort(value as SortOrder)}>
                            <SelectTrigger className="h-9 w-[130px] shrink-0 rounded-2xl text-[12px] sm:w-[150px]" aria-label="Trier">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recent">Plus récentes</SelectItem>
                                <SelectItem value="oldest">Plus anciennes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Liste mobile : le tableau (720px mini) ne tient pas sur un téléphone,
                    chaque ligne devient une carte. */}
                <div className="space-y-3 md:hidden">
                    {loading ? (
                        [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
                    ) : error ? (
                        <div className="rounded-2xl border border-[#e8edf6] px-4 py-10 text-center dark:border-border">
                            <p className="text-[13px] text-[#7f8796] dark:text-muted-foreground">Ta bibliothèque n'a pas pu être chargée.</p>
                            <Button variant="outline" size="sm" onClick={load} className="mt-3 gap-1.5 rounded-2xl">
                                <RefreshCw className="h-3.5 w-3.5" />
                                Réessayer
                            </Button>
                        </div>
                    ) : pagedRows.length === 0 ? (
                        <div className="rounded-2xl border border-[#e8edf6] px-4 py-10 text-center dark:border-border">
                            <p className="text-[13px] text-[#7f8796] dark:text-muted-foreground">
                                {search.trim() ? `Aucun résultat pour « ${search.trim()} ».` : emptyMessage[selectedTab]}
                            </p>
                            {!search.trim() && (selectedTab === "all" || selectedTab === "applications" || selectedTab === "favorites") && (
                                <Button asChild size="sm" className="mt-3 rounded-2xl bg-brand-gradient text-white hover:bg-brand-gradient-hover">
                                    <Link href="/chercher-emploi">Explorer les offres</Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        pagedRows.map((row) => {
                            const style = STATUS_STYLES[row.status] ?? STATUS_STYLES.EN_ATTENTE
                            const href = row.jobId ? jobHref({ id: row.jobId, slug: row.jobSlug }) : null
                            return (
                                <div key={row.key} className="rounded-2xl border border-[#e8edf6] bg-white p-4 dark:border-border dark:bg-card">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8edf6] text-[13px] font-semibold text-[#5b6474] dark:bg-muted dark:text-muted-foreground">
                                            {row.logo ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={formatFileUrl(row.logo)} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                                            ) : (
                                                row.company.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="truncate text-[13px] font-medium text-[#1b2331] dark:text-foreground">{row.company}</span>
                                                {row.saved && row.candidatureId && (
                                                    <Bookmark className="h-3.5 w-3.5 shrink-0 fill-current text-[#2f6de6] dark:text-primary" aria-label="Offre sauvegardée" />
                                                )}
                                            </div>
                                            <p className="mt-0.5 break-words text-[13px] text-[#7f8796] dark:text-muted-foreground">
                                                {href ? (
                                                    <Link href={href} className="hover:text-[#2f6de6] hover:underline dark:hover:text-primary">
                                                        {row.role}
                                                    </Link>
                                                ) : (
                                                    row.role
                                                )}
                                            </p>
                                        </div>
                                        <div className="shrink-0">{renderActions(row, href)}</div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                        <Badge variant="outline" className={cn("rounded-2xl px-3 py-1 text-[11px]", style.className)}>
                                            {style.label}
                                        </Badge>
                                        {row.candidatureId && <span className="text-[12px] text-[#7f8796] dark:text-muted-foreground">{formatDate(row.date)}</span>}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Table */}
                <div className="hidden overflow-x-auto rounded-2xl border border-[#e8edf6] bg-white md:block dark:border-border dark:bg-card">
                    <table className="w-full min-w-[720px]">
                        <thead>
                            <tr className="border-b border-[#e8edf6] dark:border-border">
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground">#</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground">Nom de l'entreprise</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground">Rôles</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground">Date de la demande</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground">État</th>
                                <th className="px-4 py-3 text-center text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [0, 1, 2, 3].map((i) => (
                                    <tr key={i} className="border-b border-[#e8edf6] dark:border-border">
                                        <td colSpan={6} className="px-4 py-4">
                                            <Skeleton className="h-8 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <p className="text-[13px] text-[#7f8796] dark:text-muted-foreground">Ta bibliothèque n'a pas pu être chargée.</p>
                                        <Button variant="outline" size="sm" onClick={load} className="mt-3 gap-1.5 rounded-2xl">
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            Réessayer
                                        </Button>
                                    </td>
                                </tr>
                            ) : pagedRows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <p className="text-[13px] text-[#7f8796] dark:text-muted-foreground">
                                            {search.trim() ? `Aucun résultat pour « ${search.trim()} ».` : emptyMessage[selectedTab]}
                                        </p>
                                        {!search.trim() && (selectedTab === "all" || selectedTab === "applications" || selectedTab === "favorites") && (
                                            <Button asChild size="sm" className="mt-3 rounded-2xl bg-brand-gradient text-white hover:bg-brand-gradient-hover">
                                                <Link href="/chercher-emploi">Explorer les offres</Link>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                pagedRows.map((row, index) => {
                                    const style = STATUS_STYLES[row.status] ?? STATUS_STYLES.EN_ATTENTE
                                    const href = row.jobId ? jobHref({ id: row.jobId, slug: row.jobSlug }) : null
                                    return (
                                        <tr key={row.key} className="border-b border-[#e8edf6] transition-colors hover:bg-[#f9fafb] dark:border-border dark:hover:bg-muted">
                                            <td className="px-4 py-4 text-[13px] font-medium text-[#1b2331] dark:text-foreground">{(currentPage - 1) * pageSize + index + 1}</td>
                                            <td className="px-4 py-4 text-[13px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8edf6] text-[12px] font-semibold text-[#5b6474] dark:bg-muted dark:text-muted-foreground">
                                                        {row.logo ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={formatFileUrl(row.logo)} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                                                        ) : (
                                                            row.company.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-[#1b2331] dark:text-foreground">{row.company}</span>
                                                    {row.saved && row.candidatureId && <Bookmark className="h-3.5 w-3.5 fill-current text-[#2f6de6] dark:text-primary" aria-label="Offre sauvegardée" />}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-[13px] text-[#7f8796] dark:text-muted-foreground">
                                                {href ? (
                                                    <Link href={href} className="hover:text-[#2f6de6] hover:underline dark:hover:text-primary">
                                                        {row.role}
                                                    </Link>
                                                ) : (
                                                    row.role
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-[13px] text-[#7f8796] dark:text-muted-foreground">{row.candidatureId ? formatDate(row.date) : "-"}</td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className={cn("rounded-2xl px-3 py-1 text-[11px]", style.className)}>
                                                    {style.label}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-center">{renderActions(row, href)}</td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <DataPagination
                    page={currentPage}
                    totalPages={totalPages}
                    total={visibleRows.length}
                    currentCount={pagedRows.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                    }}
                />

                <AlertDialog open={toWithdraw !== null} onOpenChange={(open) => !open && setToWithdraw(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Retirer ta candidature ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Ta candidature au poste « {toWithdraw?.role} » chez {toWithdraw?.company} sera retirée. Tu pourras postuler de nouveau tant que l'offre est ouverte.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => toWithdraw && withdraw(toWithdraw)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Retirer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
