import { apiRequest } from "@/lib/api-client-http"
import { IPaginatedResponse } from "@/lib/@types/api"

export interface IArticle {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    coverImage: string | null
    authorName: string | null
    status: "DRAFT" | "PUBLISHED"
    publishedAt: string | null
    createdAt: string
    updatedAt: string
}

export const articleService = {
    getArticles: async (filters?: { page?: number; limit?: number }) => {
        return apiRequest<IPaginatedResponse<IArticle>>({
            endpoint: "/articles",
            method: "GET",
            params: filters,
        })
    },

    getArticleBySlug: async (slug: string) => {
        return apiRequest<IArticle>({
            endpoint: `/articles/${slug}`,
            method: "GET",
        })
    },
}
