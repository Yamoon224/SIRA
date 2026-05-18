"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Search,
    SlidersHorizontal,
    MapPin,
    BriefcaseBusiness,
    Clock3,
    Heart,
    Plus,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

const filterChips = [
    { label: "Salaire affiché", count: 53 },
    { label: "Télétravail possible", count: 22 },
    { label: "Poste salarié", count: 67 },
    { label: "Entreprise émergente", count: 91 },
    { label: "Entreprise établie", count: 144 },
]

const popularSearches = [
    "Communication",
    "Commercial",
    "Marketing",
    "Graphisme",
    "Data",
    "Product manager",
    "Développeur",
    "Finance",
    "Customer success manager",
    "Juridique",
]

const jobs = [
    {
        title: "Data base engineer SQL et PLSQL (H/F)",
        company: "Agence fun side",
        location: "Côti",
        mode: "Hybride",
        posted: "Il y a 23 jours",
        logo: "/generic-bird-logo.png",
        image: "/database-engineer-workspace.jpg",
        highlighted: true,
    },
    {
        title: "Business Developer Junior (H/F)",
        company: "Pitech",
        location: "Côti",
        mode: "Télétravail fréquent",
        posted: "Il y a 2 jours",
        logo: "/pitch-logo-black.jpg",
        image: "/junior-developer-team.jpg",
    },
    {
        title: "Business Developer International (H/F)",
        company: "Masonry Zone 4",
        location: "Côti",
        mode: "Télétravail fréquent",
        posted: "Il y a 29 jours",
        logo: "/revolut-logo.png",
        image: "/international-business-team.jpg",
    },
    {
        title: "Business Developer Junior (H/F)",
        company: "Pitech",
        location: "Côti",
        mode: "Télétravail fréquent",
        posted: "Il y a 2 jours",
        logo: "/pitch-logo-black.jpg",
        image: "/junior-developer-team.jpg",
    },
    {
        title: "Data base engineer SQL et PLSQL (H/F)",
        company: "Agence fun side",
        location: "Côti",
        mode: "Hybride",
        posted: "Il y a 23 jours",
        logo: "/generic-bird-logo.png",
        image: "/database-engineer-workspace.jpg",
    },
    {
        title: "Business Developer Junior (H/F)",
        company: "Pitech",
        location: "Côti",
        mode: "Télétravail fréquent",
        posted: "Il y a 2 jours",
        logo: "/pitch-logo-black.jpg",
        image: "/junior-developer-team.jpg",
    },
    {
        title: "Business Developer Junior (H/F)",
        company: "Pitech",
        location: "Côti",
        mode: "Télétravail fréquent",
        posted: "Il y a 2 jours",
        logo: "/pitch-logo-black.jpg",
        image: "/junior-developer-team.jpg",
    },
    {
        title: "Business Developer Junior (H/F)",
        company: "Pitech",
        location: "Côti",
        mode: "Télétravail fréquent",
        posted: "Il y a 2 jours",
        logo: "/pitch-logo-black.jpg",
        image: "/junior-developer-team.jpg",
    },
    {
        title: "Business Developer International (H/F)",
        company: "Masonry Zone 4",
        location: "Côti",
        mode: "Télétravail fréquent",
        posted: "Il y a 29 jours",
        logo: "/revolut-logo.png",
        image: "/international-business-team.jpg",
    },
]

const companies = [
    { name: "Marketing REVOLUT", logo: "/revolut-logo.png", tag: "3 offres" },
    { name: "Twitter", logo: "/generic-bird-logo.png", tag: "zéro" },
    { name: "Pitch", logo: "/pitch-logo-black.jpg", tag: "3 offres" },
    { name: "Marketing REVOLUT", logo: "/revolut-logo.png", tag: "3 offres" },
    { name: "Pitch", logo: "/pitch-logo-black.jpg", tag: "3 offres" },
]

const jobCategories = [
    "Emploi Éducation",
    "Emploi Ressources humaines",
    "Emploi Santé",
    "Emploi Informatique",
    "Emploi Marketing",
    "Emploi Graphisme",
    "Emploi Communication",
    "Emploi Éducation",
    "Emploi Industrie",
    "Emploi Finance",
    "Emploi Technologie",
    "Emploi Audit",
    "Emploi Juridique",
    "Emploi Logistique",
    "Emploi Restauration",
    "Emploi Recrutement",
    "Emploi Environnement",
    "Emploi Ressources naturelles",
    "Emploi Notariat",
    "Emploi Immobilier",
    "Emploi Comptabilité",
    "Emploi Audit",
    "Emploi Distribution",
    "Emploi Assurance",
    "Emploi Banque",
    "Emploi Publicité",
    "Emploi Immobilier",
    "Emploi Finance",
    "Emploi Qualité",
    "Emploi Conseil",
    "Emploi Administratif",
    "Emploi Relations publiques",
    "Emploi Relation client",
]

const careerCards = [
    {
        title: "Présentations des révisions UX",
        text: "Comment créer des présentations convaincantes qui impressionnent vos collègues et vos managers ?",
        image: "/ux-presentation-meeting.jpg",
    },
    {
        title: "Migration vers Linear 101",
        text: "Lancer simplifie les projets logiciels, les sprints, les tickets et le suivi des bugs. Voici comment commencer.",
        image: "/team-migration-software.jpg",
    },
    {
        title: "Construisez votre pile d'API.",
        text: "La prolifération des API RESTful a été conjointement soutenue par une croissance des ressources disponibles pour les contraintes, les erreurs et les administratifs.",
        image: "/api-development-workspace.jpg",
    },
]

export default function JobListingsPage() {
    return (
        <div className="min-h-screen bg-[#f4f5f7] text-[#111827]">
            <header className="bg-[#f4f5f7]">
                <div className="mx-auto max-w-[1180px] px-4 h-[56px] sm:h-[64px] md:h-[72px] flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img src="/images/logo.png" alt="Goriya" className="h-8 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-[12px] text-[#7a8495] font-medium">
                        <Link href="/" className="text-[#2f6de6]">Accueil</Link>
                        <Link href="/emplois" className="hover:text-[#2f6de6]">Trouve un emploi</Link>
                        <Link href="/offres" className="hover:text-[#2f6de6]">Tarifs d'abonnement</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link href="/auth/signin">
                            <Button variant="outline" className="h-8 px-4 rounded-full text-[11px] border-[#b9c8ec] text-[#2f6de6] bg-white">
                                Connexion
                            </Button>
                        </Link>
                        <Button className="h-8 px-4 rounded-full text-[11px] bg-[#2157d3] hover:bg-[#1d4cb9]">Espace entreprise</Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1180px] px-4 pt-10 pb-16">
                <section className="text-center">
                    <h1 className="text-[30px] sm:text-[46px] leading-none font-extrabold text-[#121826]">Explorer les offres d'emploi.</h1>
                    <p className="mt-4 text-[11px] sm:text-[12px] text-[#7f8796] max-w-[760px] mx-auto leading-4">
                        Trouver l'opportunité qui correspond à vos compétences et à vos ambitions. Parcourez les dernières offres
                        publiées, filtrez selon vos critères et postulez directement depuis l'application.
                    </p>

                    <div className="mt-6 flex justify-center">
                        <form className="w-full max-w-[690px] relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b2]" />
                            <Input
                                className="h-11 rounded-full border-[#d8deeb] bg-white pl-10 pr-36 text-[12px]"
                                placeholder="Recherchez un emploi par industrie, poste, mot-clé ou entreprise."
                            />
                            <Button
                                type="submit"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] px-6 text-[11px]"
                            >
                                Recherche
                            </Button>
                        </form>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        {filterChips.map((chip) => (
                            <button
                                key={chip.label}
                                type="button"
                                className="h-7 rounded-full border border-[#d8deeb] px-3 text-[10px] text-[#7d8798] bg-white inline-flex items-center gap-2"
                            >
                                <SlidersHorizontal className="w-3 h-3" />
                                {chip.label}
                                <span>{chip.count}</span>
                            </button>
                        ))}
                        <button
                            type="button"
                            className="h-7 rounded-full bg-[#2f6de6] text-white px-3 text-[10px] inline-flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" />
                            Tous les filtres
                        </button>
                    </div>
                </section>

                <section className="mt-9">
                    <h2 className="text-[18px] sm:text-[22px] font-bold text-[#1b2331]">Recherches populaires</h2>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-b border-[#d8deeb] pb-3">
                        {popularSearches.map((item, index) => (
                            <button
                                key={item}
                                type="button"
                                className={`text-[10px] ${index === 0 ? "text-[#2f6de6] font-semibold" : "text-[#8f97a9]"}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="mt-3 space-y-3">
                        {jobs.map((job, index) => (
                            <article
                                key={`${job.title}-${index}`}
                                className={`rounded-[14px] border p-3 sm:p-4 ${job.highlighted ? "bg-[#eef3ff] border-[#8eb4ff]" : "bg-white border-[#d8deeb]"}`}
                            >
                                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                                    <div className="flex-1">
                                        <Link href="/emplois" className="hover:underline">
                                            <h3 className="text-[16px] font-bold text-[#1b2331]">{job.title}</h3>
                                        </Link>
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] text-[#7f8796]">
                                            <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                                            <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="w-3 h-3" />{job.company}</span>
                                            <span className="inline-flex items-center gap-1 rounded-full border border-[#d8deeb] px-2 py-0.5">{job.mode}</span>
                                        </div>
                                        <p className="mt-1 text-[9px] text-[#9aa3b2] inline-flex items-center gap-1"><Clock3 className="w-3 h-3" />{job.posted}</p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#f0f3fb]">
                                                <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                                            </div>
                                            <button type="button" className="text-[#9aa3b2] hover:text-[#2f6de6]">
                                                <Heart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-[230px] h-[95px] rounded-xl overflow-hidden bg-[#f0f3fb]">
                                        <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="text-center mt-6">
                        <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] px-8 h-10 text-[12px]">
                            <Plus className="w-4 h-4 mr-1" /> Voir plus
                        </Button>
                    </div>
                </section>

                <section className="mt-10 rounded-none bg-gradient-to-r from-[#2b7cf0] via-[#1e5ed4] to-[#153fbf] px-4 sm:px-6 py-8 text-white relative overflow-hidden">
                    <div className="absolute -left-14 bottom-2 w-36 h-36 rounded-full border-[14px] border-[#82b7ff] opacity-35" />
                    <h2 className="text-[18px] sm:text-[26px] font-bold mb-5 relative z-10">Entreprises populaires</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
                        {companies.map((company, index) => (
                            <article key={`${company.name}-${index}`} className="rounded-[12px] border border-[#c8d7fb] bg-white text-[#1b2331] p-3">
                                <div className="flex items-center justify-between">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-[#f0f3fb]">
                                        <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[9px] border border-[#c7d5f4] text-[#5c74af] rounded-full px-2 py-0.5">{company.tag}</span>
                                </div>
                                <h3 className="mt-2 text-[12px] font-semibold">{company.name}</h3>
                                <p className="text-[9px] text-[#7e889c]">Technologie, information et internet</p>
                                <p className="text-[9px] text-[#a2acbd] mt-0.5">Abidjan, Côte d'ivoire</p>
                                <p className="mt-2 text-[9px] leading-4 text-[#8a95a8]">Revolut Retaille renforce la passion pour le sport en offrant l'expérience de paris sportifs la plus divertissante.</p>
                                <div className="mt-3 flex gap-2">
                                    <span className="text-[8px] rounded-full bg-[#eff4ff] text-[#5b6f98] px-2 py-0.5">Marketing</span>
                                    <span className="text-[8px] rounded-full bg-[#eff4ff] text-[#5b6f98] px-2 py-0.5">Conception</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10">
                    <h2 className="text-[20px] sm:text-[28px] font-bold text-[#1b2331]">Catégories d'emploi</h2>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {jobCategories.map((category) => (
                            <button key={category} type="button" className="h-6 rounded-full border border-[#d8deeb] bg-white px-3 text-[9px] text-[#707b90]">
                                {category}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mt-14 pb-8">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[24px] sm:text-[36px] leading-none font-extrabold text-[#1b2331]">Prenez votre carrière en main</h2>
                        <div className="hidden sm:flex gap-2">
                            <button type="button" className="w-7 h-7 rounded-full border border-[#d8deeb] text-[#9aa3b2] inline-flex items-center justify-center"><ChevronLeft className="w-3 h-3" /></button>
                            <button type="button" className="w-7 h-7 rounded-full border border-[#d8deeb] text-[#9aa3b2] inline-flex items-center justify-center"><ChevronRight className="w-3 h-3" /></button>
                        </div>
                    </div>

                    <div className="inline-flex rounded-full border border-[#d8deeb] overflow-hidden mb-5 bg-white">
                        <button type="button" className="px-4 h-8 text-[10px] font-semibold text-[#2f6de6] bg-[#edf4ff]">Candidats</button>
                        <button type="button" className="px-4 h-8 text-[10px] text-[#7f8796]">Étudiants</button>
                        <button type="button" className="px-4 h-8 text-[10px] text-[#7f8796]">Fonctionnaire</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {careerCards.map((card) => (
                            <article key={card.title} className="rounded-xl border border-[#d8deeb] bg-white p-3">
                                <img src={card.image} alt={card.title} className="h-36 w-full rounded-md object-cover" />
                                <h3 className="mt-3 text-[18px] leading-none font-extrabold text-[#1b2331]">{card.title}</h3>
                                <p className="mt-2 text-[11px] leading-4 text-[#8a95a8]">{card.text}</p>
                            </article>
                        ))}
                    </div>

                    <div className="text-center mt-6">
                        <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] px-8 h-10 text-[12px]">
                            <Plus className="w-4 h-4 mr-1" /> Découvrir plus
                        </Button>
                    </div>
                </section>
            </main>

            <footer className="bg-[#06080d] text-white pt-10 sm:pt-14 pb-8">
                <div className="mx-auto max-w-[1180px] px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                        <div>
                            <img src="/images/logo.png" alt="Goriya" className="h-10 sm:h-12 w-auto brightness-0 invert" />
                            <p className="mt-4 text-sm text-[#9098a7]">
                                Goriya est une plateforme web intelligente qui permet aux utilisateurs d'uploader leur CV, lettre de
                                motivation ou tout autre document professionnel afin d'obtenir une analyse intelligente par IA.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Concept</h4>
                            <ul className="mt-4 space-y-2 text-[#9098a7] text-sm">
                                <li><Link href="/emplois">Trouve un emploi</Link></li>
                                <li><Link href="/offres">Tarification</Link></li>
                                <li><Link href="/auth/settings">Politique de confidentialité</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Recevoir les notifications d'emploi</h4>
                            <p className="text-sm text-[#9098a7] mt-3">
                                Les dernières nouvelles sur l'emploi, les articles, envoyés dans votre boîte de réception chaque
                                semaine.
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Input className="h-10 rounded-full border-[#2a2f3a] bg-[#0f121a] text-white" placeholder="Adresse e-mail" />
                                <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">S'abonner</Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-[#1c202a] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                        <p className="text-xs sm:text-sm text-[#6f7887]">2026 © Goriya. Tous droits réservés.</p>
                        <div className="flex items-center gap-2">
                            <Link href="/auth/signin"><Button variant="outline" className="h-8 rounded-full border-[#374153] text-[#d9e5ff] bg-transparent">Connexion</Button></Link>
                            <Button className="h-8 rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">Espace entreprise</Button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
