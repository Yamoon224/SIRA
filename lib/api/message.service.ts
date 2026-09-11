import { apiRequest } from "@/lib/api-client-http"
import { ApiResponse } from "@/lib/@types/api"

async function requestWithFallback<T>(
    endpoints: string[],
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: any,
) {
    let lastError: any

    for (const endpoint of endpoints) {
        try {
            return await apiRequest<T>({ endpoint, method, data, silent: true })
        } catch (error: any) {
            lastError = error
            // On tente le prochain endpoint uniquement pour les 404.
            if (error?.statusCode !== 404) {
                throw error
            }
        }
    }

    throw lastError
}

export const messageService = {
    getConversations: async () => {
        return requestWithFallback<ApiResponse<any[]>>(
            [
                "/messages/conversations",
                "/conversations",
                "/message/conversations",
            ],
            "GET",
        )
    },

    getConversationMessages: async (conversationId: string) => {
        return requestWithFallback<ApiResponse<any[]>>(
            [
                `/messages/conversations/${conversationId}/messages`,
                `/conversations/${conversationId}/messages`,
                `/message/conversations/${conversationId}/messages`,
            ],
            "GET",
        )
    },

    sendMessage: async (conversationId: string, content: string) => {
        return requestWithFallback<ApiResponse<any>>(
            [
                `/messages/conversations/${conversationId}/messages`,
                `/conversations/${conversationId}/messages`,
                `/message/conversations/${conversationId}/messages`,
            ],
            "POST",
            { content },
        )
    },

    /**
     * Meme endpoint que sendMessage, mais en multipart : axios pose lui-meme
     * le Content-Type et sa boundary a partir du FormData.
     */
    sendAttachment: async (conversationId: string, file: File, content = "") => {
        const body = new FormData()
        body.append("attachment", file)
        if (content) body.append("content", content)

        return requestWithFallback<ApiResponse<any>>(
            [
                `/messages/conversations/${conversationId}/messages`,
                `/conversations/${conversationId}/messages`,
                `/message/conversations/${conversationId}/messages`,
            ],
            "POST",
            body,
        )
    },

    markAsRead: async (conversationId: string) => {
        return requestWithFallback<ApiResponse<null>>(
            [
                `/messages/conversations/${conversationId}/read`,
                `/conversations/${conversationId}/read`,
                `/message/conversations/${conversationId}/read`,
            ],
            "PUT",
        )
    },

    createConversation: async (candidatureId: string) => {
        return requestWithFallback<ApiResponse<any>>(
            [
                "/messages/conversations",
                "/conversations",
                "/message/conversations",
            ],
            "POST",
            { candidatureId },
        )
    },

    markAsUnread: async (conversationId: string) => {
        return requestWithFallback<ApiResponse<null>>(
            [
                `/messages/conversations/${conversationId}/unread`,
                `/conversations/${conversationId}/unread`,
                `/message/conversations/${conversationId}/unread`,
            ],
            "PUT",
        )
    },

    /** Sans argument, bascule l'état courant (même comportement que l'étoile de l'en-tête). */
    setStarred: async (conversationId: string, starred?: boolean) => {
        return requestWithFallback<ApiResponse<any>>(
            [
                `/messages/conversations/${conversationId}/star`,
                `/conversations/${conversationId}/star`,
                `/message/conversations/${conversationId}/star`,
            ],
            "PUT",
            typeof starred === "boolean" ? { starred } : undefined,
        )
    },

    deleteConversation: async (conversationId: string) => {
        return requestWithFallback<ApiResponse<null>>(
            [
                `/messages/conversations/${conversationId}`,
                `/conversations/${conversationId}`,
                `/message/conversations/${conversationId}`,
            ],
            "DELETE",
        )
    },
}
