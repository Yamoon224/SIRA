import { apiRequest } from "@/lib/api-client-http"

export interface IResearchResult {
    historique: string
    valeurs: string[]
    culture: string
    actualites: string[]
    synthese: string
    recommandations: string[]
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
        return apiRequest<IResearchQuery>({ endpoint: "/research", method: "POST", data: { companyName } })
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
