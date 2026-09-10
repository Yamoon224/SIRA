import { apiRequest } from "@/lib/api-client-http"
import type { IJobOffer } from "@/lib/@types/entities"

export interface IConnectUser {
    id: string
    name: string
    /** Titre professionnel, affiché sous le nom comme le headline LinkedIn. */
    title?: string | null
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

/** Page renvoyée par ApiResponse::paginated côté backend. */
export interface IPage<T> {
    data: T[]
    meta: { total: number; page: number; limit: number; totalPages: number }
}

export type PostAttachmentType = "IMAGE" | "DOCUMENT"

export interface IPostAttachment {
    id: string
    type: PostAttachmentType
    url: string
    name: string
    mimeType: string | null
    size: number
}

export interface IPost {
    id: string
    /** `null` pour un post fait d'images seules ou une republication sans commentaire. */
    content: string | null
    author: IConnectUser | null
    communityId: string | null
    attachments: IPostAttachment[]
    likesCount: number
    commentsCount: number
    repostsCount: number
    likedByMe: boolean
    repostedByMe: boolean
    /** Post republié ; absent pour un post original, `null` si l'original a été supprimé. */
    repostOf?: IPost | null
    createdAt: string
}

export interface IPostComment {
    id: string
    postId: string
    content: string
    author: IConnectUser | null
    createdAt: string
}

/** Alignés sur PostService côté backend : 9 images, ou un PDF publié seul. */
export const POST_MAX_IMAGES = 9
export const POST_MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const POST_MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
export const POST_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
export const POST_DOCUMENT_TYPES = ["application/pdf"]
export const POST_MAX_LENGTH = 3000
export const COMMENT_MAX_LENGTH = 1250

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
        return apiRequest<IPage<IPost>>({ endpoint: "/posts/feed", method: "GET", params: { page, limit } })
    },
    get: async (id: string) => {
        return apiRequest<IPost>({ endpoint: `/posts/${id}`, method: "GET" })
    },
    /** Multipart : le texte est facultatif dès qu'une image ou un PDF est joint. */
    create: async ({ content, files = [], communityId }: { content?: string; files?: File[]; communityId?: string }) => {
        const form = new FormData()
        if (content?.trim()) form.append("content", content.trim())
        if (communityId) form.append("communityId", communityId)
        files.forEach((file) => form.append("attachments[]", file))
        return apiRequest<IPost>({ endpoint: "/posts", method: "POST", data: form })
    },
    toggleLike: async (id: string) => {
        return apiRequest<{ liked: boolean; likesCount: number }>({ endpoint: `/posts/${id}/like`, method: "POST" })
    },
    repost: async (id: string, content?: string) => {
        return apiRequest<IPost>({ endpoint: `/posts/${id}/repost`, method: "POST", data: { content: content?.trim() || null } })
    },
    comments: async (id: string, page = 1, limit = 10) => {
        return apiRequest<IPage<IPostComment>>({ endpoint: `/posts/${id}/comments`, method: "GET", params: { page, limit } })
    },
    addComment: async (id: string, content: string) => {
        return apiRequest<IPostComment>({ endpoint: `/posts/${id}/comments`, method: "POST", data: { content } })
    },
    deleteComment: async (postId: string, commentId: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/posts/${postId}/comments/${commentId}`, method: "DELETE" })
    },
    remove: async (id: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/posts/${id}`, method: "DELETE" })
    },
}
