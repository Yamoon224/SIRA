import { ApiResponse } from "@/lib/@types/api"
import { apiRequest } from "@/lib/api-client-http"
import { ICandidature } from "@/lib/@types/entities"

export const candidatureService = {
    /**
     * `limit` explicite : sans lui, /candidatures/paginate retombe sur son
     * défaut de 10 et l'écran « Mes candidatures », qui n'a pas de pagination,
     * tronquait la liste sans le dire — un filtre semblait alors ne rien
     * renvoyer alors que le résultat était juste hors de la première page.
     */
    getCandidatures: async (status?: string) => {
        return apiRequest<ApiResponse<ICandidature[]>>({
            endpoint: "/candidatures/paginate",
            method: "GET",
            params: { page: 1, limit: 100, ...(status ? { status } : {}) },
        })
    },

    getCandidatureById: async (id: string) => {
        return apiRequest<ApiResponse<ICandidature>>({
            endpoint: `/candidatures/${id}`,
            method: "GET",
        })
    },

    withdrawCandidature: async (id: string) => {
        return apiRequest<ApiResponse<null>>({
            endpoint: `/candidatures/${id}`,
            method: "DELETE",
        })
    },
}
