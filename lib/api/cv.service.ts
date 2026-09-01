import { apiRequest } from "@/lib/api-client-http"

export interface CvDraft {
    data: Record<string, string> | null
    step: number
    updatedAt: string | null
}

// Le backend renvoie une JsonResource → payload encapsulé dans `data`.
export const cvService = {
    get: () =>
        apiRequest<{ data: CvDraft }>({ endpoint: "/me/cv", method: "GET" }),

    save: (payload: { data?: Record<string, string> | null; step?: number }) =>
        apiRequest<{ data: CvDraft }>({ endpoint: "/me/cv", method: "PUT", data: payload }),

    remove: () =>
        apiRequest<null>({ endpoint: "/me/cv", method: "DELETE", silent: true }),
}
