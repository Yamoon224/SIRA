"use client"

import { useState } from "react"
import Link from "next/link"
import { Globe, Phone, Mail, Users, UserCheck } from "lucide-react"

const company = {
    name: "Pitch",
    logo: "/pitch-logo-black.jpg",
    cover: "/ux-presentation-meeting.jpg",
    sector: "Fintech",
    location: "Abidjan, Plateau",
    employees: 240,
    subscribers: 9800,
    website: "revolut.com",
    phone: "+225 01 02 03 04 05",
    email: "info@revolut.com",
    presentation: {
        description: "Pitch développe des solutions technologiques de nouvelle génération pour digitaliser les administrations publiques et les services financiers en Afrique.\nDepuis plus de 10 ans, nous accompagnons les États dans leur transformation digitale avec des outils concrets, pensés pour simplifier le travail des agents publics.\nDéployés dans plus de 15 administrations, nos logiciels automatisent la collecte des recettes et la gestion des dépenses.\nRejoindre Pitch, c'est intégrer :",
        points: [
            "Une structure à taille humaine, portée par des projets à fort impact",
            "Un cadre stimulant, mêlant innovation technologique et enjeux métiers complexes",
            "De vraies perspectives d'évolution, avec une montée en compétences rapide",
        ],
    },
    recherche: {
        description: "Pitch recherche des profils qui veulent mettre leurs talents au service de la croissance de pays émergents avec l'envie de contribuer à des projets utiles et ambitieux.",
        values: [
            { key: "Détermination", desc: "aller au bout des sujets, identifier un problème puis trouver LA solution" },
            { key: "Ownership", desc: "prendre la responsabilité de ses missions et s'impliquer pleinement dans la réussite collective d'Pitch" },
            { key: "Engagement", desc: "être prêt à se mobiliser pour atteindre nos objectifs, en équipe" },
        ],
        note: "Nous aimons les personnes curieuses, rigoureuses, avec une vraie appétence pour la tech et les sujets publics.",
    },
    culture: [
        "Primes de performance",
        "Épargne salariale avec abondement de 800.000 FCFA par mois",
        "Couverture CNPS, prise en charge à 100%",
        "Accès à la salle de GYM du Pass Premium à 50%",
        "2 jours de télétravail par semaine",
        "Séminaires et teambuildings réguliers",
    ],
    teamPhotos: [
        "/junior-developer-team.jpg",
        "/international-business-team.jpg",
        "/database-engineer-workspace.jpg",
        "/ux-presentation-meeting.jpg",
    ],
    similarCompanies: [
        {
            name: "Twitter",
            logo: "/generic-bird-logo.png",
            sector: "Développement de logiciels",
            location: "Abidjan, Côte d'Ivoire",
            tag: "zéro",
            description: "La vie ne consiste pas à travailler, mais à donner un sens, nous croyons que le véritable changement...",
            tags: ["Marketing", "Conception"],
        },
        {
            name: "Pitch",
            logo: "/pitch-logo-black.jpg",
            sector: "Édition en ligne",
            location: "Abidjan, Côte d'Ivoire",
            tag: "3 offres",
            description: "Pitch est la plateforme de pitch pour en un. De la création de présentations originales à la conclusion d'affaires...",
            tags: ["Marketing", "Conception"],
        },
    ],
}

export default function EntrepriseDetailPage() {
    const [activeTab, setActiveTab] = useState<"profil" | "jobs">("profil")

    return (
        <div className="min-h-screen bg-white text-[#1b2331]">
            {/* Header */}
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
                        <button className="h-8 px-4 rounded-full text-[12px] bg-[#2157d3] hover:bg-[#1d4cb9] text-white">
                            Espace entreprise
                        </button>
                    </div>
                </div>
            </header>

            {/* Cover + Profile */}
            <div className="relative">
                {/* Cover image */}
                <div className="h-[220px] sm:h-[260px] overflow-hidden">
                    <img src={company.cover} alt="cover" className="w-full h-full object-cover" />
                </div>

                {/* Profile bar */}
                <div className="mx-auto max-w-[860px] px-4">
                    <div className="relative -mt-10 flex items-end gap-4 pb-4 border-b border-[#e8edf6]">
                        {/* Logo */}
                        <div className="w-[72px] h-[72px] rounded-full bg-black flex items-center justify-center flex-shrink-0 border-4 border-white shadow">
                            <img src={company.logo} alt={company.name} className="w-[54px] h-[54px] rounded-full object-cover" />
                        </div>

                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
                            <div>
                                <h1 className="text-[20px] font-extrabold text-[#1b2331]">{company.name}</h1>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-[#7f8796]">
                                    <span className="flex items-center gap-1 text-[#2f6de6]">
                                        <span className="text-[10px]">✦</span> Fintech
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span>📍</span> Abidjan, Plateau
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="h-7 px-4 rounded-full border border-[#d8deeb] text-[11px] text-[#1b2331] hover:border-[#2f6de6] bg-white">
                                    Suivre
                                </button>
                                {/* Tabs inline */}
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
                                        Jobs <span className="w-4 h-4 rounded-full bg-white/20 text-[9px] flex items-center justify-center">2</span>
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
                        {/* Présentation */}
                        <section>
                            <h2 className="text-[20px] font-extrabold text-[#1b2331] mb-3">Présentation</h2>
                            <p className="text-[13px] text-[#4e5a6e] leading-[1.7] whitespace-pre-line mb-4">
                                {company.presentation.description}
                            </p>
                            <ul className="space-y-1.5">
                                {company.presentation.points.map((p, i) => (
                                    <li key={i} className="text-[13px] text-[#4e5a6e] flex items-start gap-2">
                                        <span className="mt-1 flex-shrink-0">•</span> {p}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Ce qu'ils recherchent */}
                        <section>
                            <h2 className="text-[20px] font-extrabold text-[#1b2331] mb-3">Ce qu'ils recherchent</h2>
                            <p className="text-[13px] text-[#4e5a6e] leading-[1.7] mb-4">{company.recherche.description}</p>
                            <p className="text-[13px] text-[#4e5a6e] mb-2">Nos valeurs clés :</p>
                            <ul className="space-y-1.5 mb-4">
                                {company.recherche.values.map((v, i) => (
                                    <li key={i} className="text-[13px] text-[#4e5a6e] flex items-start gap-2">
                                        <span className="mt-1 flex-shrink-0">•</span>
                                        <span><strong>{v.key}</strong> : {v.desc}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-[13px] text-[#4e5a6e] leading-[1.7]">{company.recherche.note}</p>
                        </section>

                        {/* Culture et valeur */}
                        <section>
                            <h2 className="text-[20px] font-extrabold text-[#1b2331] mb-3">Culture et valeur</h2>
                            <ul className="space-y-1.5">
                                {company.culture.map((v, i) => (
                                    <li key={i} className="text-[13px] text-[#4e5a6e] flex items-start gap-2">
                                        <span className="mt-1 flex-shrink-0">•</span> {v}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Contact + Stats + Social */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#e8edf6]">
                            {/* Contact */}
                            <div>
                                <h3 className="text-[13px] font-semibold text-[#2f6de6] mb-4">Contact</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                        <Globe className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] text-[#9aa3b2]">Site web</p>
                                            <p className="font-medium">{company.website}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                        <Phone className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] text-[#9aa3b2]">Numéro de téléphone</p>
                                            <p className="font-medium">{company.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                        <Mail className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] text-[#9aa3b2]">E-mail</p>
                                            <p className="font-medium">{company.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 content-start">
                                <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                    <Users className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] text-[#9aa3b2]">Localisation</p>
                                        <p className="font-semibold text-[13px]">{company.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                    <span className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5 text-[10px] leading-4">🏢</span>
                                    <div>
                                        <p className="text-[10px] text-[#9aa3b2]">Secteur d'activité</p>
                                        <p className="font-semibold text-[13px]">{company.sector}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                    <Users className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] text-[#9aa3b2]">Employés</p>
                                        <p className="font-semibold text-[13px]">{company.employees}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-[12px] text-[#4e5a6e]">
                                    <UserCheck className="w-4 h-4 text-[#9aa3b2] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] text-[#9aa3b2]">Abonnés</p>
                                        <p className="font-semibold text-[13px]">{company.subscribers.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social */}
                            <div>
                                <h3 className="text-[13px] font-semibold text-[#1b2331] mb-4">Suivez-nous sur</h3>
                                <a
                                    href="#"
                                    className="inline-flex items-center justify-center w-9 h-9 bg-[#0a66c2] text-white rounded-lg hover:bg-[#085bb5]"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Team photos */}
                        <section>
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                {company.teamPhotos.slice(0, 3).map((photo, i) => (
                                    <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden">
                                        <img src={photo} alt={`team-${i}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center">
                                <div className="w-1/3 aspect-[4/3] rounded-xl overflow-hidden">
                                    <img src={company.teamPhotos[3]} alt="team-3" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </section>

                        {/* Autres entreprises */}
                        <section>
                            <h2 className="text-[18px] font-extrabold text-[#1b2331] text-center mb-6">
                                Autres entreprises que vous pouvez consulter
                            </h2>
                            <div className="flex justify-center gap-4 flex-wrap">
                                {company.similarCompanies.map((c, i) => (
                                    <div key={i} className="w-[220px] rounded-2xl border border-[#e5e9f2] bg-white p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#f0f3fb]">
                                                <img src={c.logo} alt={c.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[9px] border border-[#d8deeb] text-[#7f8796] rounded-full px-2 py-0.5">{c.tag}</span>
                                        </div>
                                        <h3 className="text-[13px] font-bold text-[#1b2331]">{c.name}</h3>
                                        <p className="text-[10px] text-[#9aa3b2]">{c.sector}</p>
                                        <p className="mt-2 text-[10px] text-[#7f8796] leading-[1.5] line-clamp-3">{c.description}</p>
                                        <div className="mt-3 flex gap-1 flex-wrap">
                                            {c.tags.map(tag => (
                                                <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#5b6f98]">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "jobs" && (
                    <div className="space-y-8">
                        {/* Barre de recherche et filtres */}
                        <div className="bg-white rounded-2xl border border-[#e8edf6] px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 shadow-sm">
                            <input
                                type="text"
                                placeholder="Rechercher par job, mot-clé ou entreprise"
                                className="flex-1 h-10 rounded-full border border-[#e8edf6] px-4 text-[13px] text-[#1b2331] placeholder:text-[#9aa3b2] outline-none bg-white"
                            />
                            <div className="flex flex-wrap gap-2">
                                <button className="h-8 px-4 rounded-full border border-[#e8edf6] text-[12px] text-[#1b2331] bg-white hover:border-[#2f6de6]">Type de job</button>
                                <button className="h-8 px-4 rounded-full border border-[#e8edf6] text-[12px] text-[#1b2331] bg-white hover:border-[#2f6de6]">Télétravail</button>
                                <button className="h-8 px-4 rounded-full border border-[#e8edf6] text-[12px] text-[#1b2331] bg-white hover:border-[#2f6de6]">Professions</button>
                                <button className="h-8 px-4 rounded-full bg-[#2f6de6] text-white border border-[#2f6de6] hover:bg-[#2157d3]">🎯 Tous les filtres</button>
                            </div>
                        </div>

                        {/* Liste des jobs */}
                        <div className="space-y-5">
                            {([
                                {
                                    title: "Business Developer International (H/F)",
                                    location: "Mercury, Zama",
                                    remote: "Télétravail fréquent",
                                    posted: "il y a 12 jours",
                                    image: "/ux-presentation-meeting.jpg",
                                    tags: ["CDI"],
                                },
                                {
                                    title: "Business Developer Junior (H/F)",
                                    location: "Plateau",
                                    remote: "Télétravail fréquent",
                                    posted: "il y a 12 jours",
                                    image: "/ux-presentation-meeting.jpg",
                                    tags: ["CDI"],
                                },
                                {
                                    title: "Data base engineer SQL et PLSQL (H/F)",
                                    location: "Signature Plus 7508",
                                    remote: "-",
                                    posted: "il y a 12 jours",
                                    image: "/ux-presentation-meeting.jpg",
                                    tags: ["CDI"],
                                },
                            ]).map((job, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-[#e8edf6] flex flex-col md:flex-row items-stretch overflow-hidden shadow-sm">
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-[16px] text-[#1b2331] mb-2">{job.title}</h3>
                                            <div className="flex flex-wrap gap-4 text-[12px] text-[#7f8796] mb-2">
                                                <span className="flex items-center gap-1">📍 {job.location}</span>
                                                <span className="flex items-center gap-1">💻 {job.remote}</span>
                                                <span className="flex items-center gap-1">🗓️ {job.posted}</span>
                                            </div>
                                            <div className="flex gap-2 mb-2">
                                                {job.tags.map((tag, idx) => (
                                                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#5b6f98] border border-[#e8edf6]">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="mt-2 text-[#b9c8ec] hover:text-[#2f6de6] w-6 h-6 flex items-center justify-center">
                                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                    </div>
                                    <div className="w-full md:w-56 h-36 md:h-auto flex-shrink-0 overflow-hidden">
                                        <img src={job.image} alt="job" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-[#06080d] text-white pt-12 pb-8 mt-12">
                <div className="mx-auto max-w-[1180px] px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                        <div>
                            <img src="/images/logo.png" alt="Goriya" className="h-10 w-auto brightness-0 invert mb-4" />
                            <p className="text-[13px] text-[#9098a7] leading-[1.7]">
                                Goriya est une plateforme web intelligente qui permet aux utilisateurs d'uploader leur CV, lettre de motivation ou tout autre document professionnel afin d'obtenir une analyse intelligente par IA.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Concept</h4>
                            <ul className="space-y-2 text-[13px] text-[#9098a7]">
                                <li><Link href="/explorer-emplois" className="hover:text-white">Trouve un emploi</Link></li>
                                <li><Link href="/offres" className="hover:text-white">Tarification</Link></li>
                                <li><Link href="/auth/settings" className="hover:text-white">Politique de confidentialité</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Recevoir les notifications d'emploi</h4>
                            <p className="text-[13px] text-[#9098a7] mb-4">Les dernières nouvelles sur l'emploi, les articles, envoyés dans votre boite de réception chaque semaine.</p>
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
                            <button className="h-8 px-4 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] text-white text-[12px]">Espace entreprise</button>
                        </div>
                        <div className="flex items-center gap-3 text-[#5a6070]">
                            {["f", "t", "in", "yt", "ig"].map((icon) => (
                                <a key={icon} href="#" className="w-7 h-7 rounded-full border border-[#2a2f3a] flex items-center justify-center text-[10px] hover:border-[#2f6de6] hover:text-white">{icon}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
