import { apiRequest } from "@/lib/api-client-http"
import { resolveToken } from "@/lib/utils"
import axios from "axios"

export type PitchType = "EMPLOI" | "CONCOURS" | "APPEL_PROJET" | "STARTUP"
export type PitchFormat = "TEXT" | "VIDEO"
export type PitchStatus = "DRAFT" | "PROCESSING" | "READY" | "FAILED"

export interface IPitchScore {
    clarte: number
    impact: number
    persuasion: number
    feedback: string
}

export interface IPitch {
    id: string
    jobOfferId: string | null
    type: PitchType
    format: PitchFormat
    content: string
    videoPath: string | null
    score: IPitchScore | null
    status: PitchStatus
    isPublic: boolean
    createdAt: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://goriya-api.lunion-lab.com"

export const pitchService = {
    list: async () => {
        return apiRequest<IPitch[]>({ endpoint: "/pitches", method: "GET" })
    },

    create: async (type: PitchType, jobOfferId?: string, content?: string) => {
        return apiRequest<IPitch>({ endpoint: "/pitches", method: "POST", data: { type, jobOfferId, content } })
    },

    get: async (id: string) => {
        return apiRequest<IPitch>({ endpoint: `/pitches/${id}`, method: "GET" })
    },

    // Upload multipart — apiRequest ne gère pas FormData avec le bon Content-Type
    // automatiquement dans tous les cas, on passe donc par axios directement ici
    // en respectant le même schéma d'auth (Bearer token résolu depuis la session).
    uploadVideo: async (id: string, file: File) => {
        const token = await resolveToken()
        const form = new FormData()
        form.append("video", file)
        const response = await axios.post(`${API_BASE_URL}/pitches/${id}/video`, form, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
        return response.data as IPitch
    },

    renderAvatar: async (id: string) => {
        return apiRequest<IPitch>({ endpoint: `/pitches/${id}/avatar-video`, method: "POST" })
    },

    toggleVisibility: async (id: string) => {
        return apiRequest<IPitch>({ endpoint: `/pitches/${id}/visibility`, method: "PATCH" })
    },

    sendToRecruiter: async (id: string, jobOfferId: string) => {
        return apiRequest<any>({ endpoint: `/pitches/${id}/send`, method: "POST", data: { jobOfferId } })
    },

    remove: async (id: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/pitches/${id}`, method: "DELETE" })
    },
}
