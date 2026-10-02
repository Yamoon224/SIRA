import { apiRequest } from "@/lib/api-client-http"
import type { CvModeleId } from "@/lib/cv-pdf"

/** Une entrée de la liste « Expérience professionnelle » du créateur de CV. */
export interface CvExperience {
    entreprise: string
    poste: string
    /** Date ISO `YYYY-MM-DD` (valeur d'un `<input type="date">`). */
    dateDebut: string
    /** Vide lorsque `enCours` est vrai. */
    dateFin: string
    /** Poste toujours occupé : la date de fin devient « En cours ». */
    enCours: boolean
    description: string
}

/** Une entrée de la liste « Formation ». */
export interface CvFormation {
    etablissement: string
    /** Niveau de diplôme, contraint par la liste DIPLOMES du formulaire. */
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
    /** Indicatif pays sélectionné, ex. « +225 ». */
    indicatif: string
    /** Numéro local, sans indicatif. */
    telephone: string
    adresse: string
    profil: string
    experiences: CvExperience[]
    formations: CvFormation[]
    competences: CvCompetence[]
    /** Modèle de mise en page du PDF, choisi à l'étape « Modèle ». */
    modele: CvModeleId
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
