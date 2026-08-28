"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ArrowLeft, Loader2 } from "lucide-react"
import { companyService } from "@/lib/api/company.service"
import { ICompany } from "@/lib/@types/entities"
import { CompanyLogo } from "@/components/company-logo"
import { capitalizeFirst, dedupeByName } from "@/lib/utils"

export default function TopRecruitingPage() {
    const [companies, setCompanies] = useState<ICompany[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        companyService.getRecruitingCompanies()
            .then((res: any) => {
                const data = res?.data?.data ?? res?.data ?? []
                setCompanies(dedupeByName(Array.isArray(data) ? data : []))
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[1180px] px-4 py-10 sm:py-14">
                <Link href="/explorer-entreprises" className="inline-flex items-center gap-2 text-sm text-[#2f6de6] font-semibold mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux entreprises
                </Link>
                <section className="rounded-2xl border border-[#dbe3ef] bg-white p-6 sm:p-8 shadow-sm">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">Entreprises qui recrutent le plus souvent</h1>
                    <p className="mt-3 max-w-2xl text-sm text-[#667085]">Consulte la liste des entreprises les plus actives sur les recrutements pour cibler tes candidatures.</p>

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
                                                    <p className="text-xs text-[#667085] mt-0.5">{capitalizeFirst(company.location || company.headquarters) || "-"}</p>
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

            <Footer />
        </div>
    )
}
