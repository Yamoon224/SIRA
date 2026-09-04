import { apiRequest } from "@/lib/api-client-http"
import { ICandidature, IJobOffer } from "@/lib/@types/entities"
import { ApiResponse, IPaginatedResponse } from "@/lib/@types/api"

export const jobService = {
    getJobs: async (
        filters?: {
            search?: string
            location?: string
            jobType?: string | string[]
            experience?: string[]
            salary?: string[]
            remote?: boolean
            hasSalary?: boolean
            companySize?: string | string[]
            sector?: string
            page?: number
            limit?: number
        },
    ) => {
        return apiRequest<IPaginatedResponse<IJobOffer>>({
            endpoint: "/job-offers/paginate",
            method: "GET",
            params: filters,
        })
    },

    getCategories: async () => {
        return apiRequest<ApiResponse<string[]>>({
            endpoint: "/job-offers/categories",
            method: "GET",
        })
    },

    getMatchScore: async (id: string) => {
        return apiRequest<{ matchingScore: number; matchReasons: string[] }>({
            endpoint: `/job-offers/${id}/match`,
            method: "GET",
            silent: true,
        })
    },

    getJobById: async (id: string) => {
        return apiRequest<ApiResponse<IJobOffer>>({
            endpoint: `/job-offers/${id}`,
            method: "GET",
        })
    },

    applyToJob: async (
        jobId: string,
        applicationData: { coverLetter?: string; resumeUrl?: string },
    ) => {
        return apiRequest<ApiResponse<ICandidature>>({
            endpoint: `/job-offers/${jobId}/apply`,
            method: "POST",
            data: applicationData,
        })
    },

    saveJob: async (jobId: string) => {
        return apiRequest<ApiResponse<null>>({
            endpoint: `/job-offers/${jobId}/save`,
            method: "POST",
        })
    },

    unsaveJob: async (jobId: string) => {
        return apiRequest<ApiResponse<null>>({
            endpoint: `/job-offers/${jobId}/save`,
            method: "DELETE",
        })
    },

    getSavedJobIds: async () => {
        return apiRequest<ApiResponse<{ jobIds: string[] }>>({
            endpoint: "/me/saved-jobs",
            method: "GET",
        })
    },

    getAppliedJobIds: async () => {
        return apiRequest<ApiResponse<{ jobIds: string[] }>>({
            endpoint: "/me/applied-jobs",
            method: "GET",
            silent: true,
        })
    },
}
