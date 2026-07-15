import { apiRequest } from "@/lib/api-client-http"

export type PresentationType = "SLIDES" | "SCHEMA"

export interface ISlide {
    title: string
    bullets: string[]
}

export interface ISchemaNode {
    id: string
    label: string
}

export interface ISchemaEdge {
    from: string
    to: string
    label?: string
}

export interface IPresentation {
    id: string
    title: string
    type: PresentationType
    brief: string
    content: { slides: ISlide[] } | { nodes: ISchemaNode[]; edges: ISchemaEdge[] }
    createdAt: string
}

export const presentationService = {
    list: async () => {
        return apiRequest<IPresentation[]>({ endpoint: "/presentations", method: "GET" })
    },

    create: async (title: string, type: PresentationType, brief: string) => {
        return apiRequest<IPresentation>({ endpoint: "/presentations", method: "POST", data: { title, type, brief } })
    },

    get: async (id: string) => {
        return apiRequest<IPresentation>({ endpoint: `/presentations/${id}`, method: "GET" })
    },

    exportPptx: async (id: string) => {
        return apiRequest<{ url: string }>({ endpoint: `/presentations/${id}/export-pptx`, method: "GET" })
    },

    remove: async (id: string) => {
        return apiRequest<{ message: string }>({ endpoint: `/presentations/${id}`, method: "DELETE" })
    },
}
