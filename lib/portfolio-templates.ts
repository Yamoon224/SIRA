import type { PortfolioTheme } from "@/lib/@types/entities"

/**
 * Modèles de départ du portfolio : un thème et une trame (titre, bio,
 * compétences) par famille de métiers. Le membre garde la main sur tout dans
 * l'éditeur ; les informations de son profil priment sur la trame.
 */
export interface PortfolioTemplate {
    id: string
    nom: string
    description: string
    theme: PortfolioTheme
    title: string
    bio: string
    skills: { name: string; level: number }[]
}

export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
    {
        id: "tech",
        nom: "Développeur & Tech",
        description: "Stack technique, projets avec liens de démo et de code.",
        theme: "blue",
        title: "Développeur Full-Stack",
        bio: "Développeur passionné par la conception d'applications web fiables et faciles à utiliser. J'interviens de la maquette à la mise en production, avec une attention particulière à la qualité du code et à l'expérience utilisateur.",
        skills: [
            { name: "JavaScript / TypeScript", level: 80 },
            { name: "React", level: 75 },
            { name: "Node.js", level: 70 },
            { name: "Bases de données SQL", level: 65 },
            { name: "Git", level: 80 },
        ],
    },
    {
        id: "design",
        nom: "Design & Création",
        description: "Univers visuel affirmé pour mettre en avant tes réalisations.",
        theme: "purple",
        title: "Designer UI/UX",
        bio: "Designer attaché à créer des interfaces claires et des identités visuelles qui marquent. Je pars des besoins des utilisateurs pour aboutir à des maquettes soignées, prêtes à être développées.",
        skills: [
            { name: "Figma", level: 85 },
            { name: "Identité visuelle", level: 80 },
            { name: "UI Design", level: 80 },
            { name: "Recherche utilisateur", level: 65 },
            { name: "Canva", level: 90 },
        ],
    },
    {
        id: "marketing",
        nom: "Marketing & Communication",
        description: "Campagnes, réseaux sociaux et résultats obtenus.",
        theme: "green",
        title: "Responsable Communication & Marketing Digital",
        bio: "Professionnel de la communication digitale, je conçois des stratégies et des campagnes orientées résultats : gestion des réseaux sociaux, création de contenus et publicité en ligne au service de la visibilité des marques.",
        skills: [
            { name: "Stratégie de communication", level: 80 },
            { name: "Community management", level: 85 },
            { name: "Meta Ads / Google Ads", level: 75 },
            { name: "Création de contenu", level: 80 },
            { name: "Canva", level: 90 },
        ],
    },
    {
        id: "business",
        nom: "Commerce & Gestion",
        description: "Sobre et professionnel, centré sur tes résultats.",
        theme: "default",
        title: "Chargé de Développement Commercial",
        bio: "Commercial orienté résultats, j'accompagne les clients de la prospection à la fidélisation. Mon objectif : comprendre leurs besoins, proposer la bonne solution et construire une relation durable.",
        skills: [
            { name: "Prospection", level: 80 },
            { name: "Négociation", level: 80 },
            { name: "Relation client", level: 85 },
            { name: "Gestion de portefeuille", level: 70 },
            { name: "Pack Office", level: 75 },
        ],
    },
    {
        id: "etudiant",
        nom: "Étudiant & Jeune diplômé",
        description: "Valorise ta formation, tes stages et tes projets d'école.",
        theme: "blue",
        title: "Étudiant en recherche de stage",
        bio: "Étudiant motivé et curieux, je recherche une première expérience pour mettre en pratique ce que j'ai appris. Mes projets d'école et associatifs m'ont appris à travailler en équipe et à tenir des délais.",
        skills: [
            { name: "Travail en équipe", level: 80 },
            { name: "Communication", level: 75 },
            { name: "Pack Office", level: 75 },
            { name: "Organisation", level: 75 },
            { name: "Anglais", level: 60 },
        ],
    },
    {
        id: "freelance",
        nom: "Freelance & Consultant",
        description: "Présente tes services et tes missions à de futurs clients.",
        theme: "purple",
        title: "Consultant indépendant",
        bio: "Consultant indépendant, j'accompagne les entreprises et les porteurs de projet sur des missions ciblées. Je m'engage sur des livrables clairs, des délais tenus et un suivi transparent.",
        skills: [
            { name: "Gestion de projet", level: 85 },
            { name: "Conseil", level: 80 },
            { name: "Relation client", level: 80 },
            { name: "Analyse des besoins", level: 75 },
            { name: "Rédaction", level: 75 },
        ],
    },
]

export const findPortfolioTemplate = (id: string | null | undefined): PortfolioTemplate | undefined =>
    PORTFOLIO_TEMPLATES.find((t) => t.id === id)
