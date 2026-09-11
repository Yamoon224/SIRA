"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarClock, Eye, Briefcase, Video } from "lucide-react"
import { dashboardService } from "@/lib/api/dashboard.service"
import { companyService } from "@/lib/api/company.service"
import { careerDashboardService, type ICareerDashboard } from "@/lib/api/career-dashboard.service"
import { callSessionService, type ICallSession } from "@/lib/api/call-session.service"
import { CompanyLogo } from "@/components/company-logo"
import { capitalizeFirst } from "@/lib/utils"
import type { ICandidature, ICompany } from "@/lib/@types/entities"
import { PageHeader } from "@/components/layout/page-header"
import { useI18n, type TranslationKey } from "@/contexts/i18n-context"
import { jobHref } from "@/lib/public-links"

const STATUS_LABEL_KEY: Record<string, TranslationKey> = {
    EN_ATTENTE: "dashboard.statusPending",
    EN_COURS: "dashboard.statusInterview",
    APPROUVEE: "dashboard.statusAccepted",
    REJETEE: "dashboard.statusRejected",
    ACCEPTEE: "dashboard.statusAccepted",
    REFUSEE: "dashboard.statusRejected",
}

/** Nombre de rendez-vous affichés dans l'agenda Meet - au-delà, on renvoie
 *  vers la page Appels pour ne pas déséquilibrer la hauteur de la ligne. */
const AGENDA_LIMIT = 4

export default function Page() {
    const { user } = useAuth()
    const router = useRouter()
    const { locale, t } = useI18n()
    const [dashStats, setDashStats] = useState<{ totalApplications: number; interviews: number; profileViews: number; savedJobs: number } | null>(null)
    const [recentApplications, setRecentApplications] = useState<ICandidature[]>([])
    const [recruitingCompanies, setRecruitingCompanies] = useState<ICompany[]>([])
    const [career, setCareer] = useState<ICareerDashboard | null>(null)
    const [callSessions, setCallSessions] = useState<ICallSession[]>([])

    const dateLocale = locale === "en" ? "en-GB" : "fr-FR"

    useEffect(() => {
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

    // Chargement séparé : l'agenda Meet ne doit pas empêcher le reste du
    // tableau de bord de s'afficher si le service d'appels est indisponible.
    useEffect(() => {
        callSessionService.list()
            .then((res) => {
                const data = (res as any)?.data ?? res ?? []
                setCallSessions(Array.isArray(data) ? data : [])
            })
            .catch((err) => console.error("[dashboard] call sessions load error:", err))
    }, [])

    // Rendez-vous à venir : les appels clôturés sortent, les plus proches d'abord.
    const upcomingCalls = useMemo(() => {
        return callSessions
            .filter((session) => session.status !== "ENDED")
            .sort((a, b) => {
                if (!a.scheduledAt) return 1
                if (!b.scheduledAt) return -1
                return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
            })
            .slice(0, AGENDA_LIMIT)
    }, [callSessions])

    const displayName = user?.name ?? t("dashboard.defaultUser")
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)

    const quickActions = [
        { icon: "📄", label: t("dashboard.actionCreateCv"), href: "/creer-cv" },
        { icon: "👤", label: t("dashboard.actionEditProfile"), href: "/parametres" },
        { icon: "🔍", label: t("dashboard.actionFindJob"), href: "/chercher-emploi" },
        { icon: "💬", label: t("dashboard.actionContactSupport"), href: "/centre-assistance" },
    ]

    return (
        <ProtectedRoute>
            <div className="bg-white dark:bg-background">
                <div className="mx-auto max-w-7xl">
                    <PageHeader title={t("dashboard.title")} />

                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h2 className="text-[28px] font-bold text-[#1b2331] dark:text-foreground mb-1">{t("dashboard.greeting", { name: displayName })}</h2>
                            <p className="text-[13px] text-[#7f8796] dark:text-muted-foreground">{t("dashboard.subtitle")}</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground mb-1">{t("dashboard.nextInterview")}</p>
                            <p className="text-[14px] font-semibold text-[#1b2331] dark:text-foreground mb-3">{t("dashboard.today")}</p>
                            <Avatar className="w-10 h-10 ml-auto">
                                <AvatarImage src={user?.avatar ?? undefined} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground mb-1">{t("dashboard.applicationsSubmitted")}</p>
                                    <p className="text-[28px] font-bold text-[#1b2331] dark:text-foreground">{dashStats?.totalApplications ?? "-"}</p>
                                </div>
                                <Briefcase className="w-10 h-10 text-[#e8edf6]" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground mb-1">{t("dashboard.interviews")}</p>
                                    <p className="text-[28px] font-bold text-[#1b2331] dark:text-foreground">{dashStats?.interviews ?? "-"}</p>
                                </div>
                                <Briefcase className="w-10 h-10 text-[#e8edf6]" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground mb-1">{t("dashboard.savedJobs")}</p>
                                    <p className="text-[28px] font-bold text-[#1b2331] dark:text-foreground">{dashStats?.savedJobs ?? "-"}</p>
                                </div>
                                <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center">
                                    <span className="text-white text-[14px] font-bold">★</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground mb-1">{t("dashboard.profileViews")}</p>
                                    <p className="text-[28px] font-bold text-[#1b2331] dark:text-foreground">{dashStats?.profileViews ?? "-"}</p>
                                </div>
                                <Eye className="w-10 h-10 text-[#e8edf6]" />
                            </div>
                        </div>
                    </div>

                    {/* Progression carrière (7/12) + Agenda Meet (5/12) sur la même
                        ligne en desktop, empilés en dessous de `lg`. */}
                    <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
                        {career && (
                            <div className="bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl p-5 lg:col-span-7">
                                <h3 className="text-[16px] font-bold text-[#1b2331] dark:text-foreground mb-4">{t("dashboard.careerProgress")}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground mb-1">{t("dashboard.responseRate")}</p>
                                        <p className="text-[22px] font-bold text-[#1b2331] dark:text-foreground">{career.applications.responseRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground mb-1">{t("dashboard.trainingsInProgress")}</p>
                                        <p className="text-[22px] font-bold text-[#1b2331] dark:text-foreground">{career.formations.inProgress}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground mb-1">{t("dashboard.trainingsCompleted")}</p>
                                        <p className="text-[22px] font-bold text-[#1b2331] dark:text-foreground">{career.formations.completed}</p>
                                    </div>
                                </div>
                                {career.recommendations.length > 0 && (
                                    <div className="space-y-2">
                                        {career.recommendations.map((rec, i) => (
                                            <div key={i} className="flex items-start gap-2 rounded-lg bg-[#f4f7ff] dark:bg-muted px-3 py-2">
                                                <span className="mt-0.5 text-[#2f6de6] dark:text-primary">💡</span>
                                                <p className="text-[12px] text-[#1b2331] dark:text-foreground">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Agenda de planification Meet */}
                        <div className={`flex flex-col bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl p-5 ${career ? "lg:col-span-5" : "lg:col-span-12"}`}>
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="flex items-center gap-2 text-[16px] font-bold text-[#1b2331] dark:text-foreground">
                                        <CalendarClock className="h-4 w-4 text-[#2f6de6] dark:text-primary" />
                                        {t("dashboard.meetAgenda")}
                                    </h3>
                                    <p className="mt-1 text-[11px] text-[#9aa3b2] dark:text-muted-foreground">{t("dashboard.meetAgendaHint")}</p>
                                </div>
                                <Button size="sm" className="shrink-0 rounded-full text-[11px]" onClick={() => router.push("/appels")}>
                                    <Video className="mr-1.5 h-3.5 w-3.5" />
                                    {t("dashboard.meetAgendaSchedule")}
                                </Button>
                            </div>

                            {upcomingCalls.length === 0 ? (
                                <p className="flex-1 py-6 text-center text-[12px] text-[#9aa3b2] dark:text-muted-foreground">{t("dashboard.meetAgendaEmpty")}</p>
                            ) : (
                                <div className="flex-1 space-y-2">
                                    {upcomingCalls.map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex items-center justify-between gap-3 rounded-lg bg-[#f4f7ff] dark:bg-muted px-3 py-2"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-[12px] font-semibold text-[#1b2331] dark:text-foreground">{session.title}</p>
                                                <p className="text-[11px] text-[#7f8796] dark:text-muted-foreground">
                                                    {session.scheduledAt
                                                        ? new Date(session.scheduledAt).toLocaleString(dateLocale, {
                                                            day: "2-digit",
                                                            month: "short",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })
                                                        : t("dashboard.meetNoDate")}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${session.status === "ACTIVE"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-white text-[#2f6de6] dark:bg-background dark:text-primary"
                                                    }`}
                                            >
                                                {session.status === "ACTIVE" ? t("dashboard.meetStatusActive") : t("dashboard.meetStatusScheduled")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 text-center">
                                <button onClick={() => router.push("/appels")} className="text-[12px] font-medium text-[#2f6de6] dark:text-primary hover:underline">
                                    {t("dashboard.meetAgendaSeeAll")} →
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Historique Section */}
                    <div className="mb-8">
                        <h3 className="text-[16px] font-bold text-[#1b2331] dark:text-foreground mb-4">{t("dashboard.history")}</h3>

                        {recentApplications.length === 0 ? (
                            <p className="text-[12px] text-[#9aa3b2] dark:text-muted-foreground text-center py-4">{t("dashboard.noRecentApplications")}</p>
                        ) : (
                            <div className="space-y-3">
                                {recentApplications.map((app) => (
                                    <button
                                        key={app.id}
                                        onClick={() => app.jobOffer && router.push(jobHref(app.jobOffer))}
                                        className="w-full bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl p-4 flex items-center justify-between hover:border-[#2f6de6] transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className="text-[20px]">📋</span>
                                            <div>
                                                <p className="text-[13px] font-semibold text-[#1b2331] dark:text-foreground">{app.jobOffer?.title ?? t("dashboard.application")}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[11px] text-[#7f8796] dark:text-muted-foreground">{app.jobOffer?.company?.name ?? "-"}</span>
                                                    <span className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground">•</span>
                                                    <span className="text-[11px] text-[#7f8796] dark:text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString(dateLocale)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-[10px] px-2 py-1 border-[#d8deeb] dark:border-border text-[#2f6de6] dark:text-primary">
                                                {STATUS_LABEL_KEY[app.status] ? t(STATUS_LABEL_KEY[app.status]) : app.status}
                                            </Badge>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 text-center">
                            <button onClick={() => router.push("/mes-offres")} className="text-[12px] text-[#2f6de6] dark:text-primary font-medium hover:underline">
                                {t("dashboard.seeAllApplications")} →
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8 bg-[#f4f5f7] dark:bg-muted rounded-2xl p-6">
                        <h3 className="text-[16px] font-bold text-[#1b2331] dark:text-foreground mb-4 text-center">{t("dashboard.quickActions")}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {quickActions.map((action) => (
                                <button
                                    key={action.href}
                                    onClick={() => router.push(action.href)}
                                    className="bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl p-4 text-center hover:border-[#2f6de6] hover:bg-[#f4f7ff] dark:hover:bg-muted transition-colors"
                                >
                                    <p className="text-[20px] mb-2">{action.icon}</p>
                                    <p className="text-[12px] font-medium text-[#1b2331] dark:text-foreground">{action.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Companies Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[16px] font-bold text-[#1b2331] dark:text-foreground">{t("dashboard.recruitingCompanies")}</h3>
                            <button onClick={() => router.push("/entreprises")} className="text-[12px] text-[#2f6de6] dark:text-primary font-medium hover:underline">{t("common.seeMore")} →</button>
                        </div>

                        {recruitingCompanies.length === 0 ? (
                            <p className="text-[12px] text-[#9aa3b2] dark:text-muted-foreground text-center py-4">{t("dashboard.noCompanies")}</p>
                        ) : (
                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {recruitingCompanies.map((company) => (
                                    <Link key={company.id} href={`/entreprises/${company.id}`}>
                                        <article className="rounded-2xl border border-[#e8edf6] dark:border-border bg-white dark:bg-card p-4 min-h-[140px] xs:min-h-[166px] hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <CompanyLogo name={company.name} logo={company.logo} className="w-7 h-7 sm:w-9 sm:h-9 text-[10px]" />
                                                <span className="text-[10px] border border-[#cfe0ff] dark:border-border text-[#7a8db8] dark:text-muted-foreground rounded-full px-2 py-0.5">{company.sector || t("dashboard.company")}</span>
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
