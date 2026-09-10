import { apiRequest } from "@/lib/api-client-http"
import { ApiResponse, IPaginatedResponse } from "@/lib/@types/api"
import type { IPortfolio, IPortfolioDetails, PortfolioStatus, PortfolioTheme } from "@/lib/@types/entities"

/** Corps accepté par POST /portfolios et PATCH /portfolios/{id}. */
export interface PortfolioPayload {
    title: string
    description?: string
    skills?: string[]
    theme?: PortfolioTheme
    status?: PortfolioStatus
    /** Chemin renvoyé par `uploadPhoto` ; `null` retire la photo. */
    photo?: string | null
    details?: IPortfolioDetails | null
    createdDate?: string
    userId?: string
}

/** Alignés sur PortfolioService / PortfoliosController::uploadPhoto côté backend. */
export const PORTFOLIO_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp"
export const PORTFOLIO_PHOTO_MAX_BYTES = 5 * 1024 * 1024

export const portfolioService = {
    /** Les brouillons ne sont renvoyés que lorsque `userId` est l'utilisateur connecté. */
    getPortfolios: (params?: { page?: number; limit?: number; userId?: string; status?: PortfolioStatus }) =>
        apiRequest<IPaginatedResponse<IPortfolio>>({ endpoint: "/portfolios/paginate", method: "GET", params }),

    getPortfolioById: (id: string) =>
        apiRequest<ApiResponse<IPortfolio>>({ endpoint: `/portfolios/${id}`, method: "GET" }),

    createPortfolio: (data: PortfolioPayload | Record<string, unknown>) =>
        apiRequest<ApiResponse<IPortfolio>>({ endpoint: "/portfolios", method: "POST", data }),

    updatePortfolio: (id: string, data: Partial<PortfolioPayload> | Record<string, unknown>) =>
        apiRequest<ApiResponse<IPortfolio>>({ endpoint: `/portfolios/${id}`, method: "PATCH", data }),

    deletePortfolio: (id: string) =>
        apiRequest<ApiResponse<null>>({ endpoint: `/portfolios/${id}`, method: "DELETE" }),

    /** POST multipart : PHP ne parse pas les corps multipart en PATCH/PUT. */
    uploadPhoto: (file: File) => {
        const form = new FormData()
        form.append("photo", file)
        return apiRequest<ApiResponse<{ path: string; url: string }>>({ endpoint: "/portfolios/photo", method: "POST", data: form })
    },
}
