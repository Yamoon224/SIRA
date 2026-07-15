import { apiRequest } from "@/lib/api-client-http"

export interface ICareerDashboard {
    applications: {
        total: number
        byStatus: Record<string, number>
        responseRate: number
    }
    formations: {
        enrolled: number
        completed: number
        inProgress: number
    }
    profileViews: number
    interviews: number
    recommendations: string[]
}

export const careerDashboardService = {
    get: async () => {
        return apiRequest<ICareerDashboard>({ endpoint: "/career-dashboard", method: "GET" })
    },
}
