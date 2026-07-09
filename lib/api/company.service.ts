import { apiRequest } from "@/lib/api-client-http"
import { ApiResponse, IPaginatedResponse } from "@/lib/@types/api"
import { ICompany, IJobOffer } from "@/lib/@types/entities"

export const companyService = {
    getCompanies: async (
        filters?: {
            search?: string
            sector?: string
            industry?: string[]
            size?: string[]
            location?: string[]
            page?: number
            limit?: number
        },
    ) => {
        // Le backend n'a pas de param `search` sur /companies/paginate — seul
        // `name` (ilike) est supporté, on le traduit ici pour garder un
        // contrat stable côté appelants.
        const { search, ...rest } = filters ?? {}
        return apiRequest<IPaginatedResponse<ICompany>>({
            endpoint: "/companies/paginate",
            method: "GET",
            params: { ...rest, name: search },
        })
    },

    getSectors: async () => {
        return apiRequest<ApiResponse<{ name: string; count: number }[]>>({
            endpoint: "/companies/sectors",
            method: "GET",
        })
    },

    getCompanyById: async (id: string) => {
        return apiRequest<ApiResponse<ICompany>>({
            endpoint: `/companies/${id}`,
            method: "GET",
        })
    },

    followCompany: async (companyId: string) => {
        return apiRequest<ApiResponse<null>>({
            endpoint: `/companies/${companyId}/follow`,
            method: "POST",
        })
    },

    unfollowCompany: async (companyId: string) => {
        return apiRequest<ApiResponse<null>>({
            endpoint: `/companies/${companyId}/follow`,
            method: "DELETE",
        })
    },

    getFollowedCompanyIds: async () => {
        return apiRequest<ApiResponse<{ companyIds: string[] }>>({
            endpoint: "/me/followed-companies",
            method: "GET",
        })
    },

    getRecruitingCompanies: async () => {
        return apiRequest<ApiResponse<ICompany[]>>({
            endpoint: "/companies/paginate",
            method: "GET",
        })
    },

    getCompanyJobs: async (companyId: string) => {
        // Pas de route dédiée /companies/{id}/jobs côté backend — le filtre
        // companyId de /job-offers/paginate (public) couvre le même besoin.
        return apiRequest<ApiResponse<IJobOffer[]>>({
            endpoint: "/job-offers/paginate",
            method: "GET",
            params: { companyId },
        })
    },
}
