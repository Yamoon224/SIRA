import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata = {
    title: "Politique de confidentialité — Goriya",
    description:
        "Politique de confidentialité et de protection des données à caractère personnel de l'application GORIYA : données collectées, finalités, sécurité, transferts, conservation et droits des utilisateurs.",
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
        title: "Préambule",
        body: [
            "Dans le cadre de l'exploitation de l'application GORIYA, l'Exploitant accorde une importance particulière à la protection et à la confidentialité des données à caractère personnel des utilisateurs.",
            "La présente Politique de confidentialité a pour objet d'informer les personnes concernées sur les conditions dans lesquelles leurs données à caractère personnel sont collectées, utilisées, conservées, protégées et, le cas échéant, communiquées dans le cadre des services proposés par l'application.",
            "Elle présente notamment les catégories de données à caractère personnel traitées, les finalités poursuivies par les traitements réalisés, les mesures techniques et organisationnelles mises en œuvre pour assurer la sécurité des données, ainsi que les droits reconnus aux personnes concernées et les modalités permettant leur exercice.",
            "La présente Politique est établie conformément aux dispositions applicables en République de Côte d'Ivoire, notamment la Loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel.",
            "Elle complète les Conditions Générales d'Utilisation (CGU) de l'application GORIYA et s'applique à l'ensemble des utilisateurs des services proposés par la Plateforme.",
        ],
    },
    {
        title: "I. Responsable du traitement et engagements de l'Exploitant",
        subsections: [
            {
                heading: "1. Responsable du traitement",
                body: [
                    "Le responsable du traitement des données à caractère personnel collectées et traitées dans le cadre de l'utilisation de l'application GORIYA est : Monsieur GUIRIA GUEI ANGE AXEL.",
                    "L'Exploitant détermine les finalités et les moyens des traitements réalisés dans le cadre de la fourniture des services proposés par l'application.",
                ],
            },
            {
                heading: "2. Engagements de l'Exploitant",
                body: [
                    "L'Exploitant s'engage à traiter les données à caractère personnel conformément aux principes applicables en matière de protection des données, notamment :",
                ],
                list: [
                    "Le principe de licéité, loyauté et transparence des traitements",
                    "Le principe de limitation des finalités",
                    "Le principe de minimisation des données collectées",
                    "Le principe d'exactitude des données",
                    "Le principe de limitation de la durée de conservation",
                    "Le principe de sécurité et de confidentialité",
                ],
            },
            {
                body: ["À ce titre, l'Exploitant veille notamment à :"],
                list: [
                    "Collecter uniquement les données nécessaires aux finalités poursuivies",
                    "Informer les personnes concernées des traitements réalisés",
                    "Assurer la confidentialité et la sécurité des données traitées",
                    "Limiter l'accès aux données aux seules personnes habilitées",
                    "Permettre l'exercice effectif des droits reconnus aux personnes concernées",
                ],
            },
            {
                body: [
                    "Lorsque le consentement constitue la base légale du traitement, l'Exploitant recueille ce consentement préalablement à la collecte ou au traitement des données concernées. Le consentement est recueilli au moyen d'un mécanisme permettant à la personne concernée d'exprimer un choix libre, spécifique, éclairé et univoque.",
                    "Lors de la création d'un compte utilisateur, l'utilisateur est invité à prendre connaissance et à accepter les Conditions Générales d'Utilisation (CGU) ainsi que la présente Politique de confidentialité.",
                    "Lorsque certains traitements nécessitent un consentement spécifique, celui-ci est recueilli séparément au moyen d'une action positive dédiée.",
                ],
            },
        ],
    },
    {
        title: "II. Champ d'application de la Politique de confidentialité",
        body: [
            "La présente Politique s'applique à l'ensemble des traitements de données à caractère personnel réalisés dans le cadre de l'exploitation de l'application GORIYA, notamment :",
        ],
        list: [
            "La création et la gestion des comptes utilisateurs",
            "La constitution et la gestion des profils professionnels",
            "La publication et la consultation des offres d'emploi",
            "La gestion des candidatures",
            "L'analyse des CV et lettres de motivation au moyen de fonctionnalités reposant sur l'intelligence artificielle",
            "La mise en relation entre candidats et recruteurs",
            "L'utilisation des différentes fonctionnalités proposées par la Plateforme",
        ],
        subsections: [
            {
                body: ["Elle concerne notamment :"],
                list: ["Les utilisateurs de l'application", "Les candidats", "Les recruteurs", "Les entreprises clientes utilisant les fonctionnalités de recrutement"],
            },
            {
                body: ["L'utilisation de l'application implique la prise de connaissance de la présente Politique de confidentialité."],
            },
        ],
    },
    {
        title: "III. Principes relatifs à la collecte et au traitement des données personnelles",
        subsections: [
            {
                heading: "1. Personnes concernées par les traitements",
                body: ["Les traitements de données à caractère personnel mis en œuvre dans le cadre de l'application GORIYA concernent les catégories de personnes suivantes :"],
                list: [
                    "Les utilisateurs de l'application",
                    "Les candidats utilisant les services proposés par la Plateforme",
                    "Les recruteurs",
                    "Les entreprises clientes publiant des offres d'emploi ou utilisant les fonctionnalités de recrutement",
                ],
            },
            {
                body: [
                    "Ces traitements sont réalisés dans le strict respect des finalités définies par la présente Politique de confidentialité et conformément aux dispositions de la Loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel.",
                ],
            },
            {
                heading: "2. Données d'identification, de profil et de parcours",
                body: [
                    "Catégories de données collectées — Dans le cadre de l'utilisation de l'application GORIYA, l'Exploitant collecte directement auprès de l'utilisateur les données à caractère personnel nécessaires à la création, à la gestion et à l'utilisation des services proposés. Les données susceptibles d'être collectées comprennent notamment :",
                ],
                list: [
                    "Le nom et le prénom",
                    "L'adresse",
                    "La photographie de profil",
                    "Les vidéos lorsque l'utilisateur choisit volontairement d'en publier ou d'en transmettre via l'application",
                    "La date et le lieu de naissance",
                    "Le curriculum vitae (CV)",
                    "Les informations relatives à la situation professionnelle",
                    "Les informations relatives au parcours scolaire, universitaire et aux formations suivies",
                    "Les compétences, distinctions, certifications ou autres informations renseignées volontairement par l'utilisateur afin de valoriser son profil professionnel",
                ],
            },
            {
                heading: "Origine des données",
                body: ["Ces données sont communiquées directement par l'utilisateur lors :"],
                list: [
                    "De son inscription sur l'application",
                    "De la création de son compte",
                    "De la complétion ou de la modification de son profil",
                    "Du dépôt de son CV ou de documents associés",
                    "De l'utilisation des fonctionnalités proposées par l'application",
                ],
            },
            {
                body: ["L'utilisateur garantit l'exactitude, la pertinence et la mise à jour des informations communiquées."],
            },
            {
                heading: "Finalités du traitement",
                body: ["Ces données sont traitées afin de :"],
                list: [
                    "Créer, administrer et gérer le compte utilisateur",
                    "Identifier l'utilisateur et sécuriser son accès à la Plateforme",
                    "Permettre l'utilisation des fonctionnalités proposées",
                    "Constituer et valoriser les profils professionnels des candidats",
                    "Faciliter la mise en relation entre candidats et recruteurs",
                    "Permettre la publication, la consultation et la gestion des candidatures et des offres d'emploi",
                    "Analyser les CV et lettres de motivation au moyen des fonctionnalités d'intelligence artificielle intégrées à l'application",
                    "Générer des recommandations, suggestions d'amélioration ou résultats personnalisés destinés exclusivement à l'utilisateur concerné",
                    "Assurer le fonctionnement, la maintenance et la sécurité des services proposés",
                ],
            },
            {
                heading: "Durée de conservation",
                body: [
                    "Les données relatives au compte utilisateur et au profil professionnel sont conservées pendant toute la durée d'activité du compte.",
                    "En cas d'absence d'utilisation prolongée, les données peuvent faire l'objet d'une suppression ou d'une anonymisation après un délai de trois (03) ans suivant la dernière connexion, sauf réactivation du compte ou obligation légale imposant une conservation différente.",
                    "Les données relatives aux candidatures, analyses de CV, résultats de scoring, opérations de matching et évaluations sont conservées pendant une durée maximale de deux (02) ans à compter de la dernière candidature ou de la clôture de l'offre concernée.",
                    "Lorsque l'utilisateur consent expressément à la conservation de son profil dans une CVthèque, les données peuvent être conservées pendant une durée supérieure dans les conditions prévues par ce consentement.",
                ],
            },
            {
                heading: "3. Données de connexion et d'utilisation",
                body: [
                    "Catégories de données collectées — Dans le cadre de l'utilisation de l'application GORIYA, l'Exploitant collecte certaines données techniques nécessaires au fonctionnement, à la sécurisation et à l'amélioration des services. Les données susceptibles d'être collectées comprennent notamment :",
                ],
                list: [
                    "Les identifiants des terminaux utilisés pour accéder à l'application",
                    "Les identifiants techniques de connexion",
                    "Les informations relatives aux dates et heures de connexion",
                    "Les informations relatives aux opérations effectuées sur la Plateforme",
                    "Les journaux techniques nécessaires à la sécurité et au diagnostic",
                ],
            },
            {
                heading: "Origine des données",
                body: ["Ces données sont collectées automatiquement lors :"],
                list: [
                    "De la connexion de l'utilisateur à son compte",
                    "De l'utilisation des fonctionnalités de l'application",
                    "De l'exécution d'actions sur la Plateforme",
                    "Des échanges techniques entre le terminal de l'utilisateur et les serveurs de l'application",
                ],
            },
            {
                heading: "Finalités du traitement",
                body: ["Les données de connexion et d'utilisation sont utilisées afin de :"],
                list: [
                    "Permettre l'authentification et la gestion sécurisée des accès",
                    "Assurer le fonctionnement technique de l'application",
                    "Garantir la sécurité des services",
                    "Détecter et prévenir les incidents techniques ou les utilisations frauduleuses",
                    "Assurer la traçabilité des opérations sensibles",
                    "Améliorer les performances et l'expérience utilisateur",
                ],
            },
            {
                heading: "Durée de conservation",
                body: [
                    "Les données techniques sont conservées pendant une durée proportionnée aux finalités poursuivies.",
                    "Les journaux de sécurité et de traçabilité sont conservés pendant une durée comprise entre un (01) et trois (03) ans selon leur nature et leur utilité pour la sécurité de la Plateforme.",
                    "Les données nécessaires au maintien des sessions utilisateurs sont conservées pendant la durée nécessaire au fonctionnement des mécanismes d'authentification.",
                    "À l'expiration des durées applicables, les données sont supprimées ou anonymisées conformément à l'Annexe A – Politique de conservation et de purge des données à caractère personnel.",
                ],
            },
            {
                heading: "4. Données de localisation",
                body: [
                    "Catégories de données collectées — Lorsque certaines fonctionnalités de l'application GORIYA nécessitent l'utilisation de données de localisation, l'Exploitant peut être amené à collecter des informations relatives à la position géographique de l'utilisateur. Les données susceptibles d'être collectées comprennent notamment :",
                ],
                list: [
                    "Les données de localisation obtenues à partir des systèmes de géolocalisation par satellite",
                    "Les données de localisation issues du téléphone mobile ou du terminal utilisé par l'utilisateur",
                    "Les informations relatives à la position géographique nécessaires au fonctionnement de certaines fonctionnalités de l'application",
                ],
            },
            {
                body: [
                    "La collecte de ces données intervient uniquement lorsque l'utilisateur active une fonctionnalité nécessitant l'accès à sa localisation et après autorisation accordée depuis son terminal.",
                ],
            },
            {
                heading: "Origine des données",
                body: ["Les données de localisation sont collectées :"],
                list: [
                    "Directement depuis le terminal utilisé par l'utilisateur",
                    "Par l'intermédiaire des services de localisation activés sur l'appareil",
                    "À la suite de l'autorisation donnée par l'utilisateur lors de l'utilisation des fonctionnalités concernées",
                ],
            },
            {
                body: [
                    "L'utilisateur peut modifier ou retirer cette autorisation à tout moment depuis les paramètres de son terminal. Le retrait de l'autorisation peut toutefois limiter l'accès à certaines fonctionnalités nécessitant l'utilisation de données de localisation.",
                ],
            },
            {
                heading: "Finalités du traitement",
                body: ["Les données de localisation peuvent être utilisées afin de :"],
                list: [
                    "Permettre l'accès aux fonctionnalités nécessitant une information géographique",
                    "Améliorer la pertinence des services proposés",
                    "Faciliter certaines opérations de mise en relation ou de recommandation",
                    "Personnaliser l'expérience utilisateur",
                    "Assurer le fonctionnement et la sécurité des fonctionnalités concernées",
                ],
            },
            {
                body: [
                    "Les données de localisation ne sont pas utilisées pour effectuer un suivi permanent de l'utilisateur en dehors des fonctionnalités nécessitant expressément leur utilisation.",
                ],
            },
            {
                heading: "Durée de conservation",
                body: [
                    "Les données de localisation sont conservées uniquement pendant la durée nécessaire aux finalités pour lesquelles elles sont collectées.",
                    "Lorsqu'elles sont enregistrées dans les systèmes de l'Exploitant, elles sont conservées pendant une durée maximale de douze (12) mois, sauf nécessité particulière liée à une obligation légale ou réglementaire, à la sécurité de la Plateforme, ou à la défense des droits de l'Exploitant.",
                    "À l'expiration de cette durée, les données sont supprimées ou anonymisées conformément à l'Annexe A – Politique de conservation et de purge des données à caractère personnel.",
                ],
            },
            {
                heading: "5. Données nécessaires à la vérification d'identité et données particulières",
                body: [
                    "Catégories de données collectées — Dans le cadre de la création du compte utilisateur, de la vérification de l'identité ou de l'accès à certaines fonctionnalités de l'application GORIYA, l'Exploitant peut être amené à collecter des données nécessaires à l'identification et à la sécurisation des comptes. Les données susceptibles d'être collectées comprennent notamment :",
                ],
                list: ["Le numéro de téléphone", "La carte nationale d'identité (CNI) ou tout document officiel équivalent", "Le permis de conduire"],
            },
            {
                body: [
                    "Ces données sont communiquées directement par l'utilisateur lorsque leur collecte est nécessaire au fonctionnement de certains services ou fonctionnalités. L'Exploitant applique un principe de minimisation et veille à ne collecter que les données strictement nécessaires aux finalités poursuivies.",
                ],
            },
            {
                heading: "Origine des données",
                body: ["Ces données sont recueillies directement auprès de l'utilisateur notamment :"],
                list: [
                    "Lors de la création ou de la validation du compte",
                    "Dans le cadre d'une procédure de vérification d'identité",
                    "Lors de l'accès à certaines fonctionnalités nécessitant un niveau de contrôle renforcé",
                ],
            },
            {
                body: ["L'utilisateur garantit l'authenticité et l'exactitude des informations et documents transmis."],
            },
            {
                heading: "Finalités du traitement",
                body: ["Ces données sont traitées afin de :"],
                list: [
                    "Vérifier l'identité de l'utilisateur",
                    "Sécuriser l'accès à l'application et aux services proposés",
                    "Prévenir les fraudes, les usurpations d'identité et les utilisations abusives de la Plateforme",
                    "Renforcer la fiabilité des profils utilisateurs",
                    "Satisfaire, lorsque cela est applicable, aux obligations légales ou réglementaires auxquelles l'Exploitant est soumis",
                ],
            },
            {
                heading: "Durée de conservation",
                body: [
                    "Les données utilisées pour la vérification d'identité sont conservées uniquement pendant la durée nécessaire aux finalités poursuivies.",
                    "Sauf obligation légale ou nécessité particulière liée à la sécurité de la Plateforme, le numéro de téléphone, la carte nationale d'identité et le permis de conduire sont conservés pendant une durée maximale d'un (01) mois après la suppression du compte utilisateur.",
                    "À l'expiration de cette période, elles sont supprimées de manière sécurisée conformément à l'Annexe A.",
                ],
            },
        ],
    },
    {
        title: "IV. Finalités générales des traitements",
        body: ["Les données à caractère personnel collectées dans le cadre de l'utilisation de l'application GORIYA sont traitées pour des finalités déterminées, explicites et légitimes, notamment :"],
        list: [
            "Créer, gérer et sécuriser les comptes utilisateurs",
            "Permettre l'accès aux fonctionnalités proposées par l'application",
            "Gérer les profils professionnels des candidats",
            "Faciliter la mise en relation entre candidats et recruteurs",
            "Permettre la publication, la gestion et la consultation des offres d'emploi",
            "Analyser les CV, lettres de motivation et documents transmis au moyen des fonctionnalités d'intelligence artificielle intégrées à l'application",
            "Produire des recommandations, analyses ou suggestions personnalisées",
            "Améliorer la pertinence des résultats de mise en relation",
            "Assurer la maintenance, la sécurité et la disponibilité des services",
            "Prévenir les comportements frauduleux ou les utilisations abusives",
            "Respecter les obligations légales et réglementaires applicables",
        ],
        subsections: [
            {
                body: ["L'Exploitant veille à ce qu'aucune donnée ne soit utilisée pour une finalité incompatible avec celle pour laquelle elle a été initialement collectée."],
            },
        ],
    },
    {
        title: "V. Interconnexion des fichiers et des traitements de données à caractère personnel",
        subsections: [
            {
                heading: "1. Principe général",
                body: [
                    "Dans le cadre de l'exploitation de l'application GORIYA, l'Exploitant veille à ce que les traitements de données à caractère personnel soient réalisés conformément aux finalités déterminées lors de leur collecte et dans le respect des principes de proportionnalité, de pertinence et de limitation des finalités.",
                    "Les traitements mis en œuvre peuvent nécessiter l'utilisation de plusieurs fonctionnalités applicatives impliquant le traitement coordonné de différentes catégories de données, notamment les données relatives aux profils utilisateurs, aux candidatures, aux offres d'emploi, aux entreprises et aux résultats générés par les outils d'analyse automatisée.",
                ],
            },
            {
                heading: "2. Absence d'interconnexion de fichiers",
                body: [
                    "Lorsque les traitements réalisés ne comportent aucun rapprochement ou croisement de fichiers poursuivant des finalités distinctes, l'Exploitant ne procède à aucune interconnexion de fichiers au sens de la réglementation applicable en matière de protection des données à caractère personnel.",
                    "Les traitements réalisés dans le cadre de l'application GORIYA sont exclusivement destinés :",
                ],
                list: [
                    "À la création et la gestion des comptes utilisateurs",
                    "À la gestion des profils professionnels",
                    "À l'analyse automatisée des CV et documents transmis volontairement par les utilisateurs",
                    "À la mise en relation entre candidats et recruteurs",
                    "À la gestion des candidatures et des offres d'emploi",
                    "À l'amélioration des services proposés",
                ],
            },
            {
                body: ["Ces traitements ne donnent pas lieu à un rapprochement avec des bases externes ou des fichiers poursuivant des finalités incompatibles avec celles prévues par la présente Politique."],
            },
            {
                heading: "3. Interconnexion de fichiers ou de traitements",
                body: [
                    "Lorsque l'Exploitant met en œuvre une interconnexion entre plusieurs fichiers ou traitements de données à caractère personnel, celle-ci est réalisée exclusivement pour des finalités déterminées, explicites et légitimes en lien avec les services proposés par l'application. Les interconnexions susceptibles d'être réalisées peuvent notamment concerner :",
                ],
                list: [
                    "Les données de profil des candidats",
                    "Les informations relatives aux candidatures",
                    "Les données relatives aux offres d'emploi publiées par les entreprises",
                    "Les résultats issus des outils d'analyse automatisée",
                    "Les informations nécessaires aux fonctionnalités de matching et de mise en relation professionnelle",
                ],
            },
            {
                body: ["Ces opérations ont notamment pour finalités :"],
                list: [
                    "D'améliorer la pertinence des suggestions proposées aux utilisateurs",
                    "De faciliter la mise en relation entre candidats et recruteurs",
                    "D'optimiser les fonctionnalités de recherche, de classement ou de recommandation",
                    "D'assurer le fonctionnement des services proposés par la Plateforme",
                ],
            },
            {
                body: ["Avant toute interconnexion, l'Exploitant veille à ce que :"],
                list: [
                    "Les finalités poursuivies soient compatibles avec celles initialement déclarées aux personnes concernées",
                    "Les catégories de données utilisées soient strictement nécessaires",
                    "Les accès soient limités aux seules personnes ou fonctionnalités autorisées",
                    "Les mesures de sécurité appropriées soient mises en œuvre",
                    "Les utilisateurs soient informés, lorsque cela est requis, des traitements concernés",
                ],
            },
            {
                body: ["Lorsque l'interconnexion constitue un traitement soumis à une formalité particulière auprès de l'autorité compétente en matière de protection des données personnelles, l'Exploitant accomplit les démarches nécessaires conformément à la réglementation applicable."],
            },
        ],
    },
    {
        title: "VI. Sécurité et confidentialité des données",
        body: ["L'Exploitant met en œuvre des mesures techniques et organisationnelles appropriées afin de garantir la sécurité, l'intégrité, la disponibilité et la confidentialité des données à caractère personnel traitées dans le cadre de l'exploitation de l'application GORIYA. Ces mesures sont adaptées à la nature des données traitées, aux risques identifiés et aux moyens techniques disponibles."],
        subsections: [
            {
                heading: "1. Infrastructure informatique",
                body: [
                    "L'application GORIYA repose sur une architecture technique composée de plusieurs environnements permettant d'assurer son fonctionnement.",
                    "Le backend de l'application est développé sous Laravel 12 (PHP 8.2) et hébergé sur une infrastructure Hostinger Business fonctionnant sous environnement CloudLinux.",
                    "Les interfaces utilisateurs, comprenant notamment les espaces utilisateur, administration et entreprise, sont développées sous Next.js 16 / React 19 et hébergées sur la plateforme Vercel, reposant sur une infrastructure Linux managée.",
                    "Les données applicatives sont stockées dans une base de données MariaDB 10.5.",
                    "L'Exploitant s'appuie également sur les dispositifs de sécurité mis en œuvre par ses prestataires d'hébergement afin d'assurer la disponibilité et la protection des infrastructures utilisées.",
                ],
            },
            {
                heading: "2. Sécurisation des communications",
                body: [
                    "Les échanges entre les utilisateurs, les interfaces applicatives et les serveurs de l'application sont sécurisés au moyen du protocole HTTPS reposant sur les standards de chiffrement TLS 1.2 et TLS 1.3. Ces mécanismes permettent d'assurer :",
                ],
                list: ["La confidentialité des communications", "L'intégrité des données échangées", "L'authentification des serveurs utilisés par l'application"],
            },
            {
                heading: "3. Protection de l'infrastructure technique",
                body: [
                    "L'application est hébergée sur des infrastructures mutualisées ne permettant pas à l'Exploitant de mettre en place une segmentation réseau dédiée de type DMZ ou VLAN.",
                    "Toutefois, les environnements d'hébergement bénéficient des mécanismes de sécurité déployés par les prestataires techniques, notamment :",
                ],
                list: [
                    "Des dispositifs de pare-feu",
                    "Des protections applicatives de type Web Application Firewall (WAF)",
                    "Des mécanismes d'isolation des environnements via CloudLinux",
                    "Des restrictions d'accès aux répertoires et ressources techniques",
                    "Des mécanismes de durcissement des environnements applicatifs",
                    "Des protections contre les logiciels malveillants",
                    "Des dispositifs de protection contre les attaques par déni de service distribué (DDoS)",
                    "Des mécanismes de surveillance et d'analyse de sécurité proposés par les fournisseurs d'infrastructure",
                ],
            },
            {
                heading: "4. Contrôle des accès et gestion des habilitations",
                body: [
                    "L'Exploitant limite l'accès aux données à caractère personnel aux seules personnes habilitées, dans la stricte limite de leurs fonctions et selon le principe du besoin d'en connaître.",
                    "L'application intègre un système de gestion des rôles permettant de distinguer les différents niveaux d'accès, notamment Administrateur (ADMIN), Utilisateur (USER) et Entreprise (ENTREPRISE).",
                    "Les autorisations sont contrôlées par des mécanismes applicatifs permettant de limiter l'accès aux fonctionnalités et aux données selon les profils attribués.",
                    "L'authentification repose notamment sur des mots de passe protégés par un mécanisme de hachage sécurisé utilisant bcrypt, une authentification par jetons sécurisés (JWT), ainsi que des mécanismes de contrôle des permissions.",
                ],
            },
            {
                heading: "5. Confidentialité et cloisonnement des données",
                body: [
                    "L'Exploitant met en œuvre des mesures destinées à garantir que les données à caractère personnel ne soient accessibles qu'aux personnes autorisées et uniquement dans la limite de leurs missions.",
                    "Les données sont organisées et protégées selon les différentes fonctionnalités de l'application afin de limiter les accès non nécessaires. Le cloisonnement des données est assuré notamment par :",
                ],
                list: [
                    "Une séparation des modules fonctionnels de l'application",
                    "Une gestion des rôles et des autorisations",
                    "Des contrôles applicatifs limitant l'accès aux informations selon les profils utilisateurs",
                    "Une limitation de l'accès aux données brutes aux seules personnes techniquement habilitées",
                ],
            },
            {
                body: [
                    "Les fonctions de développement, d'administration technique et d'utilisation des services sont organisées de manière à réduire les risques d'accès non autorisés ou de divulgation de données.",
                    "Les tiers externes susceptibles d'intervenir dans le fonctionnement technique ou opérationnel de l'application sont soumis à des obligations de confidentialité appropriées leur interdisant toute utilisation ou divulgation non autorisée des données auxquelles ils pourraient avoir accès.",
                ],
            },
            {
                heading: "6. Sécurisation des postes de travail et des environnements",
                body: [
                    "Les équipements utilisés dans le cadre du développement et de l'exploitation de l'application sont protégés par des mécanismes de sécurité intégrés aux systèmes d'exploitation utilisés, notamment Microsoft Defender pour les environnements Windows et les mécanismes de protection natifs XProtect et Gatekeeper pour les environnements macOS.",
                    "L'Exploitant veille également à maintenir une séparation entre les environnements de développement et l'environnement de production afin de limiter les risques d'altération ou d'exposition des données exploitées en production.",
                    "Les opérations de développement et de test sont réalisées, lorsque cela est possible, à partir de données fictives ou anonymisées afin d'éviter l'utilisation inutile de données réelles.",
                ],
            },
            {
                heading: "7. Sécurité des fichiers et des données stockées",
                body: [
                    "Les données à caractère personnel sont conservées dans les infrastructures utilisées pour l'exploitation de l'application et bénéficient des mesures de sécurité mises en œuvre au niveau applicatif et infrastructurel.",
                    "À la date de la présente Politique, les fichiers transmis volontairement par les utilisateurs, notamment les CV et documents associés, ne font pas l'objet d'un chiffrement spécifique au repos au niveau applicatif. L'Exploitant limite toutefois les accès à ces fichiers aux seules personnes ou fonctionnalités autorisées et applique des mesures destinées à prévenir toute consultation ou utilisation non autorisée.",
                    "L'Exploitant prévoit l'amélioration progressive de ses dispositifs de sécurité, notamment l'étude de mécanismes complémentaires de chiffrement lorsque cela sera nécessaire au regard de l'évolution des risques et des volumes de données traitées.",
                ],
            },
            {
                heading: "8. Journalisation et traçabilité des opérations",
                body: [
                    "Afin d'assurer la sécurité des données et de faciliter les investigations en cas d'incident, l'Exploitant met en œuvre des mécanismes de journalisation des opérations sensibles. Ces journaux peuvent enregistrer notamment :",
                ],
                list: [
                    "L'identifiant de l'utilisateur ayant effectué une action",
                    "La date et l'heure de l'opération",
                    "L'adresse IP associée",
                    "Les informations relatives au navigateur ou terminal utilisé (User-Agent)",
                    "L'action réalisée",
                    "La ressource ou l'élément concerné",
                ],
            },
            {
                body: [
                    "Les journaux d'audit sont utilisés exclusivement à des fins de sécurité, de contrôle interne, de détection des comportements anormaux, d'analyse des incidents et de preuve en cas de contestation ou d'utilisation frauduleuse.",
                    "Les journaux peuvent être conservés pendant une durée comprise entre un (01) et trois (03) ans selon leur nature et leur finalité.",
                ],
            },
            {
                heading: "9. Sauvegardes et disponibilité des données",
                body: [
                    "L'Exploitant met en œuvre des mécanismes de sauvegarde destinés à assurer la disponibilité et la continuité des services proposés par l'application.",
                    "Les sauvegardes sont réalisées selon les capacités et modalités proposées par les prestataires d'hébergement utilisés. L'infrastructure bénéficie notamment des dispositifs de sauvegarde proposés par l'hébergeur, des mécanismes de disponibilité de l'environnement technique et de procédures de restauration lorsque celles-ci sont nécessaires.",
                    "Les sauvegardes sont conservées dans des environnements bénéficiant des mêmes exigences générales de sécurité que les environnements d'exploitation.",
                    "À la date de la présente Politique, le protocole précis de chiffrement utilisé lors du transfert réseau des sauvegardes automatisées n'est pas documenté publiquement par les prestataires concernés.",
                ],
            },
            {
                heading: "10. Maintenance et gestion des équipements",
                body: [
                    "La maintenance applicative et technique de l'application est principalement réalisée en interne par l'Exploitant ou ses équipes techniques habilitées. Les opérations de maintenance sont effectuées au moyen de connexions sécurisées, notamment via des protocoles tels que SSH ou HTTPS, avec authentification préalable.",
                    "Aucune maintenance régulière impliquant un accès aux données à caractère personnel n'est confiée à un sous-traitant technique externe.",
                    "Lorsqu'un équipement informatique doit faire l'objet d'une intervention ou d'une mise au rebut, l'Exploitant veille à ce qu'aucune donnée à caractère personnel ne demeure accessible sur le support concerné. Lorsque cela est nécessaire, les données sont transférées vers un environnement sécurisé avant toute intervention sur le support physique.",
                ],
            },
            {
                heading: "11. Suppression et purge des données",
                body: [
                    "L'Exploitant applique une politique de conservation limitant la durée de conservation des données à caractère personnel conformément aux finalités poursuivies. Les durées de conservation applicables aux différentes catégories de données sont précisées dans l'Annexe A – Politique de conservation et de purge des données à caractère personnel.",
                    "À la date de la présente Politique, le mécanisme entièrement automatisé de détection de la fin des durées de conservation et de purge périodique n'est pas encore totalement déployé. L'Exploitant prévoit la mise en place progressive d'un système automatisé permettant l'identification des données arrivées à échéance, leur suppression ou anonymisation, ainsi que la journalisation des opérations réalisées.",
                    "En cas de demande de suppression formulée par un utilisateur conformément à ses droits, l'Exploitant procède à la suppression des données concernées dans les systèmes opérationnels, sous réserve des obligations légales applicables.",
                    "Les journaux d'audit ne conservent pas le contenu des données supprimées ; ils peuvent uniquement conserver les éléments nécessaires à la preuve de l'opération réalisée (nature de l'action, identifiant technique, auteur et date).",
                ],
            },
        ],
    },
    {
        title: "VII. Destinataires des données et transferts",
        subsections: [
            {
                heading: "1. Destinataires des données à caractère personnel",
                body: [
                    "Dans le cadre de la fourniture des services proposés par l'application GORIYA, les données à caractère personnel collectées peuvent être communiquées ou rendues accessibles uniquement aux destinataires qui en ont besoin pour les finalités définies dans la présente Politique de confidentialité. Les destinataires susceptibles d'accéder aux données sont notamment :",
                ],
                list: [
                    "L'Exploitant et les personnes habilitées intervenant dans la gestion, l'administration et la maintenance de l'application",
                    "Les utilisateurs eux-mêmes, pour les données relatives à leur propre compte et profil",
                    "Les recruteurs et entreprises clientes, uniquement dans le cadre des fonctionnalités de mise en relation prévues par la Plateforme et dans les limites des informations rendues accessibles conformément aux choix de l'utilisateur",
                    "Les prestataires techniques intervenant dans l'hébergement, la maintenance ou le fonctionnement de certains services nécessaires à l'application",
                ],
            },
            {
                body: [
                    "L'Exploitant veille à ce que chaque destinataire n'accède qu'aux seules données strictement nécessaires à l'accomplissement de sa mission.",
                    "Aucune donnée à caractère personnel n'est vendue, louée ou cédée à des tiers à des fins commerciales indépendantes.",
                ],
            },
            {
                heading: "2. Sous-traitants et prestataires techniques",
                body: [
                    "Pour assurer le fonctionnement de l'application, l'Exploitant peut recourir à des prestataires techniques spécialisés intervenant notamment dans l'hébergement des infrastructures, le stockage des données, la fourniture d'outils techniques nécessaires au fonctionnement de l'application ou la maintenance et l'assistance technique.",
                    "Lorsque ces prestataires agissent pour le compte de l'Exploitant et traitent des données à caractère personnel, ils sont tenus de respecter des obligations appropriées en matière de confidentialité, de sécurité, de limitation des finalités et de protection des données traitées.",
                    "L'Exploitant veille à sélectionner des prestataires présentant des garanties suffisantes au regard des exigences applicables en matière de protection des données à caractère personnel.",
                ],
            },
            {
                heading: "3. Transfert des données",
                body: [
                    "Dans le cadre de la fourniture de ses services, l'Exploitant peut être amené à transférer ou à rendre accessibles tout ou partie des données à caractère personnel traitées à des destinataires situés en dehors de l'espace CEDEAO.",
                    "Ces transferts peuvent notamment résulter de l'utilisation de solutions techniques nécessaires au fonctionnement de l'application, notamment des services d'hébergement, d'infrastructure cloud ou d'outils techniques intégrés.",
                    "Les transferts de données sont réalisés uniquement lorsque cela est nécessaire à la fourniture des services proposés et dans le respect des dispositions de la Loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel.",
                    "L'Exploitant veille à ce que tout transfert international de données soit encadré par des garanties juridiques, techniques et organisationnelles appropriées afin d'assurer un niveau de protection adéquat des données concernées. Ces garanties peuvent notamment comprendre la limitation des transferts aux seules données nécessaires, la sécurisation des communications, la restriction des accès, l'engagement de confidentialité des intervenants et l'évaluation des garanties offertes par les prestataires concernés.",
                    "Les informations relatives aux catégories de données concernées, aux finalités des transferts, aux destinataires impliqués et aux garanties mises en œuvre sont précisées dans l'Annexe C – Transferts internationaux de données à caractère personnel hors espace CEDEAO.",
                ],
            },
        ],
    },
    {
        title: "VIII. Cookies et technologies similaires",
        subsections: [
            {
                heading: "1. Utilisation des cookies",
                body: [
                    "L'application GORIYA peut utiliser des cookies ou technologies similaires nécessaires à son fonctionnement et à l'amélioration des services proposés. Les cookies sont de petits fichiers enregistrés sur le terminal de l'utilisateur permettant notamment de conserver certaines informations relatives à sa navigation.",
                ],
            },
            {
                heading: "2. Cookies nécessaires au fonctionnement de l'application",
                body: [
                    "Ces cookies sont indispensables au fonctionnement des fonctionnalités essentielles de la Plateforme. Ils permettent notamment l'authentification de l'utilisateur, le maintien de la session utilisateur et la sécurisation des accès.",
                    "Ces cookies ne peuvent pas être désactivés lorsqu'ils sont nécessaires au fonctionnement du service.",
                ],
            },
            {
                heading: "3. Cookies de mesure d'audience",
                body: [
                    "L'application utilise des outils de mesure d'audience permettant d'obtenir des informations statistiques relatives à l'utilisation des services, notamment pour analyser la fréquentation de l'application, identifier les éventuelles difficultés techniques et améliorer les performances et l'expérience utilisateur.",
                    "À la date de la présente Politique, aucun usage de cookies publicitaires ou de suivi commercial ciblé n'est identifié.",
                ],
            },
            {
                heading: "4. Gestion des cookies",
                body: [
                    "L'utilisateur peut gérer ou désactiver certains cookies depuis les paramètres de son navigateur ou de son terminal. Toutefois, la désactivation des cookies nécessaires peut affecter le fonctionnement normal de certaines fonctionnalités de l'application.",
                ],
            },
        ],
    },
    {
        title: "IX. Conservation et suppression des données à caractère personnel",
        subsections: [
            {
                heading: "1. Principe de limitation de la conservation",
                body: [
                    "L'Exploitant conserve les données à caractère personnel uniquement pendant une durée nécessaire aux finalités pour lesquelles elles sont traitées. Les durées de conservation sont déterminées en tenant compte de la nature des données concernées, des finalités poursuivies, des obligations légales et réglementaires applicables et des nécessités liées à la sécurité, à la preuve et à la défense des droits de l'Exploitant.",
                    "À l'expiration des durées applicables, les données font l'objet d'une suppression sécurisée ou d'une anonymisation lorsque leur conservation sous une forme permettant l'identification des personnes n'est plus nécessaire.",
                    "Les principales durées de conservation sont précisées dans l'Annexe A – Politique de conservation et de purge des données à caractère personnel.",
                ],
            },
            {
                heading: "2. Suppression des comptes et des données associées",
                body: [
                    "L'utilisateur peut demander la suppression de son compte conformément aux modalités prévues à l'article XII – Modalités d'exercice des droits et contact.",
                    "Lorsqu'un compte est supprimé, les données personnelles associées sont supprimées ou anonymisées dans les systèmes opérationnels lorsque leur conservation n'est plus justifiée. Les données nécessaires au respect d'obligations légales peuvent être conservées pendant la durée requise par la réglementation applicable, et certaines informations techniques peuvent être conservées temporairement afin d'assurer la sécurité des systèmes ou de prévenir les utilisations frauduleuses.",
                    "La suppression d'un compte entraîne également la suppression ou la purge des contenus associés lorsque leur conservation n'est plus nécessaire, notamment les éléments liés aux profils, échanges ou fonctionnalités communautaires.",
                ],
            },
        ],
    },
    {
        title: "X. Droits des utilisateurs sur leurs données personnelles",
        body: [
            "Conformément aux dispositions applicables en matière de protection des données à caractère personnel, toute personne concernée dispose de droits sur les données la concernant. Ces droits peuvent être exercés dans les conditions prévues par la réglementation applicable et selon les modalités précisées à l'article XII – Modalités d'exercice des droits et contacts.",
        ],
        subsections: [
            {
                heading: "1. Droit d'information",
                body: [
                    "Toute personne concernée a le droit d'être informée de manière claire et transparente sur les traitements réalisés concernant ses données à caractère personnel. À ce titre, l'Exploitant informe les utilisateurs notamment des catégories de données collectées, des finalités des traitements, des destinataires éventuels des données, des durées de conservation applicables et des droits dont disposent les personnes concernées.",
                    "Cette information est portée à la connaissance des utilisateurs notamment par la présente Politique de confidentialité, les mentions d'information associées aux formulaires de collecte et les Conditions générales d'utilisation (CGU).",
                ],
            },
            {
                heading: "2. Droit d'accès",
                body: [
                    "Conformément à la règlementation applicable en matière de protection des données à caractère personnel, toute personne concernée dispose d'un droit d'accès aux données à caractère personnel la concernant faisant l'objet d'un traitement par l'Exploitant. À ce titre, elle peut obtenir la confirmation que ses données sont ou ne sont pas traitées, l'accès aux données personnelles la concernant, ainsi que les informations relatives aux traitements réalisés sur ces données.",
                    "Les demandes d'accès peuvent être adressées selon les modalités prévues à l'article XII. Afin de protéger les données contre toute communication à une personne non autorisée, l'Exploitant peut demander les justificatifs nécessaires permettant de vérifier l'identité du demandeur.",
                ],
            },
            {
                heading: "3. Droit de rectification",
                body: [
                    "Toute personne concernée dispose du droit d'obtenir la correction ou la mise à jour des données à caractère personnel inexactes, incomplètes ou obsolètes la concernant.",
                    "L'utilisateur peut également modifier directement certaines informations depuis son espace personnel lorsque cette fonctionnalité est disponible. Lorsque la modification directe n'est pas possible, la demande peut être adressée à l'Exploitant selon les modalités prévues à l'article XII.",
                ],
            },
            {
                heading: "4. Droit à l'effacement",
                body: ["Toute personne concernée peut demander la suppression des données à caractère personnel la concernant lorsque :"],
                list: [
                    "Les données ne sont plus nécessaires au regard des finalités pour lesquelles elles ont été collectées",
                    "Le traitement repose exclusivement sur son consentement et celui-ci est retiré",
                    "Elle s'oppose au traitement dans les conditions prévues par la réglementation",
                    "La suppression est imposée par une obligation légale",
                ],
            },
            {
                body: ["L'Exploitant procède à l'effacement des données concernées sous réserve des obligations légales ou des motifs légitimes justifiant leur conservation."],
            },
            {
                heading: "5. Droit d'opposition",
                body: [
                    "Lorsque la règlementation le permet, toute personne concernée peut s'opposer au traitement de ses données à caractère personnel pour des raisons tenant à sa situation particulière.",
                    "L'Exploitant cesse alors le traitement concerné, sauf lorsqu'il démontre l'existence de motifs légitimes et impérieux justifiant la poursuite du traitement.",
                ],
            },
            {
                heading: "6. Droit de retrait du consentement",
                body: [
                    "Lorsque le traitement de ses données personnelles repose sur son consentement, l'utilisateur peut retirer celui-ci à tout moment, sans que ce retrait n'affecte la licéité des traitements effectués avant son intervention.",
                    "Le retrait du consentement peut être exercé selon les modalités prévues à l'article XII de la présente Politique de confidentialité ou par tout autre moyen mis à disposition par l'Exploitant.",
                    "Le retrait du consentement peut entraîner l'impossibilité d'accéder à certaines fonctionnalités lorsque celles-ci nécessitent le traitement des données concernées.",
                ],
            },
            {
                heading: "7. Droit à la limitation du traitement",
                body: ["Dans les conditions prévues par la réglementation applicable, toute personne concernée peut demander la limitation du traitement de ses données à caractère personnel. La limitation du traitement peut notamment être demandée lorsque :"],
                list: [
                    "L'exactitude des données est contestée par la personne concernée, pendant la période permettant à l'Exploitant de procéder aux vérifications nécessaires",
                    "Le traitement est considéré comme illicite mais que la personne concernée s'oppose à l'effacement des données et demande la limitation de leur utilisation",
                    "L'Exploitant n'a plus besoin des données pour les finalités initialement prévues, mais leur conservation demeure nécessaire à la défense de droits",
                    "La personne concernée s'est opposée au traitement, pendant la période de vérification relative aux motifs légitimes de l'Exploitant",
                ],
            },
            {
                body: ["Lorsque le traitement fait l'objet d'une limitation, les données concernées ne peuvent être traitées que dans les conditions autorisées par la réglementation applicable."],
            },
        ],
    },
    {
        title: "XI. Gestion des violations de données à caractère personnel",
        subsections: [
            {
                heading: "1. Détection et prise en charge des incidents",
                body: [
                    "L'Exploitant met en œuvre une procédure interne destinée à identifier, analyser et traiter les incidents susceptibles d'affecter la sécurité des données à caractère personnel.",
                    "Une violation de données à caractère personnel désigne tout incident entraînant, de manière accidentelle ou illicite, la destruction, la perte, l'altération, la divulgation non autorisée ou l'accès non autorisé à des données personnelles traitées.",
                    "Toute suspicion de violation est signalée au responsable technique interne désigné afin de permettre une évaluation rapide de la situation.",
                ],
            },
            {
                heading: "2. Évaluation de l'incident et mesures correctives",
                body: ["Dès la détection d'un incident, l'Exploitant procède à une analyse visant notamment à déterminer :"],
                list: [
                    "La nature de la violation",
                    "Les systèmes ou fonctionnalités concernés",
                    "Les catégories de données affectées",
                    "Les personnes susceptibles d'être concernées",
                    "Les conséquences potentielles de l'incident",
                ],
            },
            {
                body: [
                    "Une première évaluation est réalisée dans un objectif interne de vingt-quatre (24) heures suivant la découverte de l'incident.",
                    "Selon la nature du risque identifié, l'Exploitant peut mettre en œuvre différentes mesures de confinement, notamment la révocation des accès compromis, la modification des identifiants concernés, l'isolation du composant affecté, la correction de la vulnérabilité identifiée et le renforcement des mesures de sécurité existantes.",
                ],
            },
            {
                heading: "3. Notification des violations",
                body: [
                    "Lorsque la violation est susceptible d'engendrer un risque pour les droits et libertés des personnes concernées, l'Exploitant procède aux notifications nécessaires auprès de l'autorité compétente conformément aux dispositions applicables. L'évaluation tient notamment compte de la nature des données concernées, du niveau de sensibilité des informations affectées, du nombre de personnes concernées et de la gravité des conséquences potentielles.",
                    "Lorsque le risque est élevé pour les personnes concernées, celles-ci peuvent être informées dans les conditions prévues par la réglementation applicable.",
                    "Le délai de notification est apprécié conformément aux exigences légales applicables en Côte d'Ivoire. À titre de référence opérationnelle, l'Exploitant retient un objectif de notification rapide compatible avec les standards internationaux de protection des données, notamment un délai indicatif de soixante-douze (72) heures lorsque celui-ci est applicable.",
                ],
            },
            {
                heading: "4. Registre interne des violations",
                body: ["L'Exploitant tient un registre interne destiné à assurer la traçabilité des violations de données à caractère personnel. Ce registre contient notamment :"],
                list: [
                    "La date de découverte de l'incident",
                    "La description de la violation",
                    "Les catégories de données concernées",
                    "Les personnes ou catégories de personnes affectées",
                    "Les conséquences identifiées",
                    "Les mesures prises pour limiter l'impact",
                    "Les actions correctives mises en œuvre",
                ],
            },
            {
                body: ["À la date de la présente Politique, le registre automatisé intégré à l'application est en cours de mise en place. Dans l'intervalle, un support interne de suivi peut être utilisé pour documenter les incidents."],
            },
        ],
    },
    {
        title: "XII. Modalités d'exercice des droits et contact",
        subsections: [
            {
                heading: "1. Contact relatif à la protection des données personnelles",
                body: [
                    "Pour toute question relative au traitement de ses données à caractère personnel ou pour exercer les droits qui lui sont reconnus par la réglementation applicable, l'utilisateur peut contacter l'Exploitant aux coordonnées précisées dans les Mentions légales de l'application.",
                    "L'Exploitant s'engage à traiter les demandes relatives aux données à caractère personnel avec confidentialité et diligence.",
                ],
            },
            {
                heading: "2. Modalités de demande",
                body: ["Toute personne souhaitant exercer ses droits doit adresser une demande suffisamment précise permettant à l'Exploitant d'identifier :"],
                list: ["L'identité du demandeur", "Le droit exercé", "L'objet de la demande", "Les informations ou données concernées lorsque cela est nécessaire"],
            },
            {
                body: ["La demande peut être formulée par tout moyen permettant d'en assurer la réception et le suivi, notamment par courrier électronique ou par tout canal mis à disposition dans l'application."],
            },
            {
                heading: "3. Vérification de l'identité du demandeur",
                body: [
                    "Afin de garantir la confidentialité des données personnelles et d'éviter toute communication à une personne non autorisée, l'Exploitant peut demander des informations complémentaires ou un justificatif permettant de vérifier l'identité du demandeur. Cette vérification est réalisée uniquement dans la mesure nécessaire au traitement sécurisé de la demande.",
                ],
            },
            {
                heading: "4. Traitement des demandes",
                body: [
                    "L'Exploitant s'engage à répondre aux demandes d'exercice des droits dans un délai raisonnable conformément aux dispositions légales et règlementaires applicables.",
                    "Lorsque l'Exploitant ne peut donner suite à une demande, il informe la personne concernée des motifs justifiant cette décision, sous réserve des limitations prévues par la réglementation.",
                ],
            },
        ],
    },
    {
        title: "XIII. Modification de la Politique de confidentialité",
        body: ["L'Exploitant peut modifier la présente Politique de confidentialité afin de tenir compte :"],
        list: [
            "Des évolutions légales et réglementaires",
            "Des évolutions techniques de l'application",
            "Des modifications apportées aux fonctionnalités proposées",
            "Des améliorations des mesures de sécurité et de protection des données",
        ],
        subsections: [
            {
                body: ["Toute modification substantielle susceptible d'avoir un impact sur les droits des utilisateurs fera l'objet d'une information appropriée par tout moyen adapté, notamment une notification dans l'application, un message d'information ou la publication de la version actualisée de la Politique."],
            },
            {
                body: [
                    "La date de dernière mise à jour figurant en tête du document permet aux utilisateurs d'identifier la version applicable.",
                    "La poursuite de l'utilisation de l'application après l'entrée en vigueur d'une nouvelle version de la Politique vaut prise de connaissance des modifications apportées, dans les conditions prévues par la réglementation applicable.",
                ],
            },
        ],
    },
    {
        title: "XIV. Dispositions finales",
        body: [
            "La présente Politique de confidentialité complète les Conditions Générales d'Utilisation (CGU) de l'application GORIYA. Elle constitue le document de référence relatif aux traitements de données à caractère personnel réalisés dans le cadre de l'utilisation de la Plateforme.",
            "L'utilisation de l'application implique que l'utilisateur a pris connaissance des informations relatives aux traitements de ses données et des droits dont il dispose.",
            "Si une disposition de la présente Politique devait être déclarée invalide, illégale ou inapplicable, les autres dispositions demeureraient pleinement applicables.",
            "La présente Politique est régie par la réglementation applicable en République de Côte d'Ivoire, notamment la Loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel.",
        ],
    },
    {
        title: "Annexes à la Politique de confidentialité",
        body: [
            "Le présent document est complété par les annexes suivantes, qui en font partie intégrante et doivent être interprétées conjointement avec lui. Elles présentent les éléments techniques, organisationnels et procéduraux relatifs à la conservation des données, à la gestion des violations de données, aux transferts internationaux et aux mesures de sécurité mises en œuvre par l'Exploitant.",
        ],
        list: [
            "Annexe A – Politique de conservation et de purge des données à caractère personnel",
            "Annexe B – Procédure interne de réaction aux violations de données à caractère personnel",
            "Annexe C – Transferts internationaux de données à caractère personnel hors espace CEDEAO",
            "Annexe D – Synthèse des mesures techniques et organisationnelles de protection des données",
        ],
    },
    {
        title: "Annexe A — Politique de conservation et de purge des données à caractère personnel",
        subsections: [
            {
                heading: "1. Principes généraux",
                body: [
                    "L'Exploitant applique un principe de limitation de la durée de conservation des données à caractère personnel. Les données collectées dans le cadre de l'utilisation de l'application GORIYA sont conservées uniquement pendant une durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées.",
                    "La durée de conservation de chaque catégorie de données est déterminée en tenant compte de la nature des données concernées, de la finalité du traitement, de la nécessité de garantir le fonctionnement des services, des obligations légales et réglementaires applicables, ainsi que des besoins liés à la sécurité, à la preuve et à la défense des droits de l'Exploitant.",
                    "À l'expiration des durées prévues, les données font l'objet d'une suppression sécurisée ou d'une anonymisation lorsque leur conservation sous une forme permettant l'identification des personnes concernées n'est plus nécessaire.",
                ],
            },
            {
                heading: "2. Durées applicables selon les catégories de données",
                body: [
                    "a) Données relatives aux comptes utilisateurs — Conservées pendant toute la durée d'activité du compte. Lorsqu'un compte demeure inactif pendant une période prolongée, les données peuvent faire l'objet d'une suppression ou d'une anonymisation après un délai de trois (3) ans suivant la dernière connexion, sauf réactivation du compte ou nécessité particulière justifiant une conservation différente.",
                    "b) Données relatives aux candidatures et aux évaluations — Les données relatives aux candidatures, aux analyses de CV, aux résultats de scoring, aux opérations de matching et aux évaluations sont conservées pendant une durée maximale de deux (02) ans à compter de la dernière candidature ou de la clôture de l'offre concernée. À l'issue de cette période, les données sont supprimées, sauf lorsque l'utilisateur a expressément accepté leur conservation dans une CVthèque ou qu'une autre base légale permet leur conservation.",
                    "c) Données relatives aux offres d'emploi — Conservées pendant une durée maximale de deux (02) ans à compter de la clôture de l'offre concernée. À l'issue de cette période, elles peuvent être supprimées ou faire l'objet d'une anonymisation à des fins statistiques lorsque cela est nécessaire.",
                    "d) Données relatives aux entreprises clientes — Conservées pendant toute la durée d'utilisation active du service. En cas de résiliation ou de suppression du compte entreprise, les données sont supprimées après un délai maximal de trois (03) ans, sauf obligation légale ou nécessité liée à la défense des droits de l'Exploitant.",
                    "e) Données relatives aux échanges et à la messagerie — Conservées pendant la durée d'activité du compte. Elles peuvent être supprimées lors de la suppression du compte utilisateur ou après une période d'inactivité prolongée de trois (03) ans, sauf nécessité particulière liée à la sécurité ou à la preuve.",
                    "f) Codes de vérification et données temporaires — Conservés uniquement jusqu'à leur expiration ou leur utilisation, puis supprimés après expiration ou consommation.",
                    "g) Journaux d'audit et données de sécurité — Conservés pendant une durée comprise entre un (01) et trois (03) ans selon leur nature, à des fins de sécurité, de preuve et de contrôle exclusivement.",
                    "h) Notifications et données techniques associées — Les données relatives aux notifications utilisateurs sont conservées pendant une durée comprise entre six (06) et douze (12) mois. Les données techniques relatives aux terminaux et aux notifications sont conservées uniquement pendant la durée nécessaire au fonctionnement du service.",
                    "i) Données relatives aux communautés et interactions internes — Conservées pendant la durée d'activité du compte utilisateur. Elles peuvent être supprimées lors de la suppression du compte ou lorsque leur conservation n'est plus nécessaire.",
                    "j) Données relatives aux enquêtes — Les données issues des enquêtes et questionnaires utilisateurs sont conservées pendant une durée maximale de deux (02) ans après la fin de la campagne concernée. Lorsque cela est possible, les réponses peuvent être anonymisées afin de permettre une exploitation statistique ultérieure.",
                ],
            },
            {
                heading: "3. Mécanisme de purge",
                body: [
                    "L'Exploitant prévoit la mise en place progressive d'un mécanisme automatisé permettant d'assurer la suppression ou l'anonymisation des données arrivées à échéance. Ce mécanisme pourra notamment reposer sur des tâches planifiées permettant d'identifier les données dont la durée de conservation est arrivée à expiration, d'exécuter les opérations de suppression ou d'anonymisation, et d'enregistrer la réalisation des opérations dans les journaux d'audit.",
                    "À la date de la présente Politique, le mécanisme automatisé complet de purge n'est pas encore totalement déployé. Dans l'attente de son implémentation, les opérations nécessaires peuvent être réalisées selon des procédures internes de contrôle et de suppression.",
                ],
            },
        ],
    },
    {
        title: "Annexe B — Procédure interne de réaction aux violations de données à caractère personnel",
        subsections: [
            {
                heading: "1. Objet de la procédure",
                body: [
                    "La présente procédure définit les mesures organisationnelles mises en œuvre par l'Exploitant afin d'assurer la détection, l'évaluation, la gestion et le suivi des violations de données à caractère personnel susceptibles d'affecter les utilisateurs de l'application GORIYA.",
                    "Elle a pour objectif de limiter les conséquences d'un incident de sécurité, de préserver la confidentialité des données traitées et d'assurer le respect des obligations applicables en matière de protection des données à caractère personnel.",
                ],
            },
            {
                heading: "2. Définition d'une violation de données à caractère personnel",
                body: ["Constitue une violation de données à caractère personnel tout incident de sécurité entraînant, de manière accidentelle ou illicite :"],
                list: ["La destruction de données", "La perte de données", "L'altération de données", "La divulgation non autorisée de données", "L'accès non autorisé à des données à caractère personnel"],
            },
            {
                body: ["Une violation peut notamment résulter d'un accès frauduleux à l'application, d'une compromission d'identifiants d'accès, d'une erreur humaine entraînant une divulgation de données, d'une défaillance technique, d'une attaque informatique ou d'une mauvaise configuration d'un service utilisé par l'application."],
            },
            {
                heading: "3. Détection et signalement de l'incident",
                body: [
                    "Toute personne ayant connaissance ou suspectant une violation de données à caractère personnel doit en informer immédiatement le responsable technique interne désigné par l'Exploitant. Le signalement doit permettre de recueillir, dans la mesure du possible, les informations suivantes :",
                ],
                list: [
                    "La date et l'heure de découverte de l'incident",
                    "La nature de l'événement constaté",
                    "Les systèmes, fonctionnalités ou services concernés",
                    "Les données susceptibles d'être affectées",
                    "Les personnes susceptibles d'être concernées",
                    "Les premières mesures déjà prises",
                ],
            },
            {
                heading: "4. Analyse et qualification de l'incident",
                body: ["Dès réception du signalement, l'Exploitant procède à une analyse visant à déterminer la réalité de la violation, son origine probable, son étendue, les catégories de données concernées, le nombre potentiel de personnes affectées et le niveau de risque pour les droits et libertés des personnes concernées."],
            },
            {
                body: [
                    "Une première évaluation interne est réalisée dans un délai cible de vingt-quatre (24) heures suivant la découverte de l'incident. Cette analyse permet de déterminer les mesures correctives appropriées ainsi que les éventuelles obligations de notification.",
                ],
            },
            {
                heading: "5. Mesures de confinement et de remédiation",
                body: ["Lorsque cela est nécessaire, l'Exploitant met en œuvre immédiatement des mesures destinées à limiter les conséquences de l'incident. Ces mesures peuvent notamment comprendre :"],
                list: [
                    "La suspension temporaire des accès compromis",
                    "La révocation ou le renouvellement des identifiants concernés",
                    "La modification des paramètres de sécurité affectés",
                    "L'isolation du composant technique concerné",
                    "La correction de la vulnérabilité identifiée",
                    "Le renforcement des contrôles d'accès",
                    "La surveillance renforcée des systèmes concernés",
                ],
            },
            {
                body: ["Une analyse post-incident peut être réalisée afin d'identifier les causes de l'événement et de prévenir sa réapparition."],
            },
            {
                heading: "6. Notification à l'autorité compétente",
                body: [
                    "Lorsque la violation de données présente un risque pour les droits et libertés des personnes concernées, l'Exploitant procède aux notifications nécessaires auprès de l'autorité compétente conformément aux dispositions applicables. L'évaluation du risque prend notamment en considération la nature des données concernées, leur niveau de sensibilité, les conséquences potentielles pour les personnes et les mesures de protection déjà mises en œuvre.",
                    "À titre de procédure interne, l'Exploitant retient un objectif de notification rapide et compatible avec les standards internationaux de protection des données, notamment un délai indicatif de soixante-douze (72) heures lorsque ce délai est applicable.",
                ],
            },
            {
                heading: "7. Information des personnes concernées",
                body: ["Lorsque la violation est susceptible d'engendrer un risque élevé pour les droits et libertés des personnes concernées, celles-ci peuvent être informées dans les conditions prévues par la règlementation applicable. L'information communiquée précise notamment :"],
                list: [
                    "La nature de la violation",
                    "Les catégories de données concernées",
                    "Les mesures prises ou envisagées",
                    "Les recommandations permettant de limiter les conséquences éventuelles",
                    "Les modalités permettant de contacter l'Exploitant",
                ],
            },
            {
                heading: "8. Registre interne des violations",
                body: ["L'Exploitant tient un registre interne permettant d'assurer la traçabilité des incidents affectant ou susceptibles d'affecter les données à caractère personnel. Ce registre comporte notamment :"],
                list: [
                    "La description de la violation",
                    "Les circonstances de survenance",
                    "Les catégories de données concernées",
                    "Les personnes ou catégories de personnes affectées",
                    "Les mesures prises pour limiter les conséquences",
                    "Les actions correctives mises en œuvre",
                    "Les suites données à l'incident",
                ],
            },
            {
                body: ["À la date de la présente Politique, ce registre n'est pas encore intégré techniquement à l'application. Dans l'attente de son automatisation, un support interne de suivi peut être utilisé afin d'assurer la conservation des informations nécessaires relatives aux incidents."],
            },
            {
                heading: "9. Amélioration continue",
                body: ["Après chaque incident significatif, l'Exploitant procède, lorsque cela est nécessaire, à une revue des mesures techniques et organisationnelles existantes. Cette revue peut conduire notamment à renforcer les contrôles d'accès, améliorer les procédures internes, adapter les configurations techniques, sensibiliser les personnes habilitées et mettre à jour les mesures de prévention."],
            },
        ],
    },
    {
        title: "Annexe C — Transferts internationaux de données à caractère personnel hors espace CEDEAO",
        subsections: [
            {
                heading: "1. Objet de l'annexe",
                body: [
                    "La présente annexe précise les conditions dans lesquelles certaines données à caractère personnel traitées dans le cadre de l'exploitation de l'application GORIYA peuvent être transférées ou rendues accessibles à des destinataires situés en dehors de l'espace CEDEAO.",
                    "Ces transferts peuvent notamment intervenir dans le cadre de l'utilisation de solutions techniques nécessaires au fonctionnement, à l'hébergement, à la maintenance ou à la sécurisation de l'application.",
                    "L'Exploitant veille à ce que tout transfert international de données soit réalisé dans le respect des dispositions de la Loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel.",
                ],
            },
            {
                heading: "2. Fondement des transferts",
                body: ["Les transferts internationaux de données peuvent intervenir lorsque ceux-ci sont nécessaires :"],
                list: [
                    "À l'exécution des services proposés par l'application",
                    "Au fonctionnement des infrastructures techniques utilisées",
                    "À la fourniture de services d'hébergement, de stockage ou d'outils techniques",
                    "À l'amélioration de la sécurité et de la disponibilité de la Plateforme",
                ],
            },
            {
                body: ["L'Exploitant veille à ce que les données transférées soient limitées aux seules informations nécessaires au regard de la finalité poursuivie."],
            },
            {
                heading: "3. Catégories de données susceptibles d'être transférées",
                body: ["Selon les fonctionnalités utilisées et les services techniques concernés, les catégories de données susceptibles d'être transférées peuvent inclure :"],
                list: [
                    "Les données d'identification et de profil",
                    "Les informations relatives au parcours professionnel et académique",
                    "Les curriculums vitae et documents transmis volontairement par les utilisateurs",
                    "Les données techniques nécessaires au fonctionnement de l'application",
                    "Les données relatives aux comptes utilisateurs",
                    "Les données nécessaires à la sécurité et à la maintenance des services",
                ],
            },
            {
                body: ["Les données particulièrement sensibles ou soumises à une protection renforcée font l'objet d'une attention particulière et ne sont transférées que lorsque cela est strictement nécessaire et conformément aux exigences applicables."],
            },
            {
                heading: "4. Destinataires et prestataires concernés",
                body: ["Les transferts ou accès internationaux peuvent concerner notamment les prestataires techniques intervenant dans :"],
                list: [
                    "L'hébergement des applications et infrastructures",
                    "L'hébergement des bases de données",
                    "La fourniture de services cloud",
                    "La maintenance technique",
                    "Les outils nécessaires au fonctionnement des fonctionnalités intégrées à l'application",
                ],
            },
            {
                body: ["Les prestataires concernés sont sélectionnés en tenant compte de leurs garanties techniques et organisationnelles en matière de sécurité et de protection des données."],
            },
            {
                heading: "5. Garanties mises en œuvre",
                body: ["Afin d'assurer un niveau de protection approprié des données transférées, l'Exploitant met en œuvre des garanties destinées notamment à :"],
                list: [
                    "Limiter les transferts aux seules données nécessaires",
                    "Contrôler les accès aux données",
                    "Sécuriser les communications par des protocoles adaptés",
                    "Imposer des obligations de confidentialité aux intervenants autorisés",
                    "Encadrer contractuellement les interventions des prestataires concernés",
                    "Maintenir des mesures de sécurité adaptées aux risques identifiés",
                ],
            },
            {
                body: ["Lorsque cela est nécessaire, l'Exploitant veille à ce que les prestataires concernés présentent des garanties suffisantes quant à la protection des données traitées."],
            },
            {
                heading: "6. Hébergement et infrastructures techniques",
                body: [
                    "L'application GORIYA utilise des infrastructures techniques fournies par des prestataires spécialisés, notamment Hostinger pour l'hébergement du backend et de certains composants techniques, et Vercel pour l'hébergement des interfaces applicatives.",
                    "Ces infrastructures peuvent impliquer que certaines données soient traitées ou rendues accessibles depuis des environnements situés hors de l'espace CEDEAO.",
                    "L'Exploitant veille à ce que ces opérations soient limitées aux besoins strictement nécessaires au fonctionnement de l'application et encadrées par des mesures appropriées de sécurité.",
                ],
            },
            {
                heading: "7. Information des utilisateurs",
                body: [
                    "Les utilisateurs sont informés que l'utilisation de certaines fonctionnalités de l'application peut nécessiter l'intervention de prestataires techniques situés en dehors de l'espace CEDEAO.",
                    "Ils sont invités à consulter régulièrement la présente Politique de confidentialité afin de prendre connaissance des éventuelles évolutions relatives aux transferts internationaux de données.",
                ],
            },
            {
                heading: "8. Évolution des transferts",
                body: [
                    "L'Exploitant peut être amené à modifier la liste des prestataires techniques ou des solutions utilisées pour assurer l'évolution de l'application.",
                    "Toute modification substantielle susceptible d'avoir un impact significatif sur les traitements de données personnelles fera l'objet d'une mise à jour de la présente annexe et, lorsque nécessaire, d'une information appropriée des utilisateurs.",
                ],
            },
        ],
    },
    {
        title: "Annexe D — Synthèse des mesures techniques et organisationnelles de protection des données",
        subsections: [
            {
                heading: "1. Objet de l'annexe",
                body: [
                    "La présente annexe synthétise les principales mesures techniques et organisationnelles mises en œuvre par l'Exploitant afin d'assurer la protection des données à caractère personnel traitées dans le cadre de l'exploitation de l'application GORIYA. Ces mesures ont pour objectif de garantir la confidentialité des données, leur intégrité, leur disponibilité, la prévention des accès non autorisés, la traçabilité des opérations sensibles et la maîtrise des risques liés aux traitements réalisés.",
                ],
            },
            {
                heading: "2. Sécurisation de l'infrastructure",
                body: [
                    "L'application repose sur une architecture technique comprenant un backend développé sous Laravel 12 (PHP 8.2), des interfaces utilisateurs développées sous Next.js 16 / React 19, une base de données MariaDB 10.5 et des infrastructures hébergées auprès de prestataires spécialisés.",
                    "Les environnements techniques bénéficient notamment de mécanismes de protection réseau, de pare-feu applicatifs, de protections contre les attaques informatiques courantes, de mécanismes d'isolation des environnements et de dispositifs de surveillance proposés par les prestataires d'hébergement.",
                ],
            },
            {
                heading: "3. Sécurisation des communications",
                body: ["Les communications entre les utilisateurs et les serveurs de l'application sont protégées par l'utilisation du protocole HTTPS, le chiffrement des échanges via TLS 1.2 et TLS 1.3, ainsi que l'utilisation de certificats SSL permettant l'authentification des serveurs."],
            },
            {
                heading: "4. Authentification et contrôle des accès",
                body: [
                    "L'Exploitant applique des mesures destinées à limiter l'accès aux données aux seules personnes autorisées, notamment une gestion des profils et des habilitations, une séparation des rôles applicatifs (ADMIN / USER / ENTREPRISE), un contrôle des permissions, l'utilisation de mots de passe protégés par hachage bcrypt et une authentification sécurisée par jetons (JWT).",
                ],
            },
            {
                heading: "5. Protection contre les accès non autorisés",
                body: [
                    "L'accès aux données est limité selon le principe du besoin d'en connaître. Les données sont accessibles uniquement aux utilisateurs pour leurs propres informations, aux entreprises et recruteurs dans le cadre des fonctionnalités prévues, et aux personnes habilitées intervenant dans l'administration ou la maintenance du service. Les accès techniques sont réalisés au moyen de connexions sécurisées.",
                ],
            },
            {
                heading: "6. Journalisation, sauvegarde et disponibilité",
                body: [
                    "L'Exploitant met en œuvre des mécanismes permettant d'assurer la traçabilité des opérations sensibles. Les journaux peuvent contenir l'identifiant de l'utilisateur, la date et l'heure de l'opération, l'adresse IP, les informations relatives au terminal utilisé et l'action réalisée, utilisés exclusivement à des fins de sécurité, d'audit, de détection d'incidents et d'investigation en cas d'utilisation frauduleuse.",
                    "L'Exploitant met également en œuvre des mécanismes de sauvegarde destinés à garantir la continuité du service, réalisés selon les capacités offertes par les prestataires techniques concernés.",
                ],
            },
            {
                heading: "7. Gestion des habilitations et confidentialité des intervenants",
                body: [
                    "L'Exploitant veille à ce que seules les personnes ayant une mission nécessitant l'accès aux données puissent y accéder. Les habilitations sont attribuées selon les fonctions exercées et peuvent être ajustées en fonction de l'évolution des besoins.",
                    "Toute personne susceptible d'accéder à des données à caractère personnel est tenue à une obligation de confidentialité, notamment les membres de l'équipe technique, les administrateurs de l'application et les prestataires externes autorisés.",
                ],
            },
            {
                heading: "8. Encadrement des prestataires et des environnements techniques",
                body: [
                    "Lorsque des prestataires interviennent dans le fonctionnement de l'application, l'Exploitant veille à ce que leurs interventions soient encadrées par des engagements appropriés en matière de confidentialité, de sécurité, de limitation des usages et de protection des données.",
                    "L'Exploitant maintient une séparation entre les environnements de développement, les environnements de test et l'environnement de production. Lorsque cela est possible, les tests sont réalisés à partir de données fictives ou anonymisées afin de limiter l'exposition de données réelles.",
                ],
            },
            {
                heading: "9. Mesures relatives aux équipements",
                body: [
                    "Les équipements utilisés pour accéder aux données sont protégés par des mécanismes d'authentification, des mots de passe ou codes d'accès et des protections natives des systèmes d'exploitation, notamment Microsoft Defender pour les environnements Windows et XProtect / Gatekeeper pour les environnements macOS.",
                    "En cas de maintenance ou de remplacement d'un équipement, l'Exploitant veille à ce qu'aucune donnée personnelle ne reste accessible sur les supports concernés.",
                ],
            },
            {
                heading: "10. Amélioration continue des mesures de sécurité",
                body: [
                    "L'Exploitant s'engage à faire évoluer progressivement ses mesures techniques et organisationnelles afin de tenir compte des évolutions technologiques, des nouveaux risques identifiés, des recommandations en matière de cybersécurité et des exigences réglementaires applicables.",
                    "Les mesures complémentaires susceptibles d'être mises en œuvre pourront notamment concerner le renforcement du chiffrement des données stockées, l'amélioration de l'automatisation des purges, le renforcement des mécanismes de contrôle et de surveillance, ainsi que l'amélioration des procédures internes de gestion des incidents.",
                ],
            },
        ],
    },
]

function BlockContent({ body, list }: Block) {
    return (
        <>
            {body?.map((paragraph, i) => (
                <p key={i} className="text-sm sm:text-[15px] leading-7 text-[#3d4658]">
                    {paragraph}
                </p>
            ))}
            {list && (
                <ul className="list-disc space-y-1.5 pl-5">
                    {list.map((item, i) => (
                        <li key={i} className="text-sm sm:text-[15px] leading-7 text-[#3d4658]">
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}

export default function ConfidentialitePage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[860px] px-4 py-10 sm:py-16">
                <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-[#111827]">Politique de confidentialité</h1>
                <p className="mt-2 text-sm text-[#7a8495]">Application GORIYA</p>
                <p className="mt-3 text-sm text-[#7a8495]">Dernière mise à jour : 4 août 2026</p>

                <div className="mt-8 sm:mt-10 space-y-8 sm:space-y-10">
                    {sections.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-lg sm:text-xl font-bold text-[#111827]">{section.title}</h2>
                            <div className="mt-3 space-y-3">
                                <BlockContent body={section.body} list={section.list} />
                                {section.subsections?.map((sub, i) => (
                                    <div key={i} className={sub.heading ? "pt-2" : undefined}>
                                        {sub.heading && (
                                            <h3 className="text-base font-semibold text-[#111827]">{sub.heading}</h3>
                                        )}
                                        <div className="mt-2 space-y-3">
                                            <BlockContent body={sub.body} list={sub.list} />
                                        </div>
                                    </div>
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
