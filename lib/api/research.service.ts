import { apiRequest } from "@/lib/api-client-http"

export interface IResearchLeader {
    nom: string
    role: string
}

export interface IResearchSource {
    title: string
    url: string
}

export interface IResearchResult {
    historique: string
    valeurs: string[]
    culture: string
    actualites: string[]
    synthese: string
    recommandations: string[]
    // Champs de la recherche approfondie : absents des recherches antérieures.
    presentation?: string
    fiche?: {
        secteur?: string
        creation?: string
        siege?: string
        effectif?: string
        siteWeb?: string
        groupe?: string
    }
    dirigeants?: IResearchLeader[]
    activites?: string[]
    chiffres?: string[]
    dates?: { annee: string; evenement: string }[]
    concurrents?: string[]
    questions?: string[]
    /** Pages web consultées ; vide quand la recherche repose sur les seules connaissances de l'IA. */
    sources?: IResearchSource[]
    /** `web` : informations vérifiées en ligne ; `connaissances` : mémoire de l'IA seule. */
    mode?: "web" | "connaissances"
}

export interface IResearchQuery {
    id: string
    companyName: string
    result: IResearchResult
    isFavorite: boolean
    createdAt: string
}

export const researchService = {
    list: async () => {
        return apiRequest<IResearchQuery[]>({ endpoint: "/research", method: "GET" })
    },

    create: async (companyName: string) => {
        // La recherche approfondie consulte le web : elle dépasse largement
        // le délai par défaut des appels backend.
        return apiRequest<IResearchQuery>({ endpoint: "/research", method: "POST", data: { companyName }, timeout: 120_000 })
    },

    get: async (id: string) => {
        return apiRequest<IResearchQuery>({ endpoint: `/research/${id}`, method: "GET" })
    },

    toggleFavorite: async (id: string) => {
        return apiRequest<IResearchQuery>({ endpoint: `/research/${id}/favorite`, method: "PATCH" })
    },

    remove: async (id: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/research/${id}`, method: "DELETE" })
    },
}
