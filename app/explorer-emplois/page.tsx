"use client"

import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, MapPin, BriefcaseBusiness, Clock3, Heart, Plus, ChevronLeft, ChevronRight, Loader2, Building2 } from "lucide-react"
import { jobService } from "@/lib/api/job.service"
import { companyService } from "@/lib/api/company.service"
import { IJobOffer, ICompany } from "@/lib/@types/entities"

const filterChips = [
    { label: "Salaire affiché" },
    { label: "Télétravail possible" },
    { label: "Poste salarié" },
    { label: "Entreprise émergente" },
    { label: "Entreprise établie" },
]

const popularSearches = [
    "Tous", "Communication", "Commercial", "Marketing", "Graphisme",
    "Data", "Product manager", "Développeur", "Finance", "Juridique",
]

const jobCategories = [
    "Éducation", "Ressources humaines", "Santé", "Informatique", "Marketing",
    "Graphisme", "Communication", "Industrie", "Finance", "Technologie",
    "Audit", "Juridique", "Logistique", "Restauration", "Recrutement",
    "Environnement", "Comptabilité", "Distribution", "Assurance", "Banque",
    "Publicité", "Conseil", "Administratif", "Relations publiques",
]

const careerCards = [
    { title: "Présentations des révisions UX", text: "Comment créer des présentations convaincantes qui impressionnent vos collègues et vos managers ?", image: "/ux-presentation-meeting.jpg" },
    { title: "Migration vers Linear 101", text: "Lancer simplifie les projets logiciels, les sprints, les tickets et le suivi des bugs. Voici comment commencer.", image: "/team-migration-software.jpg" },
    { title: "Construisez votre pile d'API.", text: "La prolifération des API RESTful a été conjointement soutenue par une croissance des ressources disponibles.", image: "/api-development-workspace.jpg" },
]

function formatPosted(date: Date | string) {
    const d = new Date(date)
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return "Il y a 1 jour"
    if (days < 7) return `Il y a ${days} jours`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`
    return `Il y a ${Math.floor(days / 30)} mois`
}

export default function ExploreJobsPage() {
    const [searchInput, setSearchInput] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedFilters, setSelectedFilters] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState("Candidats")
    const [activeCategory, setActiveCategory] = useState("Tous")
    const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([])

    const [jobs, setJobs] = useState<IJobOffer[]>([])
    const [companies, setCompanies] = useState<ICompany[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    const fetchJobs = useCallback(async (p: number, append = false) => {
        try {
            if (append) setLoadingMore(true)
            else setLoading(true)

            const keyword = activeCategory !== "Tous" ? activeCategory : searchTerm || undefined
            const res = await jobService.getJobs({ search: keyword, page: p, limit: 8 }) as any
            const newJobs: IJobOffer[] = res?.data?.data ?? res?.data ?? []
            const meta = res?.data?.meta ?? res?.meta

            if (append) setJobs(prev => [...prev, ...newJobs])
            else setJobs(newJobs)

            if (meta) {
                setTotalPages(meta.totalPages ?? 1)
                setTotal(meta.total ?? newJobs.length)
            }
        } catch {
            if (!append) setJobs([])
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [searchTerm, activeCategory])

    useEffect(() => {
        setPage(1)
        fetchJobs(1, false)
    }, [fetchJobs])

    useEffect(() => {
        companyService.getCompanies({ limit: 5 })
            .then((res: any) => {
                const data = res?.data?.data ?? res?.data ?? []
                setCompanies(Array.isArray(data) ? data : [])
            })
            .catch(() => {})
    }, [])

    const handleLoadMore = () => {
        const next = page + 1
        setPage(next)
        fetchJobs(next, true)
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

    const toggleBookmark = (jobId: string) =>
        setBookmarkedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId])

    return (
        <div className="min-h-screen bg-[#f4f5f7] text-[#111827]">
            <header className="bg-[#f4f5f7]">
                <div className="mx-auto max-w-[1180px] px-4 h-[56px] sm:h-[64px] md:h-[72px] flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img src="/images/logo.png" alt="Goriya" className="h-8 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-[12px] text-[#7a8495] font-medium">
                        <Link href="/" className="text-[#2f6de6]">Accueil</Link>
                        <Link href="/explorer-emplois" className="font-semibold text-[#1b2331]">Trouve un emploi</Link>
                        <Link href="/offres" className="hover:text-[#2f6de6]">Tarifs d'abonnement</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link href="/auth/signin">
                            <Button variant="outline" className="h-8 px-4 rounded-full text-[11px] border-[#b9c8ec] text-[#2f6de6] bg-white">Connexion</Button>
                        </Link>
                        <Link href="//entreprise">
                            <Button className="h-8 px-4 rounded-full text-[11px] bg-[#2157d3] hover:bg-[#1d4cb9]">Espace entreprise</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1180px] px-4 pt-10 pb-16">
                {/* Hero search */}
                <section className="text-center">
                    <h1 className="text-[30px] sm:text-[46px] leading-none font-extrabold text-[#121826]">Explorer les offres d'emploi.</h1>
                    <p className="mt-4 text-[11px] sm:text-[12px] text-[#7f8796] max-w-[760px] mx-auto leading-4">
                        Trouver l'opportunité qui correspond à vos compétences et à vos ambitions. Parcourez les dernières offres publiées, filtrez selon vos critères et postulez directement depuis l'application.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <form className="w-full max-w-[690px] relative" onSubmit={handleSearch}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b2]" />
                            <Input
                                className="h-11 rounded-full border-[#d8deeb] bg-white pl-10 pr-36 text-[12px]"
                                placeholder="Recherchez un emploi par industrie, poste, mot-clé ou entreprise."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-9 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] px-6 text-[11px]">
                                Recherche
                            </Button>
                        </form>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        {filterChips.map((chip) => (
                            <button key={chip.label} type="button" onClick={() => toggleFilter(chip.label)}
                                className={`h-7 rounded-full border px-3 text-[10px] inline-flex items-center gap-2 transition-colors ${selectedFilters.includes(chip.label) ? "border-[#2f6de6] bg-[#edf4ff] text-[#2f6de6]" : "border-[#d8deeb] text-[#7d8798] bg-white"}`}>
                                <SlidersHorizontal className="w-3 h-3" />{chip.label}
                            </button>
                        ))}
                        <button type="button" className="h-7 rounded-full bg-[#2f6de6] text-white px-3 text-[10px] inline-flex items-center gap-1 hover:bg-[#2458ba]">
                            <Plus className="w-3 h-3" /> Tous les filtres
                        </button>
                    </div>
                </section>

                {/* Jobs list */}
                <section className="mt-9">
                    <h2 className="text-[18px] sm:text-[22px] font-extrabold text-[#1b2331]">Recherches populaires</h2>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-b border-[#d8deeb] pb-3">
                        {popularSearches.map((item) => (
                            <button key={item} type="button" onClick={() => handleCategoryClick(item)}
                                className={`text-[10px] transition-colors ${activeCategory === item ? "text-[#2f6de6] font-semibold" : "text-[#8f97a9] hover:text-[#2f6de6]"}`}>
                                {item}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#2f6de6]" /></div>
                    ) : jobs.length > 0 ? (
                        <div className="mt-3 space-y-3">
                            {jobs.map((job) => (
                                <article key={job.id} className="rounded-[14px] border border-[#d8deeb] bg-white p-3 sm:p-4 hover:border-[#8eb4ff] transition-colors">
                                    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                                        <div className="flex-1">
                                            <Link href={`/explorer-emplois/${job.id}`} className="hover:underline">
                                                <h3 className="text-[16px] font-extrabold text-[#1b2331]">{job.title}</h3>
                                            </Link>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] text-[#7f8796]">
                                                {job.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                                                {job.company?.name && <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="w-3 h-3" />{job.company.name}</span>}
                                                {job.type && <span className="inline-flex items-center gap-1 rounded-full border border-[#d8deeb] px-2 py-0.5">{job.type}</span>}
                                            </div>
                                            <p className="mt-1 text-[9px] text-[#9aa3b2] inline-flex items-center gap-1">
                                                <Clock3 className="w-3 h-3" />{formatPosted(job.publishDate)}
                                            </p>
                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#f0f3fb] flex items-center justify-center">
                                                    {job.company?.logo
                                                        ? <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                                                        : <Building2 className="w-3 h-3 text-[#9aa3b2]" />
                                                    }
                                                </div>
                                                <button type="button" onClick={() => toggleBookmark(job.id)}
                                                    className={`transition-colors ${bookmarkedJobs.includes(job.id) ? "text-[#2f6de6]" : "text-[#9aa3b2] hover:text-[#2f6de6]"}`}>
                                                    <Heart className={`w-4 h-4 ${bookmarkedJobs.includes(job.id) ? "fill-current" : ""}`} />
                                                </button>
                                                {job.salary && <span className="text-[10px] font-semibold text-[#2f6de6] ml-auto">{job.salary}</span>}
                                            </div>
                                        </div>
                                        {job.company?.coverImage && (
                                            <div className="w-full md:w-[230px] h-[95px] rounded-xl overflow-hidden bg-[#f0f3fb]">
                                                <img src={job.company.coverImage} alt={job.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[#7f8796]">Aucune offre d'emploi trouvée pour cette recherche.</div>
                    )}

                    {page < totalPages && (
                        <div className="text-center mt-6">
                            <Button onClick={handleLoadMore} disabled={loadingMore} className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] px-8 h-10 text-[12px]">
                                {loadingMore ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                                Voir plus
                            </Button>
                        </div>
                    )}
                    {total > 0 && (
                        <p className="text-center text-[10px] text-[#9aa3b2] mt-2">{jobs.length} offre{jobs.length > 1 ? "s" : ""} affichée{jobs.length > 1 ? "s" : ""} sur {total}</p>
                    )}
                </section>

                {/* Popular companies */}
                {companies.length > 0 && (
                    <section className="mt-10 rounded-none bg-gradient-to-r from-[#2b7cf0] via-[#1e5ed4] to-[#153fbf] px-4 sm:px-6 py-8 text-white relative overflow-hidden">
                        <div className="absolute -left-14 bottom-2 w-36 h-36 rounded-full border-[14px] border-[#82b7ff] opacity-35" />
                        <h2 className="text-[18px] sm:text-[26px] font-extrabold mb-5 relative z-10">Entreprises populaires</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
                            {companies.map((company) => (
                                <Link key={company.id} href={`/entreprises/${company.id}`}>
                                    <article className="rounded-[12px] border border-[#c8d7fb] bg-white text-[#1b2331] p-3 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#f0f3fb] flex items-center justify-center">
                                                {company.logo
                                                    ? <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                                    : <Building2 className="w-3 h-3 text-[#9aa3b2]" />
                                                }
                                            </div>
                                        </div>
                                        <h3 className="mt-2 text-[12px] font-semibold truncate">{company.name}</h3>
                                        <p className="text-[9px] text-[#7e889c]">{company.sector || "Technologie"}</p>
                                        <p className="text-[9px] text-[#a2acbd] mt-0.5">{company.location || company.headquarters || "—"}</p>
                                        {company.about && <p className="mt-2 text-[9px] leading-4 text-[#8a95a8] line-clamp-2">{company.about}</p>}
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Job categories */}
                <section className="mt-10">
                    <h2 className="text-[20px] sm:text-[28px] font-extrabold text-[#1b2331]">Catégories d'emploi</h2>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {jobCategories.map((category) => (
                            <button key={category} type="button" onClick={() => handleCategoryClick(category)}
                                className={`h-6 rounded-full border px-3 text-[9px] transition-colors ${activeCategory === category ? "border-[#2f6de6] bg-[#edf4ff] text-[#2f6de6]" : "border-[#d8deeb] bg-white text-[#707b90] hover:border-[#2f6de6] hover:text-[#2f6de6]"}`}>
                                Emploi {category}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Career cards */}
                <section className="mt-14 pb-8">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[24px] sm:text-[36px] leading-none font-extrabold text-[#1b2331]">Prenez votre carrière en main</h2>
                        <div className="hidden sm:flex gap-2">
                            <button type="button" className="w-7 h-7 rounded-full border border-[#d8deeb] text-[#9aa3b2] inline-flex items-center justify-center hover:border-[#2f6de6]"><ChevronLeft className="w-3 h-3" /></button>
                            <button type="button" className="w-7 h-7 rounded-full border border-[#d8deeb] text-[#9aa3b2] inline-flex items-center justify-center hover:border-[#2f6de6]"><ChevronRight className="w-3 h-3" /></button>
                        </div>
                    </div>
                    <div className="inline-flex rounded-full border border-[#d8deeb] overflow-hidden mb-5 bg-white">
                        {["Candidats", "Étudiants", "Fonctionnaire"].map((tab) => (
                            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                                className={`px-4 h-8 text-[10px] font-semibold transition-colors ${activeTab === tab ? "text-[#2f6de6] bg-[#edf4ff]" : "text-[#7f8796] hover:text-[#2f6de6]"}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {careerCards.map((card) => (
                            <article key={card.title} className="rounded-xl border border-[#d8deeb] bg-white p-3 hover:shadow-md transition-shadow">
                                <img src={card.image} alt={card.title} className="h-36 w-full rounded-md object-cover" />
                                <h3 className="mt-3 text-[18px] leading-none font-extrabold text-[#1b2331]">{card.title}</h3>
                                <p className="mt-2 text-[11px] leading-4 text-[#8a95a8]">{card.text}</p>
                            </article>
                        ))}
                    </div>
                    <div className="text-center mt-6">
                        <Button onClick={() => handleCategoryClick("Tous")} className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] px-8 h-10 text-[12px]">
                            <Plus className="w-4 h-4 mr-1" /> Découvrir plus
                        </Button>
                    </div>
                </section>
            </main>

            <footer className="bg-[#06080d] text-white pt-10 sm:pt-14 pb-8">
                <div className="mx-auto max-w-[1180px] px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                        <div>
                            <img src="/images/logo.png" alt="Goriya" className="h-10 sm:h-12 w-auto brightness-0 invert" />
                            <p className="mt-4 text-sm text-[#9098a7]">Goriya est une plateforme web intelligente qui permet aux utilisateurs d'uploader leur CV afin d'obtenir une analyse intelligente par IA.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Concept</h4>
                            <ul className="mt-4 space-y-2 text-[#9098a7] text-sm">
                                <li><Link href="/explorer-emplois">Trouve un emploi</Link></li>
                                <li><Link href="/offres">Tarification</Link></li>
                                <li><Link href="#">Politique de confidentialité</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Recevoir les notifications d'emploi</h4>
                            <p className="text-sm text-[#9098a7] mt-3">Les dernières nouvelles sur l'emploi envoyées dans votre boîte de réception chaque semaine.</p>
                            <div className="mt-4 flex gap-2">
                                <Input className="h-10 rounded-full border-[#2a2f3a] bg-[#0f121a] text-white" placeholder="Adresse e-mail" />
                                <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">S'abonner</Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-[#1c202a] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                        <p className="text-xs sm:text-sm text-[#6f7887]">2026 © Goriya. Tous droits réservés.</p>
                        <div className="flex items-center gap-2">
                            <Link href="/auth/signin"><Button variant="outline" className="h-8 rounded-full border-[#374153] text-[#d9e5ff] bg-transparent">Connexion</Button></Link>
                            <Link href="//entreprise"><Button className="h-8 rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">Espace entreprise</Button></Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
