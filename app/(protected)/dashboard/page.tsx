"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Eye, Briefcase } from "lucide-react"
import { dashboardService } from "@/lib/api/dashboard.service"
import { companyService } from "@/lib/api/company.service"
import { careerDashboardService, type ICareerDashboard } from "@/lib/api/career-dashboard.service"
import { CompanyLogo } from "@/components/company-logo"
import { capitalizeFirst } from "@/lib/utils"
import type { ICandidature, ICompany } from "@/lib/@types/entities"

const STATUS_LABEL: Record<string, string> = {
    EN_ATTENTE: "En attente",
    EN_COURS: "Entrevue prévue",
    APPROUVEE: "Acceptée",
    REJETEE: "Refusée",
    ACCEPTEE: "Acceptée",
    REFUSEE: "Refusée",
}

export default function Page() {
    const { user } = useAuth()
    const router = useRouter()
    const [currentDate, setCurrentDate] = useState("")
    const [dashStats, setDashStats] = useState<{ totalApplications: number; interviews: number; profileViews: number; savedJobs: number } | null>(null)
    const [recentApplications, setRecentApplications] = useState<ICandidature[]>([])
    const [recruitingCompanies, setRecruitingCompanies] = useState<ICompany[]>([])
    const [career, setCareer] = useState<ICareerDashboard | null>(null)

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString("fr-FR", { weekday: "long", month: "long", day: "numeric" }))

        const load = async () => {
            try {
                const [statsRes, appsRes, companiesRes, careerRes] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getRecentApplications(3),
                    companyService.getRecruitingCompanies(),
                    careerDashboardService.get(),
                ])
                setDashStats((statsRes as any)?.data ?? statsRes)
                const apps = (appsRes as any)?.data ?? appsRes ?? []
                setRecentApplications(Array.isArray(apps) ? apps : [])
                const companies = (companiesRes as any)?.data?.data ?? (companiesRes as any)?.data ?? companiesRes ?? []
                setRecruitingCompanies(Array.isArray(companies) ? companies.slice(0, 4) : [])
                setCareer((careerRes as any)?.data ?? careerRes)
            } catch (err) {
                console.error("[dashboard] load error:", err)
            }
        }
        load()
    }, [])

    const displayName = user?.name ?? "Utilisateur"
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)

    return (
        <ProtectedRoute>
            <div className="bg-white">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-[24px] font-bold text-[#1b2331]">Tableau de bord</h1>
                    </div>

                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h2 className="text-[28px] font-bold text-[#1b2331] mb-1">Bonjour, {displayName}</h2>
                            <p className="text-[13px] text-[#7f8796]">Voici un aperçu de tes candidatures et offres d'emploi</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-[11px] text-[#9aa3b2] mb-1">Prochaine entrevue</p>
                            <p className="text-[14px] font-semibold text-[#1b2331] mb-3">Aujourd'hui</p>
                            <Avatar className="w-10 h-10 ml-auto">
                                <AvatarImage src={user?.avatar ?? undefined} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white border border-[#e8edf6] rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] mb-1">Candidatures soumises</p>
                                    <p className="text-[28px] font-bold text-[#1b2331]">{dashStats?.totalApplications ?? "-"}</p>
                                </div>
                                <Briefcase className="w-10 h-10 text-[#e8edf6]" />
                            </div>
                        </div>

                        <div className="bg-white border border-[#e8edf6] rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] mb-1">Entretiens</p>
                                    <p className="text-[28px] font-bold text-[#1b2331]">{dashStats?.interviews ?? "-"}</p>
                                </div>
                                <Briefcase className="w-10 h-10 text-[#e8edf6]" />
                            </div>
                        </div>

                        <div className="bg-white border border-[#e8edf6] rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] mb-1">Offres sauvegardées</p>
                                    <p className="text-[28px] font-bold text-[#1b2331]">{dashStats?.savedJobs ?? "-"}</p>
                                </div>
                                <div className="w-10 h-10 bg-[#2f6de6] rounded-full flex items-center justify-center">
                                    <span className="text-white text-[14px] font-bold">★</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-[#e8edf6] rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] mb-1">Vues du profil</p>
                                    <p className="text-[28px] font-bold text-[#1b2331]">{dashStats?.profileViews ?? "-"}</p>
                                </div>
                                <Eye className="w-10 h-10 text-[#e8edf6]" />
                            </div>
                        </div>
                    </div>

                    {/* Progression carrière (Career Dashboard) */}
                    {career && (
                        <div className="mb-8 bg-white border border-[#e8edf6] rounded-xl p-5">
                            <h3 className="text-[16px] font-bold text-[#1b2331] mb-4">Progression carrière</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] mb-1">Taux de réponse</p>
                                    <p className="text-[22px] font-bold text-[#1b2331]">{career.applications.responseRate}%</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] mb-1">Formations en cours</p>
                                    <p className="text-[22px] font-bold text-[#1b2331]">{career.formations.inProgress}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] mb-1">Formations terminées</p>
                                    <p className="text-[22px] font-bold text-[#1b2331]">{career.formations.completed}</p>
                                </div>
                            </div>
                            {career.recommendations.length > 0 && (
                                <div className="space-y-2">
                                    {career.recommendations.map((rec, i) => (
                                        <div key={i} className="flex items-start gap-2 rounded-lg bg-[#f4f7ff] px-3 py-2">
                                            <span className="mt-0.5 text-[#2f6de6]">💡</span>
                                            <p className="text-[12px] text-[#1b2331]">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Historique Section */}
                    <div className="mb-8">
                        <h3 className="text-[16px] font-bold text-[#1b2331] mb-4">Historique des identités opérationnelles</h3>

                        {recentApplications.length === 0 ? (
                            <p className="text-[12px] text-[#9aa3b2] text-center py-4">Aucune candidature récente.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentApplications.map((app) => (
                                    <button
                                        key={app.id}
                                        onClick={() => app.jobOffer?.id && router.push(`/explorer-emplois/${app.jobOffer.id}`)}
                                        className="w-full bg-white border border-[#e8edf6] rounded-xl p-4 flex items-center justify-between hover:border-[#2f6de6] transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className="text-[20px]">📋</span>
                                            <div>
                                                <p className="text-[13px] font-semibold text-[#1b2331]">{app.jobOffer?.title ?? "Candidature"}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[11px] text-[#7f8796]">{app.jobOffer?.company?.name ?? "-"}</span>
                                                    <span className="text-[11px] text-[#9aa3b2]">•</span>
                                                    <span className="text-[11px] text-[#7f8796]">{new Date(app.appliedDate).toLocaleDateString("fr-FR")}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-[10px] px-2 py-1 border-[#d8deeb] text-[#2f6de6]">
                                                {STATUS_LABEL[app.status] ?? app.status}
                                            </Badge>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 text-center">
                            <button onClick={() => router.push("/mes-offres")} className="text-[12px] text-[#2f6de6] font-medium hover:underline">
                                Voir l'historique en entier de mes candidatures →
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8 bg-[#f4f5f7] rounded-xl p-6">
                        <h3 className="text-[16px] font-bold text-[#1b2331] mb-4 text-center">Actions rapides</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { icon: "📄", label: "Créer mon CV", href: "/creer-cv" },
                                { icon: "👤", label: "Modifier mon profil", href: "/parametres" },
                                { icon: "🔍", label: "Chercher un emploi", href: "/chercher-emploi" },
                                { icon: "💬", label: "Contacter support", href: "/centre-assistance" },
                            ].map((action) => (
                                <button
                                    key={action.href}
                                    onClick={() => router.push(action.href)}
                                    className="bg-white border border-[#e8edf6] rounded-lg p-4 text-center hover:border-[#2f6de6] hover:bg-[#f4f7ff] transition-colors"
                                >
                                    <p className="text-[20px] mb-2">{action.icon}</p>
                                    <p className="text-[12px] font-medium text-[#1b2331]">{action.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Companies Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[16px] font-bold text-[#1b2331]">Les entreprises qui recrutent</h3>
                            <button onClick={() => router.push("/entreprises")} className="text-[12px] text-[#2f6de6] font-medium hover:underline">Voir plus →</button>
                        </div>

                        {recruitingCompanies.length === 0 ? (
                            <p className="text-[12px] text-[#9aa3b2] text-center py-4">Aucune entreprise disponible.</p>
                        ) : (
                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {recruitingCompanies.map((company) => (
                                    <Link key={company.id} href={`/entreprises/${company.id}`}>
                                        <article className="rounded-2xl border border-[#e8edf6] dark:border-border bg-white dark:bg-card p-4 min-h-[140px] xs:min-h-[166px] hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <CompanyLogo name={company.name} logo={company.logo} className="w-7 h-7 sm:w-9 sm:h-9 text-[10px]" />
                                                <span className="text-[10px] border border-[#cfe0ff] dark:border-border text-[#7a8db8] dark:text-muted-foreground rounded-full px-2 py-0.5">{company.sector || "Entreprise"}</span>
                                            </div>
                                            <h3 className="text-[13px] font-semibold text-[#1a2232] dark:text-foreground truncate">{company.name}</h3>
                                            <p className="text-[11px] text-[#8a95a8] dark:text-muted-foreground mt-0.5">{capitalizeFirst(company.location || company.headquarters) || "-"}</p>
                                            {company.about && <p className="text-[10px] text-[#9aa5b8] dark:text-muted-foreground mt-2 leading-4 line-clamp-2">{capitalizeFirst(company.about)}</p>}
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
