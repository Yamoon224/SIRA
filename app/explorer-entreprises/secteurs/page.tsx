import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Globe, Factory, ShoppingCart, Utensils, BriefcaseBusiness, Cpu, ArrowLeft } from "lucide-react"

const sectors = [
    { name: "Santé / Social / Environnement", icon: Globe },
    { name: "Industrie", icon: Factory },
    { name: "Distribution", icon: ShoppingCart },
    { name: "Food et boisson", icon: Utensils },
    { name: "Conseil / Audit", icon: BriefcaseBusiness },
    { name: "Tech", icon: Cpu },
]

export default function SectorsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[1180px] px-4 py-10 sm:py-14">
                <Link href="/explorer-entreprises" className="inline-flex items-center gap-2 text-sm text-[#2f6de6] dark:text-primary font-semibold mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux entreprises
                </Link>
                <section className="rounded-2xl border border-[#dbe3ef] dark:border-border bg-white dark:bg-card p-6 sm:p-8 shadow-sm">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-foreground">Tous les secteurs d'activité</h1>
                    <p className="mt-3 max-w-2xl text-sm text-[#667085] dark:text-muted-foreground">Parcours les grands domaines d’emploi pour repérer les entreprises qui correspondent le mieux à ton profil.</p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sectors.map((sector) => {
                            const Icon = sector.icon
                            return (
                                <article key={sector.name} className="rounded-xl border border-[#dbe3ef] dark:border-border bg-[#f8fbff] dark:bg-muted p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-[#eaf2ff] dark:bg-primary/10 p-3 text-[#2f6de6] dark:text-primary">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-sm font-semibold text-[#1d2432] dark:text-foreground">{sector.name}</h2>
                                    </div>
                                    <p className="mt-3 text-xs text-[#667085] dark:text-muted-foreground">Découvre les entreprises, les offres et la culture propre à ce secteur.</p>
                                </article>
                            )
                        })}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
