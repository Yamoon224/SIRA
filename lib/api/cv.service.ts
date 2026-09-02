import { apiRequest } from "@/lib/api-client-http"

/** Une entrée de la liste « Expérience professionnelle » du créateur de CV. */
export interface CvExperience {
    entreprise: string
    poste: string
    dateDebut: string
    dateFin: string
    description: string
}

/** Une entrée de la liste « Formation ». */
export interface CvFormation {
    etablissement: string
    diplome: string
    dateDebut: string
    dateFin: string
}

/** Une entrée de la liste « Compétences ». */
export interface CvCompetence {
    nom: string
    niveau: string
}

export interface CvContent {
    nom: string
    email: string
    telephone: string
    adresse: string
    profil: string
    experiences: CvExperience[]
    formations: CvFormation[]
    competences: CvCompetence[]
}

export interface CvDraft {
    // Le brouillon relu peut venir d'une version antérieure du formulaire
    // (experience/formation/competences/langues en texte libre) : c'est la page
    // qui normalise, d'où le type large ici.
    data: Partial<Record<string, unknown>> | null
    step: number
    updatedAt: string | null
}

// Le backend renvoie une JsonResource → payload encapsulé dans `data`.
export const cvService = {
    get: () =>
        apiRequest<{ data: CvDraft }>({ endpoint: "/me/cv", method: "GET" }),

    save: (payload: { data?: CvContent | null; step?: number }) =>
        apiRequest<{ data: CvDraft }>({ endpoint: "/me/cv", method: "PUT", data: payload }),

    remove: () =>
        apiRequest<null>({ endpoint: "/me/cv", method: "DELETE", silent: true }),
}
