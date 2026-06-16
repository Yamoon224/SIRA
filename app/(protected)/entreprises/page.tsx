"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { companyService } from "@/lib/api/company.service"
import type { ICompany } from "@/lib/@types/entities"

const INDUSTRIES = [
    "Publicité (4)",
    "Services aux entreprises (4)",
    "Chaîne de blocs (5)",
    "Cloud (8)",
    "Technologie (3)",
    "Éducation (3)",
    "Fintech (5)",
    "Jeux de hasard (13)",
    "Marketing & Publicitaire (4)",
    "Santé (10)",
    "Hébergement (4)",
    "Médias (4)",
]

const SIZES = ["1-10 (15)", "11-50 (35)", "51-250 (14)", "251-500 (4)", "500 et 1000 (43)", "1000+ et dessus (33)"]

export default function CompaniesPage() {
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [page, setPage] = useState(1)
    const [companies, setCompanies] = useState<ICompany[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await companyService.getCompanies({ page, limit: 12, search: debouncedSearch || undefined })
                const payload = (res as any)?.data ?? res
                if (Array.isArray(payload)) {
                    setCompanies(payload)
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
    }, [page, debouncedSearch])

    const pageNumbers = useMemo(() => {
        const pages: number[] = []
        for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i)
        return pages
    }, [totalPages])

    return (
        <div className="min-h-[calc(100vh-80px)]">
            <div className="border-b border-[#d9dfea] px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl sm:text-[30px] font-semibold leading-none text-[#1b2331]">Parcourir les entreprises</h1>
                    <div className="hidden items-center gap-3 md:flex">
                        <div className="relative w-[220px]">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa3b2]" />
                            <Input placeholder="Recherche" className="h-7 rounded-full border-[#dce3ef] pl-8 text-[11px]" />
                        </div>
                        <button className="text-[#9aa3b2]">
                            <Bell className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-[1240px] px-4 py-4 sm:px-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
                    <aside className="rounded-[12px] border border-[#dfe5f1] bg-white p-3">
                        <h2 className="text-[12px] font-semibold text-[#1d2433]">Industrie et services</h2>
                        <div className="mt-2 space-y-1.5">
                            {INDUSTRIES.map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <Checkbox id={`industry-${item}`} className="h-3.5 w-3.5" />
                                    <Label htmlFor={`industry-${item}`} className="text-[11px] font-normal text-[#8b93a3]">
                                        {item}
                                    </Label>
                                </div>
                            ))}
                        </div>

                        <h3 className="mt-4 text-[12px] font-semibold text-[#1d2433]">Taille de l'entreprise</h3>
                        <div className="mt-2 space-y-1.5">
                            {SIZES.map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <Checkbox id={`size-${item}`} className="h-3.5 w-3.5" />
                                    <Label htmlFor={`size-${item}`} className="text-[11px] font-normal text-[#8b93a3]">
                                        {item}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </aside>

                    <main>
                        <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="relative w-full sm:max-w-[650px]">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3b2]" />
                                <Input
                                    placeholder="Recherchez un emploi par intitulé, poste, mot clé ou entreprise..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-9 rounded-full border-[#dce3ef] pl-10 text-[12px]"
                                />
                            </div>
                            <Button className="h-8 w-full sm:w-auto rounded-full bg-[#2f6de6] px-4 text-[11px] hover:bg-[#285dcc]">Trouver un emploi</Button>
                        </div>

                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[11px] text-[#8b93a3]">Toutes les entreprises</p>
                            <button className="flex items-center gap-1 text-[11px] text-[#8b93a3]">
                                Trier par:
                                <span className="font-medium text-[#2f6de6]">Le plus pertinent</span>
                                <ChevronDown className="h-3.5 w-3.5 text-[#2f6de6]" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2f6de6] border-t-transparent" />
                            </div>
                        ) : companies.length === 0 ? (
                            <p className="text-center text-[12px] text-[#8b93a3] py-12">Aucune entreprise trouvée.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                                {companies.map((company) => (
                                    <Card key={company.id} className="rounded-[10px] border-[#dfe5f1] shadow-none">
                                        <CardContent className="p-3">
                                            <div className="mb-2 flex items-start justify-between">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2f6de6] text-[9px] font-semibold text-white">
                                                    {company.name.charAt(0).toUpperCase()}
                                                </div>
                                                <Badge variant="outline" className="h-5 rounded-full border-[#ced8ee] px-2 text-[10px] text-[#2f6de6]">
                                                    — offres
                                                </Badge>
                                            </div>

                                            <h3 className="text-[12px] font-semibold text-[#1d2433]">{company.name}</h3>
                                            <p className="mt-1 text-[10px] leading-[1.35] text-[#8b93a3]">{company.sector ?? company.about ?? "—"}</p>

                                            {company.headquarters && (
                                                <p className="mt-1 text-[10px] text-[#9aa3b2]">{company.headquarters}</p>
                                            )}
                                        </CardContent>
                                    </Card>
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
                    </main>
                </div>
            </div>
        </div>
    )
}
