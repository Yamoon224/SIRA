"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { companyService } from "@/lib/api/company.service"
import type { ICompany } from "@/lib/@types/entities"
import { capitalizeFirst } from "@/lib/utils"
import { CompanyLogo } from "@/components/company-logo"

const SORT_OPTIONS = [
    { value: "pertinence", label: "Le plus pertinent" },
    { value: "nom-asc", label: "Nom (A → Z)" },
    { value: "nom-desc", label: "Nom (Z → A)" },
    { value: "recent", label: "Les plus récentes" },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]["value"]

export default function CompaniesPage() {
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [page, setPage] = useState(1)
    const [companies, setCompanies] = useState<ICompany[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)

    const [sectors, setSectors] = useState<{ name: string; count: number }[]>([])
    const [activeSector, setActiveSector] = useState<string | null>(null)

    const [sortBy, setSortBy] = useState<SortValue>("pertinence")
    const [sortOpen, setSortOpen] = useState(false)
    const sortRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        companyService.getSectors()
            .then((res: any) => setSectors((res?.data ?? res ?? []).slice(0, 14)))
            .catch(() => setSectors([]))
    }, [])

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
        }
        document.addEventListener("mousedown", onClick)
        return () => document.removeEventListener("mousedown", onClick)
    }, [])

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, activeSector])

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await companyService.getCompanies({
                    page,
                    limit: 12,
                    search: debouncedSearch || undefined,
                    sector: activeSector || undefined,
                } as any)
                const payload = (res as any)?.data ?? res
                if (Array.isArray(payload)) {
                    setCompanies(payload)
                    setTotalPages(1)
                } else {
                    setCompanies(payload?.data ?? [])
                    setTotalPages(payload?.meta?.totalPages ?? 1)
                }
            } catch (err) {
                console.error("[entreprises] load error:", err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [page, debouncedSearch, activeSector])

    const sortedCompanies = useMemo(() => {
        const list = [...companies]
        if (sortBy === "nom-asc") list.sort((a, b) => a.name.localeCompare(b.name, "fr"))
        else if (sortBy === "nom-desc") list.sort((a, b) => b.name.localeCompare(a.name, "fr"))
        else if (sortBy === "recent") {
            list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
        }
        return list
    }, [companies, sortBy])

    const pageNumbers = useMemo(() => {
        const pages: number[] = []
        for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i)
        return pages
    }, [totalPages])

    return (
        <div className="min-h-[calc(100vh-80px)]">
            <div className="border-b border-[#d9dfea] px-4 py-4 sm:px-6">
                <h1 className="text-2xl sm:text-[30px] font-semibold leading-none text-[#1b2331]">Parcourir les entreprises</h1>
            </div>

            <div className="mx-auto w-full max-w-[1240px] px-4 py-4 sm:px-6">
                <div>
                    <div className="mb-3">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3b2]" />
                                <Input
                                    placeholder="Rechercher une entreprise par son nom"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-9 rounded-full border-[#dce3ef] pl-10 text-[12px]"
                                />
                            </div>
                        </div>

                        {/* Filtres secteur en chips */}
                        {sectors.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                <button
                                    onClick={() => setActiveSector(null)}
                                    className={`h-7 rounded-full border px-3 text-[11px] transition-colors ${!activeSector ? "border-[#2f6de6] bg-[#edf4ff] text-[#2f6de6] font-semibold" : "border-[#d8deeb] text-[#7d8798] hover:border-[#2f6de6]"}`}
                                >
                                    Tous les secteurs
                                </button>
                                {sectors.map((s) => (
                                    <button
                                        key={s.name}
                                        onClick={() => setActiveSector(activeSector === s.name ? null : s.name)}
                                        className={`h-7 rounded-full border px-3 text-[11px] transition-colors ${activeSector === s.name ? "border-[#2f6de6] bg-[#edf4ff] text-[#2f6de6] font-semibold" : "border-[#d8deeb] text-[#7d8798] hover:border-[#2f6de6]"}`}
                                    >
                                        {s.name} <span className="text-[#b6bdca]">({s.count})</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[11px] text-[#8b93a3]">
                                {activeSector ? `Secteur : ${activeSector}` : "Toutes les entreprises"}
                            </p>
                            <div ref={sortRef} className="relative">
                                <button
                                    onClick={() => setSortOpen((v) => !v)}
                                    className="flex items-center gap-1 text-[11px] text-[#8b93a3]"
                                >
                                    Trier par:
                                    <span className="font-medium text-[#2f6de6]">
                                        {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                                    </span>
                                    <ChevronDown className={`h-3.5 w-3.5 text-[#2f6de6] transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                                </button>
                                {sortOpen && (
                                    <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-[#e0e5f0] bg-white py-1 shadow-lg">
                                        {SORT_OPTIONS.map((o) => (
                                            <button
                                                key={o.value}
                                                onClick={() => { setSortBy(o.value); setSortOpen(false) }}
                                                className={`block w-full px-3 py-1.5 text-left text-[11px] hover:bg-[#f4f7ff] ${sortBy === o.value ? "font-semibold text-[#2f6de6]" : "text-[#4e5a6e]"}`}
                                            >
                                                {o.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2f6de6] border-t-transparent" />
                            </div>
                        ) : sortedCompanies.length === 0 ? (
                            <p className="text-center text-[12px] text-[#8b93a3] py-12">Aucune entreprise trouvée.</p>
                        ) : (
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {sortedCompanies.map((company) => (
                                    <Link key={company.id} href={`/entreprises/${company.id}`}>
                                        <article className="rounded-2xl border border-[#e8edf6] dark:border-border bg-white dark:bg-card p-4 min-h-[140px] xs:min-h-[166px] hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <CompanyLogo name={company.name} logo={company.logo} className="w-7 h-7 sm:w-9 sm:h-9 text-[10px]" />
                                                <span className="text-[10px] border border-[#cfe0ff] dark:border-border text-[#7a8db8] dark:text-muted-foreground rounded-full px-2 py-0.5">{company.sector || "Entreprise"}</span>
                                            </div>
                                            <h3 className="text-[13px] font-semibold text-[#1a2232] dark:text-foreground truncate">{company.name}</h3>
                                            <p className="text-[11px] text-[#8a95a8] dark:text-muted-foreground mt-0.5">{capitalizeFirst(company.location || company.headquarters) || "-"}</p>
                                            {company.about && <p className="text-[10px] text-[#9aa5b8] dark:text-muted-foreground mt-2 leading-4 line-clamp-2">{capitalizeFirst(company.about)}</p>}
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {!loading && totalPages > 1 && (
                            <div className="mt-5 flex items-center justify-center gap-2 text-[11px]">
                                <button
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    disabled={page === 1}
                                    className="flex h-6 w-6 items-center justify-center text-[#8b93a3] disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                {pageNumbers.map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setPage(n)}
                                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                            page === n ? "bg-[#2f6de6] text-white" : "text-[#8b93a3]"
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages}
                                    className="flex h-6 w-6 items-center justify-center text-[#8b93a3] disabled:opacity-40"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}
