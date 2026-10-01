/**
 * Grille de fonctionnalités des forfaits candidat (Grouilleur / Standard /
 * Premium) — reflète "FONCTIONNALITÉ GORIYA.pdf" (grille tarifaire sept.
 * 2026). Statique côté front : ce sont les lignes d'un tableau marketing,
 * pas des données de compte — les vrais quotas/plafonds appliqués viennent
 * de l'API (`SubscriptionPlan.featureLimits`, voir UserFeatureUsageService).
 *
 * `true`  -> incluse (coche verte)
 * `false` -> absente de ce forfait (croix rouge)
 * string  -> incluse, avec une précision affichée à côté de la coche
 *            (ex. "5 tentatives/mois", "Notifications in-app + email")
 */
export type PlanFeatureValue = boolean | string

export interface PlanFeatureRow {
    label: string
    values: Record<"Grouilleur" | "Standard" | "Premium", PlanFeatureValue>
}

export const USER_PLAN_FEATURE_MATRIX: PlanFeatureRow[] = [
    { label: "Goriya Meet", values: { Grouilleur: false, Standard: true, Premium: true } },
    { label: "Goriya Connect", values: { Grouilleur: false, Standard: true, Premium: true } },
    {
        label: "Créer un CV",
        values: { Grouilleur: false, Standard: "5 tentatives/mois", Premium: "20 tentatives/mois" },
    },
    { label: "Simulation d'entretien", values: { Grouilleur: false, Standard: false, Premium: true } },
    {
        label: "Générer des documents",
        values: { Grouilleur: false, Standard: "5 tentatives/mois", Premium: "20 tentatives/mois" },
    },
    { label: "Créer un Portfolio", values: { Grouilleur: false, Standard: false, Premium: true } },
    { label: "Recherche avancée sur une entreprise", values: { Grouilleur: false, Standard: true, Premium: true } },
    {
        label: "Analyse de CV",
        values: { Grouilleur: "2 analyses/mois", Standard: "5 analyses/mois", Premium: "20 analyses/mois" },
    },
    { label: "Goriya Pitch", values: { Grouilleur: false, Standard: false, Premium: true } },
    { label: "Goriya Docs", values: { Grouilleur: false, Standard: false, Premium: true } },
    // Le catalogue reste ouvert à tous ; ce qui change, c'est l'accès aux
    // vidéos — voir CourseAccessService côté backend.
    {
        label: "Formations",
        values: { Grouilleur: "Cours gratuits + pass 7 jours", Standard: "Catalogue illimité", Premium: "Catalogue illimité" },
    },
    { label: "Profil Goriya", values: { Grouilleur: true, Standard: true, Premium: true } },
    { label: "Recherche d'emploi", values: { Grouilleur: true, Standard: true, Premium: true } },
    { label: "Historique de candidature", values: { Grouilleur: true, Standard: true, Premium: true } },
    {
        label: "Notification d'offre prioritaire",
        values: { Grouilleur: "In-app", Standard: "In-app + email", Premium: "In-app + email" },
    },
    { label: "Goriya Chat", values: { Grouilleur: true, Standard: true, Premium: true } },
]

/**
 * Un forfait donné inclut-il `featureLabel` (une ligne de
 * USER_PLAN_FEATURE_MATRIX) ? Sert de garde-fou (SubscriptionGate) en plus
 * de l'affichage marketing — Grouilleur est un abonnement actif (prix 0,
 * `hasSubscription: true`) mais ne doit pas ouvrir les pages réservées à
 * Standard/Premium (voir le bug : Grouilleur avait accès aux pages
 * Standard/Premium faute de vérifier autre chose que "un abonnement existe").
 */
export function planIncludesFeature(planName: string | null | undefined, featureLabel: string): boolean {
    if (!planName) return false
    const row = USER_PLAN_FEATURE_MATRIX.find((r) => r.label === featureLabel)
    if (!row) return false
    const value = row.values[planName as keyof PlanFeatureRow["values"]]
    return value !== undefined && value !== false
}
