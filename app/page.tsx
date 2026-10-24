"use client"

import Link from "next/link"
import { useRef, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Building2, Upload, ChevronLeft, ChevronRight, Loader2, LogIn, Lock, Sparkles, Play } from "lucide-react"
import { jobService } from "@/lib/api/job.service"
import { companyService } from "@/lib/api/company.service"
import { IJobOffer, ICompany } from "@/lib/@types/entities"
import { capitalizeFirst, dedupeByName, formatFileUrl } from "@/lib/utils"
import { CompanyLogo } from "@/components/company-logo"
import { articleService, type IArticle } from "@/lib/api/article.service"
import { useAuth } from "@/contexts/auth-context"
import { getDeviceId } from "@/lib/device"
import { BACKEND_URL } from "@/lib/backend-url"
import type { CVAnalysis } from "@/lib/@types/openai"
import { analysisErrorMessage, CV_ACCEPT, cvFileError } from "@/lib/cv-file"
import { extractCvPhoto, storeExtractedPhoto } from "@/lib/cv-photo"
import { companyHref, jobHref } from "@/lib/public-links"
import { GoriyaLogoLoader } from "@/components/goriya-loader"

type GateState = "idle" | "requires_auth" | "requires_subscription"

const HOME_CAREER_TAB_PARAMS: Record<string, Record<string, string | string[]>> = {
    "Stagiaires":      { jobType: "STAGE" },
    "Jeunes Diplômés": { experience: ["JUNIOR"] },
    "Cadres / Pros":   { experience: ["SENIOR", "EXPERT"] },
}

const HOME_CAREER_LIMIT = 3

const featureBlocks = [
    {
        title: "Analyse ton document",
        desc: "Dépose ton CV, ta lettre de motivation ou tout autre document professionnel. Notre IA l'analyse instantanément pour identifier tes points forts, tes zones d'amélioration et te donner un **score d'efficacité** précis sur 100%.",
        image: "/images/thesis-illustration.png",
        reverse: false,
    },
    {
        title: "Simulation d'entretien",
        desc: "Prépare ton prochain entretien d'embauche en toute sérénité. Entraîne-toi face à notre **chatbot IA** dynamique ou prends rendez-vous directement avec un **professionnel des Ressources Humaines**.",
        image: "/images/lettre-recommandation.png",
        reverse: true,
    },
    {
        title: "CONNECTE-TOI DIRECTEMENT AUX RECRUTEURS",
        desc: "Renseigne tes disponibilités, mets en valeur tes compétences uniques et crée un profil complet. GORIYA te met en avant pour que les **recruteurs intéressés** te contactent directement avec des **offres sur-mesure**.",
        image: "/images/remote-collab.png",
        reverse: false,
    },
    {
        title: "TRANSPARENCE TOTALE SUR TES FUTURS EMPLOYEURS",
        desc: "Découvre la culture, les missions, les valeurs et l'ambiance de travail de ton futur employeur avant même d'envoyer ta candidature. Postule en toute confiance, avec une **transparence totale**.",
        image: "/images/search-illustration.png",
        reverse: true,
    },
]

function BoldText({ text }: { text: string }) {
    const parts = text.split(/\*\*(.+?)\*\*/g)
    return (
        <>
            {parts.map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : part
            )}
        </>
    )
}

/**
 * Révèle son contenu (fondu + léger glissement + zoom) dès qu'il entre dans
 * le viewport, une seule fois. `delay` permet d'échelonner plusieurs
 * `Reveal` voisins pour un effet d'apparition en cascade.
 */
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return (
        <div
            ref={ref}
            style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
            className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
                visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-7 scale-[0.96]"
            } ${className}`}
        >
            {children}
        </div>
    )
}

function PromoVideoCard() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    const handlePlay = () => {
        // play() doit rester synchrone avec le clic : le reporter (ex. via
        // requestAnimationFrame) casse le geste utilisateur exigé par les
        // politiques d'autoplay et le navigateur ignore silencieusement l'appel.
        videoRef.current?.play().catch(() => {})
        setIsPlaying(true)
    }

    return (
        <Reveal className="mx-auto max-w-[560px] px-3 sm:px-4 relative z-10">
            <div className="rounded-2xl sm:rounded-3xl bg-brand-gradient p-2 sm:p-3 shadow-xl shadow-[#20429b]/20 dark:shadow-black/30">
                <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#0b1430]">
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        controls={isPlaying}
                        playsInline
                        preload="none"
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                    >
                        <source src="/videos/goriya-presentation.mp4" type="video/mp4" />
                    </video>
                    {!isPlaying && (
                        <button
                            type="button"
                            onClick={handlePlay}
                            aria-label="Lancer la vidéo de présentation Goriya"
                            className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4 bg-black/25 group cursor-pointer"
                        >
                            <span className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
                                <Play className="w-7 h-7 sm:w-8 sm:h-8 text-[#20429b] fill-[#20429b]" />
                            </span>
                            <span className="text-white font-semibold text-sm sm:text-base tracking-wide">Découvre Goriya en vidéo</span>
                        </button>
                    )}
                </div>
            </div>
        </Reveal>
    )
}

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
    const [isAnalyzingCV, setIsAnalyzingCV] = useState(false)
    const [uploadError, setUploadError] = useState("")
    const [gateState, setGateState] = useState<GateState>("idle")
    const [freeUsage, setFreeUsage] = useState<{ used: number; remaining: number; limit: number } | null>(null)

    // Dynamic data states
    const [companies, setCompanies] = useState<ICompany[]>([])
    const [articles, setArticles] = useState<IArticle[]>([])

    // Career section state
    const [homeCareerTab, setHomeCareerTab] = useState("Stagiaires")
    const [homeCareerJobs, setHomeCareerJobs] = useState<IJobOffer[]>([])
    const [homeCareerLoading, setHomeCareerLoading] = useState(false)
    const [homeCareerPage, setHomeCareerPage] = useState(1)
    const [homeCareerTotalPages, setHomeCareerTotalPages] = useState(1)

    // Load companies
    useEffect(() => {
        companyService.getCompanies({ limit: 10 })
            .then((res) => {
                const data = (res as any)?.data ?? res
                setCompanies(dedupeByName(Array.isArray(data) ? data : (data?.data ?? [])))
            })
            .catch(() => {})
    }, [])

    // Load latest articles (landing)
    useEffect(() => {
        articleService.getArticles({ limit: 3 })
            .then((res: any) => setArticles(res?.data ?? []))
            .catch(() => setArticles([]))
    }, [])

    // Load anonymous usage status
    useEffect(() => {
        if (authLoading || isLoggedIn) return
        const deviceId = getDeviceId()
        fetch(`${BACKEND_URL}/anonymous-usage/status?deviceId=${deviceId}&featureKey=cv_analysis`)
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

    const handlePickCV = () => {
        if (isAnalyzingCV) return
        if (gateState === "requires_auth") { router.push("/auth/signin"); return }
        if (gateState === "requires_subscription") { router.push("/auth/plan"); return }
        cvInputRef.current?.click()
    }

    const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const fileError = cvFileError(file)
        if (fileError) {
            setUploadError(fileError)
            event.target.value = ""
            return
        }

        setUploadError("")
        setGateState("idle")
        setIsAnalyzingCV(true)

        // La photo du CV est cherchée dans le navigateur pendant que l'IA analyse
        // le texte : elle préremplit la photo de profil sur la page de résultat.
        const photoPromise = extractCvPhoto(file)

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
                setUploadError(payload.error ?? "Connecte-toi pour continuer.")
                return
            }
            if (response.status === 402 && payload.requiresSubscription) {
                setGateState("requires_subscription")
                setUploadError(payload.error ?? "Un abonnement est requis.")
                return
            }
            if (!response.ok || !payload.analysis) throw new Error(payload.error || "Analyse IA indisponible")

            if (payload.usage) setFreeUsage(payload.usage)
            await storeExtractedPhoto(await photoPromise)
            sessionStorage.setItem("goriya_cv_analysis_result", JSON.stringify({
                fileName: file.name, analyzedAt: new Date().toISOString(), analysis: payload.analysis,
            }))
            router.push("/resultat-analyse-cv")
        } catch (error) {
            setUploadError(analysisErrorMessage(error))
        } finally {
            setIsAnalyzingCV(false)
            event.target.value = ""
        }
    }

    // Accueil : la même page pour tout le monde, connecté ou non.
    return (
        <div className="min-h-screen bg-background text-foreground">
            {isAnalyzingCV && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background/95 backdrop-blur-sm">
                    <GoriyaLogoLoader width={110} />
                    <p className="text-[13px] text-muted-foreground">Analyse du CV…</p>
                </div>
            )}

            <Header />

            {/* Hero */}
            <section className="relative overflow-hidden bg-brand-gradient text-white py-10 sm:py-14 md:py-16">
                <div className="absolute -right-8 top-0 h-full w-[220px] sm:w-[320px] md:w-[380px] hidden md:block">
                    <div className="absolute top-8 right-16 w-36 h-36 border-[18px] border-[#7ab2ff] dark:border-primary/50 rounded-full opacity-60" />
                    <div className="absolute top-52 right-4 w-24 h-24 border-[14px] border-[#7ab2ff] dark:border-primary/50 rounded-full opacity-60" />
                    <div className="absolute top-40 right-40 w-12 h-12 bg-[#7ab2ff] rounded-full opacity-70" />
                    <div className="absolute top-20 right-28 w-14 h-14 border-[10px] border-[#7ab2ff] dark:border-primary/50 rounded-full opacity-40" />
                </div>
                <div className="mx-auto max-w-[1180px] px-4 text-center relative z-10">
                    <h1 className="font-extrabold leading-tight text-2xl xs:text-3xl sm:text-4xl md:text-[40px] lg:text-[52px] max-w-[920px] mx-auto">
                        Analysez votre CV. Améliorez-le pour augmenter vos chances
                    </h1>
                    <div className="mt-6 sm:mt-9 flex flex-col items-center gap-3">
                        {gateState === "requires_subscription" ? (
                            <div className="flex flex-col items-center gap-3 max-w-[420px] mx-auto">
                                <p className="text-sm text-[#ffd4d4]">{uploadError}</p>
                                <Button onClick={() => router.push("/auth/plan")} className="h-11 sm:h-12 rounded-full bg-white dark:bg-card text-[#20429b] dark:text-primary hover:bg-[#f4f7ff] dark:hover:bg-muted px-5 sm:px-8 font-semibold w-full">
                                    <Sparkles className="w-4 h-4 mr-2" />Choisir un abonnement
                                </Button>
                            </div>
                        ) : gateState === "requires_auth" ? (
                            <div className="flex flex-col items-center gap-3 max-w-[420px] mx-auto bg-white/15 backdrop-blur-sm rounded-2xl p-5">
                                <Lock className="w-8 h-8 text-white" />
                                <p className="text-sm text-white font-semibold text-center">Tu as utilisé tes 3 analyses gratuites</p>
                                <p className="text-xs text-[#b9d8ff] text-center">Connecte-toi pour continuer avec un abonnement.</p>
                                <div className="flex gap-2 w-full">
                                    <Button onClick={() => router.push("/auth/signin")} className="flex-1 h-10 rounded-full bg-white dark:bg-card text-[#20429b] dark:text-primary hover:bg-[#f4f7ff] dark:hover:bg-muted font-semibold text-sm">
                                        <LogIn className="w-4 h-4 mr-1.5" />Se connecter
                                    </Button>
                                    <Button onClick={() => router.push("/auth/signin")} variant="outline" className="flex-1 h-10 rounded-full border-white dark:border-border text-white bg-transparent hover:bg-white/10 text-sm">
                                        Créer un compte
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Button onClick={handlePickCV} disabled={isAnalyzingCV} className="h-11 sm:h-12 rounded-full bg-white dark:bg-card text-[#20429b] dark:text-primary hover:bg-[#f4f7ff] dark:hover:bg-muted px-5 sm:px-8 font-semibold w-full max-w-[420px] mx-auto">
                                    {isAnalyzingCV ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                    {isAnalyzingCV ? "Analyse IA en cours..." : "Télécharger votre CV"}
                                </Button>
                                {!isLoggedIn && freeUsage && (
                                    <p className="text-xs text-[#b9d8ff]">
                                        {freeUsage.remaining > 0
                                            ? `${freeUsage.remaining} analyse${freeUsage.remaining > 1 ? "s" : ""} gratuite${freeUsage.remaining > 1 ? "s" : ""} restante${freeUsage.remaining > 1 ? "s" : ""} (${freeUsage.remaining}/${freeUsage.limit})`
                                            : "Limite gratuite atteinte - connecte-toi pour continuer"}
                                    </p>
                                )}
                                {uploadError && <p className="text-[12px] text-[#ffd4d4]">{uploadError}</p>}
                            </>
                        )}
                        <input ref={cvInputRef} type="file" accept={CV_ACCEPT} onChange={handleCVUpload} className="hidden" />
                    </div>
                    <p className="mt-4 sm:mt-6 text-xs sm:text-[13px] text-[#b9d8ff]">Importer votre CV, lettre de motivation ou tout autre document et obtenez un score en quelques secondes.</p>
                </div>
            </section>

            {/* Companies */}
            <section className="pt-10 sm:pt-16 md:pt-20 pb-8 sm:pb-12 md:pb-16 bg-white dark:bg-background">
                <div className="mx-auto max-w-[1180px] px-3 sm:px-4">
                    <h2 className="text-center text-2xl xs:text-3xl sm:text-4xl md:text-[38px] lg:text-[46px] leading-none font-extrabold text-[#111827] dark:text-foreground">Explorer les entreprises.</h2>
                    {companies.length > 0 ? (
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8 sm:mt-10">
                            {companies.map((company) => (
                                <Link key={company.id} href={companyHref(company)}>
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
                    ) : (
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8 sm:mt-10">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="rounded-2xl border border-[#e8edf6] dark:border-border bg-white dark:bg-card p-4 min-h-[140px] animate-pulse">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-9 h-9 rounded-full bg-[#f3f5fa] dark:bg-muted" />
                                        <div className="w-14 h-4 rounded-full bg-[#f3f5fa] dark:bg-muted" />
                                    </div>
                                    <div className="w-3/4 h-3 rounded bg-[#f3f5fa] dark:bg-muted mb-2" />
                                    <div className="w-1/2 h-2 rounded bg-[#f3f5fa] dark:bg-muted" />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-80">
                        <img src="/partners/oraimo.png" alt="Oraimo" className="h-12 xs:h-14 md:h-16 w-auto" />
                        <img src="/partners/gtco.png" alt="GTCO" className="h-12 xs:h-14 md:h-16 w-auto" />
                        <img src="/partners/te.png" alt="TE" className="h-12 xs:h-14 md:h-16 w-auto" />
                        <img src="/partners/uba.png" alt="UBA" className="h-12 xs:h-14 md:h-16 w-auto" />
                        <img src="/partners/gsk.png" alt="GSK" className="h-12 xs:h-14 md:h-16 w-auto" />
                    </div>
                    <div className="text-center mt-6 sm:mt-8">
                        <Link href="/explorer-entreprises">
                            <Button className="rounded-full bg-brand-gradient hover:bg-brand-gradient-hover h-10 sm:h-11 px-6 sm:px-8">+ Découvrir plus</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Find a job */}
            <section className="bg-[#f2f4f8] dark:bg-muted/30 py-10 sm:py-16">
                <div className="mx-auto max-w-[960px] px-3 sm:px-4 text-center">
                    <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-[38px] lg:text-[58px] leading-none font-extrabold text-[#2a62d7] dark:text-primary uppercase">TROUVE TON FUTUR EMPLOI</h2>
                    <p className="text-xs sm:text-[14px] text-[#7d8798] dark:text-muted-foreground mt-2 sm:mt-4">Des opportunités de stages et d'emplois t'attendent ici. Es-tu prêt(e) à décrocher le poste qui te correspond vraiment ?</p>
                    <div className="mt-6 sm:mt-8 flex justify-center">
                        <form className="flex w-full max-w-[720px] relative" onSubmit={(e) => { e.preventDefault(); const q = (e.currentTarget.querySelector("input") as HTMLInputElement)?.value; router.push(`/explorer-emplois${q ? `?q=${encodeURIComponent(q)}` : ""}`) }}>
                            <Input className="h-10 sm:h-12 rounded-full border-[#dbe4f4] dark:border-border bg-white text-[#111827] placeholder:text-[#9aa3b2] pr-32 text-sm w-full" placeholder="Quel métier recherches-tu ? (ex: Comptable, Commercial...)" />
                            <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 sm:h-10 rounded-full bg-brand-gradient hover:bg-brand-gradient-hover px-4 sm:px-6 text-xs sm:text-sm font-semibold shadow-md">
                                Trouver un emploi
                            </Button>
                        </form>
                    </div>
                    <Link href="/explorer-emplois">
                        <Button variant="outline" className="mt-6 sm:mt-8 h-10 sm:h-11 px-6 sm:px-8 rounded-full border-[#97b8f5] dark:border-primary/50 text-[#2f6de6] dark:text-primary bg-transparent w-full sm:w-auto">
                            M'abonner aux alertes offres d'emploi 📩
                        </Button>
                    </Link>
                </div>
            </section>

            {/* How it works */}
            <section className="bg-white dark:bg-background py-10 sm:py-16">
                <div className="mx-auto max-w-[1180px] px-3 sm:px-4">
                    <Reveal>
                        <h2 className="text-center text-xl xs:text-2xl sm:text-3xl md:text-[38px] lg:text-[44px] leading-none font-extrabold">Comment fonctionne Goriya?</h2>
                    </Reveal>
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-7 mt-8 sm:mt-12 text-center">
                        {[
                            { n: 1, title: "Créer un compte", desc: "Inscription ultra-rapide en 2 clics. Crée ton profil et rejoins la communauté des boostés." },
                            { n: 2, title: "Télécharger un CV", desc: "Dépose ton CV ou ta lettre de motivation au format PDF ou Word." },
                            { n: 3, title: "Faire valider ton CV par l'IA", desc: "Obtiens ton score IA instantané. Découvre tes forces, tes faiblesses et reçois des conseils de correction immédiats." },
                            { n: 4, title: "Préparer ton entretien", desc: "Entraîne-toi face à la machine. Utilise notre chatbot intelligent ou simule un vrai entretien avec un expert RH pour être prêt le jour J." },
                            { n: 5, title: "Postuler et décrocher le poste", desc: "Décroche ton stage ou ton premier emploi. Postule directement aux offres qui matchent avec ton profil." },
                        ].map(({ n, title, desc }, i) => (
                            <Reveal key={n} delay={i * 110}>
                                <div className="mx-auto w-8 h-8 rounded-full border border-[#bfd0f5] dark:border-border text-[#2f6de6] dark:text-primary text-sm flex items-center justify-center">{n}</div>
                                <h3 className="mt-4 font-semibold text-[#1c2433] dark:text-foreground">{title}</h3>
                                <p className="text-sm text-[#8a95a8] dark:text-muted-foreground mt-2">{desc}</p>
                            </Reveal>
                        ))}
                    </div>
                    <div className="mt-8 sm:mt-12 space-y-10 sm:space-y-14">
                        {featureBlocks.map((item, i) => (
                            <Reveal key={item.title} delay={i === 0 ? 0 : 80} className={`grid grid-cols-1 md:grid-cols-2 items-center gap-6 sm:gap-8 ${item.reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
                                <div className="px-1 sm:px-2 md:px-6 text-center md:text-left">
                                    <h3 className="text-lg xs:text-xl sm:text-2xl md:text-[32px] lg:text-[40px] leading-[1.05] font-extrabold text-[#2f6de6] dark:text-primary">{item.title}</h3>
                                    <p className="mt-3 sm:mt-4 text-[#2d3545] dark:text-muted-foreground leading-7 text-sm sm:text-base"><BoldText text={item.desc} /></p>
                                </div>
                                <div className="flex justify-center mt-4 md:mt-0">
                                    <img src={item.image} alt={item.title} className="max-h-[160px] xs:max-h-[200px] sm:max-h-[240px] w-auto object-contain" />
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA banner */}
            <section className="bg-brand-gradient text-white py-10 sm:py-16 relative overflow-hidden">
                <div className="absolute left-0 bottom-0 w-28 h-28 sm:w-52 sm:h-52 rounded-full border-[10px] sm:border-[20px] border-[#7cb0ff] dark:border-primary/50 opacity-40 -translate-x-5 sm:-translate-x-10 translate-y-5 sm:translate-y-10" />
                <div className="mx-auto max-w-[1180px] px-3 sm:px-4 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center relative z-10">
                    <div>
                        <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-[38px] lg:text-[52px] leading-none font-extrabold">Prends les commandes de ton avenir</h3>
                        <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
                            <Link href="/auth/signin">
                                <Button className="rounded-full bg-white dark:bg-card text-[#1f4fc5] dark:text-primary hover:bg-[#f4f7ff] dark:hover:bg-muted w-full sm:w-auto">Créer mon compte (Gratuit)</Button>
                            </Link>
                            <Button
                                onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); handlePickCV() }}
                                className="rounded-full bg-white dark:bg-card text-[#1f4fc5] dark:text-primary hover:bg-[#f4f7ff] dark:hover:bg-muted w-full sm:w-auto"
                            >
                                Analyser mon CV maintenant
                            </Button>
                        </div>
                    </div>
                    <div className="flex justify-center md:justify-end mt-6 md:mt-0">
                        <img src="/images/9933453_4323022.png" alt="Application" className="h-[130px] xs:h-[170px] sm:h-[200px] md:h-[240px] w-auto object-contain" />
                    </div>
                </div>
            </section>

            {/* Career cards */}
            <section className="py-8 sm:py-14 bg-white dark:bg-background">
                <div className="mx-auto max-w-[1180px] px-3 sm:px-4">
                    <div className="mb-4 sm:mb-6">
                        <h3 className="text-lg xs:text-xl sm:text-2xl font-bold">Prends ta carrière en main</h3>
                    </div>
                    <div className="inline-flex rounded-full border border-[#e2e8f5] dark:border-border overflow-hidden mb-5 bg-white dark:bg-card">
                        {Object.keys(HOME_CAREER_TAB_PARAMS).map((tab) => (
                            <button key={tab} type="button" onClick={() => setHomeCareerTab(tab)}
                                className={`px-4 h-8 text-[11px] font-semibold transition-colors ${homeCareerTab === tab ? "text-[#2f6de6] dark:text-primary bg-[#edf4ff] dark:bg-primary/10" : "text-[#7f8796] dark:text-muted-foreground hover:text-[#2f6de6] dark:hover:text-primary"}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    {homeCareerLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-[#2f6de6] dark:text-primary" /></div>
                    ) : homeCareerJobs.length === 0 ? (
                        <p className="text-center text-sm text-[#9aa3b2] dark:text-muted-foreground py-8">Aucune offre disponible pour cette catégorie.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                            {homeCareerJobs.map((job) => (
                                <Link key={job.id} href={jobHref(job)}>
                                    <article className="rounded-2xl border border-[#e9eef8] dark:border-border p-3 hover:shadow-md transition-shadow h-full">
                                        <div className="h-32 sm:h-40 w-full rounded-md overflow-hidden bg-brand-gradient flex items-center justify-center">
                                            {job.image
                                                ? <img src={formatFileUrl(job.image)} alt={job.title} className="w-full h-full object-cover" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                                : job.company?.coverImage
                                                    ? <img src={formatFileUrl(job.company.coverImage)} alt={job.title} className="w-full h-full object-cover" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                                    : job.company?.logo
                                                        ? <img src={formatFileUrl(job.company.logo)} alt={job.company.name} className="w-16 h-16 object-contain brightness-0 invert" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                                        : <Building2 className="w-10 h-10 text-white opacity-60" />
                                            }
                                        </div>
                                        <h4 className="mt-3 font-semibold text-[#1b2331] dark:text-foreground line-clamp-2">{job.title}</h4>
                                        {job.company?.name && <p className="text-xs text-[#2f6de6] dark:text-primary mt-1">{job.company.name}</p>}
                                        <p className="text-sm text-[#8a95a8] dark:text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
                        <button type="button"
                            disabled={homeCareerPage <= 1 || homeCareerLoading}
                            onClick={() => fetchHomeCareerJobs(homeCareerPage - 1)}
                            className="w-9 h-9 rounded-full border border-[#cfe0ff] dark:border-border bg-white dark:bg-card flex items-center justify-center text-[#2f6de6] dark:text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#edf4ff] dark:hover:bg-primary/10">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <Link href={homeCareerTab === "Stagiaires" ? "/explorer-emplois?jobType=STAGE" : "/explorer-emplois"}>
                            <Button className="rounded-full bg-brand-gradient hover:bg-brand-gradient-hover h-10 sm:h-11 px-6 sm:px-8">+ Découvrir plus</Button>
                        </Link>
                        <button type="button"
                            disabled={homeCareerPage >= homeCareerTotalPages || homeCareerLoading}
                            onClick={() => fetchHomeCareerJobs(homeCareerPage + 1)}
                            className="w-9 h-9 rounded-full border border-[#cfe0ff] dark:border-border bg-white dark:bg-card flex items-center justify-center text-[#2f6de6] dark:text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#edf4ff] dark:hover:bg-primary/10">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Blog / actualités */}
            {articles.length > 0 && (
                <section className="py-10 sm:py-16 bg-[#f2f4f8] dark:bg-muted/30">
                    <div className="mx-auto max-w-[1180px] px-3 sm:px-4">
                        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
                            <div>
                                <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-[#1c2433] dark:text-foreground flex items-center gap-2">
                                    Conseils & actualités
                                </h2>
                                <p className="text-sm text-[#8a95a8] dark:text-muted-foreground mt-1">Nos derniers articles pour booster ta recherche.</p>
                            </div>
                            <Link href="/blog" className="hidden sm:block text-sm font-semibold text-[#2f6de6] dark:text-primary hover:underline whitespace-nowrap">Voir tous les articles</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {articles.map((article) => (
                                <Link key={article.id} href={`/blog/${article.slug}`}>
                                    <article className="rounded-2xl border border-[#e9eef8] dark:border-border bg-white dark:bg-card overflow-hidden h-full hover:shadow-md transition-shadow">
                                        <div className="h-40 w-full bg-brand-gradient">
                                            {article.coverImage && (
                                                <img src={formatFileUrl(article.coverImage)} alt={article.title} className="w-full h-full object-cover" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                            )}
                                        </div>
                                        <div className="p-4">
                                            {article.publishedAt && (
                                                <p className="text-[10px] text-[#9aa3b2] dark:text-muted-foreground">{formatRelativeDate(article.publishedAt)}</p>
                                            )}
                                            <h3 className="mt-1 text-[15px] font-bold text-[#1b2331] dark:text-foreground leading-snug line-clamp-2">{article.title}</h3>
                                            {article.excerpt && (
                                                <p className="mt-2 text-[12px] text-[#7f8796] dark:text-muted-foreground leading-5 line-clamp-3">{article.excerpt}</p>
                                            )}
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                        <div className="text-center mt-6 sm:hidden">
                            <Link href="/blog">
                                <Button variant="outline" className="rounded-full border-[#97b8f5] dark:border-primary/50 text-[#2f6de6] dark:text-primary bg-transparent">Voir tous les articles</Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Vidéo de présentation */}
            <section className="bg-white dark:bg-background py-10 sm:py-16">
                <PromoVideoCard />
            </section>

            <Footer />
        </div>
    )
}
