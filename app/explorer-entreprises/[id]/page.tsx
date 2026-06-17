"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Globe, Phone, Mail, Users, UserCheck, MapPin, Clock, Building2, Loader2, AlertCircle } from "lucide-react"
import { companyService } from "@/lib/api/company.service"
import { ICompany, IJobOffer } from "@/lib/@types/entities"

export default function EntrepriseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const companyId = params?.id as string

    const [company, setCompany] = useState<ICompany | null>(null)
    const [jobs, setJobs] = useState<IJobOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [activeTab, setActiveTab] = useState<"profil" | "jobs">("profil")

    useEffect(() => {
        if (!companyId) return
        setLoading(true)
        companyService.getCompanyById(companyId)
            .then((res: any) => {
                const data = res?.data?.data ?? res?.data ?? res
                if (!data || !data.id) { setError(true); return }
                setCompany(data)
                return companyService.getCompanyJobs(data.id)
            })
            .then((res: any) => {
                if (!res) return
                const data = res?.data?.data ?? res?.data ?? []
                setJobs(Array.isArray(data) ? data : [])
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [companyId])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#2f6de6]" />
            </div>
        )
    }

    if (error || !company) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-4">
                <AlertCircle className="w-10 h-10 text-[#e07b10]" />
                <h2 className="text-lg font-bold text-[#1b2331]">Entreprise introuvable</h2>
                <p className="text-[13px] text-[#9aa3b2]">Cette entreprise n'existe pas ou n'est plus disponible.</p>
                <Link href="/explorer-entreprises" className="text-[#2f6de6] text-sm font-semibold hover:underline">
                    Retour aux entreprises
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white text-[#1b2331]">
            <header className="bg-white border-b border-[#edf1f6]">
                <div className="mx-auto max-w-[1180px] px-4 h-[64px] flex items-center justify-between">
                    <Link href="/">
                        <img src="/images/logo.png" alt="Goriya" className="h-8 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-[13px] text-[#7a8495] font-medium">
                        <Link href="/" className="text-[#2f6de6]">Accueil</Link>
                        <Link href="/explorer-emplois" className="hover:text-[#2f6de6]">Trouve un emploi</Link>
                        <Link href="/offres" className="hover:text-[#2f6de6]">Tarifs d'abonnement</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link href="/auth/signin">
                            <button className="h-8 px-4 rounded-full text-[12px] border border-[#b9c8ec] text-[#2f6de6] bg-white hover:bg-[#f4f7ff]">
                                Connexion
                            </button>
                        </Link>
                        <Link href="https://goriya-entreprise.vercel.app">
                            <button className="h-8 px-4 rounded-full text-[12px] bg-[#2157d3] hover:bg-[#1d4cb9] text-white">
                                Espace entreprise
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Cover + Profile */}
            <div className="relative">
                <div className="h-[220px] sm:h-[260px] overflow-hidden bg-gradient-to-r from-[#1539be] to-[#2f81f1]">
                    {company.coverImage && (
                        <img src={company.coverImage} alt="cover" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                    )}
                </div>

                <div className="mx-auto max-w-[860px] px-4">
                    <div className="relative -mt-10 flex items-end gap-4 pb-4 border-b border-[#e8edf6]">
                        <div className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center flex-shrink-0 border-4 border-white shadow overflow-hidden">
                            {company.logo
                                ? <img src={company.logo} alt={company.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                : <Building2 className="w-8 h-8 text-[#2f6de6]" />
                            }
                        </div>

                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
                            <div>
                                <h1 className="text-[20px] font-extrabold text-[#1b2331]">{company.name}</h1>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-[#7f8796]">
                                    {company.sector && (
                                        <span className="text-[#2f6de6]">✦ {company.sector}</span>
                                    )}
                                    {(company.location || company.headquarters) && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {company.location || company.headquarters}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="h-7 px-4 rounded-full border border-[#d8deeb] text-[11px] text-[#1b2331] hover:border-[#2f6de6] bg-white">
                                    Suivre
                                </button>
                                <div className="flex rounded-full border border-[#d8deeb] overflow-hidden bg-white text-[11px]">
                                    <button
                                        onClick={() => setActiveTab("profil")}
                                        className={`px-4 h-7 font-medium transition-colors ${activeTab === "profil" ? "bg-white text-[#1b2331]" : "text-[#9aa3b2] hover:text-[#1b2331]"}`}
                                    >
                                        Profil
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("jobs")}
                                        className={`px-4 h-7 font-medium transition-colors flex items-center gap-1 ${activeTab === "jobs" ? "bg-[#2f6de6] text-white" : "text-[#9aa3b2] hover:text-[#1b2331]"}`}
                                    >
                                        Jobs
                                        {jobs.length > 0 && (
                                            <span className="w-4 h-4 rounded-full bg-white/20 text-[9px] flex items-center justify-center">{jobs.length}</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <main className="mx-auto max-w-[860px] px-4 py-8">
                {activeTab === "profil" && (
                    <div className="space-y-8">
                        {/* About */}
                        {company.about && (
                            <section>
                                <h2 className="text-[20px] font-extrabold text-[#1b2331] mb-3">Présentation</h2>
                                <p className="text-[13px] text-[#4e5a6e] leading-[1.7] whitespace-pre-line">{company.about}</p>
                            </section>
                        )}

                        {/* Contact + Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#e8edf6]">
                            <div>
                                <h3 className="text-[13px] font-semibold text-[#2f6de6] mb-4">Contact</h3>
                                <div className="space-y-3">
                                    {company.website && (
                                        <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                            <Globe className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-[#9aa3b2]">Site web</p>
                                                <p className="font-medium">{company.website}</p>
                                            </div>
                                        </div>
                                    )}
                                    {company.phone && (
                                        <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                            <Phone className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-[#9aa3b2]">Numéro de téléphone</p>
                                                <p className="font-medium">{company.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {company.email && (
                                        <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                            <Mail className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-[#9aa3b2]">E-mail</p>
                                                <p className="font-medium">{company.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 content-start">
                                {(company.location || company.headquarters) && (
                                    <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                        <MapPin className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] text-[#9aa3b2]">Localisation</p>
                                            <p className="font-semibold text-[13px]">{company.location || company.headquarters}</p>
                                        </div>
                                    </div>
                                )}
                                {company.sector && (
                                    <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                        <span className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5 text-[10px] leading-4">🏢</span>
                                        <div>
                                            <p className="text-[10px] text-[#9aa3b2]">Secteur d'activité</p>
                                            <p className="font-semibold text-[13px]">{company.sector}</p>
                                        </div>
                                    </div>
                                )}
                                {company.companySize && (
                                    <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                        <Users className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] text-[#9aa3b2]">Taille</p>
                                            <p className="font-semibold text-[13px]">{company.companySize}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-[13px] font-semibold text-[#1b2331] mb-4">Suivez-nous sur</h3>
                                {company.socialLinks?.length > 0 ? (
                                    <a
                                        href={company.socialLinks[0]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center w-9 h-9 bg-[#0a66c2] text-white rounded-lg hover:bg-[#085bb5]"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </a>
                                ) : (
                                    <p className="text-[11px] text-[#9aa3b2]">Aucun réseau social renseigné.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "jobs" && (
                    <div className="space-y-5">
                        {jobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Building2 className="w-8 h-8 text-[#c8d0df] mb-3" />
                                <p className="text-[13px] font-semibold text-[#1b2331]">Aucune offre disponible</p>
                                <p className="text-[11px] text-[#9aa3b2] mt-1">Cette entreprise n'a pas encore publié d'offres.</p>
                            </div>
                        ) : jobs.map((job) => (
                            <Link key={job.id} href={`/explorer-emplois/${job.id}`}>
                                <div className="bg-white rounded-2xl border border-[#e8edf6] flex flex-col md:flex-row items-stretch overflow-hidden shadow-sm hover:shadow-md hover:border-[#2f6de6] transition-all">
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-[16px] text-[#1b2331] mb-2">{job.title}</h3>
                                            <div className="flex flex-wrap gap-4 text-[12px] text-[#7f8796] mb-2">
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>
                                                {job.salary && <span className="text-[#22a05b] font-semibold">{job.salary}</span>}
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#5b6f98] border border-[#e8edf6]">{job.type}</span>
                                                {job.experience && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f3eeff] text-[#7c3aed] border border-[#e8edf6]">{job.experience}</span>
                                                )}
                                            </div>
                                        </div>
                                        {job.description && (
                                            <p className="mt-3 text-[12px] text-[#7f8796] line-clamp-2">{job.description}</p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <footer className="bg-[#06080d] text-white pt-12 pb-8 mt-12">
                <div className="mx-auto max-w-[1180px] px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                        <div>
                            <img src="/images/logo.png" alt="Goriya" className="h-10 w-auto brightness-0 invert mb-4" />
                            <p className="text-[13px] text-[#9098a7] leading-[1.7]">
                                Goriya est une plateforme web intelligente qui permet aux utilisateurs d'uploader leur CV afin d'obtenir une analyse intelligente par IA.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Concept</h4>
                            <ul className="space-y-2 text-[13px] text-[#9098a7]">
                                <li><Link href="/explorer-emplois" className="hover:text-white">Trouve un emploi</Link></li>
                                <li><Link href="/offres" className="hover:text-white">Tarification</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Recevoir les notifications d'emploi</h4>
                            <p className="text-[13px] text-[#9098a7] mb-4">Les dernières nouvelles sur l'emploi envoyées dans votre boite de réception chaque semaine.</p>
                            <div className="flex gap-2">
                                <input type="email" placeholder="Adresse e-mail" className="flex-1 h-9 rounded-full bg-[#0f121a] border border-[#2a2f3a] px-4 text-[12px] text-white placeholder:text-[#5a6070] outline-none" />
                                <button className="h-9 px-4 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] text-white text-[12px]">S'abonner</button>
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-[#1c202a] flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[12px] text-[#6f7887]">2026 © Goriya. Tous droits réservés.</p>
                        <div className="flex items-center gap-3">
                            <Link href="/auth/signin">
                                <button className="h-8 px-4 rounded-full border border-[#374153] text-[#d9e5ff] text-[12px] bg-transparent hover:bg-[#1c2030]">Connexion</button>
                            </Link>
                            <Link href="https://goriya-entreprise.vercel.app">
                                <button className="h-8 px-4 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] text-white text-[12px]">Espace entreprise</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
