"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Search, Settings, ChevronDown, ChevronLeft, ChevronRight, Building2, Loader2, MapPin, Briefcase } from "lucide-react"
import { jobService } from "@/lib/api/job.service"
import { IJobOffer } from "@/lib/@types/entities"

const jobTypeOptions = ["À temps plein", "À temps partiel", "Stage", "Contrat", "Freelance"]
const categoryOptions = ["Design", "Ventes", "Marketing", "Commerce", "Ressources humaines", "Finance", "Ingénierie", "Technologie"]
const experienceOptions = ["Débutant", "Intermédiaire", "Senior", "Expert"]

const JOB_TYPE_MAP: Record<string, string> = {
    "À temps plein": "FULL_TIME",
    "À temps partiel": "PART_TIME",
    "Stage": "INTERNSHIP",
    "Contrat": "CONTRACT",
    "Freelance": "FREELANCE",
}

const EXPERIENCE_MAP: Record<string, string> = {
    "Débutant": "ENTRY",
    "Intermédiaire": "MID",
    "Senior": "SENIOR",
    "Expert": "EXPERT",
}

function getTypeBadge(type: string) {
    const map: Record<string, { label: string; color: string }> = {
        FULL_TIME: { label: "Temps plein", color: "bg-[#f3eeff] text-[#7c3aed]" },
        PART_TIME: { label: "Temps partiel", color: "bg-[#fff3e8] text-[#e07b10]" },
        INTERNSHIP: { label: "Stage", color: "bg-[#e8f8ef] text-[#22a05b]" },
        CONTRACT: { label: "Contrat", color: "bg-[#e8f1ff] text-[#2f6de6]" },
        FREELANCE: { label: "Freelance", color: "bg-[#fff3e8] text-[#e07b10]" },
    }
    return map[type] ?? { label: type, color: "bg-[#f0f3fb] text-[#6b7585]" }
}

function JobSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-[#e5e9f2] p-3 animate-pulse">
            <div className="flex justify-end mb-2"><div className="w-16 h-4 rounded-full bg-[#f0f3fb]" /></div>
            <div className="w-8 h-8 rounded-full bg-[#f0f3fb] mb-2" />
            <div className="w-3/4 h-3 rounded bg-[#f0f3fb] mb-1" />
            <div className="w-1/2 h-2 rounded bg-[#f0f3fb] mb-1" />
            <div className="w-2/3 h-2 rounded bg-[#f0f3fb] mb-3" />
            <div className="w-full h-8 rounded bg-[#f0f3fb]" />
        </div>
    )
}

export default function EmploisPage() {
    const [jobs, setJobs] = useState<IJobOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [searchInput, setSearchInput] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedLevels, setSelectedLevels] = useState<string[]>([])
    const LIMIT = 12

    const fetchJobs = useCallback(async (p: number) => {
        setLoading(true)
        try {
            const jobType = selectedJobTypes.map(t => JOB_TYPE_MAP[t]).filter(Boolean)
            const experience = selectedLevels.map(l => EXPERIENCE_MAP[l]).filter(Boolean)
            const res = await jobService.getJobs({
                search: searchTerm || undefined,
                jobType: jobType.length ? jobType : undefined,
                experience: experience.length ? experience : undefined,
                page: p,
                limit: LIMIT,
            }) as any
            const data = res?.data?.data ?? res?.data ?? []
            const meta = res?.data?.meta ?? {}
            setJobs(Array.isArray(data) ? data : [])
            setTotal(meta.total ?? data.length)
            setTotalPages(meta.totalPages ?? Math.ceil((meta.total ?? data.length) / LIMIT))
        } catch {
            setJobs([])
        } finally {
            setLoading(false)
        }
    }, [searchTerm, selectedJobTypes, selectedLevels])

    useEffect(() => {
        setPage(1)
        fetchJobs(1)
    }, [fetchJobs])

    const toggleFilter = (value: string, list: string[], setList: (v: string[]) => void) => {
        setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearchTerm(searchInput)
    }

    const goToPage = (p: number) => {
        setPage(p)
        fetchJobs(p)
    }

    const pagesWindow = () => {
        const start = Math.max(1, page - 2)
        const end = Math.min(totalPages, start + 4)
        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Top search bar */}
            <form onSubmit={handleSearch} className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b2]" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Rechercher un emploi..."
                        className="w-full h-9 rounded-full border border-[#d8deeb] bg-white pl-9 pr-4 text-[12px] text-[#1b2331] placeholder:text-[#9aa3b2] outline-none focus:border-[#2f6de6]"
                    />
                </div>
                <button type="submit" className="w-9 h-9 rounded-full border border-[#d8deeb] bg-white flex items-center justify-center text-[#9aa3b2] hover:text-[#2f6de6]">
                    <Settings className="w-4 h-4" />
                </button>
            </form>

            <h1 className="text-[22px] font-extrabold text-[#1b2331]">Trouvez un emploi</h1>

            <div className="flex gap-5 items-start">
                {/* Filters sidebar */}
                <aside className="w-[200px] flex-shrink-0 bg-white rounded-2xl border border-[#e5e9f2] p-4 space-y-5">
                    <div>
                        <button type="button" className="flex items-center justify-between w-full text-[12px] font-semibold text-[#1b2331] mb-3">
                            Type d'emploi <ChevronDown className="w-4 h-4 text-[#9aa3b2]" />
                        </button>
                        <div className="space-y-2">
                            {jobTypeOptions.map(item => (
                                <label key={item} className="flex items-center gap-2 cursor-pointer">
                                    <div
                                        onClick={() => toggleFilter(item, selectedJobTypes, setSelectedJobTypes)}
                                        className={`w-3.5 h-3.5 rounded border flex-shrink-0 cursor-pointer ${selectedJobTypes.includes(item) ? "bg-[#2f6de6] border-[#2f6de6]" : "border-[#c8d0df] bg-white"}`}
                                    />
                                    <span className="text-[11px] text-[#4e5a6e]">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <button type="button" className="flex items-center justify-between w-full text-[12px] font-semibold text-[#1b2331] mb-3">
                            Catégories <ChevronDown className="w-4 h-4 text-[#9aa3b2]" />
                        </button>
                        <div className="space-y-2">
                            {categoryOptions.map(item => (
                                <label key={item} className="flex items-center gap-2 cursor-pointer">
                                    <div
                                        onClick={() => toggleFilter(item, selectedCategories, setSelectedCategories)}
                                        className={`w-3.5 h-3.5 rounded border flex-shrink-0 cursor-pointer ${selectedCategories.includes(item) ? "bg-[#2f6de6] border-[#2f6de6]" : "border-[#c8d0df] bg-white"}`}
                                    />
                                    <span className="text-[11px] text-[#4e5a6e]">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <button type="button" className="flex items-center justify-between w-full text-[12px] font-semibold text-[#1b2331] mb-3">
                            Niveau d'expérience <ChevronDown className="w-4 h-4 text-[#9aa3b2]" />
                        </button>
                        <div className="space-y-2">
                            {experienceOptions.map(item => (
                                <label key={item} className="flex items-center gap-2 cursor-pointer">
                                    <div
                                        onClick={() => toggleFilter(item, selectedLevels, setSelectedLevels)}
                                        className={`w-3.5 h-3.5 rounded border flex-shrink-0 cursor-pointer ${selectedLevels.includes(item) ? "bg-[#2f6de6] border-[#2f6de6]" : "border-[#c8d0df] bg-white"}`}
                                    />
                                    <span className="text-[11px] text-[#4e5a6e]">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {(selectedJobTypes.length > 0 || selectedCategories.length > 0 || selectedLevels.length > 0) && (
                        <button type="button"
                            onClick={() => { setSelectedJobTypes([]); setSelectedCategories([]); setSelectedLevels([]) }}
                            className="w-full text-[10px] text-[#2f6de6] hover:underline text-center">
                            Réinitialiser les filtres
                        </button>
                    )}
                </aside>

                {/* Jobs grid */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-[14px] font-bold text-[#1b2331]">Tous les emplois</h2>
                            <p className="text-[11px] text-[#9aa3b2]">
                                {loading ? "Chargement..." : `${total} offre${total !== 1 ? "s" : ""} trouvée${total !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#9aa3b2]">Page {page}/{totalPages}</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                            {Array.from({ length: LIMIT }).map((_, i) => <JobSkeleton key={i} />)}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Briefcase className="w-10 h-10 text-[#c8d0df] mb-3" />
                            <p className="text-[13px] font-semibold text-[#1b2331]">Aucune offre trouvée</p>
                            <p className="text-[11px] text-[#9aa3b2] mt-1">Essayez de modifier vos filtres ou votre recherche.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                            {jobs.map(job => {
                                const badge = getTypeBadge(job.type)
                                return (
                                    <Link
                                        key={job.id}
                                        href={`/emplois/${job.id}`}
                                        className="block bg-white rounded-2xl border border-[#e5e9f2] p-3 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-end mb-2">
                                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center mb-2 overflow-hidden">
                                            {job.company?.logo
                                                ? <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                                                : <Building2 className="w-4 h-4 text-[#2f6de6]" />
                                            }
                                        </div>
                                        <h3 className="text-[11px] font-bold text-[#1b2331] leading-tight line-clamp-1">{job.title}</h3>
                                        <p className="text-[9px] text-[#9aa3b2] mt-0.5 leading-tight line-clamp-1">{job.company?.name ?? "—"}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-2.5 h-2.5 text-[#9aa3b2] flex-shrink-0" />
                                            <p className="text-[9px] text-[#9aa3b2] leading-tight line-clamp-1">{job.location}</p>
                                        </div>
                                        {job.description && (
                                            <p className="mt-2 text-[9px] text-[#6b7585] leading-[1.4] line-clamp-3">{job.description}</p>
                                        )}
                                        {job.salary && (
                                            <p className="mt-2 text-[9px] font-semibold text-[#22a05b]">{job.salary}</p>
                                        )}
                                        <p className="mt-1 text-[8px] text-[#9aa3b2]">
                                            {job.applicants ?? 0} candidat{(job.applicants ?? 0) !== 1 ? "s" : ""}
                                        </p>
                                    </Link>
                                )
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1 mt-6">
                            <button
                                type="button"
                                onClick={() => goToPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="w-7 h-7 rounded-full border border-[#d8deeb] bg-white flex items-center justify-center text-[#9aa3b2] hover:border-[#2f6de6] hover:text-[#2f6de6] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            {pagesWindow().map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => goToPage(p)}
                                    className={`w-7 h-7 rounded-full text-[11px] font-medium ${p === page ? "bg-[#2f6de6] text-white" : "border border-[#d8deeb] bg-white text-[#9aa3b2] hover:border-[#2f6de6] hover:text-[#2f6de6]"}`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="w-7 h-7 rounded-full border border-[#d8deeb] bg-white flex items-center justify-center text-[#9aa3b2] hover:border-[#2f6de6] hover:text-[#2f6de6] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
