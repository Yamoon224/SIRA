import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Footer() {
    return (
        <footer className="bg-[#06080d] text-white pt-10 sm:pt-14 pb-8">
            <div className="mx-auto max-w-[1180px] px-3 sm:px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                    <div>
                        <img src="/images/logo.png" alt="Goriya" className="h-10 sm:h-12 w-auto brightness-0 invert" />
                        <p className="mt-4 text-sm text-[#9098a7]">
                            GORIYA est la plateforme IA de référence pour optimiser tes documents professionnels,
                            te préparer à l'emploi et simplifier tes processus RH.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">Concept</h4>
                        <ul className="mt-4 space-y-2 text-[#9098a7] text-sm">
                            <li><Link href="/explorer-emplois">Trouve un emploi</Link></li>
                            <li><Link href="/offres">Tarification</Link></li>
                            <li><Link href="/a-propos">À propos de Goriya</Link></li>
                            <li><Link href="/blog">Blog</Link></li>
                            <li><Link href="/confidentialite">Politique de confidentialité</Link></li>
                            <li><Link href="/cgu">Conditions d'utilisation</Link></li>
                            <li><Link href="/mentions-legales">Mentions légales</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">Ne rate aucune opportunité</h4>
                        <p className="text-sm text-[#9098a7] mt-3">
                            Reçois chaque semaine les dernières offres de stage, d'emploi et nos meilleurs conseils
                            de carrière directement dans ta boîte mail.
                        </p>
                        <div className="mt-4 flex flex-col items-center gap-2">
                            <Input className="h-10 w-full rounded-full border-[#2a2f3a] bg-[#0f121a] text-white" placeholder="Adresse e-mail" />
                            <Button className="w-full rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">S'abonner</Button>
                        </div>
                    </div>
                </div>
                <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-[#1c202a] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                    <p className="text-xs sm:text-sm text-[#6f7887]">{new Date().getFullYear()} © Goriya. Tous droits réservés.</p>
                    <div className="flex items-center gap-2">
                        <Link href="/auth/signin"><Button variant="outline" className="h-8 rounded-full border-[#374153] text-[#d9e5ff] bg-transparent">Connexion</Button></Link>
                        <Link href="https://entreprise.goriya.net"><Button className="h-8 rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">Espace entreprise</Button></Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
