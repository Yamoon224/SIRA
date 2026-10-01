import { apiRequest } from "@/lib/api-client-http"
import type { CVProfile } from "@/lib/@types/openai"

export interface StoredCvProfile {
    /** `null` tant que l'utilisateur n'a validé aucun profil issu de son CV. */
    profile: Partial<CVProfile> | null
    updatedAt: string | null
}

/** Profil extrait du CV et validé sur /resultat-analyse-cv (un par utilisateur). */
export const cvProfileService = {
    get: () =>
        apiRequest<StoredCvProfile>({ endpoint: "/me/cv-profile", method: "GET", silent: true }),

    save: (profile: CVProfile | null) =>
        apiRequest<StoredCvProfile>({ endpoint: "/me/cv-profile", method: "PUT", data: { profile } }),
}
