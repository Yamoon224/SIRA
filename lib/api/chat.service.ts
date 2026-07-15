import { apiRequest } from "@/lib/api-client-http"

export interface IChatMessage {
    id: string
    role: "USER" | "ASSISTANT"
    content: string
    createdAt: string
}

export interface IChatThread {
    id: string
    title: string | null
    messages?: IChatMessage[]
    createdAt: string
    updatedAt: string
}

export const chatService = {
    listThreads: async () => {
        return apiRequest<IChatThread[]>({ endpoint: "/chat/threads", method: "GET" })
    },

    createThread: async (message: string) => {
        return apiRequest<IChatThread>({ endpoint: "/chat/threads", method: "POST", data: { message } })
    },

    getThread: async (id: string) => {
        return apiRequest<IChatThread>({ endpoint: `/chat/threads/${id}`, method: "GET" })
    },

    sendMessage: async (id: string, message: string) => {
        return apiRequest<IChatThread>({ endpoint: `/chat/threads/${id}/messages`, method: "POST", data: { message } })
    },

    deleteThread: async (id: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/chat/threads/${id}`, method: "DELETE" })
    },
}
