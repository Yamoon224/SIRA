"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Settings, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

const jobTypes = [
    { label: "À temps plein", count: 1 },
    { label: "À temps partiel", count: 1 },
    { label: "Stage", count: 1 },
    { label: "Contrat", count: 1 },
]

const productCategories = [
    { label: "Design", count: 2 },
    { label: "Ventes", count: 3 },
    { label: "Marketing", count: 1 },
    { label: "Commerce", count: 3 },
    { label: "Ressources humaines", count: 7 },
    { label: "Finance", count: 4 },
    { label: "Ingénierie", count: 4 },
    { label: "Technologie", count: 5 },
]

const experienceLevels = [
    { label: "Niveau Débutant", count: 7 },
    { label: "Niveau Intermédiaire", count: 7 },
    { label: "Niveau Supérieur", count: 6 },
    { label: "Résidence", count: 7 },
    { label: "Whiz-plus", count: 8 },
]

const salaryRanges = [
    { label: "$100 - $200", count: 4 },
    { label: "$200 - $400", count: 3 },
    { label: "$400 - $1000", count: 3 },
    { label: "$1000 Tous plus", count: 4 },
]

const BADGE_TYPES = {
    bon: { label: "Bon pour vous", color: "bg-[#e8f8ef] text-[#22a05b]" },
    online: { label: "Emploi en ligne", color: "bg-[#e8f1ff] text-[#2f6de6]" },
    fulltime: { label: "Temps plein", color: "bg-[#f3eeff] text-[#7c3aed]" },
    salary: { label: "Salaire plein", color: "bg-[#fff3e8] text-[#e07b10]" },
    affairs: { label: "Affaires", color: "bg-[#fff3e8] text-[#e07b10]" },
}

type BadgeKey = keyof typeof BADGE_TYPES

const jobs = [
    {
        id: "1",
        company: "REVOLUT Marketing",
        category: "Technologie, information et Internet",
        location: "Abidjan, Côte d'ivoire",
        description: "Revolut Retaile renforce la passion du sport en offrant l'expérience de paris sportifs la plus divertissante.",
        tags: ["Marketing", "Design"],
        skills: 5,
        badge: "bon" as BadgeKey,
        logo: "R",
        logoColor: "bg-[#ff3b30]",
    },
    {
        id: "2",
        company: "Twitter",
        category: "Développement de logiciels",
        location: "Abidjan, Côte d'ivoire",
        description: "La vie n'est pas une gestion des gens de bien. Nous avons des idées, nous avons des entreprises différentes…",
        tags: ["Technologie", "Design"],
        skills: 12,
        badge: "online" as BadgeKey,
        logo: "T",
        logoColor: "bg-[#1d9bf0]",
    },
    {
        id: "3",
        company: "REVOLUT Marketing",
        category: "Technologie, information et Internet",
        location: "Abidjan, Côte d'ivoire",
        description: "Revolut Retaile renforce la passion du sport en offrant l'expérience de paris sportifs la plus divertissante.",
        tags: ["Communication", "Design"],
        skills: 5,
        badge: "fulltime" as BadgeKey,
        logo: "R",
        logoColor: "bg-[#ff3b30]",
    },
    {
        id: "4",
        company: "Pitch",
        category: "Édition en ligne",
        location: "Abidjan, Côte d'ivoire",
        description: "Pitch est la plateforme complète de pitch. De la création de présentations élaborées à la conclusion d'accords…",
        tags: ["Technologie"],
        skills: 10,
        badge: "fulltime" as BadgeKey,
        logo: "P",
        logoColor: "bg-[#111827]",
    },
    {
        id: "5",
        company: "Twitter",
        category: "Développement de logiciels",
        location: "Abidjan, Côte d'ivoire",
        description: "La vie n'est pas une gestion des gens de bien. Nous avons des idées, nous avons des entreprises différentes…",
        tags: ["Technologie", "Transport"],
        skills: 10,
        badge: "fulltime" as BadgeKey,
        logo: "T",
        logoColor: "bg-[#1d9bf0]",
    },
    {
        id: "6",
        company: "Marketing REVOLUT",
        category: "Technologie, information et Internet",
        location: "Abidjan, Côte d'ivoire",
        description: "Revolut Basicii renforce la passion du sport en offrant l'expérience de paris sportifs la plus divertissante.",
        tags: ["Marketing", "Conception"],
        skills: 9,
        badge: "fulltime" as BadgeKey,
        logo: "M",
        logoColor: "bg-[#34c759]",
    },
    {
        id: "7",
        company: "Pitch",
        category: "Édition en ligne",
        location: "Abidjan, Côte d'ivoire",
        description: "Pitch est la plateforme complète de pitch. De la création de présentations élaborées à la conclusion d'accords…",
        tags: ["Marketing", "Conception"],
        skills: 10,
        badge: "fulltime" as BadgeKey,
        logo: "P",
        logoColor: "bg-[#111827]",
    },
    {
        id: "8",
        company: "Twitter",
        category: "Développement de logiciels",
        location: "Abidjan, Côte d'ivoire",
        description: "Revolut, créde du service. Nous avons des idées, nous avons des entreprises différentes…",
        tags: ["Affaires"],
        skills: 18,
        badge: "affairs" as BadgeKey,
        logo: "T",
        logoColor: "bg-[#1d9bf0]",
    },
    {
        id: "9",
        company: "Pitch",
        category: "Édition en ligne",
        location: "Abidjan, Côte d'ivoire",
        description: "Pitch est la plateforme complète de pitch. De la création de présentations convaincantes à la conclusion d'accords…",
        tags: ["Marketing", "Conception"],
        skills: 10,
        badge: "salary" as BadgeKey,
        logo: "P",
        logoColor: "bg-[#111827]",
    },
    {
        id: "10",
        company: "Marketing REVOLUT",
        category: "Technologie, information et Internet",
        location: "Abidjan, Côte d'ivoire",
        description: "Pitch est la plateforme complète de pitch. De la création de présentations convaincantes à la conclusion d'accords…",
        tags: ["Marketing", "Conception"],
        skills: 10,
        badge: "fulltime" as BadgeKey,
        logo: "M",
        logoColor: "bg-[#34c759]",
    },
    {
        id: "11",
        company: "Pitch",
        category: "Édition en ligne",
        location: "Abidjan, Côte d'ivoire",
        description: "Pitch est la plateforme complète de pitch. De la création de présentations convaincantes à la conclusion d'accords…",
        tags: ["Marketing", "Conception"],
        skills: 10,
        badge: "fulltime" as BadgeKey,
        logo: "P",
        logoColor: "bg-[#111827]",
    },
    {
        id: "12",
        company: "Pitch",
        category: "Édition en ligne",
        location: "Abidjan, Côte d'ivoire",
        description: "Pitch est la plateforme complète de pitch. De la création de présentations convaincantes à la conclusion d'accords…",
        tags: ["Marketing", "Conception"],
        skills: 10,
        badge: "salary" as BadgeKey,
        logo: "P",
        logoColor: "bg-[#111827]",
    },
]

const TOTAL_RESULTS = 75
const CURRENT_PAGE = 1
const TOTAL_PAGES = 7

export default function EmploisPage() {
    const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedLevels, setSelectedLevels] = useState<string[]>([])
    const [selectedSalaries, setSelectedSalaries] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy] = useState("Le plus pertinent")

    const toggleFilter = (value: string, list: string[], setList: (v: string[]) => void) => {
        setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
    }

    const filteredJobs = jobs.filter(job =>
        searchTerm === "" ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-4">
            {/* Top search bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b2]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Rechercher un emploi..."
                        className="w-full h-9 rounded-full border border-[#d8deeb] bg-white pl-9 pr-4 text-[12px] text-[#1b2331] placeholder:text-[#9aa3b2] outline-none focus:border-[#2f6de6]"
                    />
                </div>
                <button type="button" className="w-9 h-9 rounded-full border border-[#d8deeb] bg-white flex items-center justify-center text-[#9aa3b2] hover:text-[#2f6de6]">
                    <Settings className="w-4 h-4" />
                </button>
            </div>

            {/* Page title */}
            <h1 className="text-[22px] font-extrabold text-[#1b2331]">Trouvez un emploi</h1>

            {/* Main layout */}
            <div className="flex gap-5 items-start">
                {/* Filters sidebar */}
                <aside className="w-[200px] flex-shrink-0 bg-white rounded-2xl border border-[#e5e9f2] p-4 space-y-5">
                    {/* Type d'emploi */}
                    <div>
                        <button type="button" className="flex items-center justify-between w-full text-[12px] font-semibold text-[#1b2331] mb-3">
                            Type d'emploi <ChevronDown className="w-4 h-4 text-[#9aa3b2]" />
                        </button>
                        <div className="space-y-2">
                            {jobTypes.map(item => (
                                <label key={item.label} className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center gap-2">
                                        <div
                                            onClick={() => toggleFilter(item.label, selectedJobTypes, setSelectedJobTypes)}
                                            className={`w-3.5 h-3.5 rounded border flex-shrink-0 cursor-pointer ${selectedJobTypes.includes(item.label) ? "bg-[#2f6de6] border-[#2f6de6]" : "border-[#c8d0df] bg-white"}`}
                                        />
                                        <span className="text-[11px] text-[#4e5a6e]">{item.label}</span>
                                    </div>
                                    <span className="text-[10px] text-[#9aa3b2]">({item.count})</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Catégories de produits */}
                    <div>
                        <button type="button" className="flex items-center justify-between w-full text-[12px] font-semibold text-[#1b2331] mb-3">
                            Catégories de produits <ChevronDown className="w-4 h-4 text-[#9aa3b2]" />
                        </button>
                        <div className="space-y-2">
                            {productCategories.map(item => (
                                <label key={item.label} className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <div
                                            onClick={() => toggleFilter(item.label, selectedCategories, setSelectedCategories)}
                                            className={`w-3.5 h-3.5 rounded border flex-shrink-0 cursor-pointer ${selectedCategories.includes(item.label) ? "bg-[#2f6de6] border-[#2f6de6]" : "border-[#c8d0df] bg-white"}`}
                                        />
                                        <span className="text-[11px] text-[#4e5a6e]">{item.label}</span>
                                    </div>
                                    <span className="text-[10px] text-[#9aa3b2]">({item.count})</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Niveau de temps */}
                    <div>
                        <button type="button" className="flex items-center justify-between w-full text-[12px] font-semibold text-[#1b2331] mb-3">
                            Niveau de temps <ChevronDown className="w-4 h-4 text-[#9aa3b2]" />
                        </button>
                        <div className="space-y-2">
                            {experienceLevels.map(item => (
                                <label key={item.label} className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <div
                                            onClick={() => toggleFilter(item.label, selectedLevels, setSelectedLevels)}
                                            className={`w-3.5 h-3.5 rounded border flex-shrink-0 cursor-pointer ${selectedLevels.includes(item.label) ? "bg-[#2f6de6] border-[#2f6de6]" : "border-[#c8d0df] bg-white"}`}
                                        />
                                        <span className="text-[11px] text-[#4e5a6e]">{item.label}</span>
                                    </div>
                                    <span className="text-[10px] text-[#9aa3b2]">({item.count})</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Fourchette salariale */}
                    <div>
                        <button type="button" className="flex items-center justify-between w-full text-[12px] font-semibold text-[#1b2331] mb-3">
                            Fourchette salariale <ChevronDown className="w-4 h-4 text-[#9aa3b2]" />
                        </button>
                        <div className="space-y-2">
                            {salaryRanges.map(item => (
                                <label key={item.label} className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <div
                                            onClick={() => toggleFilter(item.label, selectedSalaries, setSelectedSalaries)}
                                            className={`w-3.5 h-3.5 rounded border flex-shrink-0 cursor-pointer ${selectedSalaries.includes(item.label) ? "bg-[#2f6de6] border-[#2f6de6]" : "border-[#c8d0df] bg-white"}`}
                                        />
                                        <span className="text-[11px] text-[#4e5a6e]">{item.label}</span>
                                    </div>
                                    <span className="text-[10px] text-[#9aa3b2]">({item.count})</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Jobs grid */}
                <div className="flex-1 min-w-0">
                    {/* Results header */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-[14px] font-bold text-[#1b2331]">Tous les emplois</h2>
                            <p className="text-[11px] text-[#9aa3b2]">Affichage de {TOTAL_RESULTS} résultats</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#9aa3b2]">Trier par</span>
                            <button type="button" className="flex items-center gap-1 h-8 px-3 rounded-full border border-[#d8deeb] bg-white text-[11px] font-medium text-[#1b2331]">
                                {sortBy} <ChevronDown className="w-3.5 h-3.5 text-[#9aa3b2]" />
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                        {filteredJobs.map(job => {
                            const badge = BADGE_TYPES[job.badge]
                            return (
                                <Link
                                    key={job.id}
                                    href={`/emplois/${job.id}`}
                                    className="block bg-white rounded-2xl border border-[#e5e9f2] p-3 hover:shadow-md transition-shadow"
                                >
                                    {/* Badge */}
                                    <div className="flex justify-end mb-2">
                                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Company logo */}
                                    <div className={`w-8 h-8 rounded-full ${job.logoColor} flex items-center justify-center mb-2`}>
                                        <span className="text-[12px] font-bold text-white">{job.logo}</span>
                                    </div>

                                    {/* Company info */}
                                    <h3 className="text-[11px] font-bold text-[#1b2331] leading-tight">{job.company}</h3>
                                    <p className="text-[9px] text-[#9aa3b2] mt-0.5 leading-tight line-clamp-1">{job.category}</p>
                                    <p className="text-[9px] text-[#9aa3b2] leading-tight">{job.location}</p>

                                    {/* Description */}
                                    <p className="mt-2 text-[9px] text-[#6b7585] leading-[1.4] line-clamp-3">{job.description}</p>

                                    {/* Tags */}
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {job.tags.map(tag => (
                                            <span key={tag} className="text-[8px] px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#5b6f98]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Skills */}
                                    <p className="mt-2 text-[8px] text-[#9aa3b2]">
                                        Il a posté {job.skills} ou {job.skills + 2} compétences requis
                                    </p>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-1 mt-6">
                        <button type="button" className="w-7 h-7 rounded-full border border-[#d8deeb] bg-white flex items-center justify-center text-[#9aa3b2] hover:border-[#2f6de6] hover:text-[#2f6de6]">
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                type="button"
                                className={`w-7 h-7 rounded-full text-[11px] font-medium ${page === CURRENT_PAGE ? "bg-[#2f6de6] text-white" : "border border-[#d8deeb] bg-white text-[#9aa3b2] hover:border-[#2f6de6] hover:text-[#2f6de6]"}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button type="button" className="w-7 h-7 rounded-full border border-[#d8deeb] bg-white flex items-center justify-center text-[#9aa3b2] hover:border-[#2f6de6] hover:text-[#2f6de6]">
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
