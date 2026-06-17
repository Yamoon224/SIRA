"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, Factory, ShoppingCart, Utensils, BriefcaseBusiness, Cpu, ChevronRight, Building2, Loader2 } from "lucide-react"
import { companyService } from "@/lib/api/company.service"
import { ICompany } from "@/lib/@types/entities"

const sectors = [
    { name: "Santé / Social / Environnement", icon: Globe, query: "Santé" },
    { name: "Industrie", icon: Factory, query: "Industrie" },
    { name: "Distribution", icon: ShoppingCart, query: "Distribution" },
    { name: "Food et boisson", icon: Utensils, query: "Restauration" },
    { name: "Conseil / Audit", icon: BriefcaseBusiness, query: "Conseil" },
    { name: "Tech", icon: Cpu, query: "Tech" },
]

function CompanyCard({ company }: { company: ICompany }) {
    return (
        <Link href={`/entreprises/${company.id}`}>
            <article className="rounded-[14px] border border-[#d8deeb] bg-white p-3 hover:border-[#2f6de6] hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-[#f3f5fa] flex items-center justify-center flex-shrink-0">
                        {company.logo
                            ? <img src={company.logo} alt={company.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                            : <Building2 className="w-3 h-3 text-[#9aa3b2]" />
                        }
                    </div>
                    {company.companySize && (
                        <span className="text-[9px] border border-[#c7d5f4] text-[#5c74af] rounded-full px-2 py-0.5">{company.companySize}</span>
                    )}
                </div>
                <h3 className="mt-2 text-[12px] font-bold text-[#1d2432] truncate">{company.name}</h3>
                <p className="text-[9px] text-[#7e889c]">{company.sector || "Entreprise"}</p>
                <p className="text-[9px] text-[#a2acbd] mt-0.5">{company.location || company.headquarters || "—"}</p>
                {company.about && <p className="mt-2 text-[9px] leading-4 text-[#8a95a8] line-clamp-2">{company.about}</p>}
            </article>
        </Link>
    )
}

function CompanySkeleton() {
    return (
        <div className="rounded-[14px] border border-[#d8deeb] bg-white p-3 animate-pulse">
            <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 rounded-full bg-[#f0f3fb]" />
                <div className="w-12 h-3 rounded-full bg-[#f0f3fb]" />
            </div>
            <div className="w-3/4 h-3 rounded bg-[#f0f3fb] mb-1" />
            <div className="w-1/2 h-2 rounded bg-[#f0f3fb] mb-1" />
            <div className="w-2/3 h-2 rounded bg-[#f0f3fb] mb-2" />
            <div className="w-full h-6 rounded bg-[#f0f3fb]" />
        </div>
    )
}

export default function ExploreCompaniesPage() {
    const [newCompanies, setNewCompanies] = useState<ICompany[]>([])
    const [topCompanies, setTopCompanies] = useState<ICompany[]>([])
    const [loading, setLoading] = useState(true)
    const [activeSector, setActiveSector] = useState<string | null>(null)
    const [sectorCompanies, setSectorCompanies] = useState<ICompany[]>([])
    const [sectorLoading, setSectorLoading] = useState(false)

    useEffect(() => {
        Promise.all([
            companyService.getCompanies({ limit: 10, page: 1 }),
            companyService.getCompanies({ limit: 4, page: 2 }),
        ])
            .then(([res1, res2]: any[]) => {
                const d1 = res1?.data?.data ?? res1?.data ?? []
                const d2 = res2?.data?.data ?? res2?.data ?? []
                setNewCompanies(Array.isArray(d1) ? d1 : [])
                setTopCompanies(Array.isArray(d2) ? d2 : d1.slice(0, 4))
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const handleSectorClick = async (sector: typeof sectors[0]) => {
        if (activeSector === sector.name) {
            setActiveSector(null)
            setSectorCompanies([])
            return
        }
        setActiveSector(sector.name)
        setSectorLoading(true)
        try {
            const res = await companyService.getCompanies({ search: sector.query, limit: 10 }) as any
            const data = res?.data?.data ?? res?.data ?? []
            setSectorCompanies(Array.isArray(data) ? data : [])
        } catch {
            setSectorCompanies([])
        } finally {
            setSectorLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f4f5f7] text-[#111827]">
            <header className="bg-[#f4f5f7]">
                <div className="mx-auto max-w-[1180px] px-4 h-[56px] sm:h-[64px] md:h-[72px] flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img src="/images/logo.png" alt="Goriya" className="h-8 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-[12px] text-[#7a8495] font-medium">
                        <Link href="/" className="text-[#2f6de6]">Accueil</Link>
                        <Link href="/explorer-emplois" className="hover:text-[#2f6de6]">Trouve un emploi</Link>
                        <Link href="/offres" className="hover:text-[#2f6de6]">Tarifs d'abonnement</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link href="/auth/signin">
                            <Button variant="outline" className="h-8 px-4 rounded-full text-[11px] border-[#b9c8ec] text-[#2f6de6] bg-white">Connexion</Button>
                        </Link>
                        <Link href="https://goriya-entreprise.vercel.app">
                            <Button className="h-8 px-4 rounded-full text-[11px] bg-[#2157d3] hover:bg-[#1d4cb9]">Espace entreprise</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1180px] px-4 pt-10 pb-16">
                <section className="text-center">
                    <h1 className="text-[28px] sm:text-[42px] leading-none font-extrabold text-[#121826]">Explorer les entreprises.</h1>
                    <p className="mt-5 text-[11px] sm:text-[12px] text-[#7f8796] max-w-[760px] mx-auto leading-4">
                        Ne vous contentez pas de postuler, découvrez l'histoire derrière chaque offre d'emploi. Naviguez à travers notre sélection d'entreprises, lisez les témoignages d'employés et familiarisez-vous avec la culture de chaque organisation.
                    </p>
                </section>

                {/* Sectors */}
                <section className="mt-10 sm:mt-14">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#1b2331]">Secteur d'activité</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sectors.map((sector) => {
                            const Icon = sector.icon
                            const isActive = activeSector === sector.name
                            return (
                                <button key={sector.name} type="button" onClick={() => handleSectorClick(sector)}
                                    className={`rounded-xl border overflow-hidden text-left transition-all ${isActive ? "border-[#2f6de6] shadow-md" : "border-[#d7ddea]"} bg-white`}>
                                    <div className="px-4 pt-5 pb-3 text-center">
                                        <Icon className={`w-4 h-4 mx-auto ${isActive ? "text-[#2f6de6]" : "text-[#2f6de6]"}`} />
                                        <p className="mt-3 text-[10px] font-semibold text-[#2f5099]">{sector.name}</p>
                                    </div>
                                    <div className={`h-7 text-white text-[11px] font-semibold flex items-center justify-center ${isActive ? "bg-[#1539be]" : "bg-gradient-to-r from-[#2f81f1] to-[#1539be]"}`}>
                                        {isActive ? "Masquer ▲" : "Découvrir"}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Sector companies result */}
                    {activeSector && (
                        <div className="mt-4">
                            {sectorLoading ? (
                                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#2f6de6]" /></div>
                            ) : sectorCompanies.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                    {sectorCompanies.map(company => <CompanyCard key={company.id} company={company} />)}
                                </div>
                            ) : (
                                <p className="text-center text-[11px] text-[#9aa3b2] py-4">Aucune entreprise trouvée dans ce secteur.</p>
                            )}
                        </div>
                    )}
                </section>

                {/* New companies */}
                <section className="mt-10 sm:mt-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[18px] sm:text-[26px] font-extrabold text-[#1b2331]">Nouvelles entreprises à explorer</h2>
                        <Link href="/entreprises" className="flex items-center text-[10px] text-[#1b2331] font-semibold hover:text-[#2f6de6]">
                            Voir toutes <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {Array.from({ length: 10 }).map((_, i) => <CompanySkeleton key={i} />)}
                        </div>
                    ) : newCompanies.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {newCompanies.map(company => <CompanyCard key={company.id} company={company} />)}
                        </div>
                    ) : (
                        <p className="text-center text-[11px] text-[#9aa3b2] py-8">Aucune entreprise disponible pour le moment.</p>
                    )}
                </section>

                {/* Top recruiting companies */}
                <section className="mt-10 sm:mt-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[18px] sm:text-[26px] font-extrabold text-[#1b2331]">Les entreprises qui recrutent le plus souvent</h2>
                        <Link href="/entreprises" className="flex items-center text-[10px] text-[#1b2331] font-semibold hover:text-[#2f6de6]">
                            Découvrir <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => <CompanySkeleton key={i} />)}
                        </div>
                    ) : topCompanies.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {topCompanies.map(company => <CompanyCard key={company.id} company={company} />)}
                        </div>
                    ) : null}
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
                            <Link href="https://goriya-entreprise.vercel.app"><Button className="h-8 rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">Espace entreprise</Button></Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
