import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Users, ShieldCheck, Target } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata = {
    title: "À propos - Goriya",
    description: "Goriya, la plateforme IA qui connecte les talents ivoiriens aux meilleures opportunités de stage et d'emploi.",
}

const values = [
    {
        icon: Sparkles,
        title: "Innovation",
        desc: "On utilise l'intelligence artificielle pour rendre la recherche d'emploi plus rapide et plus juste.",
    },
    {
        icon: ShieldCheck,
        title: "Transparence",
        desc: "Des profils d'entreprises honnêtes, des offres claires, sans mauvaises surprises.",
    },
    {
        icon: Users,
        title: "Accessibilité",
        desc: "Une plateforme pensée pour tous les profils : étudiants, jeunes diplômés, professionnels.",
    },
    {
        icon: Target,
        title: "Impact",
        desc: "Notre objectif : réduire le temps entre 'je cherche' et 'j'ai décroché le poste'.",
    },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main>
                <section className="bg-[#1e7df2] text-white py-14 sm:py-20">
                    <div className="mx-auto max-w-[900px] px-4 text-center">
                        <h1 className="font-extrabold leading-tight text-3xl sm:text-5xl">
                            On aide les talents à decrocher le poste qui leur correspond
                        </h1>
                        <p className="mt-5 text-sm sm:text-base text-[#dbe8ff]">
                            Goriya est une plateforme IA qui connecte candidats et entreprises, en Côte d'Ivoire et au-delà.
                        </p>
                    </div>
                </section>

                <section className="py-14 sm:py-20">
                    <div className="mx-auto max-w-[900px] px-4">
                        <h2 className="text-xl sm:text-3xl font-extrabold text-[#121826] dark:text-foreground">Notre mission</h2>
                        <p className="mt-4 text-sm sm:text-base leading-7 text-[#2d3545] dark:text-muted-foreground">
                            Trouver un stage ou un premier emploi ne devrait pas être un parcours du combattant. Goriya
                            a été créée pour simplifier chaque étape : analyser ton CV avec l'IA, te préparer à
                            l'entretien, te connecter directement aux recruteurs et t'offrir une vraie transparence
                            sur les entreprises qui recrutent. Du côté des entreprises, on donne accès à un vivier de
                            candidats qualifiés et à des outils pour fluidifier le recrutement.
                        </p>
                    </div>
                </section>

                <section className="bg-[#f2f4f8] dark:bg-muted/30 py-14 sm:py-20">
                    <div className="mx-auto max-w-[1100px] px-4">
                        <h2 className="text-xl sm:text-3xl font-extrabold text-center text-[#121826] dark:text-foreground">Ce qui nous guide</h2>
                        <div className="mt-10 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-5">
                            {values.map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="rounded-2xl bg-white dark:bg-card border border-[#e2e8f5] dark:border-border p-5 text-center">
                                    <div className="mx-auto w-10 h-10 rounded-full bg-[#edf4ff] dark:bg-primary/10 flex items-center justify-center text-[#2f6de6] dark:text-primary">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="mt-3 font-semibold text-sm text-[#1c2433] dark:text-foreground">{title}</h3>
                                    <p className="mt-2 text-xs text-[#8a95a8] dark:text-muted-foreground leading-5">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-14 sm:py-20">
                    <div className="mx-auto max-w-[900px] px-4 text-center">
                        <h2 className="text-xl sm:text-3xl font-extrabold text-[#121826] dark:text-foreground">Prêt(e) à commencer ?</h2>
                        <p className="mt-3 text-sm text-[#7f8796] dark:text-muted-foreground">
                            Crée ton profil, dépose ton CV, et laisse Goriya t'accompagner vers la bonne opportunité.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <Link href="/auth/signin">
                                <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] px-6 h-10">Créer mon compte (Gratuit)</Button>
                            </Link>
                            <Link href="/explorer-emplois">
                                <Button variant="outline" className="rounded-full px-6 h-10">Explorer les offres</Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
