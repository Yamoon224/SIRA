"use client"

import Link from "next/link"
import { useRef, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Building2, Search, Heart, Bookmark, Upload, Mail, ChevronLeft, ChevronRight, Loader2, LogIn, BriefcaseBusiness, Lock, Sparkles } from "lucide-react"
import { jobService } from "@/lib/api/job.service"
import { companyService } from "@/lib/api/company.service"
import { dashboardService } from "@/lib/api/dashboard.service"
import { IJobOffer, ICompany, ICandidature } from "@/lib/@types/entities"
import { formatAmount, capitalizeFirst, dedupeByName } from "@/lib/utils"
import { CompanyLogo } from "@/components/company-logo"
import { useAuth } from "@/contexts/auth-context"
import { getDeviceId } from "@/lib/device"
import type { CVAnalysis } from "@/lib/@types/openai"

type GateState = "idle" | "requires_auth" | "requires_subscription"

const HOME_CAREER_TAB_PARAMS: Record<string, Record<string, string | string[]>> = {
    "Stagiaires":      { jobType: "STAGE" },
    "Jeunes Diplômés": { experience: ["JUNIOR"] },
    "Cadres / Pros":   { experience: ["SENIOR", "EXPERT"] },
}

const HOME_CAREER_LIMIT = 3

const featureBlocks = [
    {
        title: "Analysez votre document",
        desc: "Téléchargez votre CV, lettre de motivation ou tout autre document et obtenez une analyse intelligente de l'IA qui identifie les points forts et les zones à améliorer en fonction d'un score d'efficacité de 100%.",
        image: "/images/thesis-illustration.png",
        reverse: false,
    },
    {
        title: "Simulation d'entretien",
        desc: "Préparez-vous pour votre prochain entretien d'embauche avec Goriya, en utilisant un chatbot dynamique basé sur un modèle d'intelligence artificielle ou en prenant rendez-vous avec un professionnel des ressources humaines.",
        image: "/images/lettre-recommandation.png",
        reverse: true,
    },
    {
        title: "UNE CONNEXION PLUS FACILE AVEC LES RECRUTEURS",
        desc: "Décrivez votre disponibilité et mettez en valeur votre expérience grâce à un profil complet. Les recruteurs intéressés vous contacteront directement avec des opportunités adaptées.",
        image: "/images/remote-collab.png",
        reverse: false,
    },
    {
        title: "TRANSPARENCE TOTALE SUR LES ENTREPRISES",
        desc: "Découvrez des profils détaillés d'entreprises incluant leur mission, valeurs, environnement de travail, et équipes. Postulez en toute confiance.",
        image: "/images/search-illustration.png",
        reverse: true,
    },
]

function formatRelativeDate(date: Date | string) {
    const d = new Date(date)
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return "Hier"
    if (days < 7) return `Il y a ${days} jours`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`
    const months = Math.floor(days / 30)
    return `Il y a ${months} mois`
}

export default function Page() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const isLoggedIn = !authLoading && !!user

    const cvInputRef = useRef<HTMLInputElement | null>(null)
    const [savedJobs, setSavedJobs] = useState<string[]>([])
    const [popularJobs, setPopularJobs] = useState<IJobOffer[]>([])
    const [jobsLoading, setJobsLoading] = useState(true)
    const [isAnalyzingCV, setIsAnalyzingCV] = useState(false)
    const [uploadError, setUploadError] = useState("")
    const [gateState, setGateState] = useState<GateState>("idle")
    const [freeUsage, setFreeUsage] = useState<{ used: number; remaining: number; limit: number } | null>(null)

    // Dynamic data states
    const [companies, setCompanies] = useState<ICompany[]>([])
    const [dashboardStats, setDashboardStats] = useState<{ totalApplications: number; interviews: number; profileViews: number; savedJobs: number } | null>(null)
    const [recentApplications, setRecentApplications] = useState<ICandidature[]>([])

    // Career section state
    const [homeCareerTab, setHomeCareerTab] = useState("Stagiaires")
    const [homeCareerJobs, setHomeCareerJobs] = useState<IJobOffer[]>([])
    const [homeCareerLoading, setHomeCareerLoading] = useState(false)
    const [homeCareerPage, setHomeCareerPage] = useState(1)
    const [homeCareerTotalPages, setHomeCareerTotalPages] = useState(1)

    // Load popular jobs
    useEffect(() => {
        jobService.getJobs({ limit: 6 })
            .then((res) => {
                const data = (res as any)?.data ?? res
                setPopularJobs(Array.isArray(data) ? data : (data?.data ?? []))
            })
            .catch(() => setPopularJobs([]))
            .finally(() => setJobsLoading(false))
    }, [])

    // Load companies for disconnected state
    useEffect(() => {
        if (isLoggedIn) return
        companyService.getCompanies({ limit: 10 })
            .then((res) => {
                const data = (res as any)?.data ?? res
                setCompanies(dedupeByName(Array.isArray(data) ? data : (data?.data ?? [])))
            })
            .catch(() => {})
    }, [isLoggedIn])

    // Load dashboard stats + recent activity for connected state
    useEffect(() => {
        if (!isLoggedIn) return
        dashboardService.getStats()
            .then((res) => {
                const data = (res as any)?.data ?? res
                setDashboardStats(data)
            })
            .catch(() => {})
        dashboardService.getRecentApplications(3)
            .then((res) => {
                const data = (res as any)?.data ?? res
                setRecentApplications(Array.isArray(data) ? data : [])
            })
            .catch(() => {})
    }, [isLoggedIn])

    // Load anonymous usage status
    useEffect(() => {
        if (authLoading || isLoggedIn) return
        const deviceId = getDeviceId()
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://goriya-backend-production.up.railway.app"}/anonymous-usage/status?deviceId=${deviceId}&featureKey=cv_analysis`)
            .then(r => r.json())
            .then(data => setFreeUsage(data))
            .catch(() => {})
    }, [authLoading, isLoggedIn])

    const fetchHomeCareerJobs = useCallback(async (p: number) => {
        setHomeCareerLoading(true)
        try {
            const params = HOME_CAREER_TAB_PARAMS[homeCareerTab] ?? {}
            const res = await jobService.getJobs({ ...params, page: p, limit: HOME_CAREER_LIMIT }) as any
            const data: IJobOffer[] = res?.data?.data ?? res?.data ?? []
            const meta = res?.data?.meta ?? res?.meta
            setHomeCareerJobs(Array.isArray(data) ? data : [])
            setHomeCareerPage(p)
            setHomeCareerTotalPages(meta?.totalPages ?? 1)
        } catch {
            setHomeCareerJobs([])
        } finally {
            setHomeCareerLoading(false)
        }
    }, [homeCareerTab])

    useEffect(() => {
        fetchHomeCareerJobs(1)
    }, [fetchHomeCareerJobs])

    const toggleSaveJob = (jobId: string) => {
        setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
    }

    const handlePickCV = () => {
        if (isAnalyzingCV) return
        if (gateState === "requires_auth") { router.push("/auth/signin"); return }
        if (gateState === "requires_subscription") { router.push("/auth/plan"); return }
        cvInputRef.current?.click()
    }

    const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const allowedTypes = [
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png", "image/jpeg", "image/jpg", "image/webp",
        ]

        if (!allowedTypes.includes(file.type)) {
            setUploadError("Format non supporté. Utilisez PDF, Word ou image.")
            event.target.value = ""
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            setUploadError("Le fichier est trop volumineux (max 10MB).")
            event.target.value = ""
            return
        }

        setUploadError("")
        setGateState("idle")
        setIsAnalyzingCV(true)

        try {
            const formData = new FormData()
            formData.append("file", file)
            const deviceId = getDeviceId()
            const response = await fetch("/api/analyse-cv", {
                method: "POST",
                headers: { "x-device-id": deviceId },
                body: formData,
            })

            const payload = await response.json() as {
                analysis?: CVAnalysis; error?: string;
                requiresAuth?: boolean; requiresSubscription?: boolean;
                usage?: { used: number; remaining: number; limit: number }
            }

            if (response.status === 403 && payload.requiresAuth) {
                setGateState("requires_auth")
                setUploadError(payload.error ?? "Connectez-vous pour continuer.")
                return
            }
            if (response.status === 402 && payload.requiresSubscription) {
                setGateState("requires_subscription")
                setUploadError(payload.error ?? "Un abonnement est requis.")
                return
            }
            if (!response.ok || !payload.analysis) throw new Error(payload.error || "Analyse IA indisponible")

            if (payload.usage) setFreeUsage(payload.usage)
            sessionStorage.setItem("goriya_cv_analysis_result", JSON.stringify({
                fileName: file.name, analyzedAt: new Date().toISOString(), analysis: payload.analysis,
            }))
            router.push("/resultat-analyse-cv")
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : "Une erreur est survenue pendant l'analyse.")
        } finally {
            setIsAnalyzingCV(false)
            event.target.value = ""
        }
    }

    // ─── Connected state ───────────────────────────────────────────────
    if (isLoggedIn) {
        const firstName = user?.name?.split(" ")[0] ?? "vous"
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-3 sm:px-6 py-5 sm:py-8">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Bonjour, {firstName}!</h1>
                        <p className="text-muted-foreground">Voici les dernières opportunités pour vous</p>
                    </div>

                    {/* Search Bar */}
                    <form className="mb-8" onSubmit={(e) => { e.preventDefault(); const q = (e.currentTarget.querySelector("input") as HTMLInputElement)?.value; if (q) router.push(`/chercher-emploi?q=${encodeURIComponent(q)}`) }}>
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input placeholder="Recherchez un emploi par intitulé, poste, mot clé ou entreprise..." className="pl-12 h-12 text-base" />
                        </div>
                    </form>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-2xl font-bold text-blue-600 mb-1">{dashboardStats?.totalApplications ?? <Loader2 className="w-5 h-5 animate-spin mx-auto" />}</div>
                                <p className="text-sm text-muted-foreground">Candidatures envoyées</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-2xl font-bold text-green-600 mb-1">{dashboardStats?.interviews ?? <Loader2 className="w-5 h-5 animate-spin mx-auto" />}</div>
                                <p className="text-sm text-muted-foreground">Entretiens programmés</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-2xl font-bold text-purple-600 mb-1">{dashboardStats?.savedJobs ?? <Loader2 className="w-5 h-5 animate-spin mx-auto" />}</div>
                                <p className="text-sm text-muted-foreground">Offres sauvegardées</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-2xl font-bold text-orange-600 mb-1">{dashboardStats?.profileViews ?? <Loader2 className="w-5 h-5 animate-spin mx-auto" />}</div>
                                <p className="text-sm text-muted-foreground">Vues de profil</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommended Jobs */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recommandé pour vous</h2>
                            <Link href="/chercher-emploi" className="text-blue-600 hover:text-blue-700 font-medium">Voir tout</Link>
                        </div>
                        {jobsLoading ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                                {popularJobs.slice(0, 4).map((job) => (
                                    <Card key={job.id} className="hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <CompanyLogo name={job.company?.name ?? "?"} logo={job.company?.logo} className="w-12 h-12 rounded-lg text-[14px] flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-foreground truncate">{job.company?.name ?? "—"}</h3>
                                                        <p className="text-sm text-muted-foreground truncate">{capitalizeFirst(job.location)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <Button variant="ghost" size="sm" onClick={() => toggleSaveJob(job.id)} className="p-2">
                                                        <Bookmark className={`w-4 h-4 ${savedJobs.includes(job.id) ? "fill-current text-blue-600" : "text-muted-foreground"}`} />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="p-2">
                                                        <Heart className="w-4 h-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Link href={`/explorer-emplois/${job.id}`} className="hover:underline">
                                                <h4 className="font-semibold text-lg mb-2 text-foreground line-clamp-2">{job.title}</h4>
                                            </Link>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                                <Badge variant="secondary">{job.type}</Badge>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatRelativeDate(job.publishDate)}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <span className="font-semibold text-blue-600 truncate mr-2">{formatAmount(job.salary)}</span>
                                                <Link href={`/explorer-emplois/${job.id}`}>
                                                    <Button size="sm" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 flex-shrink-0">Postuler</Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Activité récente</h2>
                        <Card>
                            <CardContent className="p-6">
                                {recentApplications.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentApplications.map((app) => (
                                            <div key={app.id} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                                                <div className={`w-2 h-2 mt-2 sm:mt-0 flex-shrink-0 rounded-full ${app.status === "APPROUVEE" ? "bg-green-500" : app.status === "REJETEE" ? "bg-red-500" : "bg-blue-500"}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground">Candidature — {app.jobOffer?.title ?? "Poste"}</p>
                                                    <p className="text-sm text-muted-foreground">{app.jobOffer?.company?.name ?? ""}</p>
                                                </div>
                                                <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">{formatRelativeDate(app.appliedDate)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                                            <div className="w-2 h-2 mt-2 sm:mt-0 flex-shrink-0 bg-blue-500 rounded-full" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-foreground">Bienvenue sur Goriya</p>
                                                <p className="text-sm text-muted-foreground">Commencez par explorer les offres d'emploi disponibles</p>
                                            </div>
                                            <Link href="/explorer-emplois" className="flex-shrink-0">
                                                <Button size="sm" variant="outline">Explorer</Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    // ─── Disconnected / Landing page ───────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f7f8fb] text-[#111827]">
            <header className="bg-white border-b border-[#edf1f6]">
                <div className="mx-auto max-w-[1180px] px-4 h-[56px] sm:h-[64px] md:h-[72px] flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img src="/images/logo.png" alt="Goriya" className="h-8 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-[13px] text-[#7a8495] font-medium">
                        <Link href="/" className="text-[#2f6de6]">Accueil</Link>
                        <Link href="/explorer-emplois" className="hover:text-[#2f6de6]">Trouver un emploi</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link href="/auth/signin" aria-label="Connexion" className="inline-flex">
                            <Button variant="outline" className="h-8 w-8 sm:h-8 sm:w-auto sm:px-4 rounded-full border-[#b9c8ec] text-[#2f6de6] bg-white p-0 sm:p-2">
                                <LogIn className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline text-[12px]">Connexion</span>
                            </Button>
                        </Link>
                        <Link href="https://goriya-entreprise.vercel.app">
                            <Button className="h-8 w-8 sm:h-8 sm:w-auto sm:px-4 rounded-full text-[12px] bg-[#2157d3] hover:bg-[#1d4cb9] p-0 sm:p-2" aria-label="Espace entreprise">
                                <BriefcaseBusiness className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Espace entreprise</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden bg-[#1e7df2] text-white py-10 sm:py-14 md:py-16">
                <div className="absolute -right-8 top-0 h-full w-[220px] sm:w-[320px] md:w-[380px] hidden md:block">
                    <div className="absolute top-8 right-16 w-36 h-36 border-[18px] border-[#7ab2ff] rounded-full opacity-60" />
                    <div className="absolute top-52 right-4 w-24 h-24 border-[14px] border-[#7ab2ff] rounded-full opacity-60" />
                    <div className="absolute top-40 right-40 w-12 h-12 bg-[#7ab2ff] rounded-full opacity-70" />
                    <div className="absolute top-20 right-28 w-14 h-14 border-[10px] border-[#7ab2ff] rounded-full opacity-40" />
                </div>
                <div className="mx-auto max-w-[1180px] px-4 text-center relative z-10">
                    <h1 className="font-extrabold leading-tight text-2xl xs:text-3xl sm:text-4xl md:text-[40px] lg:text-[56px] max-w-[920px] mx-auto">
                        Analysez votre CV. Ameliorez-le pour augmenter vos chances.
                    </h1>
                    <div className="mt-6 sm:mt-9 flex flex-col items-center gap-3">
                        {gateState === "requires_subscription" ? (
                            <div className="flex flex-col items-center gap-3 max-w-[420px] mx-auto">
                                <p className="text-sm text-[#ffd4d4]">{uploadError}</p>
                                <Button onClick={() => router.push("/auth/plan")} className="h-11 sm:h-12 rounded-full bg-white text-[#20429b] hover:bg-[#f4f7ff] px-5 sm:px-8 font-semibold w-full">
                                    <Sparkles className="w-4 h-4 mr-2" />Choisir un abonnement
                                </Button>
                            </div>
                        ) : gateState === "requires_auth" ? (
                            <div className="flex flex-col items-center gap-3 max-w-[420px] mx-auto bg-white/15 backdrop-blur-sm rounded-2xl p-5">
                                <Lock className="w-8 h-8 text-white" />
                                <p className="text-sm text-white font-semibold text-center">Vous avez utilisé vos 3 analyses gratuites</p>
                                <p className="text-xs text-[#b9d8ff] text-center">Connectez-vous pour continuer avec un abonnement.</p>
                                <div className="flex gap-2 w-full">
                                    <Button onClick={() => router.push("/auth/signin")} className="flex-1 h-10 rounded-full bg-white text-[#20429b] hover:bg-[#f4f7ff] font-semibold text-sm">
                                        <LogIn className="w-4 h-4 mr-1.5" />Se connecter
                                    </Button>
                                    <Button onClick={() => router.push("/auth/signin")} variant="outline" className="flex-1 h-10 rounded-full border-white text-white bg-transparent hover:bg-white/10 text-sm">
                                        Créer un compte
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Button onClick={handlePickCV} disabled={isAnalyzingCV} className="h-11 sm:h-12 rounded-full bg-white text-[#20429b] hover:bg-[#f4f7ff] px-5 sm:px-8 font-semibold w-full max-w-[420px] mx-auto">
                                    {isAnalyzingCV ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                    {isAnalyzingCV ? "Analyse IA en cours..." : "Telechargez votre Curriculum Vitae ici"}
                                </Button>
                                {!isLoggedIn && freeUsage && (
                                    <p className="text-xs text-[#b9d8ff]">
                                        {freeUsage.remaining > 0
                                            ? `${freeUsage.remaining} analyse${freeUsage.remaining > 1 ? "s" : ""} gratuite${freeUsage.remaining > 1 ? "s" : ""} restante${freeUsage.remaining > 1 ? "s" : ""} (${freeUsage.used}/${freeUsage.limit})`
                                            : "Limite gratuite atteinte — connectez-vous pour continuer"}
                                    </p>
                                )}
                                {uploadError && <p className="text-[12px] text-[#ffd4d4]">{uploadError}</p>}
                            </>
                        )}
                        <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpeg,.jpg,.webp" onChange={handleCVUpload} className="hidden" />
                    </div>
                    <p className="mt-4 sm:mt-6 text-xs sm:text-[13px] text-[#b9d8ff]">Importer votre CV, lettre de motivation ou tout autre document et obtenir un score d'analyse.</p>
                </div>
            </section>

            {/* Companies */}
            <section className="py-8 sm:py-12 md:py-16 bg-white">
                <div className="mx-auto max-w-[1180px] px-3 sm:px-4">
                    <h2 className="text-center text-2xl xs:text-3xl sm:text-4xl md:text-[38px] lg:text-[46px] leading-none font-extrabold text-[#111827]">Explorer les entreprises.</h2>
                    {companies.length > 0 ? (
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8 sm:mt-10">
                            {companies.map((company) => (
                                <Link key={company.id} href={`/entreprises/${company.id}`}>
                                    <article className="rounded-2xl border border-[#e8edf6] bg-white p-4 min-h-[140px] xs:min-h-[166px] hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                                            <CompanyLogo name={company.name} logo={company.logo} className="w-7 h-7 sm:w-9 sm:h-9 text-[10px]" />
                                            <span className="text-[10px] border border-[#cfe0ff] text-[#7a8db8] rounded-full px-2 py-0.5">{company.sector || "Entreprise"}</span>
                                        </div>
                                        <h3 className="text-[13px] font-semibold text-[#1a2232] truncate">{company.name}</h3>
                                        <p className="text-[11px] text-[#8a95a8] mt-0.5">{capitalizeFirst(company.location || company.headquarters) || "—"}</p>
                                        {company.about && <p className="text-[10px] text-[#9aa5b8] mt-2 leading-4 line-clamp-2">{capitalizeFirst(company.about)}</p>}
                                    </article>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8 sm:mt-10">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="rounded-2xl border border-[#e8edf6] bg-white p-4 min-h-[140px] animate-pulse">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-9 h-9 rounded-full bg-[#f3f5fa]" />
                                        <div className="w-14 h-4 rounded-full bg-[#f3f5fa]" />
                                    </div>
                                    <div className="w-3/4 h-3 rounded bg-[#f3f5fa] mb-2" />
                                    <div className="w-1/2 h-2 rounded bg-[#f3f5fa]" />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="text-center mt-6 sm:mt-8">
                        <Link href="/explorer-entreprises">
                            <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-10 sm:h-11 px-6 sm:px-8">+ Decouvrir en plus</Button>
                        </Link>
                    </div>
                    <div className="mt-10 sm:mt-14 grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 items-center opacity-80">
                        <img src="/partners/oraimo.png" alt="Oraimo" className="h-12 xs:h-14 md:h-16 w-auto mx-auto" />
                        <img src="/partners/gtco.png" alt="GTCO" className="h-12 xs:h-14 md:h-16 w-auto mx-auto" />
                        <img src="/partners/te.png" alt="TE" className="h-12 xs:h-14 md:h-16 w-auto mx-auto" />
                        <img src="/partners/uba.png" alt="UBA" className="h-12 xs:h-14 md:h-16 w-auto mx-auto" />
                        <img src="/partners/gsk.png" alt="GSK" className="h-12 xs:h-14 md:h-16 w-auto mx-auto" />
                    </div>
                </div>
            </section>

            {/* Find a job */}
            <section className="bg-[#f2f4f8] py-10 sm:py-16">
                <div className="mx-auto max-w-[960px] px-3 sm:px-4 text-center">
                    <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-[38px] lg:text-[58px] leading-none font-extrabold text-[#2a62d7] uppercase">TROUVEZ UN EMPLOI</h2>
                    <p className="text-xs sm:text-[14px] text-[#7d8798] mt-2 sm:mt-4">Des milliers d'opportunités d'emploi vous attendent. Etes-vous prêt(e) a décrocher le poste parfait ?</p>
                    <div className="mt-6 sm:mt-8 flex justify-center">
                        <form className="flex w-full max-w-[720px] relative" onSubmit={(e) => { e.preventDefault(); const q = (e.currentTarget.querySelector("input") as HTMLInputElement)?.value; router.push(`/explorer-emplois${q ? `?q=${encodeURIComponent(q)}` : ""}`) }}>
                            <Input className="h-10 sm:h-12 rounded-full border-[#dbe4f4] bg-white dark:bg-white text-[#111827] dark:text-[#111827] placeholder:text-[#9aa3b2] dark:placeholder:text-[#9aa3b2] pr-32 text-sm w-full" placeholder="Je recherche un emploi par industrie, poste, mot-cle ou entreprise..." />
                            <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 sm:h-10 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] px-4 sm:px-6 text-xs sm:text-sm font-semibold shadow-md">
                                Trouver un emploi
                            </Button>
                        </form>
                    </div>
                    <Link href="/explorer-emplois">
                        <Button variant="outline" className="mt-6 sm:mt-8 h-10 sm:h-11 px-6 sm:px-8 rounded-full border-[#97b8f5] text-[#2f6de6] bg-transparent w-full sm:w-auto">
                            Recevoir plus d'offres <Mail className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* How it works */}
            <section className="bg-white py-10 sm:py-16">
                <div className="mx-auto max-w-[1180px] px-3 sm:px-4">
                    <h2 className="text-center text-xl xs:text-2xl sm:text-3xl md:text-[38px] lg:text-[44px] leading-none font-extrabold">Comment fonctionne Goriya?</h2>
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-7 mt-8 sm:mt-12 text-center">
                        {[
                            { n: 1, title: "Creer un compte", desc: "La porte d'entree est votre profil. Remplissez-le et laissez l'opportunite vous trouver." },
                            { n: 2, title: "Telecharger un CV", desc: "Goriya met en valeur les competences qui feront ressortir votre candidature." },
                            { n: 3, title: "Faire valider votre CV par l'IA", desc: "Prochaine etape: l'entretien. Une simulation claire et rapide pour se preparer." },
                            { n: 4, title: "Postuler pour un emploi", desc: "Cliquez et envoyez votre candidature en quelques secondes." },
                        ].map(({ n, title, desc }) => (
                            <div key={n}>
                                <div className="mx-auto w-8 h-8 rounded-full border border-[#bfd0f5] text-[#2f6de6] text-sm flex items-center justify-center">{n}</div>
                                <h3 className="mt-4 font-semibold text-[#1c2433]">{title}</h3>
                                <p className="text-sm text-[#8a95a8] mt-2">{desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 sm:mt-12 space-y-10 sm:space-y-14">
                        {featureBlocks.map((item) => (
                            <div key={item.title} className={`grid grid-cols-1 md:grid-cols-2 items-center gap-6 sm:gap-8 ${item.reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
                                <div className="px-1 sm:px-2 md:px-6 text-center md:text-left">
                                    <h3 className="text-lg xs:text-xl sm:text-2xl md:text-[32px] lg:text-[40px] leading-[1.05] font-extrabold text-[#2f6de6]">{item.title}</h3>
                                    <p className="mt-3 sm:mt-4 text-[#2d3545] leading-7 text-sm sm:text-base">{item.desc}</p>
                                </div>
                                <div className="flex justify-center mt-4 md:mt-0">
                                    <img src={item.image} alt={item.title} className="max-h-[160px] xs:max-h-[200px] sm:max-h-[240px] w-auto object-contain" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA banner */}
            <section className="bg-gradient-to-r from-[#2058d6] to-[#1f4fc5] text-white py-10 sm:py-16 relative overflow-hidden">
                <div className="absolute left-0 bottom-0 w-28 h-28 sm:w-52 sm:h-52 rounded-full border-[10px] sm:border-[20px] border-[#7cb0ff] opacity-40 -translate-x-5 sm:-translate-x-10 translate-y-5 sm:translate-y-10" />
                <div className="mx-auto max-w-[1180px] px-3 sm:px-4 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center relative z-10">
                    <div>
                        <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-[38px] lg:text-[52px] leading-none font-extrabold">Debloquer tout le potentiel de notre application</h3>
                        <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
                            <Link href="/explorer-emplois">
                                <Button variant="outline" className="rounded-full border-white text-white bg-transparent hover:bg-white hover:text-[#1f4fc5] w-full sm:w-auto">Trouver un emploi</Button>
                            </Link>
                            <Link href="/explorer-emplois">
                                <Button variant="outline" className="rounded-full border-white text-white bg-transparent hover:bg-white hover:text-[#1f4fc5] w-full sm:w-auto">Obtenez plus d'offres</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="flex justify-center md:justify-end mt-6 md:mt-0">
                        <img src="/images/9933453_4323022.png" alt="Application" className="h-[130px] xs:h-[170px] sm:h-[200px] md:h-[240px] w-auto object-contain" />
                    </div>
                </div>
            </section>

            {/* Career cards */}
            <section className="py-8 sm:py-14 bg-white">
                <div className="mx-auto max-w-[1180px] px-3 sm:px-4">
                    <div className="mb-4 sm:mb-6">
                        <h3 className="text-lg xs:text-xl sm:text-2xl font-bold">Prends ta carrière en main</h3>
                    </div>
                    <div className="inline-flex rounded-full border border-[#e2e8f5] overflow-hidden mb-5 bg-white">
                        {Object.keys(HOME_CAREER_TAB_PARAMS).map((tab) => (
                            <button key={tab} type="button" onClick={() => setHomeCareerTab(tab)}
                                className={`px-4 h-8 text-[11px] font-semibold transition-colors ${homeCareerTab === tab ? "text-[#2f6de6] bg-[#edf4ff]" : "text-[#7f8796] hover:text-[#2f6de6]"}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    {homeCareerLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-[#2f6de6]" /></div>
                    ) : homeCareerJobs.length === 0 ? (
                        <p className="text-center text-sm text-[#9aa3b2] py-8">Aucune offre disponible pour cette catégorie.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                            {homeCareerJobs.map((job) => (
                                <Link key={job.id} href={`/explorer-emplois/${job.id}`}>
                                    <article className="rounded-xl border border-[#e9eef8] p-3 hover:shadow-md transition-shadow h-full">
                                        <div className="h-32 sm:h-40 w-full rounded-md overflow-hidden bg-gradient-to-br from-[#2f6de6] to-[#1539be] flex items-center justify-center">
                                            {job.company?.coverImage
                                                ? <img src={job.company.coverImage} alt={job.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                                : job.company?.logo
                                                    ? <img src={job.company.logo} alt={job.company.name} className="w-16 h-16 object-contain brightness-0 invert" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                                    : <Building2 className="w-10 h-10 text-white opacity-60" />
                                            }
                                        </div>
                                        <h4 className="mt-3 font-semibold text-[#1b2331] line-clamp-2">{job.title}</h4>
                                        {job.company?.name && <p className="text-xs text-[#2f6de6] mt-1">{job.company.name}</p>}
                                        <p className="text-sm text-[#8a95a8] mt-2 line-clamp-2">{job.description}</p>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
                        <button type="button"
                            disabled={homeCareerPage <= 1 || homeCareerLoading}
                            onClick={() => fetchHomeCareerJobs(homeCareerPage - 1)}
                            className="w-9 h-9 rounded-full border border-[#cfe0ff] bg-white flex items-center justify-center text-[#2f6de6] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#edf4ff]">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <Link href={homeCareerTab === "Stagiaires" ? "/explorer-emplois?jobType=STAGE" : "/explorer-emplois"}>
                            <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-10 sm:h-11 px-6 sm:px-8">+ Découvrir plus</Button>
                        </Link>
                        <button type="button"
                            disabled={homeCareerPage >= homeCareerTotalPages || homeCareerLoading}
                            onClick={() => fetchHomeCareerJobs(homeCareerPage + 1)}
                            className="w-9 h-9 rounded-full border border-[#cfe0ff] bg-white flex items-center justify-center text-[#2f6de6] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#edf4ff]">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            <footer className="bg-[#06080d] text-white pt-10 sm:pt-14 pb-8">
                <div className="mx-auto max-w-[1180px] px-3 sm:px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                        <div>
                            <img src="/images/logo.png" alt="Goriya" className="h-10 sm:h-12 w-auto brightness-0 invert" />
                            <p className="mt-4 text-sm text-[#9098a7]">Goriya est une plateforme web intelligente qui permet aux utilisateurs d'uploader leur CV, lettre de motivation ou tout autre document professionnel afin d'obtenir une analyse intelligente par IA.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Concept</h4>
                            <ul className="mt-4 space-y-2 text-[#9098a7] text-sm">
                                <li><Link href="/explorer-emplois">Trouve un emploi</Link></li>
                                <li><Link href="/offres">Tarification</Link></li>
                                <li><Link href="/confidentialite">Politique de confidentialité</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Recevoir les notifications d'emploi</h4>
                            <p className="text-sm text-[#9098a7] mt-3">Les dernières nouvelles sur l'emploi, les articles, envoyés dans votre boîte de réception chaque semaine.</p>
                            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
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
