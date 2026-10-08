"use client"

import Link from "next/link"
import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataPagination, DEFAULT_PAGE_SIZE } from "@/components/ui/data-pagination"
import { AutocompleteInput } from "@/components/autocomplete-input"
import { LOCALISATIONS } from "@/lib/data/afrique"
import { Search, SlidersHorizontal, MapPin, BriefcaseBusiness, Clock3, Hourglass, Heart, Plus, Loader2, Building2, Building, GraduationCap } from "lucide-react"
import { jobService } from "@/lib/api/job.service"
import { companyService } from "@/lib/api/company.service"
import { IJobOffer, ICompany } from "@/lib/@types/entities"
import { JobType, JobExperienceType } from "@/lib/@types/enums"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CompanyLogo } from "@/components/company-logo"
import { capitalizeFirst, dedupeByName, formatFileUrl } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { companyHref, jobHref } from "@/lib/public-links"

const filterChips = [
    { label: "Salaire affiché", icon: SlidersHorizontal },
    { label: "Télétravail possible", icon: SlidersHorizontal },
    { label: "Temps plein", icon: Clock3 },
    { label: "Temps partiel", icon: Hourglass },
    { label: "PME / Startup", icon: Building2 },
    { label: "Multinationale", icon: Building },
    { label: "Stage", icon: GraduationCap },
    { label: "Premier emploi", icon: BriefcaseBusiness },
]

const FILTER_CHIP_PARAMS: Record<string, Record<string, any>> = {
    "Salaire affiché":    { hasSalary: true },
    "Télétravail possible": { remote: true },
    "Temps plein":        { jobType: ["CDI", "CDD"] },
    "Temps partiel":      { jobType: "TEMPS_PARTIEL" },
    "PME / Startup":      { companySize: ["1-10 employés", "11-50 employés", "51-200 employés"] },
    "Multinationale":     { companySize: "500+ employés" },
    "Stage":              { jobType: "STAGE" },
    "Premier emploi":     { experience: ["JUNIOR"] },
}

const popularSearches = [
    "Tous", "Communication", "Commercial", "Marketing", "Graphisme",
    "Data", "Product manager", "Développeur", "Finance", "Juridique",
]

const JOB_TYPE_LABELS: Record<string, string> = {
    CDI: "CDI",
    CDD: "CDD",
    STAGE: "Stage",
    ALTERNANCE: "Alternance",
    FREELANCE: "Freelance",
    TEMPS_PARTIEL: "Temps partiel",
}

const EXPERIENCE_LABELS: Record<string, string> = {
    JUNIOR: "Junior",
    INTERMEDIAIRE: "Intermédiaire",
    SENIOR: "Senior",
    EXPERT: "Expert",
}

function formatPosted(date: Date | string) {
    const d = new Date(date)
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return "Aujourd'hui"
    if (days <= 3) return "Récent"
    if (days < 7) return `Il y a ${days} jours`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`
    return `Il y a ${Math.floor(days / 30)} mois`
}

function ExploreJobsContent() {
    const searchParams = useSearchParams()
    const { isAuthenticated } = useAuth()
    const initialQuery = searchParams.get("q") ?? ""
    const initialJobType = searchParams.get("jobType") ?? ""

    const [searchInput, setSearchInput] = useState(initialQuery)
    const [searchTerm, setSearchTerm] = useState(initialQuery)
    const [selectedFilters, setSelectedFilters] = useState<string[]>([])
    const [activeCategory, setActiveCategory] = useState("Tous")
    const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([])
    const [jobCategories, setJobCategories] = useState<string[]>([])

    const [showAllFilters, setShowAllFilters] = useState(!!initialJobType)
    const [locationFilter, setLocationFilter] = useState("")
    const [typeFilter, setTypeFilter] = useState(initialJobType)
    const [experienceFilter, setExperienceFilter] = useState("")

    const [jobs, setJobs] = useState<IJobOffer[]>([])
    const [companies, setCompanies] = useState<ICompany[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

    useEffect(() => {
        jobService.getSavedJobIds()
            .then((res: any) => setBookmarkedJobs(res?.data?.jobIds ?? res?.jobIds ?? []))
            .catch(() => {})
    }, [])

    useEffect(() => {
        jobService.getCategories()
            .then((res: any) => setJobCategories(res?.data ?? res ?? []))
            .catch(() => setJobCategories([]))
    }, [])

    const fetchJobs = useCallback(async (p: number) => {
        try {
            setLoading(true)

            const isCategory = jobCategories.includes(activeCategory)
            const keyword = activeCategory !== "Tous" && !isCategory ? activeCategory : searchTerm || undefined
            const chipParams: Record<string, any> = {}
            selectedFilters.forEach(label => {
                const params = FILTER_CHIP_PARAMS[label]
                if (params) Object.assign(chipParams, params)
            })
            const res = await jobService.getJobs({
                search: keyword,
                sector: isCategory ? activeCategory : undefined,
                location: locationFilter || undefined,
                jobType: typeFilter || undefined,
                experience: experienceFilter ? [experienceFilter] : undefined,
                page: p,
                limit: pageSize,
                ...chipParams,
            }) as any
            const newJobs: IJobOffer[] = res?.data?.data ?? res?.data ?? []
            const meta = res?.data?.meta ?? res?.meta

            setJobs(newJobs)

            if (meta) {
                setTotalPages(meta.totalPages ?? 1)
                setTotal(meta.total ?? newJobs.length)
            }
        } catch {
            setJobs([])
        } finally {
            setLoading(false)
        }
    }, [searchTerm, activeCategory, selectedFilters, jobCategories, locationFilter, typeFilter, experienceFilter, pageSize])

    useEffect(() => {
        setPage(1)
        fetchJobs(1)
    }, [fetchJobs])

    useEffect(() => {
        companyService.getCompanies({ search: searchTerm || undefined, limit: 5 })
            .then((res: any) => {
                const data = res?.data?.data ?? res?.data ?? []
                const list: ICompany[] = Array.isArray(data) ? data : []
                setCompanies(dedupeByName(list))
            })
            .catch(() => setCompanies([]))
    }, [searchTerm])

    const goToPage = (p: number) => {
        setPage(p)
        fetchJobs(p)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setActiveCategory("Tous")
        setSearchTerm(searchInput)
    }

    const handleCategoryClick = (cat: string) => {
        setActiveCategory(cat)
        setSearchInput("")
        setSearchTerm("")
    }

    const toggleFilter = (label: string) =>
        setSelectedFilters(prev => prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label])

    const toggleBookmark = (e: React.MouseEvent, jobId: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isAuthenticated) { toast.info("Connecte-toi pour sauvegarder une offre.") ; return }
        const isSaved = bookmarkedJobs.includes(jobId)
        setBookmarkedJobs(prev => isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId])
        const action = isSaved ? jobService.unsaveJob(jobId) : jobService.saveJob(jobId)
        action.catch(() => setBookmarkedJobs(prev => isSaved ? [...prev, jobId] : prev.filter(id => id !== jobId)))
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[1180px] px-4 pt-10 pb-16">
                {/* Hero search */}
                <section className="text-center">
                    <h1 className="text-[30px] sm:text-[46px] leading-none font-extrabold text-[#121826] dark:text-foreground">Explorer les offres d'emploi.</h1>
                    <p className="mt-4 text-[14px] sm:text-[16px] text-[#7f8796] dark:text-muted-foreground max-w-[760px] mx-auto leading-6">
                        Trouve l'opportunité qui correspond à tes compétences et à tes ambitions. Parcours les dernières offres publiées, filtre selon tes critères et postule directement depuis l'application.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <form className="w-full max-w-[690px] relative" onSubmit={handleSearch}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2f6de6] dark:text-primary" />
                            <Input
                                className="h-11 rounded-full border-[#b9c8ec] dark:border-border bg-white text-[#111827] placeholder:text-[#9aa3b2] pl-10 pr-36 text-[12px]"
                                placeholder="Quel métier recherches-tu ?"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-9 rounded-full bg-brand-gradient hover:bg-brand-gradient-hover px-6 text-[11px]">
                                Recherche
                            </Button>
                        </form>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        {filterChips.map((chip) => {
                            const Icon = chip.icon
                            return (
                                <button key={chip.label} type="button" onClick={() => toggleFilter(chip.label)}
                                    className={`h-7 rounded-full border px-3 text-[12px] inline-flex items-center gap-2 transition-colors ${selectedFilters.includes(chip.label) ? "border-[#2f6de6] bg-[#edf4ff] dark:bg-primary/10 text-[#2f6de6] dark:text-primary" : "border-[#b9c8ec] dark:border-border text-[#7d8798] dark:text-muted-foreground bg-white dark:bg-card"}`}>
                                    <Icon className="w-3 h-3" />{chip.label}
                                </button>
                            )
                        })}
                        <button type="button" onClick={() => setShowAllFilters(v => !v)}
                            className={`h-7 rounded-full px-3 text-[12px] inline-flex items-center gap-1 transition-colors ${showAllFilters ? "bg-brand-gradient text-white" : "bg-brand-gradient text-white hover:bg-brand-gradient-hover"}`}>
                            <Plus className={`w-3 h-3 transition-transform ${showAllFilters ? "rotate-45" : ""}`} /> Tous les filtres
                        </button>
                    </div>

                    {showAllFilters && (
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#d8deeb] dark:border-border bg-white dark:bg-card p-3">
                            <div className="w-full sm:w-[180px]">
                                <AutocompleteInput
                                    value={locationFilter}
                                    onChange={setLocationFilter}
                                    options={LOCALISATIONS}
                                    placeholder="Localisation"
                                    className="h-9 w-full rounded-full text-[12px]"
                                    aria-label="Localisation"
                                />
                            </div>
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                                className="h-9 rounded-full border border-input bg-transparent px-3 text-[12px]">
                                <option value="">Type de contrat</option>
                                {Object.values(JobType).map((t) => (
                                    <option key={t} value={t}>{JOB_TYPE_LABELS[t] ?? t}</option>
                                ))}
                            </select>
                            <select value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)}
                                className="h-9 rounded-full border border-input bg-transparent px-3 text-[12px]">
                                <option value="">Expérience</option>
                                {Object.values(JobExperienceType).map((exp) => (
                                    <option key={exp} value={exp}>{EXPERIENCE_LABELS[exp] ?? exp}</option>
                                ))}
                            </select>
                            <Button type="button" onClick={() => { setPage(1); fetchJobs(1) }} className="h-9 rounded-full bg-brand-gradient hover:bg-brand-gradient-hover px-5 text-[12px]">
                                Appliquer
                            </Button>
                            {(locationFilter || typeFilter || experienceFilter) && (
                                <button type="button" onClick={() => { setLocationFilter(""); setTypeFilter(""); setExperienceFilter("") }}
                                    className="text-[11px] text-[#7f8796] dark:text-muted-foreground hover:text-[#2f6de6] dark:hover:text-primary underline">
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* Jobs list */}
                <section className="mt-9">
                    <h2 className="text-[18px] sm:text-[22px] font-extrabold text-[#1b2331] dark:text-foreground">Recherches populaires</h2>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-b border-[#d8deeb] dark:border-border pb-3">
                        {popularSearches.map((item) => (
                            <button key={item} type="button" onClick={() => handleCategoryClick(item)}
                                className={`text-[12px] transition-colors ${activeCategory === item ? "text-[#2f6de6] dark:text-primary font-semibold" : "text-[#8f97a9] dark:text-muted-foreground hover:text-[#2f6de6] dark:hover:text-primary"}`}>
                                {item}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#2f6de6] dark:text-primary" /></div>
                    ) : jobs.length > 0 ? (
                        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {jobs.map((job) => (
                                <Link key={job.id} href={jobHref(job)} className="group block rounded-[14px] border border-[#b9c8ec] dark:border-border bg-white dark:bg-card p-3 sm:p-4 hover:border-[#8eb4ff] dark:hover:border-primary transition-colors">
                                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[17px] font-extrabold text-[#1b2331] dark:text-foreground group-hover:underline">{job.title}</h3>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#7f8796] dark:text-muted-foreground">
                                                {job.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{capitalizeFirst(job.location)}</span>}
                                                {job.company?.name && <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="w-3 h-3" />{job.company.name}</span>}
                                                {job.type && <span className="inline-flex items-center gap-1 rounded-full border border-[#d8deeb] dark:border-border px-2 py-0.5">{job.type}</span>}
                                            </div>
                                            <p className="mt-1 text-[11px] text-[#9aa3b2] dark:text-muted-foreground inline-flex items-center gap-1">
                                                <Clock3 className="w-3 h-3" />{formatPosted(job.publishDate)}
                                            </p>
                                            {job.description && (
                                                <p className="mt-2 text-[12px] leading-5 text-[#5b6474] dark:text-muted-foreground line-clamp-2">
                                                    {job.description}{" "}
                                                    <span className="text-[#2f6de6] dark:text-primary font-semibold whitespace-nowrap">
                                                        Plus de détails
                                                    </span>
                                                </p>
                                            )}
                                            <div className="mt-3 flex items-center gap-3">
                                                <CompanyLogo name={job.company?.name ?? "?"} logo={job.company?.logo} className="w-6 h-6 text-[12px]" />
                                                {isAuthenticated && (
                                                    <button type="button" onClick={(e) => toggleBookmark(e, job.id)}
                                                        className={`transition-colors ${bookmarkedJobs.includes(job.id) ? "text-[#2f6de6] dark:text-primary" : "text-[#9aa3b2] dark:text-muted-foreground hover:text-[#2f6de6] dark:hover:text-primary"}`}>
                                                        <Heart className={`w-4 h-4 ${bookmarkedJobs.includes(job.id) ? "fill-current" : ""}`} />
                                                    </button>
                                                )}
                                                {job.salary && <span className="text-[11px] font-semibold text-[#2f6de6] dark:text-primary ml-auto">{job.salary}</span>}
                                            </div>
                                        </div>
                                        {(job.image || job.company?.coverImage) && (
                                            <div className="w-full sm:w-[150px] md:w-[180px] h-[95px] rounded-xl overflow-hidden bg-[#f0f3fb] dark:bg-muted shrink-0">
                                                <img src={formatFileUrl(job.image || job.company?.coverImage)} alt={job.title} className="w-full h-full object-cover" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[#7f8796] dark:text-muted-foreground">Aucune offre d'emploi trouvée pour cette recherche.</div>
                    )}

                    <DataPagination
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        currentCount={jobs.length}
                        pageSize={pageSize}
                        onPageChange={goToPage}
                        onPageSizeChange={setPageSize}
                        disabled={loading}
                    />
                </section>

                {/* Companies (populaires, ou correspondant à la recherche) */}
                {(companies.length > 0 || searchTerm) && (
                    <section className="mt-10 rounded-none bg-brand-gradient px-4 sm:px-6 py-8 text-white relative overflow-hidden">
                        <div className="absolute -left-14 bottom-2 w-36 h-36 rounded-full border-[14px] border-[#82b7ff] dark:border-primary/50 opacity-35" />
                        <h2 className="text-[18px] sm:text-[26px] font-extrabold mb-5 relative z-10">
                            {searchTerm ? `Entreprises pour « ${searchTerm} »` : "Entreprises populaires"}
                        </h2>
                        {companies.length === 0 ? (
                            <p className="relative z-10 text-[13px] text-white/80">Aucune entreprise trouvée pour cette recherche.</p>
                        ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
                            {companies.map((company) => (
                                <Link key={company.id} href={companyHref(company)}>
                                    <article className="rounded-[12px] border border-[#c8d7fb] dark:border-border bg-white dark:bg-card text-[#1b2331] dark:text-foreground p-3 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <CompanyLogo name={company.name} logo={company.logo} className="w-9 h-9 text-[12px]" />
                                        </div>
                                        <h3 className="mt-2 text-[12px] font-semibold truncate">{company.name}</h3>
                                        <p className="text-[11px] text-[#7e889c] dark:text-muted-foreground">{company.sector || "Technologie"}</p>
                                        <p className="text-[11px] text-[#a2acbd] dark:text-muted-foreground mt-0.5">{capitalizeFirst(company.location || company.headquarters) || "-"}</p>
                                        {company.about && <p className="mt-2 text-[11px] leading-4 text-[#8a95a8] dark:text-muted-foreground line-clamp-2">{capitalizeFirst(company.about)}</p>}
                                    </article>
                                </Link>
                            ))}
                        </div>
                        )}
                    </section>
                )}

                {/* Job categories */}
                {jobCategories.length > 0 && (
                    <section className="mt-10">
                        <h2 className="text-[20px] sm:text-[28px] font-extrabold text-[#1b2331] dark:text-foreground">Catégories d'emploi</h2>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {jobCategories.map((category) => (
                                <button key={category} type="button" onClick={() => handleCategoryClick(category)}
                                    className={`h-6 rounded-full border px-3 text-[11px] transition-colors ${activeCategory === category ? "border-[#2f6de6] bg-[#edf4ff] dark:bg-primary/10 text-[#2f6de6] dark:text-primary" : "border-[#b9c8ec] dark:border-border bg-white dark:bg-card text-[#707b90] dark:text-muted-foreground hover:border-[#2f6de6] hover:text-[#2f6de6] dark:hover:text-primary"}`}>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

            </main>

            <Footer />
        </div>
    )
}

export default function ExploreJobsPage() {
    return (
        <Suspense fallback={null}>
            <ExploreJobsContent />
        </Suspense>
    )
}
