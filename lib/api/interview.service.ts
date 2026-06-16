import { apiRequest } from "@/lib/api-client-http"
import { ApiResponse } from "@/lib/@types/api"
import { IInterviewSession } from "@/lib/@types/entities"

export const interviewService = {
    startSession: (data: { position: string }) =>
        apiRequest<ApiResponse<IInterviewSession>>({ endpoint: "/interview-sessions", method: "POST", data }),

    getSession: (id: string) =>
        apiRequest<ApiResponse<IInterviewSession>>({ endpoint: `/interview-sessions/${id}`, method: "GET" }),

    updateSession: (id: string, data: Record<string, unknown>) =>
        apiRequest<ApiResponse<IInterviewSession>>({ endpoint: `/interview-sessions/${id}`, method: "PATCH", data }),

    deleteSession: (id: string) =>
        apiRequest<ApiResponse<null>>({ endpoint: `/interview-sessions/${id}`, method: "DELETE" }),
}
