import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
        <div className="min-h-screen bg-[#f4f5f7] text-[#111827]">
            <header className="bg-[#f4f5f7] border-b border-[#e5eaf2]">
                <div className="mx-auto max-w-[1180px] px-4 h-[56px] sm:h-[64px] md:h-[72px] flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img src="/images/logo.png" alt="Goriya" className="h-8 w-auto" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/auth/signin">
                            <Button variant="outline" className="h-8 px-4 rounded-full text-[11px] border-[#b9c8ec] text-[#2f6de6] bg-white">Connexion</Button>
                        </Link>
                        <Button className="h-8 px-4 rounded-full text-[11px] bg-[#2157d3] hover:bg-[#1d4cb9]">Espace entreprise</Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1180px] px-4 py-10 sm:py-14">
                <Link href="/explorer-entreprises" className="inline-flex items-center gap-2 text-sm text-[#2f6de6] font-semibold mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux entreprises
                </Link>
                <section className="rounded-2xl border border-[#dbe3ef] bg-white p-6 sm:p-8 shadow-sm">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">Tous les secteurs d'activité</h1>
                    <p className="mt-3 max-w-2xl text-sm text-[#667085]">Parcours les grands domaines d’emploi pour repérer les entreprises qui correspondent le mieux à ton profil.</p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sectors.map((sector) => {
                            const Icon = sector.icon
                            return (
                                <article key={sector.name} className="rounded-xl border border-[#dbe3ef] bg-[#f8fbff] p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-[#eaf2ff] p-3 text-[#2f6de6]">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-sm font-semibold text-[#1d2432]">{sector.name}</h2>
                                    </div>
                                    <p className="mt-3 text-xs text-[#667085]">Découvre les entreprises, les offres et la culture propre à ce secteur.</p>
                                </article>
                            )
                        })}
                    </div>
                </section>
            </main>

            <footer className="bg-[#06080d] text-white pt-10 sm:pt-14 pb-8">
                <div className="mx-auto max-w-[1180px] px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                        <div>
                            <img src="/images/logo.png" alt="Goriya" className="h-10 sm:h-12 w-auto brightness-0 invert" />
                            <p className="mt-4 text-sm text-[#9098a7]">Goriya aide les candidats à découvrir les entreprises, les offres et les opportunités adaptées.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Concept</h4>
                            <ul className="mt-4 space-y-2 text-[#9098a7] text-sm">
                                <li><Link href="/explorer-emplois">Trouve un emploi</Link></li>
                                <li><Link href="/offres">Tarification</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Recevoir les notifications d'emploi</h4>
                            <p className="text-sm text-[#9098a7] mt-3">Les dernières opportunités envoyées dans ta boîte de réception.</p>
                            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
                                <Input className="h-10 rounded-full border-[#2a2f3a] bg-[#0f121a] text-white" placeholder="Adresse e-mail" />
                                <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">S'abonner</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
