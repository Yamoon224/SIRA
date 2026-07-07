"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, Phone, Mail, Users, MapPin, Clock, Building2, Loader2, AlertCircle, Search, X, SlidersHorizontal, Heart } from "lucide-react"
import { companyService } from "@/lib/api/company.service"
import { ICompany, IJobOffer } from "@/lib/@types/entities"
import { CompanyLogo } from "@/components/company-logo"
import { capitalizeFirst } from "@/lib/utils"

const JOB_TYPES = ["CDI", "CDD", "STAGE", "FREELANCE"]
const DURATIONS = ["1-3 mois", "4-6 mois", "7-12 mois", "13-24 mois", "25-36 mois"]
const EXPERIENCES = ["0-1 an", "1-3 ans", "3-5 ans", "5-10 ans", "10+ ans"]

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

function FilterModal({
    open,
    onClose,
    onApply,
    selectedTypes,
    setSelectedTypes,
    selectedDurations,
    setSelectedDurations,
    selectedExperiences,
    setSelectedExperiences,
}: {
    open: boolean
    onClose: () => void
    onApply: () => void
    selectedTypes: string[]
    setSelectedTypes: (v: string[]) => void
    selectedDurations: string[]
    setSelectedDurations: (v: string[]) => void
    selectedExperiences: string[]
    setSelectedExperiences: (v: string[]) => void
}) {
    if (!open) return null

    const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
        set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[18px] font-extrabold text-[#1b2331]">Tous les filtres</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f4f5f7] flex items-center justify-center hover:bg-[#e8edf6]">
                        <X className="w-4 h-4 text-[#7f8796]" />
                    </button>
                </div>

                {/* Type de travail */}
                <div className="mb-5">
                    <p className="text-[12px] font-bold text-[#1b2331] mb-3">Type de travail</p>
                    <div className="flex flex-wrap gap-2">
                        {JOB_TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => toggle(selectedTypes, type, setSelectedTypes)}
                                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${selectedTypes.includes(type) ? "bg-[#2f6de6] text-white border-[#2f6de6]" : "bg-white text-[#4e5a6e] border-[#d8deeb] hover:border-[#2f6de6]"}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Profession */}
                <div className="mb-5">
                    <p className="text-[12px] font-bold text-[#1b2331] mb-3">Profession</p>
                    <button className="w-full text-left px-4 py-2.5 rounded-xl border border-[#d8deeb] text-[12px] text-[#9aa3b2] hover:border-[#2f6de6] transition-colors">
                        Sélectionner des professions
                    </button>
                </div>

                {/* Durée du travail */}
                <div className="mb-5">
                    <p className="text-[12px] font-bold text-[#1b2331] mb-3">Durée du travail</p>
                    <div className="flex flex-wrap gap-2">
                        {DURATIONS.map(dur => (
                            <button
                                key={dur}
                                onClick={() => toggle(selectedDurations, dur, setSelectedDurations)}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${selectedDurations.includes(dur) ? "bg-[#2f6de6] text-white border-[#2f6de6]" : "bg-white text-[#4e5a6e] border-[#d8deeb] hover:border-[#2f6de6]"}`}
                            >
                                {dur}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Niveau d'expérience */}
                <div className="mb-6">
                    <p className="text-[12px] font-bold text-[#1b2331] mb-3">Niveau d'expérience</p>
                    <div className="flex flex-wrap gap-2">
                        {EXPERIENCES.map(exp => (
                            <button
                                key={exp}
                                onClick={() => toggle(selectedExperiences, exp, setSelectedExperiences)}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${selectedExperiences.includes(exp) ? "bg-[#2f6de6] text-white border-[#2f6de6]" : "bg-white text-[#4e5a6e] border-[#d8deeb] hover:border-[#2f6de6]"}`}
                            >
                                {exp}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSelectedTypes([])
                            setSelectedDurations([])
                            setSelectedExperiences([])
                            onClose()
                        }}
                        className="flex-1 rounded-full border-[#d8deeb] text-[12px] h-10"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={onApply}
                        className="flex-1 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] text-[12px] h-10"
                    >
                        Explorer les offres
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function EntrepriseDetailPage() {
    const params = useParams()
    const companyId = params?.id as string

    const [company, setCompany] = useState<ICompany | null>(null)
    const [jobs, setJobs] = useState<IJobOffer[]>([])
    const [similarCompanies, setSimilarCompanies] = useState<ICompany[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [activeTab, setActiveTab] = useState<"profil" | "jobs">("profil")

    // Filter state
    const [jobSearch, setJobSearch] = useState("")
    const [activeJobType, setActiveJobType] = useState<string | null>(null)
    const [showRemote, setShowRemote] = useState(false)
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [selectedDurations, setSelectedDurations] = useState<string[]>([])
    const [selectedExperiences, setSelectedExperiences] = useState<string[]>([])

    useEffect(() => {
        if (!companyId) return
        setLoading(true)
        companyService.getCompanyById(companyId)
            .then((res: any) => {
                const data = res?.data?.data ?? res?.data ?? res
                if (!data || !data.id) { setError(true); return }
                setCompany(data)
                return Promise.all([
                    companyService.getCompanyJobs(data.id),
                    companyService.getCompanies({ search: data.sector, limit: 6 }),
                ])
            })
            .then((results: any) => {
                if (!results) return
                const [jobsRes, similarsRes] = results
                const jobData = jobsRes?.data?.data ?? jobsRes?.data ?? []
                const simData = similarsRes?.data?.data ?? similarsRes?.data ?? []
                setJobs(Array.isArray(jobData) ? jobData : [])
                setSimilarCompanies((Array.isArray(simData) ? simData : []).filter((c: ICompany) => c.id !== companyId).slice(0, 5))
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [companyId])

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            if (jobSearch && !job.title.toLowerCase().includes(jobSearch.toLowerCase())) return false
            if (activeJobType && job.type !== activeJobType) return false
            if (selectedTypes.length > 0 && !selectedTypes.includes(job.type)) return false
            return true
        })
    }, [jobs, jobSearch, activeJobType, selectedTypes])

    const activeFilterCount = selectedTypes.length + selectedDurations.length + selectedExperiences.length

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#2f6de6]" />
            </div>
        )
    }

    if (error || !company) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-4">
                <AlertCircle className="w-10 h-10 text-[#e07b10]" />
                <h2 className="text-lg font-bold text-[#1b2331]">Entreprise introuvable</h2>
                <p className="text-[13px] text-[#9aa3b2]">Cette entreprise n'existe pas ou n'est plus disponible.</p>
                <Link href="/explorer-entreprises" className="text-[#2f6de6] text-sm font-semibold hover:underline">
                    Retour aux entreprises
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f4f5f7] text-[#1b2331]">
            <header className="bg-white border-b border-[#edf1f6]">
                <div className="mx-auto max-w-[1180px] px-4 h-[64px] flex items-center justify-between">
                    <Link href="/">
                        <img src="/images/logo.png" alt="Goriya" className="h-8 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-[13px] text-[#7a8495] font-medium">
                        <Link href="/" className="text-[#2f6de6]">Accueil</Link>
                        <Link href="/explorer-emplois" className="hover:text-[#2f6de6]">Trouve un emploi</Link>
                        <Link href="/offres" className="hover:text-[#2f6de6]">Tarifs d'abonnement</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link href="/auth/signin">
                            <button className="h-8 px-4 rounded-full text-[12px] border border-[#b9c8ec] text-[#2f6de6] bg-white hover:bg-[#f4f7ff]">
                                Connexion
                            </button>
                        </Link>
                        <Link href="https://goriya-entreprise.vercel.app">
                            <button className="h-8 px-4 rounded-full text-[12px] bg-[#2157d3] hover:bg-[#1d4cb9] text-white">
                                Espace entreprise
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Cover + Profile hero */}
            <div className="bg-white">
                <div className="h-[200px] sm:h-[250px] overflow-hidden bg-gradient-to-r from-[#1539be] to-[#2f81f1]">
                    {company.coverImage && (
                        <img src={company.coverImage} alt="cover" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                    )}
                </div>

                <div className="mx-auto max-w-[1000px] px-4">
                    <div className="relative -mt-10 flex items-end gap-4 pb-4 border-b border-[#e8edf6]">
                        <CompanyLogo name={company.name} logo={company.logo} className="w-[72px] h-[72px] rounded-2xl text-[22px] border-2 border-white shadow-lg" />

                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
                            <div>
                                <h1 className="text-[20px] font-extrabold text-[#1b2331]">{company.name}</h1>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-[#7f8796]">
                                    {company.sector && <span className="text-[#2f6de6] font-semibold">✦ {company.sector}</span>}
                                    {(company.location || company.headquarters) && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {capitalizeFirst(company.location || company.headquarters)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="h-8 px-5 rounded-full border border-[#d8deeb] text-[12px] text-[#1b2331] hover:border-[#2f6de6] bg-white transition-colors flex items-center gap-1.5">
                                    <Heart className="w-3.5 h-3.5" /> Suivre
                                </button>
                                <div className="flex rounded-full border border-[#d8deeb] overflow-hidden bg-white text-[12px]">
                                    <button
                                        onClick={() => setActiveTab("profil")}
                                        className={`px-5 h-8 font-semibold transition-colors ${activeTab === "profil" ? "bg-white text-[#1b2331]" : "text-[#9aa3b2] hover:text-[#1b2331]"}`}
                                    >
                                        Profil
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("jobs")}
                                        className={`px-5 h-8 font-semibold transition-colors flex items-center gap-1.5 ${activeTab === "jobs" ? "bg-[#2f6de6] text-white" : "text-[#9aa3b2] hover:text-[#1b2331]"}`}
                                    >
                                        Jobs
                                        {jobs.length > 0 && (
                                            <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${activeTab === "jobs" ? "bg-white/20 text-white" : "bg-[#f0f3fb] text-[#2f6de6]"}`}>
                                                {jobs.length}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <main className="mx-auto max-w-[1000px] px-4 py-8">
                {/* ── PROFIL TAB ── */}
                {activeTab === "profil" && (
                    <div className="space-y-6">
                        {/* About / Présentation */}
                        {company.about && (
                            <div className="bg-white rounded-xl border border-[#e8edf6] p-6">
                                <h2 className="text-[18px] font-extrabold text-[#1b2331] mb-4">Présentation</h2>
                                <p className="text-[13px] text-[#4e5a6e] leading-[1.8] whitespace-pre-line">{capitalizeFirst(company.about)}</p>
                            </div>
                        )}

                        {/* Ce qu'ils recherchent */}
                        <div className="bg-white rounded-xl border border-[#e8edf6] p-6">
                            <h2 className="text-[18px] font-extrabold text-[#1b2331] mb-4">Ce qu'ils recherchent</h2>
                            <div className="space-y-2">
                                {["Des candidats passionnés et motivés", "Des profils avec une expérience pertinente", "Des personnes capables de s'adapter rapidement"].map((item, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[13px] text-[#4e5a6e]">
                                        <span className="text-[#2f6de6] mt-0.5 flex-shrink-0">✓</span>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Culture et valeur */}
                        <div className="bg-white rounded-xl border border-[#e8edf6] p-6">
                            <h2 className="text-[18px] font-extrabold text-[#1b2331] mb-4">Culture et valeurs</h2>
                            <div className="space-y-2">
                                {["Innovation et créativité", "Collaboration et esprit d'équipe", "Engagement envers la satisfaction client", "Développement continu des compétences"].map((val, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[13px] text-[#4e5a6e]">
                                        <span className="text-[#2f6de6] mt-0.5 flex-shrink-0">•</span>
                                        {val}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact + Stats grid */}
                        <div className="bg-white rounded-xl border border-[#e8edf6] p-6">
                            <h2 className="text-[18px] font-extrabold text-[#1b2331] mb-5">Informations</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    {company.website && (
                                        <div className="flex items-start gap-3">
                                            <Globe className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-[#9aa3b2] mb-0.5">Site web</p>
                                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-[#2f6de6] hover:underline">{company.website}</a>
                                            </div>
                                        </div>
                                    )}
                                    {company.phone && (
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-[#9aa3b2] mb-0.5">Téléphone</p>
                                                <p className="text-[12px] font-medium text-[#4e5a6e]">{company.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {company.email && (
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-[#9aa3b2] mb-0.5">E-mail</p>
                                                <p className="text-[12px] font-medium text-[#4e5a6e]">{company.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {(company.location || company.headquarters) && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-[#9aa3b2] mb-0.5">Localisation</p>
                                                <p className="text-[12px] font-semibold text-[#1b2331]">{capitalizeFirst(company.location || company.headquarters)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {company.sector && (
                                        <div className="flex items-start gap-3">
                                            <Building2 className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-[#9aa3b2] mb-0.5">Secteur</p>
                                                <p className="text-[12px] font-semibold text-[#1b2331]">{company.sector}</p>
                                            </div>
                                        </div>
                                    )}
                                    {company.companySize && (
                                        <div className="flex items-start gap-3">
                                            <Users className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-[#9aa3b2] mb-0.5">Taille</p>
                                                <p className="text-[12px] font-semibold text-[#1b2331]">{company.companySize}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="text-[12px] font-semibold text-[#1b2331] mb-3">Suis-nous sur</p>
                                    {company.socialLinks?.length > 0 ? (
                                        <div className="flex gap-2">
                                            {company.socialLinks.slice(0, 3).map((link, i) => (
                                                <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-9 h-9 bg-[#0a66c2] text-white rounded-lg hover:bg-[#085bb5]">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                    </svg>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-[#9aa3b2]">Aucun réseau social renseigné.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Similar companies */}
                        {similarCompanies.length > 0 && (
                            <div className="bg-white rounded-xl border border-[#e8edf6] p-6">
                                <h2 className="text-[18px] font-extrabold text-[#1b2331] mb-4">Autres entreprises que tu peux consulter</h2>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {similarCompanies.map(sim => (
                                        <Link key={sim.id} href={`/explorer-entreprises/${sim.id}`} className="flex-shrink-0">
                                            <div className="w-[140px] rounded-xl border border-[#e8edf6] p-3 hover:border-[#2f6de6] hover:shadow-sm transition-all">
                                                <CompanyLogo name={sim.name} logo={sim.logo} className="w-9 h-9 rounded-lg text-[11px] mb-2" />
                                                <p className="text-[11px] font-bold text-[#1b2331] truncate">{sim.name}</p>
                                                <p className="text-[10px] text-[#9aa3b2] truncate">{sim.sector}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── JOBS TAB ── */}
                {activeTab === "jobs" && (
                    <div className="space-y-4">
                        {/* Search + filters row */}
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b2]" />
                                <Input
                                    type="search"
                                    value={jobSearch}
                                    onChange={e => setJobSearch(e.target.value)}
                                    placeholder="Recherche par job, mot-clé ou entreprise"
                                    className="pl-10 h-11 rounded-xl border-[#d8deeb] bg-white dark:bg-white text-[#111827] dark:text-[#111827] placeholder:text-[#9aa3b2] dark:placeholder:text-[#9aa3b2] text-[13px]"
                                />
                            </div>

                            {/* Filter chips */}
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setActiveJobType(activeJobType === "CDI" ? null : "CDI")}
                                    className={`px-4 h-8 rounded-full text-[12px] font-semibold border transition-all ${activeJobType === "CDI" ? "bg-[#2f6de6] text-white border-[#2f6de6]" : "bg-white text-[#4e5a6e] border-[#d8deeb] hover:border-[#2f6de6]"}`}
                                >
                                    Type de job
                                </button>
                                <button
                                    onClick={() => setShowRemote(r => !r)}
                                    className={`px-4 h-8 rounded-full text-[12px] font-semibold border transition-all ${showRemote ? "bg-[#2f6de6] text-white border-[#2f6de6]" : "bg-white text-[#4e5a6e] border-[#d8deeb] hover:border-[#2f6de6]"}`}
                                >
                                    Télétravail
                                </button>
                                <button className="px-4 h-8 rounded-full text-[12px] font-semibold border border-[#d8deeb] bg-white text-[#4e5a6e] hover:border-[#2f6de6] transition-all">
                                    Professions
                                </button>
                                <button
                                    onClick={() => setFilterModalOpen(true)}
                                    className={`px-4 h-8 rounded-full text-[12px] font-semibold border transition-all flex items-center gap-1.5 ${activeFilterCount > 0 ? "bg-[#2f6de6] text-white border-[#2f6de6]" : "bg-[#2f6de6] text-white border-[#2f6de6]"}`}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    Tous les filtres
                                    {activeFilterCount > 0 && (
                                        <span className="w-4 h-4 rounded-full bg-white/25 text-[10px] flex items-center justify-center">{activeFilterCount}</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Job list */}
                        {filteredJobs.length === 0 ? (
                            <div className="bg-white rounded-xl border border-[#e8edf6] flex flex-col items-center justify-center py-14 text-center px-4">
                                <Building2 className="w-8 h-8 text-[#c8d0df] mb-3" />
                                <p className="text-[13px] font-semibold text-[#1b2331]">Aucune offre disponible</p>
                                <p className="text-[11px] text-[#9aa3b2] mt-1">
                                    {jobs.length === 0 ? "Cette entreprise n'a pas encore publié d'offres." : "Aucun résultat pour ces filtres."}
                                </p>
                                {(jobSearch || activeJobType || activeFilterCount > 0) && (
                                    <button onClick={() => { setJobSearch(""); setActiveJobType(null); setSelectedTypes([]); setSelectedDurations([]); setSelectedExperiences([]) }} className="mt-3 text-[12px] text-[#2f6de6] hover:underline">
                                        Réinitialiser les filtres
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredJobs.map((job) => (
                                    <Link key={job.id} href={`/explorer-emplois/${job.id}`}>
                                        <div className="bg-white rounded-xl border border-[#e8edf6] flex items-stretch overflow-hidden hover:border-[#2f6de6] hover:shadow-sm transition-all">
                                            <div className="flex-1 p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-[15px] text-[#1b2331] mb-2">{job.title}</h3>
                                                        <div className="flex flex-wrap gap-3 text-[11px] text-[#7f8796] mb-2">
                                                            {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{capitalizeFirst(job.location)}</span>}
                                                            {job.type && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>}
                                                            {job.salary && <span className="text-[#22a05b] font-semibold">{job.salary}</span>}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {job.type && (
                                                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#2f6de6] border border-[#dce8ff] font-semibold">{job.type}</span>
                                                            )}
                                                            {job.experience && (
                                                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f4f5f7] text-[#7f8796] border border-[#e8eef6]">{job.experience}</span>
                                                            )}
                                                            {job.publishDate && (
                                                                <span className="text-[10px] text-[#9aa3b2]">{formatPosted(job.publishDate)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f4f5f7] flex-shrink-0">
                                                        <Heart className="w-4 h-4 text-[#9aa3b2]" />
                                                    </button>
                                                </div>
                                                {job.description && (
                                                    <p className="mt-2 text-[11px] text-[#9aa3b2] line-clamp-1">{job.description}</p>
                                                )}
                                            </div>
                                            {company.coverImage && (
                                                <div className="w-[100px] flex-shrink-0 hidden sm:block">
                                                    <img src={company.coverImage} alt={company.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Filter Modal */}
            <FilterModal
                open={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApply={() => setFilterModalOpen(false)}
                selectedTypes={selectedTypes}
                setSelectedTypes={setSelectedTypes}
                selectedDurations={selectedDurations}
                setSelectedDurations={setSelectedDurations}
                selectedExperiences={selectedExperiences}
                setSelectedExperiences={setSelectedExperiences}
            />

            <footer className="bg-[#06080d] text-white pt-12 pb-8 mt-12">
                <div className="mx-auto max-w-[1180px] px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                        <div>
                            <img src="/images/logo.png" alt="Goriya" className="h-10 w-auto brightness-0 invert mb-4" />
                            <p className="text-[13px] text-[#9098a7] leading-[1.7]">
                                Goriya est une plateforme web intelligente qui permet aux utilisateurs d'uploader leur CV afin d'obtenir une analyse intelligente par IA.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Concept</h4>
                            <ul className="space-y-2 text-[13px] text-[#9098a7]">
                                <li><Link href="/explorer-emplois" className="hover:text-white">Trouve un emploi</Link></li>
                                <li><Link href="/offres" className="hover:text-white">Tarification</Link></li>
                                <li><Link href="/confidentialite" className="hover:text-white">Politique de confidentialité</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Recevoir les notifications d'emploi</h4>
                            <p className="text-[13px] text-[#9098a7] mb-4">Les dernières nouvelles sur l'emploi envoyées dans ta boîte de réception chaque semaine.</p>
                            <div className="flex flex-col items-center gap-2 sm:flex-row">
                                <input type="email" placeholder="Adresse e-mail" className="w-full flex-1 h-9 rounded-full bg-[#0f121a] border border-[#2a2f3a] px-4 text-[12px] text-white placeholder:text-[#5a6070] outline-none" />
                                <button className="h-9 px-4 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] text-white text-[12px]">S'abonner</button>
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-[#1c202a] flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[12px] text-[#6f7887]">2026 © Goriya. Tous droits réservés.</p>
                        <div className="flex items-center gap-3">
                            <Link href="/auth/signin">
                                <button className="h-8 px-4 rounded-full border border-[#374153] text-[#d9e5ff] text-[12px] bg-transparent hover:bg-[#1c2030]">Connexion</button>
                            </Link>
                            <Link href="https://goriya-entreprise.vercel.app">
                                <button className="h-8 px-4 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] text-white text-[12px]">Espace entreprise</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
