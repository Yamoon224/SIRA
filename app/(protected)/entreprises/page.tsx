"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react"

type CatalogCompany = {
    id: number
    name: string
    logo: string
    offers: number
    description: string
    tags: string[]
}

const companiesData: CatalogCompany[] = [
    {
        id: 1,
        name: "Marketing REVOLUT",
        logo: "R",
        offers: 3,
        description: "Technologie, informatique et internet\nRévolut. Défiez et innovez la passion pour le sport et un futur d'expérience...",
        tags: ["Marketing", "Conception"],
    },
    {
        id: 2,
        name: "Pitch",
        logo: "Dbx",
        offers: 3,
        description: "Édition de logiciel\nPitch. Ici le laboratoire complète le pitch. Notre vocation de performances...",
        tags: ["Marketing", "Conception"],
    },
    {
        id: 3,
        name: "Marketing REVOLUT",
        logo: "R",
        offers: 3,
        description: "Technologie, informatique et internet\nRévolut. Défiez et innovez la passion pour le sport et un futur d'expérience...",
        tags: ["Marketing", "Conception"],
    },
    {
        id: 4,
        name: "Pitch",
        logo: "Dbx",
        offers: 3,
        description: "Édition de logiciel\nPitch. Ici le laboratoire complète le pitch. Notre vocation de performances...",
        tags: ["Marketing", "Conception"],
    },
    {
        id: 5,
        name: "Marketing REVOLUT",
        logo: "R",
        offers: 3,
        description: "Technologie, informatique et internet\nRévolut. Défiez et innovez la passion pour le sport et un futur d'expérience...",
        tags: ["Marketing", "Conception"],
    },
    {
        id: 6,
        name: "Twitter",
        logo: "t",
        offers: 0,
        description: "Développement de logiciel\nLa vie ne commence pas à travailler, mais à devenir un chemin. Mon croyons vers le bonheur...",
        tags: ["Marketing", "Conception"],
    },
    {
        id: 7,
        name: "Pitch",
        logo: "Dbx",
        offers: 3,
        description: "Édition de logiciel\nPitch. Ici le laboratoire complète le pitch. Notre vocation de performances...",
        tags: ["Marketing", "Conception"],
    },
    {
        id: 8,
        name: "Marketing REVOLUT",
        logo: "R",
        offers: 3,
        description: "Technologie, informatique et internet\nRévolut. Défiez et innovez la passion pour le sport et un futur d'expérience...",
        tags: ["Marketing", "Conception"],
    },
    {
        id: 9,
        name: "Twitter",
        logo: "t",
        offers: 0,
        description: "Développement de logiciel\nLa vie ne commence pas à travailler, mais à devenir un chemin. Mon croyons vers le bonheur...",
        tags: ["Marketing", "Conception"],
    },
    {
        id: 10,
        name: "Marketing REVOLUT",
        logo: "R",
        offers: 3,
        description: "Technologie, informatique et internet\nRévolut. Défiez et innovez la passion pour le sport et un futur d'expérience...",
        tags: ["Marketing", "Conception"],
    },
    {
        id: 11,
        name: "Pitch",
        logo: "Dbx",
        offers: 3,
        description: "Édition de logiciel\nPitch. Ici le laboratoire complète le pitch. Notre vocation de performances...",
        tags: ["Marketing", "Conception"],
    },
    {
        id: 12,
        name: "Pitch",
        logo: "Dbx",
        offers: 3,
        description: "Édition de logiciel\nPitch. Ici le laboratoire complète le pitch. Notre vocation de performances...",
        tags: ["Marketing", "Conception"],
    },
]

export default function CompaniesPage() {
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)

    const pageSize = 12
    const totalPages = 3

    const filteredCompanies = useMemo(() => {
        if (!search.trim()) return companiesData
        return companiesData.filter((company) => company.name.toLowerCase().includes(search.toLowerCase()))
    }, [search])

    const pagedCompanies = useMemo(() => {
        const start = (page - 1) * pageSize
        return filteredCompanies.slice(start, start + pageSize)
    }, [filteredCompanies, page])

    const industries = [
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

    const sizes = ["1-10 (15)", "11-50 (35)", "51-250 (14)", "251-500 (4)", "500 et 1000 (43)", "1000+ et dessus (33)"]

    const logoClass = (logo: string) => {
        if (logo === "t") return "bg-[#3aa0f3] text-white"
        if (logo === "Dbx") return "bg-black text-white"
        return "bg-transparent border border-[#1d2433] text-[#1d2433]"
    }

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
                            {industries.map((item) => (
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
                            {sizes.map((item) => (
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

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {pagedCompanies.map((company) => (
                                <Card key={company.id} className="rounded-[10px] border-[#dfe5f1] shadow-none">
                                    <CardContent className="p-3">
                                        <div className="mb-2 flex items-start justify-between">
                                            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-semibold ${logoClass(company.logo)}`}>
                                                {company.logo}
                                            </div>
                                            <Badge variant="outline" className="h-5 rounded-full border-[#ced8ee] px-2 text-[10px] text-[#2f6de6]">
                                                {company.offers} offres
                                            </Badge>
                                        </div>

                                        <h3 className="text-[12px] font-semibold text-[#1d2433]">{company.name}</h3>
                                        <p className="mt-1 whitespace-pre-line text-[10px] leading-[1.35] text-[#8b93a3]">{company.description}</p>

                                        <div className="mt-2 flex gap-1.5">
                                            {company.tags.map((tag) => (
                                                <Badge
                                                    key={`${company.id}-${tag}`}
                                                    variant="secondary"
                                                    className="h-5 rounded-full bg-[#eef3fb] px-2 text-[9px] font-medium text-[#5f6d87]"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-5 flex items-center justify-center gap-2 text-[11px]">
                            <button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                className="flex h-6 w-6 items-center justify-center text-[#8b93a3]"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            {[1, 2, 3].map((n) => (
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
                                className="flex h-6 w-6 items-center justify-center text-[#8b93a3]"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
