import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
    title: "Conditions générales d'utilisation - Goriya",
    description: "Conditions générales d'utilisation (CGU) de l'application Goriya : accès, compte utilisateur, services, responsabilités et droit applicable.",
}

type Block = {
    heading?: string
    body?: string[]
    list?: string[]
}

type Section = {
    title: string
    body?: string[]
    list?: string[]
    subsections?: Block[]
}

const sections: Section[] = [
    {
        title: "I. Objet des Conditions Générales d'Utilisation",
        body: [
            "Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les conditions dans lesquelles les utilisateurs accèdent et utilisent l'application GORIYA ainsi que les services proposés par l'Exploitant, dont les informations ont été précisées dans les mentions légales.",
            "L'application GORIYA se présente comme une solution digitale intelligente dont l'objectif est de transformer les processus de recrutement et l'accès au monde du travail par le biais de l'intelligence artificielle. En alignant les aptitudes des profils avec les exigences concrètes des recruteurs, la plateforme établit une passerelle performante entre les postulants et les entités économiques.",
            "L'utilisation de l'application implique l'acceptation pleine et entière des présentes CGU par l'utilisateur.",
        ],
    },
    {
        title: "II. Identification de l'éditeur de l'application",
        body: [
            "L'application GORIYA est éditée et exploitée par un Exploitant, personne physique, agissant en son personnel, dont les informations ont été précisées dans les mentions légales.",
            "L'Éditeur est joignable aux coordonnées précisées dans les mentions légales de l'application, complétant les présentes CGU.",
            "L'Éditeur assure la conception, l'administration, la maintenance et l'exploitation de l'application, ainsi que la gestion des services proposés aux utilisateurs.",
            "Les présentes Conditions Générales d'Utilisation s'appliquent à toute personne accédant ou utilisant l'application.",
            "L'Éditeur exerce actuellement son activité en qualité de personne physique. En cas d'évolution de son statut juridique ou de la création d'une société, les informations d'identification figurant dans les présentes CGU seront mises à jour en conséquence.",
        ],
    },
    {
        title: "III. Définitions",
        body: ["Au sens des présentes CGU :"],
        list: [
            "Application : désigne la solution numérique accessible via téléphone mobile permettant l'accès aux services proposés par la Société.",
            "Utilisateur : désigne toute personne utilisant l'application.",
            "Compte utilisateur : désigne l'espace personnel créé par l'utilisateur afin d'accéder aux fonctionnalités proposées.",
            "Exploitant : désigne l'Editeur, responsable de sa gestion, de son fonctionnement et de la fourniture des services proposés aux utilisateurs.",
            "Services : désignent l'ensemble des fonctionnalités accessibles via l'application.",
            "Données personnelles : désignent toute information permettant d'identifier directement ou indirectement un utilisateur.",
        ],
    },
    {
        title: "IV. Conditions d'accès à l'application et acceptation des CGU",
        subsections: [
            {
                heading: "1. Objet",
                body: [
                    "Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités d'accès, d'inscription et d'utilisation de l'application, ainsi que les droits et obligations respectifs de l'Exploitant et des utilisateurs.",
                    "Toute personne accédant à l'application reconnaît avoir pris connaissance des présentes CGU et s'engage à les respecter pendant toute la durée d'utilisation des services.",
                ],
            },
            {
                heading: "2. Conditions d'accès",
                body: [
                    "L'accès aux services de l'application est subordonné à la création préalable d'un compte utilisateur.",
                    "L'application est accessible aux personnes physiques âgées d'au moins dix-huit (18) ans et juridiquement capables de contracter, ainsi qu'aux personnes morales représentées par une personne dûment habilitée à agir en leur nom.",
                    "L'utilisateur garantit remplir l'ensemble des conditions requises pour accéder aux services proposés et s'engage à fournir des informations exactes, complètes et régulièrement mises à jour.",
                    "L'application fonctionne selon un modèle d'accès mixte.",
                    "Certaines fonctionnalités sont accessibles gratuitement ou dans une version limitée, tandis que les fonctionnalités avancées sont réservées aux utilisateurs ayant souscrit un abonnement payant.",
                    "Les conditions tarifaires applicables sont portées à la connaissance de l'utilisateur avant toute souscription et précisées dans les Conditions Générales de Vente (CGV).",
                ],
            },
            {
                heading: "3. Acceptation des Conditions Générales d'Utilisation",
                body: [
                    "L'accès aux services, la création d'un compte et l'utilisation de l'application sont subordonnés à l'acceptation préalable, pleine, entière et sans réserve des présentes Conditions Générales d'Utilisation.",
                    "Lors de son inscription, l'utilisateur est tenu de prendre connaissance des présentes CGU et de manifester expressément son consentement en cochant la case prévue à cet effet avant la validation de son compte.",
                    "Cette validation constitue une acceptation électronique des présentes CGU et produit les mêmes effets juridiques qu'une signature manuscrite, conformément aux dispositions de la Loi n°2013-546 du 30 juillet 2013 relative aux transactions électroniques.",
                    "L'utilisateur reconnaît avoir eu la possibilité de consulter, pris connaissance des présentes CGU, avant leur acceptation.",
                    "En cas de refus des présentes CGU, l'utilisateur ne pourra ni créer un compte ni accéder aux services nécessitant une inscription.",
                    "L'exploitant conserve les éléments techniques permettant d'établir la preuve de l'acceptation des présentes CGU, notamment la date et l'heure de l'acceptation, la version des CGU en vigueur au moment de celle-ci ainsi que tout autre élément de preuve électronique autorisé par la règlementation applicable.",
                    "En cas de modification substantielle des présentes CGU, l'exploitant pourra demander à l'utilisateur de renouveler son acceptation avant de poursuivre l'utilisation des services. À défaut d'acceptation des nouvelles conditions, l'accès à tout ou partie des services pourra être suspendu jusqu'à leur acceptation.",
                ],
            },
        ],
    },
    {
        title: "V. Création et gestion du compte utilisateur",
        subsections: [
            {
                heading: "1. Création",
                body: [
                    "L'inscription nécessite la communication d'informations exactes et à jour.",
                    "Pour créer un compte, l'utilisateur doit notamment renseigner :",
                ],
                list: ["Son nom", "Son prénom", "Une adresse électronique valide", "Un mot de passe personnel"],
            },
            {
                heading: "2. Sécurité du compte",
                body: ["L'utilisateur est responsable :"],
                list: [
                    "De la confidentialité de ses identifiants",
                    "De l'utilisation de son compte",
                    "Des informations communiquées depuis son espace personnel",
                ],
            },
        ],
    },
    {
        title: "VI. Utilisation des services",
        body: [
            "L'inscription nécessite la communication d'informations exactes et à jour. L'utilisateur s'engage à maintenir ces informations exactes pendant toute la durée d'utilisation de l'application. Toute utilisation frauduleuse ou suspicion d'accès non autorisé doit être signalée immédiatement à la Société.",
        ],
        subsections: [
            {
                heading: "1. Services destinés aux particuliers",
                body: ["L'application permet notamment :"],
                list: [
                    "L'analyse automatisée des CV et lettres de motivation par intelligence artificielle",
                    "L'attribution d'un score d'efficacité accompagné d'une analyse détaillée",
                    "Des suggestions de reformulation et d'amélioration",
                    "Des corrections grammaticales et stylistiques",
                    "L'adaptation des documents au secteur d'activité et au pays visé",
                    "L'exportation des documents sous différents formats (PDF, Word, Google Docs)",
                    "L'accès à des simulations d'entretien automatisées ou, selon l'abonnement, réalisées avec des professionnels des ressources humaines",
                ],
            },
            {
                heading: "2. Services destinés aux entreprises",
                body: ["Les entreprises peuvent notamment :"],
                list: [
                    "Créer une page entreprise",
                    "Publier des offres d'emploi",
                    "Rechercher des candidats",
                    "Bénéficier d'un système de rapprochement intelligent entre les offres publiées et les profils disponibles",
                    "Accéder à un tableau de bord RH intégrant un système de scoring assisté par intelligence artificielle",
                ],
            },
            {
                heading: "3. Interactions entre les utilisateurs",
                body: ["Selon les fonctionnalités disponibles, les utilisateurs peuvent notamment :"],
                list: [
                    "Créer un profil",
                    "Publier des offres ou contenus autorisés",
                    "Échanger des messages via la plateforme entre recruteurs et candidats",
                    "Effectuer des paiements sécurisés au moyen d'un prestataire de paiement intégré",
                    "Télécharger des documents sous différents formats",
                ],
            },
        ],
    },
    {
        title: "VII. Géolocalisation et services basés sur la position",
        body: [
            "L'application ne procède pas à une géolocalisation en temps réel des utilisateurs.",
            "Lors de l'inscription, les utilisateurs peuvent uniquement renseigner volontairement :",
        ],
        list: ["Leur pays", "Leur ville de résidence"],
    },
    {
        title: "VIII. Obligations des utilisateurs",
        body: ["L'utilisateur s'engage à :"],
        subsections: [
            {
                list: [
                    "Fournir des informations exactes, complètes et régulièrement mises à jour",
                    "Préserver la confidentialité de ses identifiants de connexion",
                    "Utiliser l'application conformément aux lois et règlements applicables",
                    "Ne pas porter atteinte aux droits des autres utilisateurs",
                    "Ne pas publier de contenus illicites, frauduleux, diffamatoires, discriminatoires ou portant atteinte aux droits de tiers",
                    "Ne pas détourner les fonctionnalités de l'intelligence artificielle à des fins illicites, trompeuses ou frauduleuses",
                    "Respecter les droits de propriété intellectuelle attachés à l'application",
                ],
            },
            {
                heading: "L'utilisateur demeure seul responsable :",
                list: [
                    "Des informations publiées sur son profil",
                    "Des contenus qu'il diffuse",
                    "De l'utilisation faite de son compte",
                ],
            },
        ],
    },
    {
        title: "IX. Disponibilité et évolution de l'application",
        body: [
            "L'exploitant met en œuvre les moyens raisonnables afin d'assurer la disponibilité continue des services.",
            "Toutefois, l'accès peut être temporairement interrompu notamment en raison :",
        ],
        list: [
            "D'opérations de maintenance",
            "De mises à jour",
            "D'évolutions techniques",
            "De cas de force majeure",
            "D'incidents indépendants de la volonté de l'exploitant",
        ],
        subsections: [
            {
                body: ["L'exploitant se réserve le droit de faire évoluer les fonctionnalités de l'application afin d'améliorer les services proposés."],
            },
        ],
    },
    {
        title: "X. Protection des données personnelles",
        body: ["La collecte et le traitement des données personnelles réalisées dans le cadre de l'utilisation de l'application sont effectués conformément à :"],
        list: [
            "La Loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel",
            "La Politique de confidentialité accessible dans l'application",
            "Aux Mentions légales de l'application",
        ],
        subsections: [
            {
                body: ["L'exploitant collecte uniquement les données nécessaires au fonctionnement des services."],
            },
        ],
    },
    {
        title: "XI. Droit des utilisateurs",
        body: ["Les utilisateurs disposent notamment des droits :"],
        list: [
            "D'information",
            "D'accès",
            "De rectification",
            "D'opposition",
            "De suppression",
            "De retrait du consentement lorsque le traitement repose sur celui-ci",
        ],
        subsections: [
            {
                body: ["Les modalités d'exercice de ces droits sont précisées dans la Politique de confidentialité."],
            },
        ],
    },
    {
        title: "XII. Propriété intellectuelle",
        body: ["L'ensemble des éléments composant l'application, notamment :"],
        list: [
            "Le nom de l'application",
            "Le logo",
            "Le design graphique",
            "Le code source",
            "Les bases de données",
            "Les textes",
            "Les contenus créés par l'éditeur",
        ],
        subsections: [
            {
                body: [
                    "Demeurent la propriété exclusive de l'exploitant ou de leurs titulaires respectifs.",
                    "Toute reproduction, adaptation, diffusion ou exploitation sans autorisation préalable est interdite.",
                    "Les utilisateurs demeurent propriétaires des contenus qu'ils publient ou téléchargent sur la plateforme.",
                    "Ils accordent toutefois à l'exploitant une licence non exclusive, limitée à la durée de leur présence sur la plateforme, permettant l'hébergement, le stockage, l'affichage et le traitement technique de ces contenus pour les seuls besoins de fonctionnement du service.",
                ],
            },
        ],
    },
    {
        title: "XIII. Responsabilités",
        subsections: [
            {
                heading: "1. Responsabilité de l'exploitant",
                body: ["L'application agit en qualité :"],
                list: ["De fournisseur de services numériques", "De plateforme de mise en relation entre candidats et recruteurs", "D'intermédiaire technique"],
            },
            {
                body: [
                    "Les analyses générées par intelligence artificielle constituent exclusivement des outils d'aide à la décision.",
                    "Elles ne constituent ni une garantie d'embauche, ni un conseil professionnel personnalisé.",
                    "L'exploitant ne saurait être tenu responsable :",
                ],
                list: [
                    "Des décisions prises par les recruteurs",
                    "Des recrutements réalisés",
                    "Des relations contractuelles entre utilisateurs",
                    "Des informations publiées par les utilisateurs",
                    "Des interruptions temporaires du service",
                    "Des dommages résultant d'une mauvaise utilisation de l'application",
                ],
            },
            {
                heading: "2. Responsabilité de l'utilisateur",
                body: ["Chaque utilisateur est seul responsable :"],
                list: [
                    "Des informations communiquées",
                    "Des contenus publiés",
                    "Des échanges réalisés avec les autres utilisateurs",
                    "De l'utilisation de son compte",
                    "Du respect des lois applicables",
                ],
            },
        ],
    },
    {
        title: "XIV. Suspension ou suppression du compte",
        body: ["L'exploitant peut suspendre temporairement ou supprimer définitivement un compte notamment en cas :"],
        list: [
            "De violation des présentes CGU",
            "De communication d'informations fausses ou trompeuses",
            "De fraude",
            "De harcèlement",
            "D'usurpation d'identité",
            "D'utilisation abusive de l'intelligence artificielle",
            "D'atteinte aux droits de tiers",
            "De comportement portant atteinte à la sécurité ou au bon fonctionnement de la plateforme",
        ],
        subsections: [
            {
                body: ["Selon la gravité des faits, les mesures suivantes pourront être appliquées :"],
                list: ["Avertissement", "Suspension temporaire", "Suppression définitive du compte"],
            },
        ],
    },
    {
        title: "XV. Résiliation par l'utilisateur",
        body: [
            "L'utilisateur peut supprimer son compte à tout moment depuis son espace personnel ou en adressant une demande à l'exploitant.",
            "La suppression du compte entraîne la fermeture de l'accès aux services, sous réserve des obligations légales de conservation des données applicables.",
            "Les abonnements en cours demeurent régis par leurs conditions particulières.",
        ],
    },
    {
        title: "XVI. Modification des CGU",
        body: ["L'exploitant se réserve le droit de modifier les présentes Conditions Générales d'Utilisation afin notamment :"],
        list: [
            "D'assurer leur conformité avec les évolutions légales et réglementaires",
            "D'améliorer les fonctionnalités proposées",
            "D'adapter les services aux évolutions techniques",
        ],
        subsections: [
            {
                body: [
                    "Les utilisateurs seront informés des modifications par tout moyen approprié.",
                    "La poursuite de l'utilisation de l'application après leur entrée en vigueur vaut acceptation des nouvelles CGU.",
                ],
            },
        ],
    },
    {
        title: "XVII. Droit applicable et règlement des litiges",
        body: [
            "Les présentes Conditions Générales d'Utilisation sont régies par le droit ivoirien, notamment par la Loi n°2013-546 du 30 juillet 2013 relative aux transactions électroniques, ainsi que par toute autre législation applicable.",
            "En cas de différend, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire.",
            "À défaut d'accord amiable, les juridictions ivoiriennes territorialement compétentes seront seules compétentes pour connaître du litige.",
        ],
    },
    {
        title: "XVIII. Contact",
        body: [
            "Pour toute question relative aux présentes Conditions Générales d'Utilisation ou au fonctionnement de l'application, les utilisateurs peuvent contacter l'exploitant aux coordonnées indiquées dans les mentions légales.",
        ],
    },
]

function BlockContent({ body, list }: Block) {
    return (
        <>
            {body?.map((paragraph, i) => (
                <p key={i} className="text-sm sm:text-[15px] leading-7 text-[#3d4658] dark:text-foreground">
                    {paragraph}
                </p>
            ))}
            {list && (
                <ul className="list-disc space-y-1.5 pl-5">
                    {list.map((item, i) => (
                        <li key={i} className="text-sm sm:text-[15px] leading-7 text-[#3d4658] dark:text-foreground">
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}

export default function CguPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[860px] px-4 py-10 sm:py-16">
                <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-foreground">Conditions générales d&apos;utilisation</h1>
                <p className="mt-2 text-sm text-[#7a8495] dark:text-muted-foreground">Application GORIYA</p>
                <p className="mt-3 text-sm text-[#7a8495] dark:text-muted-foreground">Dernière mise à jour : 27 juillet 2026</p>

                <Accordion
                    type="single"
                    collapsible
                    defaultValue="section-0"
                    className="mt-8 sm:mt-10 w-full border-t border-[#e6e9f0] dark:border-border"
                >
                    {sections.map((section, idx) => (
                        <AccordionItem key={section.title} value={`section-${idx}`} className="border-[#e6e9f0] dark:border-border">
                            <AccordionTrigger className="text-lg sm:text-xl font-bold text-[#111827] dark:text-foreground hover:no-underline">
                                {section.title}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-3">
                                    <BlockContent body={section.body} list={section.list} />
                                    {section.subsections?.map((sub, i) => (
                                        <div key={i} className={sub.heading ? "pt-2" : undefined}>
                                            {sub.heading && (
                                                <h3 className="text-base font-semibold text-[#111827] dark:text-foreground">{sub.heading}</h3>
                                            )}
                                            <div className="mt-2 space-y-3">
                                                <BlockContent body={sub.body} list={sub.list} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </main>

            <Footer />
        </div>
    )
}
