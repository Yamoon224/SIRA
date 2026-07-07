import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogIn, BriefcaseBusiness } from "lucide-react"

export const metadata = {
    title: "Politique de confidentialité — Goriya",
    description: "Politique de confidentialité de Goriya : données collectées, finalités, partage, conservation et droits des utilisateurs.",
}

const sections = [
    {
        title: "1. Introduction",
        body: [
            "Goriya (« nous », « notre » ou « la plateforme ») exploite un service en ligne permettant aux candidats de gérer leur recherche d'emploi (analyse de CV, candidatures, mise en relation avec des entreprises) et aux entreprises de publier des offres et de recruter.",
            "La présente politique de confidentialité décrit quelles données personnelles nous collectons, pourquoi nous les collectons, comment nous les utilisons et les partageons, et quels sont vos droits. En utilisant Goriya, vous acceptez les pratiques décrites ici.",
        ],
    },
    {
        title: "2. Responsable du traitement",
        body: [
            "Goriya est responsable du traitement des données personnelles collectées via le site et l'application. Pour toute question relative à vos données, vous pouvez nous contacter aux coordonnées indiquées en fin de page.",
        ],
    },
    {
        title: "3. Données que nous collectons",
        body: [
            "Données de compte : nom, prénom, adresse e-mail, mot de passe (stocké de façon chiffrée), numéro de téléphone.",
            "Documents professionnels : CV, lettre de motivation et tout autre document que vous téléversez pour analyse ou candidature.",
            "Données de candidature : offres consultées ou sauvegardées, candidatures envoyées, échanges avec les recruteurs.",
            "Données générées par l'analyse IA : score, points forts et axes d'amélioration produits à partir des documents que vous soumettez.",
            "Données techniques : identifiant d'appareil, adresse IP, type de navigateur, journaux de connexion et cookies (voir section Cookies).",
            "Données fournies par les entreprises : pour les comptes recruteurs, informations sur l'entreprise (nom, secteur, effectif, description, offres publiées).",
        ],
    },
    {
        title: "4. Finalités du traitement",
        body: [
            "Créer et gérer votre compte et vous authentifier.",
            "Analyser vos documents (CV, lettre de motivation) grâce à l'intelligence artificielle et vous restituer un score et des recommandations.",
            "Vous mettre en relation avec des recruteurs ou des candidats pertinents au regard de vos critères et de votre profil.",
            "Vous envoyer des notifications relatives à votre candidature, à de nouvelles offres correspondant à votre profil, ou à la newsletter emploi si vous y êtes abonné(e).",
            "Assurer la sécurité, prévenir la fraude et le mauvais usage de la plateforme.",
            "Améliorer nos services (statistiques d'usage agrégées et anonymisées).",
        ],
    },
    {
        title: "5. Base légale du traitement",
        body: [
            "Nous traitons vos données sur la base de l'exécution du contrat qui nous lie (fourniture du service que vous avez demandé), de votre consentement (par exemple pour la newsletter ou l'analyse IA en mode invité), et de notre intérêt légitime à sécuriser et améliorer la plateforme.",
        ],
    },
    {
        title: "6. Partage des données",
        body: [
            "Avec les entreprises recruteuses : lorsque vous postulez à une offre, les informations de votre profil et les documents joints sont transmis à l'entreprise concernée.",
            "Avec nos prestataires techniques : hébergement, envoi d'e-mails, outils d'analyse et d'intelligence artificielle utilisés pour fournir le service, dans le cadre de contrats garantissant la confidentialité de vos données.",
            "Nous ne vendons jamais vos données personnelles à des tiers à des fins publicitaires.",
            "Vos données peuvent être divulguées si la loi l'exige ou pour protéger les droits, la sécurité et les biens de Goriya, de ses utilisateurs ou du public.",
        ],
    },
    {
        title: "7. Conservation des données",
        body: [
            "Vos données sont conservées pendant la durée nécessaire aux finalités décrites ci-dessus, notamment tant que votre compte est actif. Vous pouvez demander la suppression de votre compte et de vos données à tout moment ; certaines données peuvent être conservées plus longtemps si la loi l'impose (par exemple à des fins comptables).",
        ],
    },
    {
        title: "8. Sécurité des données",
        body: [
            "Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables (chiffrement des mots de passe, accès restreint aux données, connexions sécurisées) pour protéger vos données contre l'accès non autorisé, la perte ou l'altération. Aucun système n'étant totalement infaillible, nous vous invitons à utiliser un mot de passe fort et à ne pas le partager.",
        ],
    },
    {
        title: "9. Cookies",
        body: [
            "Goriya utilise des cookies et technologies similaires pour vous maintenir connecté(e), mémoriser vos préférences et mesurer l'audience du site. Vous pouvez configurer votre navigateur pour refuser les cookies, sachant que certaines fonctionnalités du site pourraient alors ne plus fonctionner correctement.",
        ],
    },
    {
        title: "10. Vos droits",
        body: [
            "Sous réserve de la réglementation applicable en matière de protection des données personnelles, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données, ainsi que d'un droit d'opposition et de limitation de leur traitement.",
            "Vous pouvez exercer ces droits directement depuis votre profil ou en nous contactant aux coordonnées ci-dessous. Nous répondrons à votre demande dans un délai raisonnable.",
        ],
    },
    {
        title: "11. Transfert international des données",
        body: [
            "Certains de nos prestataires techniques peuvent traiter des données en dehors de votre pays de résidence. Dans ce cas, nous veillons à ce que ces transferts bénéficient d'un niveau de protection adapté, conformément à la réglementation applicable.",
        ],
    },
    {
        title: "12. Mineurs",
        body: [
            "Goriya s'adresse aux personnes en âge légal de travailler ou de rechercher un emploi. Nous ne collectons pas sciemment de données concernant des mineurs qui ne rempliraient pas cette condition.",
        ],
    },
    {
        title: "13. Modifications de la présente politique",
        body: [
            "Nous pouvons mettre à jour cette politique de confidentialité pour refléter des évolutions légales, techniques ou de nos pratiques. Toute modification substantielle vous sera notifiée via le site ou par e-mail. La date de dernière mise à jour figure en haut de cette page.",
        ],
    },
    {
        title: "14. Nous contacter",
        body: [
            "Pour toute question concernant cette politique ou vos données personnelles, vous pouvez nous écrire à contact@goriya.com.",
        ],
    },
]

export default function ConfidentialitePage() {
    return (
        <div className="min-h-screen bg-[#f7f8fb] text-[#111827]">
            <header className="bg-white border-b border-[#edf1f6]">
                <div className="mx-auto max-w-[1180px] px-4 h-[56px] sm:h-[64px] md:h-[72px] flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img src="/images/logo.png" alt="Goriya" className="h-8 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-[13px] text-[#7a8495] font-medium">
                        <Link href="/" className="hover:text-[#2f6de6]">Accueil</Link>
                        <Link href="/explorer-emplois" className="hover:text-[#2f6de6]">Trouver un emploi</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link href="/auth/signin" aria-label="Connexion" className="inline-flex">
                            <Button variant="outline" className="h-8 w-8 sm:h-8 sm:w-auto sm:px-4 rounded-full border-[#b9c8ec] text-[#2f6de6] bg-white p-0 sm:p-2">
                                <LogIn className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline text-[12px]">Connexion</span>
                            </Button>
                        </Link>
                        <Link href="https://goriya-entreprise.vercel.app">
                            <Button className="h-8 w-8 sm:h-8 sm:w-auto sm:px-4 rounded-full text-[12px] bg-[#2157d3] hover:bg-[#1d4cb9] p-0 sm:p-2" aria-label="Espace entreprise">
                                <BriefcaseBusiness className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Espace entreprise</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[860px] px-4 py-10 sm:py-16">
                <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-[#111827]">Politique de confidentialité</h1>
                <p className="mt-3 text-sm text-[#7a8495]">Dernière mise à jour : 6 juillet 2026</p>

                <div className="mt-8 sm:mt-10 space-y-8 sm:space-y-10">
                    {sections.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-lg sm:text-xl font-bold text-[#111827]">{section.title}</h2>
                            <div className="mt-3 space-y-3">
                                {section.body.map((paragraph, i) => (
                                    <p key={i} className="text-sm sm:text-[15px] leading-7 text-[#3d4658]">{paragraph}</p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>

            <footer className="bg-[#06080d] text-white pt-10 sm:pt-14 pb-8">
                <div className="mx-auto max-w-[1180px] px-3 sm:px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                        <div>
                            <img src="/images/logo.png" alt="Goriya" className="h-10 sm:h-12 w-auto brightness-0 invert" />
                            <p className="mt-4 text-sm text-[#9098a7]">Goriya est une plateforme web intelligente qui permet aux utilisateurs d'uploader leur CV, lettre de motivation ou tout autre document professionnel afin d'obtenir une analyse intelligente par IA.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Concept</h4>
                            <ul className="mt-4 space-y-2 text-[#9098a7] text-sm">
                                <li><Link href="/explorer-emplois">Trouve un emploi</Link></li>
                                <li><Link href="/offres">Tarification</Link></li>
                                <li><Link href="/confidentialite">Politique de confidentialité</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Recevoir les notifications d'emploi</h4>
                            <p className="text-sm text-[#9098a7] mt-3">Les dernières nouvelles sur l'emploi, les articles, envoyés dans ta boîte de réception chaque semaine.</p>
                            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
                                <Input className="h-10 rounded-full border-[#2a2f3a] bg-[#0f121a] text-white" placeholder="Adresse e-mail" />
                                <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">S'abonner</Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-[#1c202a] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                        <p className="text-xs sm:text-sm text-[#6f7887]">2026 © Goriya. Tous droits réservés.</p>
                        <div className="flex items-center gap-2">
                            <Link href="/auth/signin"><Button variant="outline" className="h-8 rounded-full border-[#374153] text-[#d9e5ff] bg-transparent">Connexion</Button></Link>
                            <Link href="https://goriya-entreprise.vercel.app"><Button className="h-8 rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">Espace entreprise</Button></Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
