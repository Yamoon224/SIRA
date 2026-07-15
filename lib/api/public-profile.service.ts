import { apiRequest } from "@/lib/api-client-http"

export type ProfileTheme = "DEFAULT" | "CREATIF" | "TECHNIQUE" | "COMMERCIAL" | "ACADEMIQUE"

export interface IPublicProfile {
    slug: string
    theme: ProfileTheme
    isPublic: boolean
    seoMeta: { title?: string; description?: string } | null
    publicUrl: string
}

export interface IPublicProfileView {
    slug: string
    theme: ProfileTheme
    seoMeta: { title?: string; description?: string } | null
    name: string
    avatar: string | null
    portfolios: { title: string; description: string; skills: string[] }[]
    videoPitches: { id: string; type: string; videoUrl: string; score: unknown }[]
}

export const publicProfileService = {
    me: async () => {
        return apiRequest<IPublicProfile>({ endpoint: "/profile/me", method: "GET" })
    },

    update: async (data: Partial<{ slug: string; theme: ProfileTheme; isPublic: boolean; seoMeta: { title?: string; description?: string } }>) => {
        return apiRequest<IPublicProfile>({ endpoint: "/profile/me", method: "PATCH", data })
    },

    showBySlug: async (slug: string) => {
        return apiRequest<IPublicProfileView>({ endpoint: `/profiles/${slug}`, method: "GET" })
    },
}
