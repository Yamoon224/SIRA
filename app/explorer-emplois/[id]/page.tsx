"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bookmark, Share2, ChevronDown, Loader2, Building2, MapPin, Calendar, AlertCircle } from "lucide-react"
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

export default function JobDetailPage() {
    const params = useParams()
    const router = useRouter()
    const jobId = params?.id as string

    const [job, setJob] = useState<IJobOffer | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [bookmarked, setBookmarked] = useState(false)
    const [applying, setApplying] = useState(false)

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
                        <Link href="//entreprise">
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
                    <>
                        <section className="bg-white rounded-xl p-6 sm:p-8 border border-[#e8eef6]">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#f0f3fb] flex items-center justify-center flex-shrink-0">
                                            {job.company?.logo
                                                ? <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                                                : <Building2 className="w-4 h-4 text-[#9aa3b2]" />
                                            }
                                        </div>
                                        <span className="text-[10px] font-semibold text-[#1b2331]">{job.company?.name ?? "Entreprise"}</span>
                                    </div>

                                    <h1 className="text-[28px] sm:text-[36px] leading-tight font-extrabold text-[#1b2331] mb-4">{job.title}</h1>

                                    <div className="space-y-2 mb-6 text-[12px]">
                                        <div className="flex flex-wrap gap-4 text-[#7f8796]">
                                            {job.company?.sector && <span>📍 {job.company.sector}</span>}
                                            {job.type && <span>📋 {job.type}</span>}
                                            {job.experience && <span>⏱ {job.experience}</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-[#7f8796]">
                                            {job.salary && <span>💰 {job.salary}</span>}
                                            {job.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                                            <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{formatPosted(job.publishDate)}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 flex-wrap">
                                        <Button onClick={handleApply} disabled={applying} className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-10 px-6 text-[12px] font-semibold">
                                            {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                            Postuler
                                        </Button>
                                        <Button variant="outline" onClick={() => setBookmarked(b => !b)} className={`rounded-full border-[#d8deeb] h-10 px-4 ${bookmarked ? "text-[#2f6de6]" : ""}`}>
                                            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                                        </Button>
                                        <Button variant="outline" onClick={handleShare} className="rounded-full border-[#d8deeb] h-10 px-4">
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="lg:w-[280px]">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-[11px] font-bold text-[#7f8796] uppercase mb-3">Infos</h3>
                                            <div className="space-y-3 text-[12px]">
                                                {job.company?.name && (
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold text-[#1b2331]">Entreprise:</span>
                                                        <span className="text-[#7f8796]">{job.company.name}</span>
                                                    </div>
                                                )}
                                                {job.company?.sector && (
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold text-[#1b2331]">Secteur:</span>
                                                        <span className="text-[#7f8796]">{job.company.sector}</span>
                                                    </div>
                                                )}
                                                {job.applicants != null && (
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold text-[#1b2331]">Candidats:</span>
                                                        <span className="text-[#7f8796]">{job.applicants}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {job.type && (
                                            <div className="border-t border-[#e8eef6] pt-6">
                                                <h3 className="text-[11px] font-bold text-[#7f8796] uppercase mb-3">Type</h3>
                                                <div className="text-[12px] font-semibold text-[#1b2331]">{job.type}</div>
                                            </div>
                                        )}
                                        {job.location && (
                                            <div className="border-t border-[#e8eef6] pt-6">
                                                <h3 className="text-[11px] font-bold text-[#7f8796] uppercase mb-3">Lieu</h3>
                                                <div className="text-[12px] text-[#7f8796]">{job.location}</div>
                                            </div>
                                        )}
                                        {job.salary && (
                                            <div className="border-t border-[#e8eef6] pt-6">
                                                <h3 className="text-[11px] font-bold text-[#7f8796] uppercase mb-3">Salaire</h3>
                                                <div className="text-[14px] font-extrabold text-[#2f6de6]">{job.salary}</div>
                                            </div>
                                        )}
                                        {job.endDate && (
                                            <div className="border-t border-[#e8eef6] pt-6">
                                                <h3 className="text-[11px] font-bold text-[#7f8796] uppercase mb-3">Date limite</h3>
                                                <div className="text-[12px] text-[#7f8796]">{new Date(job.endDate).toLocaleDateString("fr-FR")}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-[#e8eef6]">
                                {job.company?.coverImage && (
                                    <img src={job.company.coverImage} alt={job.title} className="w-full h-64 rounded-xl object-cover mb-6" />
                                )}
                                {job.company && (
                                    <div className="bg-gradient-to-r from-[#2b7cf0] to-[#1e5ed4] text-white rounded-xl p-6 text-center">
                                        <h3 className="text-[18px] font-bold mb-2">Découvrez {job.company.name}</h3>
                                        <p className="text-[12px] text-[#c8e0ff] mb-4">Apprenez à connaître la culture, les valeurs et l'équipe derrière cette offre</p>
                                        <div className="flex gap-2 justify-center">
                                            <Link href={`/entreprises/${job.company.id}`}>
                                                <Button className="bg-white text-[#2b7cf0] hover:bg-[#f0f3fb] rounded-full text-[12px] font-semibold">Découvrir</Button>
                                            </Link>
                                            <Button onClick={handleApply} variant="outline" className="border-white text-white hover:bg-white/10 rounded-full text-[12px]">Postuler</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                {job.description && (
                                    <div className="bg-white rounded-xl p-6 border border-[#e8eef6]">
                                        <h2 className="text-[24px] font-extrabold text-[#1b2331] mb-4">Le poste</h2>
                                        <p className="text-[13px] leading-6 text-[#7f8796] whitespace-pre-wrap">{job.description}</p>
                                    </div>
                                )}

                                {job.requirements?.length > 0 && (
                                    <div className="bg-white rounded-xl p-6 border border-[#e8eef6]">
                                        <h2 className="text-[24px] font-extrabold text-[#1b2331] mb-4">Profil recherché</h2>
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

                                {job.benefits && (
                                    <div className="bg-white rounded-xl p-6 border border-[#e8eef6]">
                                        <h2 className="text-[24px] font-extrabold text-[#1b2331] mb-4">Avantages</h2>
                                        <p className="text-[13px] leading-6 text-[#7f8796] whitespace-pre-wrap">{job.benefits}</p>
                                    </div>
                                )}

                                <div className="bg-white rounded-xl p-6 border border-[#e8eef6]">
                                    <h2 className="text-[24px] font-extrabold text-[#1b2331] mb-6">Questions fréquentes</h2>
                                    <div className="space-y-3">
                                        {faqs.map((faq, index) => (
                                            <details key={index} className="border border-[#e8eef6] rounded-lg">
                                                <summary className="cursor-pointer px-4 py-3 flex items-center justify-between font-semibold text-[#1b2331] text-[12px]">
                                                    <span>{faq.q}</span>
                                                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                                                </summary>
                                                <div className="px-4 py-3 border-t border-[#e8eef6] text-[12px] text-[#7f8796]">{faq.a}</div>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl p-6 border border-[#e8eef6] sticky top-4">
                                    <h3 className="text-[18px] font-extrabold text-[#1b2331] mb-2">Postulez dès maintenant</h3>
                                    <p className="text-[12px] text-[#7f8796] mb-4">Rejoignez les {job.applicants ?? 0} candidat{(job.applicants ?? 0) !== 1 ? "s" : ""} qui ont déjà postulé.</p>
                                    <Button onClick={handleApply} disabled={applying} className="w-full rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-10 text-[12px] font-semibold mb-3">
                                        {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Postuler
                                    </Button>
                                    <Link href="/simulation-entretien/config">
                                        <Button variant="outline" className="w-full rounded-full border-[#d8deeb] h-10 text-[12px]">
                                            Préparer mon entretien
                                        </Button>
                                    </Link>
                                    <div className="mt-4 pt-4 border-t border-[#e8eef6]">
                                        <p className="text-[10px] text-[#9aa3b2] text-center">Offre publiée {formatPosted(job.publishDate)}</p>
                                        {job.endDate && <p className="text-[10px] text-[#9aa3b2] text-center mt-1">Clôture le {new Date(job.endDate).toLocaleDateString("fr-FR")}</p>}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
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
                            <Link href="//entreprise"><Button className="h-8 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] text-[12px]">Espace entreprise</Button></Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
