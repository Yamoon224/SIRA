import { apiRequest } from "@/lib/api-client-http"
import type { IPortfolioDetails, PortfolioStatus, PortfolioTheme } from "@/lib/@types/entities"
import type { IPost } from "@/lib/api/connect.service"

export type ProfileTheme = "DEFAULT" | "CREATIF" | "TECHNIQUE" | "COMMERCIAL" | "ACADEMIQUE"

/**
 * Qui regarde le profil : son propriétaire (mode éditeur), un membre connecté,
 * ou un visiteur non connecté — comme sur LinkedIn.
 */
export type ProfileViewerMode = "owner" | "member" | "public"

/** Vue de gestion (GET/PATCH /profile/me). */
export interface IPublicProfile {
    /** URL personnalisée, `null` tant que le membre n'en a pas choisi. */
    slug: string | null
    /** Segment d'URL effectif : le slug, sinon l'uuid du membre. */
    ref: string
    hasCustomUrl: boolean
    theme: ProfileTheme
    isPublic: boolean
    seoMeta: { title?: string; description?: string } | null
    publicPath: string
    publicUrl: string
}

export interface IPublicPortfolio {
    id: string
    title: string
    description: string
    skills: string[]
    theme: PortfolioTheme
    status: PortfolioStatus
    photo: string | null
    views: number
    details: IPortfolioDetails | null
}

/** Profil tel que le voit le lecteur courant (GET /profiles/{ref}). */
export interface IPublicProfileView {
    ref: string
    slug: string | null
    userId: string
    theme: ProfileTheme
    isPublic: boolean
    viewerMode: ProfileViewerMode
    seoMeta: { title?: string; description?: string } | null
    name: string
    avatar: string | null
    title: string | null
    location: string | null
    bio: string | null
    /** Renseignés pour le propriétaire uniquement. */
    email: string | null
    phone: string | null
    memberSince: string | null
    stats: { followers: number; following: number; posts: number }
    /** `null` hors mode membre. */
    isFollowing: boolean | null
    skills: string[]
    portfolios: IPublicPortfolio[]
    videoPitches: { id: string; type: string; videoUrl: string; score: unknown }[]
    recentPosts: IPost[]
}

/** Même contrainte que UpdatePublicProfileRequest côté backend. */
export const PROFILE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Ramène une saisie libre vers une URL personnalisée valide (« Awa Koné » → « awa-kone »). */
export function slugify(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 100)
}

/** Chemin du profil public d'un membre : son URL personnalisée, sinon son uuid. */
export function profilePath(ref: string): string {
    return `/p/${encodeURIComponent(ref)}`
}

export const publicProfileService = {
    me: async () => {
        return apiRequest<IPublicProfile>({ endpoint: "/profile/me", method: "GET" })
    },

    update: async (
        data: Partial<{ slug: string | null; theme: ProfileTheme; isPublic: boolean; seoMeta: { title?: string; description?: string } }>,
    ) => {
        return apiRequest<IPublicProfile>({ endpoint: "/profile/me", method: "PATCH", data })
    },

    /** Le jeton est joint s'il existe : il décide du mode (propriétaire / membre / public). */
    show: async (ref: string) => {
        return apiRequest<IPublicProfileView>({ endpoint: `/profiles/${encodeURIComponent(ref)}`, method: "GET", silent: true })
    },
}
