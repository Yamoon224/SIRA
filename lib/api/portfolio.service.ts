import { apiRequest } from "@/lib/api-client-http"
import { ApiResponse, IPaginatedResponse } from "@/lib/@types/api"
import { IPortfolio } from "@/lib/@types/entities"

export const portfolioService = {
    getPortfolios: (params?: { page?: number; limit?: number }) =>
        apiRequest<IPaginatedResponse<IPortfolio>>({ endpoint: "/portfolios/paginate", method: "GET", params }),

    getPortfolioById: (id: string) =>
        apiRequest<ApiResponse<IPortfolio>>({ endpoint: `/portfolios/${id}`, method: "GET" }),

    createPortfolio: (data: Record<string, unknown>) =>
        apiRequest<ApiResponse<IPortfolio>>({ endpoint: "/portfolios", method: "POST", data }),

    updatePortfolio: (id: string, data: Record<string, unknown>) =>
        apiRequest<ApiResponse<IPortfolio>>({ endpoint: `/portfolios/${id}`, method: "PATCH", data }),

    deletePortfolio: (id: string) =>
        apiRequest<ApiResponse<null>>({ endpoint: `/portfolios/${id}`, method: "DELETE" }),
}
