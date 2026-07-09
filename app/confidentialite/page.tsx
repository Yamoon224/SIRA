import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

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
        <div className="min-h-screen bg-background text-foreground">
            <Header />

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

            <Footer />
        </div>
    )
}
