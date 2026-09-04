"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bookmark, Share2, ChevronDown, Loader2, MapPin, Calendar, AlertCircle, Lock, Sparkles, Check, CheckCircle2 } from "lucide-react"
import { jobService } from "@/lib/api/job.service"
import { IJobOffer } from "@/lib/@types/entities"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CompanyLogo } from "@/components/company-logo"
import { capitalizeFirst, formatFileUrl } from "@/lib/utils"
import { companyHref } from "@/lib/public-links"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { ApplyWizard } from "@/components/apply-wizard"

function formatPosted(date: Date | string) {
    const d = new Date(date)
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return "Aujourd'hui"
    if (days <= 3) return "Récent"
    if (days < 7) return `Il y a ${days} jours`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`
    return `Il y a ${Math.floor(days / 30)} mois`
}

const faqs = [
    { q: "Un CV est-il requis pour postuler à cette offre ?", a: "Oui, un CV à jour est généralement requis. Tu peux en créer un directement sur Goriya." },
    { q: "Le télétravail est-il possible pour ce poste ?", a: "Consulte la description de l'offre pour connaître les modalités de travail proposées par l'entreprise." },
    { q: "Une lettre de motivation est-elle obligatoire ?", a: "Elle est souvent recommandée pour maximiser tes chances d'être sélectionné(e)." },
    { q: "Quel est le délai de réponse après candidature ?", a: "Les recruteurs répondent généralement sous 2 à 4 semaines après la clôture de l'offre." },
]

/**
 * Jauge circulaire de « Créer CV » (app/(protected)/creer-cv/page.tsx) :
 * même anneau, même graduation en %, remplie progressivement de 0 jusqu'au
 * score plutôt que peinte d'un coup à sa valeur finale.
 */
function ScoreGauge({ value }: { value: number }) {
    const radius = 42
    const circumference = 2 * Math.PI * radius
    const cible = Math.min(Math.max(Math.round(value), 0), 100)
    const [pct, setPct] = useState(0)

    useEffect(() => {
        setPct(0)
        if (cible <= 0) return
        let courant = 0
        const pas = Math.max(1, Math.round(cible / 20))
        const timer = setInterval(() => {
            courant = Math.min(courant + pas, cible)
            setPct(courant)
            if (courant >= cible) clearInterval(timer)
        }, 40)
        return () => clearInterval(timer)
    }, [cible])

    return (
        <div className="relative mx-auto h-[110px] w-[110px] flex-shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e7f3" strokeWidth="7" />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#2e6fe9"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct / 100)}
                    className="transition-[stroke-dashoffset] duration-300"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[22px] font-bold leading-none text-[#2e6fe9] dark:text-primary">
                {pct}%
            </div>
        </div>
    )
}

function MatchingScoreWidget({ jobId }: { jobId?: string }) {
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ matchingScore: number; matchReasons: string[] } | null>(null)

    useEffect(() => {
        if (!isAuthenticated || !jobId) return
        setLoading(true)
        jobService.getMatchScore(jobId)
            .then((res: any) => setResult(res?.data ?? res))
            .catch(() => setResult(null))
            .finally(() => setLoading(false))
    }, [isAuthenticated, jobId])

    // Déconnecté : pas de score, donc pas de titre « Ton profil correspond à
    // cette offre » - il annoncerait un résultat que la carte ne montre pas.
    if (!isAuthenticated) {
        return (
            <div className="bg-white dark:bg-card rounded-2xl border border-[#e8eef6] dark:border-border p-5">
                <div className="flex justify-end mb-3">
                    <Lock className="w-4 h-4 text-[#9aa3b2] dark:text-muted-foreground" />
                </div>
                <div className="rounded-lg bg-[#f4f7ff] dark:bg-muted border border-[#dce8ff] dark:border-border p-3 text-center">
                    <p className="text-[11px] text-[#4e5a6e] dark:text-foreground mb-2">Crée un compte gratuit pour voir si ce poste te correspond vraiment.</p>
                    <Link href="/auth/signin">
                        <Button size="sm" className="w-full rounded-full bg-[#2f6de6] hover:bg-[#2458ba] text-[11px] h-8">
                            Voir mon score de compatibilité
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-[#e8eef6] dark:border-border p-5">
            <h3 className="text-[13px] font-extrabold text-[#1b2331] dark:text-foreground mb-4">Ton profil correspond à cette offre</h3>

            {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#2f6de6] dark:text-primary" /></div>
            ) : result ? (
                <div className="flex items-center gap-4">
                    <ScoreGauge value={result.matchingScore} />
                    <ul className="space-y-1.5 flex-1">
                        {result.matchReasons.slice(0, 3).map((reason, i) => (
                            <li key={i} className="text-[10px] text-[#4e5a6e] dark:text-foreground leading-4 flex items-start gap-1.5">
                                <span className="mt-1 w-1 h-1 rounded-full bg-[#2f6de6] flex-shrink-0" />
                                {reason}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground">Impossible de calculer ton score pour le moment.</p>
            )}
        </div>
    )
}

export default function JobDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    // Segment d'URL : slug de préférence, uuid pour les liens antérieurs aux
    // slugs - le backend résout les deux (voir HasSlug::scopeWhereKeyOrSlug).
    const jobRef = params?.slug as string

    const [job, setJob] = useState<IJobOffer | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [bookmarked, setBookmarked] = useState(false)
    const [alreadyApplied, setAlreadyApplied] = useState(false)
    const [wizardOuvert, setWizardOuvert] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    useEffect(() => {
        if (!jobRef) return
        jobService.getJobById(jobRef)
            .then((res: any) => {
                const data = res?.data ?? res
                setJob(data)
            })
            .catch(() => setError("Offre introuvable ou expirée."))
            .finally(() => setLoading(false))
    }, [jobRef])

    // Les routes favoris/candidatures s'adressent à l'uuid de l'offre : on
    // attend donc qu'elle soit chargée plutôt que d'utiliser le segment d'URL.
    const jobId = job?.id

    useEffect(() => {
        if (!jobId) return
        jobService.getSavedJobIds()
            .then((res: any) => setBookmarked((res?.data?.jobIds ?? res?.jobIds ?? []).includes(jobId)))
            .catch(() => {})
    }, [jobId])

    // Une offre à laquelle on a déjà postulé ne doit plus proposer le bouton "Postuler".
    useEffect(() => {
        if (!jobId || !isAuthenticated) { setAlreadyApplied(false); return }
        jobService.getAppliedJobIds()
            .then((res: any) => setAlreadyApplied((res?.data?.jobIds ?? res?.jobIds ?? []).includes(jobId)))
            .catch(() => {})
    }, [jobId, isAuthenticated])

    const handleToggleBookmark = () => {
        if (!isAuthenticated) { toast.info("Connecte-toi pour sauvegarder une offre.") ; return }
        if (!jobId) return
        const isSaved = bookmarked
        setBookmarked(!isSaved)
        const action = isSaved ? jobService.unsaveJob(jobId) : jobService.saveJob(jobId)
        action.catch(() => setBookmarked(isSaved))
    }

    // La candidature elle-même se fait dans le wizard (coordonnées, questions
    // de l'entreprise, CV, récapitulatif) : ici on ne fait que l'ouvrir.
    const handleApply = () => {
        if (alreadyApplied) return
        if (!isAuthenticated) {
            router.push("/auth/signin?redirect=/explorer-emplois/" + jobRef)
            return
        }
        setWizardOuvert(true)
    }

    const handleApplied = () => {
        setWizardOuvert(false)
        setAlreadyApplied(true)
        setJob((prev) => (prev ? { ...prev, applicants: (prev.applicants ?? 0) + 1 } : prev))
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: job?.title, url: window.location.href })
        } else {
            navigator.clipboard.writeText(window.location.href)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[1180px] px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2f6de6] dark:text-primary" />
                    </div>
                ) : error || !job ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                        <h2 className="text-xl font-bold text-[#1b2331] dark:text-foreground">{error ?? "Offre introuvable"}</h2>
                        <Link href="/explorer-emplois">
                            <Button className="rounded-full bg-[#2f6de6]">Voir toutes les offres</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT - main content */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Job header card */}
                            <div className="bg-white dark:bg-card rounded-2xl border border-[#e8eef6] dark:border-border p-6">
                                {/* Company breadcrumb */}
                                <div className="flex items-center gap-2 mb-4">
                                    <CompanyLogo name={job.company?.name ?? "?"} logo={job.company?.logo} className="w-7 h-7 text-[10px] flex-shrink-0" />
                                    <span className="text-[11px] text-[#7f8796] dark:text-muted-foreground">/</span>
                                    <Link href={companyHref(job.company)} className="text-[11px] text-[#2f6de6] dark:text-primary font-semibold hover:underline">
                                        {job.company?.name ?? "Entreprise"}
                                    </Link>
                                    <span className="text-[11px] text-[#7f8796] dark:text-muted-foreground">/</span>
                                    <span className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground truncate max-w-[180px]">{job.title}</span>
                                </div>

                                <h1 className="text-[24px] sm:text-[30px] leading-tight font-extrabold text-[#1b2331] dark:text-foreground mb-4">{job.title}</h1>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {job.experience && (
                                        <span className="text-[11px] px-3 py-1 rounded-full bg-[#f0f3fb] dark:bg-muted text-[#4e5a6e] dark:text-foreground border border-[#e8eef6] dark:border-border">
                                            {job.experience}
                                        </span>
                                    )}
                                    {job.type && (
                                        <span className="text-[11px] px-3 py-1 rounded-full bg-[#eff4ff] dark:bg-primary/10 text-[#2f6de6] dark:text-primary border border-[#dce8ff] dark:border-border font-semibold">
                                            {job.type}
                                        </span>
                                    )}
                                    {job.salary && (
                                        <span className="text-[11px] px-3 py-1 rounded-full bg-[#f0fbf5] dark:bg-muted text-[#22a05b] border border-[#d0f0e0] dark:border-[#415c4f] font-semibold">
                                            {job.salary}
                                        </span>
                                    )}
                                    {job.location && (
                                        <span className="text-[11px] px-3 py-1 rounded-full bg-[#f4f5f7] dark:bg-muted text-[#7f8796] dark:text-muted-foreground border border-[#e8eef6] dark:border-border flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />{capitalizeFirst(job.location)}
                                        </span>
                                    )}
                                    {job.publishDate && (
                                        <span className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground flex items-center gap-1 px-1">
                                            <Calendar className="w-3 h-3" />{formatPosted(job.publishDate)}
                                        </span>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3 flex-wrap">
                                    {alreadyApplied ? (
                                        <div className="flex items-center gap-2 rounded-full bg-[#f0fbf5] dark:bg-muted border border-[#d0f0e0] dark:border-[#415c4f] h-9 px-5 text-[12px] font-semibold text-[#22a05b]">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Vous avez déjà postulé pour cette offre
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleApply}
                                            className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-9 px-6 text-[12px] font-semibold"
                                        >
                                            Postuler
                                        </Button>
                                    )}
                                    {isAuthenticated && (
                                    <Button
                                        variant="outline"
                                        onClick={handleToggleBookmark}
                                        className={`rounded-full border-[#d8deeb] dark:border-border h-9 px-4 text-[12px] gap-1.5 ${bookmarked ? "text-[#2f6de6] dark:text-primary border-[#2f6de6]" : ""}`}
                                    >
                                        <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                                        Sauvegarder
                                    </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={handleShare}
                                        className="rounded-full border-[#d8deeb] dark:border-border h-9 px-4 text-[12px] gap-1.5"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Partager
                                    </Button>
                                </div>
                            </div>

                            {/* Description */}
                            {job.description && (
                                <div className="bg-white dark:bg-card rounded-2xl border border-[#e8eef6] dark:border-border p-6">
                                    <h2 className="text-[20px] font-extrabold text-[#1b2331] dark:text-foreground mb-4">Le poste</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-[13px] font-bold text-[#1b2331] dark:text-foreground mb-2">Descriptif du poste</h3>
                                            <p className="text-[13px] leading-[1.8] text-[#7f8796] dark:text-muted-foreground whitespace-pre-wrap text-justify">{job.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Requirements */}
                            {job.requirements?.length > 0 && (
                                <div className="bg-white dark:bg-card rounded-2xl border border-[#e8eef6] dark:border-border p-6">
                                    <h2 className="text-[20px] font-extrabold text-[#1b2331] dark:text-foreground mb-4">Profil recherché</h2>
                                    <ul className="space-y-2">
                                        {job.requirements.map((req, i) => (
                                            <li key={i} className="text-[13px] leading-6 text-[#7f8796] dark:text-muted-foreground flex items-start gap-2">
                                                <span className="text-[#2f6de6] dark:text-primary mt-1 flex-shrink-0">•</span>
                                                <span className="text-justify">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Benefits */}
                            {job.benefits && (
                                <div className="bg-white dark:bg-card rounded-2xl border border-[#e8eef6] dark:border-border p-6">
                                    <h2 className="text-[20px] font-extrabold text-[#1b2331] dark:text-foreground mb-4">Avantages</h2>
                                    {(() => {
                                        const items = job.benefits.split(/\r?\n|;|•|·|- /).map((s) => s.trim()).filter(Boolean)
                                        return items.length > 1 ? (
                                            <ul className="space-y-2">
                                                {items.map((item, i) => (
                                                    <li key={i} className="text-[13px] leading-6 text-[#7f8796] dark:text-muted-foreground flex items-start gap-2">
                                                        <Check className="w-4 h-4 text-[#22a05b] shrink-0 mt-0.5" />
                                                        <span className="text-justify">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-[13px] leading-6 text-[#7f8796] dark:text-muted-foreground whitespace-pre-wrap text-justify">{job.benefits}</p>
                                        )
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* RIGHT - sidebar */}
                        <div className="space-y-4">
                            {/* Company card */}
                            {job.company && (
                                <div className="bg-white dark:bg-card rounded-2xl border border-[#e8eef6] dark:border-border overflow-hidden">
                                    {(job.image || job.company.coverImage) && (
                                        <img
                                            src={formatFileUrl(job.image || job.company.coverImage)}
                                            alt={job.company.name}
                                            className="w-full h-28 object-cover"
                                            onError={(e) => { e.currentTarget.style.display = "none" }}
                                        />
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <CompanyLogo name={job.company.name} logo={job.company.logo} className="w-10 h-10 rounded-xl text-[13px] flex-shrink-0 border border-[#e8eef6] dark:border-border" />
                                            <div>
                                                <p className="text-[13px] font-bold text-[#1b2331] dark:text-foreground">{job.company.name}</p>
                                                {job.company.sector && <p className="text-[11px] text-[#7f8796] dark:text-muted-foreground">{job.company.sector}</p>}
                                            </div>
                                        </div>
                                        <p className="text-[12px] font-semibold text-[#1b2331] dark:text-foreground mb-3">Cette offre t'intéresse ?</p>
                                        <Link href={companyHref(job.company)}>
                                            <Button variant="outline" className="w-full rounded-full border-[#d8deeb] dark:border-border h-8 text-[11px] text-[#2f6de6] dark:text-primary">
                                                Découvrir l'entreprise
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Matching score */}
                            <MatchingScoreWidget jobId={jobId} />

                            {/* Premium CTA */}
                            <div className="bg-gradient-to-br from-[#1539be] to-[#2f81f1] rounded-xl p-5 text-white text-center">
                                <Sparkles className="w-6 h-6 mx-auto mb-3 text-yellow-300" />
                                <p className="text-[14px] font-extrabold mb-1">Essayer dès maintenant</p>
                                <p className="text-[11px] text-blue-200 mb-4">Accède à toutes les fonctionnalités premium et booste ta recherche d'emploi.</p>
                                <Link href="/offres">
                                    <Button className="w-full rounded-full bg-white dark:bg-card text-[#2f6de6] dark:text-primary hover:bg-[#f0f3fb] dark:hover:bg-muted text-[11px] h-8 font-semibold">
                                        Voir les offres premium
                                    </Button>
                                </Link>
                            </div>

                            {/* Apply sticky */}
                            <div className="bg-white dark:bg-card rounded-2xl border border-[#e8eef6] dark:border-border p-5">
                                {alreadyApplied ? (
                                    <>
                                        <p className="text-[13px] font-bold text-[#1b2331] dark:text-foreground mb-1 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-[#22a05b]" />
                                            Candidature envoyée
                                        </p>
                                        <p className="text-[11px] text-[#7f8796] dark:text-muted-foreground mb-4">
                                            Vous avez déjà postulé pour cette offre. Suis son avancement depuis ton tableau de bord.
                                        </p>
                                        <Link href="/dashboard">
                                            <Button variant="outline" className="w-full rounded-full border-[#d8deeb] dark:border-border h-9 text-[12px] font-semibold mb-2 text-[#2f6de6] dark:text-primary">
                                                Voir mes candidatures
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-[13px] font-bold text-[#1b2331] dark:text-foreground mb-1">Postule dès maintenant</p>
                                        <p className="text-[11px] text-[#7f8796] dark:text-muted-foreground mb-4">
                                            Rejoins les {job.applicants ?? 0} candidat{(job.applicants ?? 0) !== 1 ? "s" : ""} qui ont déjà postulé.
                                        </p>
                                        <Button
                                            onClick={handleApply}
                                            className="w-full rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-9 text-[12px] font-semibold mb-2"
                                        >
                                            Postuler
                                        </Button>
                                        {(job.questions?.length ?? 0) > 0 && (
                                            <p className="text-[10px] text-[#9aa3b2] dark:text-muted-foreground text-center mb-2">
                                                {job.questions?.length} question
                                                {(job.questions?.length ?? 0) > 1 ? "s" : ""} de
                                                l&apos;entreprise à remplir.
                                            </p>
                                        )}
                                    </>
                                )}
                                <div className="text-[10px] text-[#9aa3b2] dark:text-muted-foreground text-center">
                                    Offre publiée {formatPosted(job.publishDate)}
                                    {job.endDate && <span className="ml-2">· Clôture le {new Date(job.endDate).toLocaleDateString("fr-FR")}</span>}
                                </div>
                            </div>
                        </div>

                        {/* FAQ - pleine largeur, en dernier (juste avant le footer sur mobile) */}
                        <div className="lg:col-span-3 bg-white dark:bg-card rounded-2xl border border-[#e8eef6] dark:border-border p-6">
                            <h2 className="text-[20px] font-extrabold text-[#1b2331] dark:text-foreground mb-5">Questions et réponses sur l'offre</h2>
                            <div className="space-y-2">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="border border-[#e8eef6] dark:border-border rounded-2xl overflow-hidden">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                            className="w-full px-5 py-4 flex items-center justify-between text-left"
                                        >
                                            <span className="text-[13px] font-semibold text-[#1b2331] dark:text-foreground">{faq.q}</span>
                                            <ChevronDown className={`w-4 h-4 flex-shrink-0 text-[#9aa3b2] dark:text-muted-foreground transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                                        </button>
                                        {openFaq === index && (
                                            <div className="px-5 pb-4 border-t border-[#e8eef6] dark:border-border pt-3">
                                                <p className="text-[13px] text-[#7f8796] dark:text-muted-foreground">{faq.a}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Monté seulement une fois l'offre chargée : le wizard a besoin de
                ses questions et de son titre. */}
            {job && (
                <ApplyWizard
                    open={wizardOuvert}
                    onOpenChange={setWizardOuvert}
                    job={job}
                    onApplied={handleApplied}
                />
            )}

            <Footer />
        </div>
    )
}
