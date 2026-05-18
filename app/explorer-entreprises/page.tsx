"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, Factory, ShoppingCart, Utensils, BriefcaseBusiness, Cpu, ChevronRight } from "lucide-react"

const sectors = [
    { name: "Santé / Social / Environnement", icon: Globe },
    { name: "Industrie", icon: Factory },
    { name: "Distribution", icon: ShoppingCart },
    { name: "Food et boisson", icon: Utensils },
    { name: "Conseil / Audit", icon: BriefcaseBusiness },
    { name: "Tech", icon: Cpu },
]

const companyCards = [
    { name: "Marketing REVOLUT", logo: "/revolut-logo.png", tag: "3 offres", active: false },
    { name: "Twitter", logo: "/generic-bird-logo.png", tag: "zéro", active: false },
    { name: "Pitch", logo: "/pitch-logo-black.jpg", tag: "3 offres", active: false },
    { name: "Marketing REVOLUT", logo: "/revolut-logo.png", tag: "3 offres", active: false },
    { name: "Pitch", logo: "/pitch-logo-black.jpg", tag: "3 offres", active: true },
]

const companyDescription =
    "Revolut Retaille renforce la passion pour le sport en offrant l'expérience de paris sportifs la plus divertissante."

export default function ExploreCompaniesPage() {
    const newCompanies = [...companyCards, ...companyCards]
    const topRecruiting = companyCards.slice(0, 4)

    const renderCompanyCard = (card: (typeof companyCards)[number], index: number) => (
        <article
            key={`${card.name}-${index}`}
            className={`rounded-[14px] border bg-white p-3 ${card.active ? "border-[#2f6de6]" : "border-[#d8deeb]"}`}
        >
            <div className="flex items-center justify-between">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#f3f5fa] flex items-center justify-center">
                    <img src={card.logo} alt={card.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] border border-[#c7d5f4] text-[#5c74af] rounded-full px-2 py-0.5">{card.tag}</span>
            </div>
            <h3 className="mt-2 text-[12px] font-bold text-[#1d2432]">{card.name}</h3>
            <p className="text-[9px] text-[#7e889c]">Technologie, information et internet</p>
            <p className="text-[9px] text-[#a2acbd] mt-0.5">Abidjan, Côte d'ivoire</p>
            <p className="mt-2 text-[9px] leading-4 text-[#8a95a8]">{companyDescription}</p>
            <div className="mt-3 flex gap-2">
                <span className="text-[8px] rounded-full bg-[#eff4ff] text-[#5b6f98] px-2 py-0.5">Marketing</span>
                <span className="text-[8px] rounded-full bg-[#eff4ff] text-[#5b6f98] px-2 py-0.5">Conception</span>
            </div>
        </article>
    )

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
                    <h1 className="text-[28px] sm:text-[42px] leading-none font-extrabold text-[#121826]">Explorer les entreprises.</h1>
                    <p className="mt-5 text-[11px] sm:text-[12px] text-[#7f8796] max-w-[760px] mx-auto leading-4">
                        Ne vous contentez pas de postuler, découvrez l'histoire derrière chaque offre d'emploi. Naviguez à travers notre
                        sélection d'entreprises, lisez les témoignages d'employés et familiarisez-vous avec la culture de chaque
                        organisation. C'est ici que vous trouvez l'entreprise où vos compétences et vos valeurs s'aligneront
                        parfaitement.
                    </p>
                </section>

                <section className="mt-10 sm:mt-14">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#1b2331]">Secteur d'activité</h2>
                        <Link href="#" className="flex items-center text-[10px] text-[#1b2331] font-semibold">
                            Découvrir
                            <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sectors.map((sector) => {
                            const Icon = sector.icon
                            return (
                                <article key={sector.name} className="rounded-xl border border-[#d7ddea] bg-white overflow-hidden">
                                    <div className="px-4 pt-5 pb-3 text-center">
                                        <Icon className="w-4 h-4 text-[#2f6de6] mx-auto" />
                                        <p className="mt-3 text-[10px] font-semibold text-[#2f5099]">{sector.name}</p>
                                    </div>
                                    <div className="h-7 bg-gradient-to-r from-[#2f81f1] to-[#1539be] text-white text-[11px] font-semibold flex items-center justify-center">
                                        Découvrir
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </section>

                <section className="mt-10 sm:mt-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[18px] sm:text-[26px] font-extrabold text-[#1b2331]">Nouvelles entreprises à explorer</h2>
                        <Link href="#" className="flex items-center text-[10px] text-[#1b2331] font-semibold">
                            Découvrir
                            <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {newCompanies.map((card, index) => renderCompanyCard(card, index))}
                    </div>
                </section>

                <section className="mt-10 sm:mt-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[18px] sm:text-[26px] font-extrabold text-[#1b2331]">Les entreprises qui recrutent le plus souvent</h2>
                        <Link href="#" className="flex items-center text-[10px] text-[#1b2331] font-semibold">
                            Découvrir
                            <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {topRecruiting.map((card, index) => renderCompanyCard(card, index))}
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
                            <h4 className="font-bold text-white">Concept</h4>
                            <ul className="mt-4 space-y-2 text-[#9098a7] text-sm">
                                <li><Link href="/emplois">Trouve un emploi</Link></li>
                                <li><Link href="/offres">Tarification</Link></li>
                                <li><Link href="/auth/settings">Politique de confidentialité</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Recevoir les notifications d'emploi</h4>
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
