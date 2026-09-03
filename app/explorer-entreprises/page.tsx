"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Globe, Factory, ShoppingCart, Utensils, BriefcaseBusiness, Cpu, ChevronRight, Loader2, Building2, Scale, Megaphone, Landmark, GraduationCap, Palette, ShieldCheck, Calculator, Truck, HeartPulse } from "lucide-react"
import { companyService } from "@/lib/api/company.service"
import { ICompany } from "@/lib/@types/entities"
import { CompanyLogo } from "@/components/company-logo"
import { capitalizeFirst, dedupeByName } from "@/lib/utils"

const SECTOR_ICONS: Record<string, typeof Globe> = {
    "Santé": HeartPulse,
    "Industrie": Factory,
    "Distribution": ShoppingCart,
    "Restauration": Utensils,
    "Conseil": BriefcaseBusiness,
    "Informatique": Cpu,
    "Juridique": Scale,
    "Marketing": Megaphone,
    "Publicité": Megaphone,
    "Communication": Megaphone,
    "Banque": Landmark,
    "Finance": Landmark,
    "Assurance": ShieldCheck,
    "Éducation": GraduationCap,
    "Graphisme": Palette,
    "Comptabilité": Calculator,
    "Audit": Calculator,
    "Logistique": Truck,
    "Ressources humaines": Building2,
}

function CompanyCard({ company }: { company: ICompany }) {
    return (
        <Link href={`/explorer-entreprises/${company.id}`}>
            <article className="rounded-[14px] border border-[#d8deeb] dark:border-border bg-white dark:bg-card p-3 hover:border-[#2f6de6] hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                    <CompanyLogo name={company.name} logo={company.logo} className="w-6 h-6 text-[9px] flex-shrink-0" />
                    {company.companySize && (
                        <span className="text-[9px] border border-[#c7d5f4] dark:border-border text-[#5c74af] dark:text-primary rounded-full px-2 py-0.5">{company.companySize}</span>
                    )}
                </div>
                <h3 className="mt-2 text-[12px] font-bold text-[#1d2432] dark:text-foreground truncate">{company.name}</h3>
                <p className="text-[9px] text-[#7e889c] dark:text-muted-foreground">{company.sector || "Entreprise"}</p>
                <p className="text-[9px] text-[#a2acbd] dark:text-muted-foreground mt-0.5">{capitalizeFirst(company.location || company.headquarters) || "-"}</p>
                {company.about && <p className="mt-2 text-[9px] leading-4 text-[#8a95a8] dark:text-muted-foreground line-clamp-2">{capitalizeFirst(company.about)}</p>}
            </article>
        </Link>
    )
}

function CompanySkeleton() {
    return (
        <div className="rounded-[14px] border border-[#d8deeb] dark:border-border bg-white dark:bg-card p-3 animate-pulse">
            <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 rounded-full bg-[#f0f3fb] dark:bg-muted" />
                <div className="w-12 h-3 rounded-full bg-[#f0f3fb] dark:bg-muted" />
            </div>
            <div className="w-3/4 h-3 rounded bg-[#f0f3fb] dark:bg-muted mb-1" />
            <div className="w-1/2 h-2 rounded bg-[#f0f3fb] dark:bg-muted mb-1" />
            <div className="w-2/3 h-2 rounded bg-[#f0f3fb] dark:bg-muted mb-2" />
            <div className="w-full h-6 rounded bg-[#f0f3fb] dark:bg-muted" />
        </div>
    )
}

export default function ExploreCompaniesPage() {
    const [newCompanies, setNewCompanies] = useState<ICompany[]>([])
    const [topCompanies, setTopCompanies] = useState<ICompany[]>([])
    const [loading, setLoading] = useState(true)
    const [sectors, setSectors] = useState<{ name: string; count: number }[]>([])
    const [activeSector, setActiveSector] = useState<string | null>(null)
    const [sectorCompanies, setSectorCompanies] = useState<ICompany[]>([])
    const [sectorLoading, setSectorLoading] = useState(false)

    useEffect(() => {
        Promise.all([
            companyService.getCompanies({ limit: 10, page: 1 }),
            companyService.getCompanies({ limit: 4, page: 2 }),
        ])
            .then(([res1, res2]: any[]) => {
                const d1raw: ICompany[] = res1?.data?.data ?? res1?.data ?? []
                const d2raw: ICompany[] = res2?.data?.data ?? res2?.data ?? []
                const d1 = dedupeByName(Array.isArray(d1raw) ? d1raw : [])
                const d2 = dedupeByName(Array.isArray(d2raw) ? d2raw : d1.slice(0, 4))
                setNewCompanies(d1)
                setTopCompanies(d2)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        companyService.getSectors()
            .then((res: any) => setSectors((res?.data ?? res ?? []).slice(0, 6)))
            .catch(() => setSectors([]))
    }, [])

    const handleSectorClick = async (sector: { name: string; count: number }) => {
        if (activeSector === sector.name) {
            setActiveSector(null)
            setSectorCompanies([])
            return
        }
        setActiveSector(sector.name)
        setSectorLoading(true)
        try {
            const res = await companyService.getCompanies({ sector: sector.name, limit: 10 }) as any
            const data = res?.data?.data ?? res?.data ?? []
            setSectorCompanies(dedupeByName(Array.isArray(data) ? data : []))
        } catch {
            setSectorCompanies([])
        } finally {
            setSectorLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[1180px] px-4 pt-10 pb-16">
                <section className="text-center">
                    <h1 className="text-[28px] sm:text-[42px] leading-none font-extrabold text-[#121826] dark:text-foreground">Explorer les entreprises.</h1>
                    <p className="mt-5 text-[11px] sm:text-[12px] text-[#7f8796] dark:text-muted-foreground max-w-[760px] mx-auto leading-4">
                        Ne te contente pas de postuler, découvre l'histoire derrière chaque offre d'emploi. Navigue à travers notre sélection d'entreprises, lis les témoignages d'employés et familiarise-toi avec la culture de chaque organisation.
                    </p>
                </section>

                {/* Sectors */}
                <section className="mt-10 sm:mt-14">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#1b2331] dark:text-foreground">Secteur d'activité</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sectors.map((sector) => {
                            const Icon = SECTOR_ICONS[sector.name] ?? Building2
                            const isActive = activeSector === sector.name
                            return (
                                <button key={sector.name} type="button" onClick={() => handleSectorClick(sector)}
                                    className={`rounded-2xl border overflow-hidden text-left transition-all ${isActive ? "border-[#2f6de6] shadow-md" : "border-[#d7ddea] dark:border-border"} bg-white dark:bg-card`}>
                                    <div className="px-4 pt-5 pb-3 text-center">
                                        <Icon className="w-4 h-4 mx-auto text-[#2f6de6] dark:text-primary" />
                                        <p className="mt-3 text-[10px] font-semibold text-[#2f5099] dark:text-primary">{sector.name}</p>
                                        <p className="text-[9px] text-[#8a95a8] dark:text-muted-foreground">{sector.count} entreprise{sector.count > 1 ? "s" : ""}</p>
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
                                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#2f6de6] dark:text-primary" /></div>
                            ) : sectorCompanies.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                    {sectorCompanies.map(company => <CompanyCard key={company.id} company={company} />)}
                                </div>
                            ) : (
                                <p className="text-center text-[11px] text-[#9aa3b2] dark:text-muted-foreground py-4">Aucune entreprise trouvée dans ce secteur.</p>
                            )}
                        </div>
                    )}
                </section>

                {/* New companies */}
                <section className="mt-10 sm:mt-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[18px] sm:text-[26px] font-extrabold text-[#1b2331] dark:text-foreground">Nouvelles entreprises à explorer</h2>
                        <Link href="/explorer-entreprises/nouvelles-entreprises" className="flex items-center text-[10px] text-[#1b2331] dark:text-foreground font-semibold hover:text-[#2f6de6] dark:hover:text-primary">
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
                        <p className="text-center text-[11px] text-[#9aa3b2] dark:text-muted-foreground py-8">Aucune entreprise disponible pour le moment.</p>
                    )}
                </section>

                {/* Top recruiting companies */}
                <section className="mt-10 sm:mt-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[18px] sm:text-[26px] font-extrabold text-[#1b2331] dark:text-foreground">Les entreprises qui recrutent le plus souvent</h2>
                        <Link href="/explorer-entreprises/recrutent-le-plus" className="flex items-center text-[10px] text-[#1b2331] dark:text-foreground font-semibold hover:text-[#2f6de6] dark:hover:text-primary">
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

            <Footer />
        </div>
    )
}
