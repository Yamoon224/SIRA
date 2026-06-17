"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bookmark, Share2, ChevronDown, Loader2, Building2, MapPin, Calendar, AlertCircle, Lock, Sparkles } from "lucide-react"
import { jobService } from "@/lib/api/job.service"
import { IJobOffer } from "@/lib/@types/entities"

function formatPosted(date: Date | string) {
    const d = new Date(date)
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return "Il y a 1 jour"
    if (days < 7) return `Il y a ${days} jours`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`
    return `Il y a ${Math.floor(days / 30)} mois`
}

const faqs = [
    { q: "Un CV est-il requis pour postuler à cette offre ?", a: "Oui, un CV à jour est généralement requis. Vous pouvez en créer un directement sur Goriya." },
    { q: "Le télétravail est-il possible pour ce poste ?", a: "Consultez la description de l'offre pour connaître les modalités de travail proposées par l'entreprise." },
    { q: "Une lettre de motivation est-elle obligatoire ?", a: "Elle est souvent recommandée pour maximiser vos chances d'être sélectionné(e)." },
    { q: "Quel est le délai de réponse après candidature ?", a: "Les recruteurs répondent généralement sous 2 à 4 semaines après la clôture de l'offre." },
]

function MatchingScoreWidget() {
    const score = 85
    const radius = 42
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    return (
        <div className="bg-white rounded-xl border border-[#e8eef6] p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-extrabold text-[#1b2331]">Votre profil correspond à cette offre</h3>
                <Lock className="w-4 h-4 text-[#9aa3b2]" />
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="relative w-[90px] h-[90px] flex-shrink-0">
                    <svg width="90" height="90" viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r={radius} fill="none" stroke="#f0f3fb" strokeWidth="8" />
                        <circle
                            cx="45" cy="45" r={radius}
                            fill="none"
                            stroke="#2f6de6"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            transform="rotate(-90 45 45)"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[22px] font-extrabold text-[#1b2331] leading-none">
                            {score}
                            <span className="text-[11px] font-semibold text-[#9aa3b2]">/100</span>
                        </span>
                    </div>
                </div>
                <div className="space-y-2 flex-1">
                    {[
                        { label: "Expérience", value: 90 },
                        { label: "Compétences", value: 80 },
                        { label: "Localisation", value: 85 },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <div className="flex justify-between text-[10px] mb-0.5">
                                <span className="text-[#7f8796]">{label}</span>
                                <span className="font-semibold text-[#1b2331]">{value}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[#f0f3fb] overflow-hidden">
                                <div className="h-full bg-[#2f6de6] rounded-full" style={{ width: `${value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-lg bg-[#f4f7ff] border border-[#dce8ff] p-3 text-center">
                <p className="text-[11px] text-[#4e5a6e] mb-2">Créez un compte gratuit pour voir si ce poste vous correspond vraiment.</p>
                <Link href="/auth/signin">
                    <Button size="sm" className="w-full rounded-full bg-[#2f6de6] hover:bg-[#2458ba] text-[11px] h-8">
                        Voir mon score de compatibilité
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default function JobDetailPage() {
    const params = useParams()
    const router = useRouter()
    const jobId = params?.id as string

    const [job, setJob] = useState<IJobOffer | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [bookmarked, setBookmarked] = useState(false)
    const [applying, setApplying] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    useEffect(() => {
        if (!jobId) return
        jobService.getJobById(jobId)
            .then((res: any) => {
                const data = res?.data ?? res
                setJob(data)
            })
            .catch(() => setError("Offre introuvable ou expirée."))
            .finally(() => setLoading(false))
    }, [jobId])

    const handleApply = async () => {
        setApplying(true)
        try {
            await jobService.applyToJob(jobId, {})
            router.push("/dashboard")
        } catch {
            router.push("/auth/signin?redirect=/explorer-emplois/" + jobId)
        } finally {
            setApplying(false)
        }
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: job?.title, url: window.location.href })
        } else {
            navigator.clipboard.writeText(window.location.href)
        }
    }

    return (
        <div className="min-h-screen bg-[#f4f5f7]">
            <header className="bg-white border-b border-[#e8eef6]">
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

            <main className="mx-auto max-w-[1180px] px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2f6de6]" />
                    </div>
                ) : error || !job ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                        <h2 className="text-xl font-bold text-[#1b2331]">{error ?? "Offre introuvable"}</h2>
                        <Link href="/explorer-emplois">
                            <Button className="rounded-full bg-[#2f6de6]">Voir toutes les offres</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT — main content */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Job header card */}
                            <div className="bg-white rounded-xl border border-[#e8eef6] p-6">
                                {/* Company breadcrumb */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-[#f0f3fb] flex items-center justify-center flex-shrink-0">
                                        {job.company?.logo
                                            ? <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                            : <Building2 className="w-4 h-4 text-[#9aa3b2]" />
                                        }
                                    </div>
                                    <span className="text-[11px] text-[#7f8796]">/</span>
                                    <Link href={job.company?.id ? `/explorer-entreprises/${job.company.id}` : "/explorer-entreprises"} className="text-[11px] text-[#2f6de6] font-semibold hover:underline">
                                        {job.company?.name ?? "Entreprise"}
                                    </Link>
                                    <span className="text-[11px] text-[#7f8796]">/</span>
                                    <span className="text-[11px] text-[#9aa3b2] truncate max-w-[180px]">{job.title}</span>
                                </div>

                                <h1 className="text-[24px] sm:text-[30px] leading-tight font-extrabold text-[#1b2331] mb-4">{job.title}</h1>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {job.experience && (
                                        <span className="text-[11px] px-3 py-1 rounded-full bg-[#f0f3fb] text-[#4e5a6e] border border-[#e8eef6]">
                                            {job.experience}
                                        </span>
                                    )}
                                    {job.type && (
                                        <span className="text-[11px] px-3 py-1 rounded-full bg-[#eff4ff] text-[#2f6de6] border border-[#dce8ff] font-semibold">
                                            {job.type}
                                        </span>
                                    )}
                                    {job.salary && (
                                        <span className="text-[11px] px-3 py-1 rounded-full bg-[#f0fbf5] text-[#22a05b] border border-[#d0f0e0] font-semibold">
                                            {job.salary}
                                        </span>
                                    )}
                                    {job.location && (
                                        <span className="text-[11px] px-3 py-1 rounded-full bg-[#f4f5f7] text-[#7f8796] border border-[#e8eef6] flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />{job.location}
                                        </span>
                                    )}
                                    {job.publishDate && (
                                        <span className="text-[11px] text-[#9aa3b2] flex items-center gap-1 px-1">
                                            <Calendar className="w-3 h-3" />Il y a {Math.floor((Date.now() - new Date(job.publishDate).getTime()) / 86400000)} jours
                                        </span>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3 flex-wrap">
                                    <Button
                                        onClick={handleApply}
                                        disabled={applying}
                                        className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-9 px-6 text-[12px] font-semibold"
                                    >
                                        {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Postuler
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setBookmarked(b => !b)}
                                        className={`rounded-full border-[#d8deeb] h-9 px-4 text-[12px] gap-1.5 ${bookmarked ? "text-[#2f6de6] border-[#2f6de6]" : ""}`}
                                    >
                                        <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                                        Sauvegarder
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleShare}
                                        className="rounded-full border-[#d8deeb] h-9 px-4 text-[12px] gap-1.5"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Partager
                                    </Button>
                                </div>
                            </div>

                            {/* Description */}
                            {job.description && (
                                <div className="bg-white rounded-xl border border-[#e8eef6] p-6">
                                    <h2 className="text-[20px] font-extrabold text-[#1b2331] mb-4">Le poste</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-[13px] font-bold text-[#1b2331] mb-2">Descriptif du poste</h3>
                                            <p className="text-[13px] leading-[1.8] text-[#7f8796] whitespace-pre-wrap">{job.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Requirements */}
                            {job.requirements?.length > 0 && (
                                <div className="bg-white rounded-xl border border-[#e8eef6] p-6">
                                    <h2 className="text-[20px] font-extrabold text-[#1b2331] mb-4">Profil recherché</h2>
                                    <ul className="space-y-2">
                                        {job.requirements.map((req, i) => (
                                            <li key={i} className="text-[13px] leading-6 text-[#7f8796] flex items-start gap-2">
                                                <span className="text-[#2f6de6] mt-1 flex-shrink-0">•</span>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Benefits */}
                            {job.benefits && (
                                <div className="bg-white rounded-xl border border-[#e8eef6] p-6">
                                    <h2 className="text-[20px] font-extrabold text-[#1b2331] mb-4">Avantages</h2>
                                    <p className="text-[13px] leading-6 text-[#7f8796] whitespace-pre-wrap">{job.benefits}</p>
                                </div>
                            )}

                            {/* FAQ */}
                            <div className="bg-white rounded-xl border border-[#e8eef6] p-6">
                                <h2 className="text-[20px] font-extrabold text-[#1b2331] mb-5">Questions et réponses sur l'offre</h2>
                                <div className="space-y-2">
                                    {faqs.map((faq, index) => (
                                        <div key={index} className="border border-[#e8eef6] rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                                className="w-full px-5 py-4 flex items-center justify-between text-left"
                                            >
                                                <span className="text-[13px] font-semibold text-[#1b2331]">{faq.q}</span>
                                                <ChevronDown className={`w-4 h-4 flex-shrink-0 text-[#9aa3b2] transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                                            </button>
                                            {openFaq === index && (
                                                <div className="px-5 pb-4 border-t border-[#e8eef6] pt-3">
                                                    <p className="text-[13px] text-[#7f8796]">{faq.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — sidebar */}
                        <div className="space-y-4">
                            {/* Company card */}
                            {job.company && (
                                <div className="bg-white rounded-xl border border-[#e8eef6] overflow-hidden">
                                    {job.company.coverImage && (
                                        <img
                                            src={job.company.coverImage}
                                            alt={job.company.name}
                                            className="w-full h-28 object-cover"
                                            onError={(e) => { e.currentTarget.style.display = "none" }}
                                        />
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#f0f3fb] flex items-center justify-center flex-shrink-0 border border-[#e8eef6]">
                                                {job.company.logo
                                                    ? <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                                    : <Building2 className="w-5 h-5 text-[#9aa3b2]" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-[#1b2331]">{job.company.name}</p>
                                                {job.company.sector && <p className="text-[11px] text-[#7f8796]">{job.company.sector}</p>}
                                            </div>
                                        </div>
                                        <p className="text-[12px] font-semibold text-[#1b2331] mb-3">Cette offre vous intéresse ?</p>
                                        <Link href={job.company.id ? `/explorer-entreprises/${job.company.id}` : "/explorer-entreprises"}>
                                            <Button variant="outline" className="w-full rounded-full border-[#d8deeb] h-8 text-[11px] text-[#2f6de6]">
                                                Découvrir l'entreprise
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Matching score */}
                            <MatchingScoreWidget />

                            {/* Premium CTA */}
                            <div className="bg-gradient-to-br from-[#1539be] to-[#2f81f1] rounded-xl p-5 text-white text-center">
                                <Sparkles className="w-6 h-6 mx-auto mb-3 text-yellow-300" />
                                <p className="text-[14px] font-extrabold mb-1">Essayer dès maintenant</p>
                                <p className="text-[11px] text-blue-200 mb-4">Accédez à toutes les fonctionnalités premium et boostez votre recherche d'emploi.</p>
                                <Link href="/offres">
                                    <Button className="w-full rounded-full bg-white text-[#2f6de6] hover:bg-[#f0f3fb] text-[11px] h-8 font-semibold">
                                        Voir les offres premium
                                    </Button>
                                </Link>
                            </div>

                            {/* Apply sticky */}
                            <div className="bg-white rounded-xl border border-[#e8eef6] p-5">
                                <p className="text-[13px] font-bold text-[#1b2331] mb-1">Postulez dès maintenant</p>
                                <p className="text-[11px] text-[#7f8796] mb-4">
                                    Rejoignez les {job.applicants ?? 0} candidat{(job.applicants ?? 0) !== 1 ? "s" : ""} qui ont déjà postulé.
                                </p>
                                <Button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="w-full rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-9 text-[12px] font-semibold mb-2"
                                >
                                    {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Postuler
                                </Button>
                                <div className="text-[10px] text-[#9aa3b2] text-center">
                                    Offre publiée {formatPosted(job.publishDate)}
                                    {job.endDate && <span className="ml-2">· Clôture le {new Date(job.endDate).toLocaleDateString("fr-FR")}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="bg-[#06080d] text-white pt-10 sm:pt-14 pb-8 mt-16">
                <div className="mx-auto max-w-[1180px] px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                        <div>
                            <img src="/images/logo.png" alt="Goriya" className="h-10 sm:h-12 w-auto brightness-0 invert mb-4" />
                            <p className="text-sm text-[#9098a7]">Goriya est une plateforme web intelligente qui permet aux utilisateurs d'uploader leur CV afin d'obtenir une analyse intelligente par IA.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Concept</h4>
                            <ul className="space-y-2 text-[#9098a7] text-sm">
                                <li><Link href="/explorer-emplois">Trouve un emploi</Link></li>
                                <li><Link href="/offres">Tarification</Link></li>
                                <li><Link href="#">Politique de confidentialité</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-3">Recevoir les notifications d'emploi</h4>
                            <p className="text-sm text-[#9098a7] mb-4">Les dernières nouvelles sur l'emploi envoyées dans votre boîte de réception chaque semaine.</p>
                            <div className="flex gap-2">
                                <Input className="h-10 rounded-full border-[#2a2f3a] bg-[#0f121a] text-white text-[12px]" placeholder="Adresse e-mail" />
                                <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] px-4">S'abonner</Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-[#1c202a] flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="text-xs sm:text-sm text-[#6f7887]">2026 © Goriya. Tous droits réservés.</p>
                        <div className="flex items-center gap-2">
                            <Link href="/auth/signin"><Button variant="outline" className="h-8 rounded-full border-[#374153] text-[#d9e5ff] bg-transparent text-[12px]">Connexion</Button></Link>
                            <Link href="https://goriya-entreprise.vercel.app"><Button className="h-8 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] text-[12px]">Espace entreprise</Button></Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
