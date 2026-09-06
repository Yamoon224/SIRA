import { ApiResponse } from "@/lib/@types/api"
import { apiRequest } from "@/lib/api-client-http"

/**
 * Origine d'un CV : « builder » pour un PDF produit par le créateur de CV,
 * « upload » pour un fichier déposé par le candidat.
 */
export type ResumeSource = "upload" | "builder"

/** Un CV de la bibliothèque du candidat (`/me/resumes`). */
export interface IResume {
    id: string
    name: string
    source: ResumeSource
    url: string | null
    mimeType: string | null
    size: number
    isDefault: boolean
    createdAt: string
}

/** Aligné sur UserResumeService côté backend — sert aussi aux messages d'erreur. */
export const RESUME_MAX_SIZE_BYTES = 5 * 1024 * 1024
export const RESUME_ACCEPT = ".pdf,.doc,.docx"

export const resumeService = {
    list: async () => {
        return apiRequest<ApiResponse<IResume[]>>({
            endpoint: "/me/resumes",
            method: "GET",
            silent: true,
        })
    },

    upload: async (file: File, name?: string, source: ResumeSource = "upload") => {
        const form = new FormData()
        form.append("file", file)
        if (name) form.append("name", name)
        form.append("source", source)

        // POST et non PATCH : PHP ne parse pas les corps multipart en PATCH/PUT.
        return apiRequest<ApiResponse<IResume>>({
            endpoint: "/me/resumes",
            method: "POST",
            data: form,
        })
    },

    update: async (id: string, data: { name?: string; isDefault?: boolean }) => {
        return apiRequest<ApiResponse<IResume>>({
            endpoint: `/me/resumes/${id}`,
            method: "PATCH",
            data,
        })
    },

    remove: async (id: string) => {
        return apiRequest<ApiResponse<null>>({
            endpoint: `/me/resumes/${id}`,
            method: "DELETE",
        })
    },
}
