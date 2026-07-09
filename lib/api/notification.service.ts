import { ApiResponse } from "@/lib/@types/api"
import { apiRequest } from "@/lib/api-client-http"

export const notificationService = {
    getNotifications: async () => {
        return apiRequest<ApiResponse<any[]>>({
            endpoint: "/notifications",
            method: "GET",
        })
    },

    markAsRead: async (notificationId: string) => {
        return apiRequest<ApiResponse<null>>({
            endpoint: `/notifications/${notificationId}/read`,
            method: "PUT",
        })
    },

    markAllAsRead: async () => {
        return apiRequest<ApiResponse<null>>({
            endpoint: "/notifications/read-all",
            method: "PUT",
        })
    },

    deleteNotification: async (notificationId: string) => {
        return apiRequest<ApiResponse<null>>({
            endpoint: `/notifications/${notificationId}`,
            method: "DELETE",
        })
    },

    updateSettings: async (
        settings: {
            applications: boolean
            emplois: boolean
            recommandations: boolean
        },
    ) => {
        return apiRequest<ApiResponse<null>>({
            endpoint: "/notifications/settings",
            method: "PUT",
            data: settings,
        })
    },
}
