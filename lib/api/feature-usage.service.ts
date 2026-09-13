import { apiRequest } from "@/lib/api-client-http"

export type FeatureUsageKey = "cv_creation" | "document_generation" | "cv_analysis"

export interface FeatureUsageStatus {
    allowed: boolean
    used: number
    remaining: number
    /** 0 si la fonctionnalité n'est pas incluse dans le forfait actif. */
    limit: number
}

/**
 * Quota des fonctionnalités "Limité" du forfait actif (Créer un CV,
 * Générer des documents, Analyse de CV) — voir UserFeatureUsageService
 * côté backend. `status` ne consomme rien (affichage), `consume` incrémente
 * et doit être appelée juste avant (ou juste après succès de) l'action.
 */
export const featureUsageService = {
    status: (featureKey: FeatureUsageKey) =>
        apiRequest<FeatureUsageStatus>({ endpoint: `/me/feature-usage/${featureKey}`, method: "GET" }),

    consume: (featureKey: FeatureUsageKey) =>
        apiRequest<FeatureUsageStatus>({ endpoint: `/me/feature-usage/${featureKey}/consume`, method: "POST" }),
}
