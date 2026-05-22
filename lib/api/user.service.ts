import { ApiResponse } from "@/lib/@types/api"
import { apiRequest } from "@/lib/api-client-http"
import { IUser } from "@/lib/@types/entities"

export const userService = {
    getProfile: async () => {
        try {
            return await apiRequest<ApiResponse<IUser>>({
                endpoint: "/user/profile",
                method: "GET",
                silent: true,
            })
        } catch (error: any) {
            if (error?.statusCode && error.statusCode !== 404) {
                throw error
            }

            return apiRequest<ApiResponse<IUser>>({
                endpoint: "/auth/profile",
                method: "GET",
            })
        }
    },

    updateProfile: async (profileData: Partial<IUser>) => {
        return apiRequest<ApiResponse<IUser>>({
            endpoint: "/user/profile",
            method: "PUT",
            data: profileData,
        })
    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData()
        formData.append("avatar", file)
        return apiRequest<ApiResponse<{ avatarUrl: string }>>({
            endpoint: "/user/avatar",
            method: "POST",
            data: formData,
        })
    },
}
