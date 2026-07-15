import { apiRequest } from "@/lib/api-client-http"

export type CallSessionStatus = "SCHEDULED" | "ACTIVE" | "ENDED"

export interface ICallSession {
    id: string
    hostId: string
    title: string
    roomSlug: string
    scheduledAt: string | null
    status: CallSessionStatus
    recordingUrl: string | null
    endedAt: string | null
    createdAt: string
}

export interface ICallJoinToken {
    token: string
    url: string
    room: string
    identity: string
    expiresAt: string
}

export const callSessionService = {
    list: async () => {
        return apiRequest<ICallSession[]>({ endpoint: "/calls", method: "GET" })
    },

    schedule: async (title: string, scheduledAt?: string) => {
        return apiRequest<ICallSession>({ endpoint: "/calls", method: "POST", data: { title, scheduledAt } })
    },

    get: async (id: string) => {
        return apiRequest<ICallSession>({ endpoint: `/calls/${id}`, method: "GET" })
    },

    join: async (id: string) => {
        return apiRequest<ICallJoinToken>({ endpoint: `/calls/${id}/join`, method: "POST" })
    },

    end: async (id: string) => {
        return apiRequest<ICallSession>({ endpoint: `/calls/${id}/end`, method: "POST" })
    },
}
