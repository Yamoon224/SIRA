"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2 } from "lucide-react"
import { companyService } from "@/lib/api/company.service"
import { ICompany } from "@/lib/@types/entities"
import { CompanyLogo } from "@/components/company-logo"
import { capitalizeFirst, dedupeByName } from "@/lib/utils"

export default function NewCompaniesPage() {
    const [companies, setCompanies] = useState<ICompany[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        companyService.getCompanies({ limit: 20, page: 1 })
            .then((res: any) => {
                const data = res?.data?.data ?? res?.data ?? []
                setCompanies(dedupeByName(Array.isArray(data) ? data : []))
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-[#f4f5f7] text-[#111827]">
            <header className="bg-[#f4f5f7] border-b border-[#e5eaf2]">
                <div className="mx-auto max-w-[1180px] px-4 h-[56px] sm:h-[64px] md:h-[72px] flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img src="/images/logo.png" alt="Goriya" className="h-8 w-auto" />
                    </Link>
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

            <main className="mx-auto max-w-[1180px] px-4 py-10 sm:py-14">
                <Link href="/explorer-entreprises" className="inline-flex items-center gap-2 text-sm text-[#2f6de6] font-semibold mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux entreprises
                </Link>
                <section className="rounded-2xl border border-[#dbe3ef] bg-white p-6 sm:p-8 shadow-sm">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">Toutes les nouvelles entreprises</h1>
                    <p className="mt-3 max-w-2xl text-sm text-[#667085]">Découvrez les entreprises récemment visibles sur la plateforme et les opportunités associées.</p>

                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#2f6de6]" /></div>
                    ) : companies.length === 0 ? (
                        <p className="text-center text-sm text-[#9aa3b2] py-10">Aucune entreprise disponible pour le moment.</p>
                    ) : (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {companies.map((company) => (
                                <Link key={company.id} href={`/explorer-entreprises/${company.id}`}>
                                    <article className="rounded-xl border border-[#dbe3ef] bg-[#f8fbff] p-5 hover:border-[#2f6de6] hover:shadow-sm transition-all">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <CompanyLogo name={company.name} logo={company.logo} className="w-8 h-8 text-[10px] flex-shrink-0" />
                                                <div>
                                                    <h2 className="text-sm font-semibold text-[#1d2432]">{company.name}</h2>
                                                    <p className="text-xs text-[#667085] mt-0.5">{capitalizeFirst(company.location || company.headquarters) || "—"}</p>
                                                </div>
                                            </div>
                                            {company.sector && (
                                                <span className="rounded-full bg-[#eff4ff] px-2.5 py-1 text-[10px] font-semibold text-[#2f6de6] flex-shrink-0">{company.sector}</span>
                                            )}
                                        </div>
                                        {company.about && (
                                            <p className="mt-3 text-xs text-[#667085] line-clamp-2">{capitalizeFirst(company.about)}</p>
                                        )}
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <footer className="bg-[#06080d] text-white pt-10 sm:pt-14 pb-8">
                <div className="mx-auto max-w-[1180px] px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                        <div>
                            <img src="/images/logo.png" alt="Goriya" className="h-10 sm:h-12 w-auto brightness-0 invert" />
                            <p className="mt-4 text-sm text-[#9098a7]">Goriya aide les candidats à découvrir les entreprises, les offres et les opportunités adaptées.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Concept</h4>
                            <ul className="mt-4 space-y-2 text-[#9098a7] text-sm">
                                <li><Link href="/explorer-emplois">Trouve un emploi</Link></li>
                                <li><Link href="/offres">Tarification</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Recevoir les notifications d'emploi</h4>
                            <p className="text-sm text-[#9098a7] mt-3">Les dernières opportunités envoyées dans votre boîte de réception.</p>
                            <div className="mt-4 flex gap-2">
                                <Input className="h-10 rounded-full border-[#2a2f3a] bg-[#0f121a] text-white" placeholder="Adresse e-mail" />
                                <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">S'abonner</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
