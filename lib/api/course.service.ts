import { apiRequest } from "@/lib/api-client-http"
import { resolveToken } from "@/lib/utils"
import { IPaginatedResponse } from "@/lib/@types/api"
import axios from "axios"

export interface ICourse {
    id: string
    title: string
    description: string | null
    category: string | null
    provider: string | null
    durationHours: number | null
    thumbnailPath: string | null
}

export interface IEnrollment {
    id: string
    course: ICourse | null
    progress: number
    status: "IN_PROGRESS" | "COMPLETED"
    hasCertificate: boolean
    enrolledAt: string
    completedAt: string | null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://goriya-api.lunion-lab.com"

export const courseService = {
    paginate: async (filters?: { page?: number; limit?: number; category?: string }) => {
        return apiRequest<IPaginatedResponse<ICourse>>({ endpoint: "/courses/paginate", method: "GET", params: filters })
    },

    get: async (id: string) => {
        return apiRequest<ICourse>({ endpoint: `/courses/${id}`, method: "GET" })
    },
}

export const enrollmentService = {
    list: async () => {
        return apiRequest<IEnrollment[]>({ endpoint: "/enrollments", method: "GET" })
    },

    enroll: async (courseId: string) => {
        return apiRequest<IEnrollment>({ endpoint: `/courses/${courseId}/enroll`, method: "POST" })
    },

    updateProgress: async (id: string, progress: number) => {
        return apiRequest<IEnrollment>({ endpoint: `/enrollments/${id}/progress`, method: "PATCH", data: { progress } })
    },

    // Fichier privé protégé par JWT — pas de proxy dans cette app, donc pas de
    // simple <a href>. On télécharge en blob authentifié puis on déclenche le
    // téléchargement navigateur via une URL objet temporaire.
    downloadCertificate: async (id: string, filename: string) => {
        const token = await resolveToken()
        const response = await axios.get(`${API_BASE_URL}/enrollments/${id}/certificate`, {
            responseType: "blob",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const url = URL.createObjectURL(response.data as Blob)
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
    },
}
