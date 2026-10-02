import { apiRequest } from "@/lib/api-client-http"

export interface IChatAttachment {
    name: string
    mime: string
}

export interface IChatMessage {
    id: string
    role: "USER" | "ASSISTANT"
    content: string
    attachments?: IChatAttachment[]
    createdAt: string
}

export interface IChatThread {
    id: string
    title: string | null
    messages?: IChatMessage[]
    createdAt: string
    updatedAt: string
}

/** Résultat de recherche : un fil et, s'il y en a un, l'extrait du message trouvé. */
export interface IChatSearchResult {
    id: string
    title: string | null
    excerpt: string | null
    updatedAt: string
}

/** Aligné sur SendChatMessageRequest côté backend. */
export const CHAT_FILE_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.txt,.docx"
export const CHAT_FILE_MAX_BYTES = 5 * 1024 * 1024
export const CHAT_FILE_MAX_COUNT = 3

// La réponse IA (a fortiori avec des fichiers à lire) dépasse le délai par
// défaut des appels backend.
const REPLY_TIMEOUT_MS = 90_000

/** JSON pour un message simple, multipart dès qu'il y a des pièces jointes. */
const corps = (message: string, files: File[]) => {
    if (files.length === 0) return { message }
    const form = new FormData()
    if (message) form.append("message", message)
    files.forEach((file) => form.append("files[]", file))
    return form
}

export const chatService = {
    listThreads: async () => {
        return apiRequest<IChatThread[]>({ endpoint: "/chat/threads", method: "GET" })
    },

    search: async (q: string) => {
        return apiRequest<IChatSearchResult[]>({ endpoint: "/chat/search", method: "GET", params: { q }, silent: true })
    },

    createThread: async (message: string, files: File[] = []) => {
        return apiRequest<IChatThread>({ endpoint: "/chat/threads", method: "POST", data: corps(message, files), timeout: REPLY_TIMEOUT_MS })
    },

    getThread: async (id: string) => {
        return apiRequest<IChatThread>({ endpoint: `/chat/threads/${id}`, method: "GET" })
    },

    sendMessage: async (id: string, message: string, files: File[] = []) => {
        return apiRequest<IChatThread>({ endpoint: `/chat/threads/${id}/messages`, method: "POST", data: corps(message, files), timeout: REPLY_TIMEOUT_MS })
    },

    deleteThread: async (id: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/chat/threads/${id}`, method: "DELETE" })
    },
}
