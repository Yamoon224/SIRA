import { apiRequest } from "@/lib/api-client-http"
import { ApiResponse, IPaginatedResponse } from "@/lib/@types/api"
import type { IJobOffer } from "@/lib/@types/entities"

export interface IConnectUser {
    id: string
    name: string
    avatar: string | null
    companyName: string | null
}

export type CommunityType = "SECTOR" | "COUNTRY" | "EXPERTISE"

export interface ICommunity {
    id: string
    name: string
    slug: string
    description: string | null
    type: CommunityType
    membersCount: number
}

export interface IPost {
    id: string
    content: string
    author: IConnectUser | null
    communityId: string | null
    likesCount: number
    createdAt: string
}

export const connectionService = {
    follow: async (userId: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/users/${userId}/follow`, method: "POST" })
    },
    unfollow: async (userId: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/users/${userId}/follow`, method: "DELETE" })
    },
    followers: async () => {
        return apiRequest<IConnectUser[]>({ endpoint: "/me/followers", method: "GET" })
    },
    following: async () => {
        return apiRequest<IConnectUser[]>({ endpoint: "/me/following", method: "GET" })
    },
    peopleRecommendations: async () => {
        return apiRequest<IConnectUser[]>({ endpoint: "/me/recommendations/people", method: "GET" })
    },
    jobOfferRecommendations: async () => {
        return apiRequest<IJobOffer[]>({ endpoint: "/me/recommendations/job-offers", method: "GET" })
    },
}

export const communityService = {
    list: async (type?: CommunityType) => {
        return apiRequest<ICommunity[]>({ endpoint: "/communities", method: "GET", params: type ? { type } : undefined })
    },
    get: async (id: string) => {
        return apiRequest<ICommunity>({ endpoint: `/communities/${id}`, method: "GET" })
    },
    create: async (name: string, type: CommunityType, description?: string) => {
        return apiRequest<ICommunity>({ endpoint: "/communities", method: "POST", data: { name, type, description } })
    },
    join: async (id: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/communities/${id}/join`, method: "POST" })
    },
    leave: async (id: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/communities/${id}/join`, method: "DELETE" })
    },
    recommendations: async () => {
        return apiRequest<ICommunity[]>({ endpoint: "/me/recommendations/communities", method: "GET" })
    },
}

export const postService = {
    feed: async (page = 1, limit = 10) => {
        return apiRequest<IPaginatedResponse<IPost>>({ endpoint: "/posts/feed", method: "GET", params: { page, limit } })
    },
    create: async (content: string, communityId?: string) => {
        return apiRequest<IPost>({ endpoint: "/posts", method: "POST", data: { content, communityId } })
    },
    toggleLike: async (id: string) => {
        return apiRequest<{ liked: boolean }>({ endpoint: `/posts/${id}/like`, method: "POST" })
    },
    remove: async (id: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/posts/${id}`, method: "DELETE" })
    },
}
