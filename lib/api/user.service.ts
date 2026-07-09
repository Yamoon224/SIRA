import { ApiResponse } from "@/lib/@types/api"
import { apiRequest } from "@/lib/api-client-http"
import { IUser } from "@/lib/@types/entities"

export const userService = {
    getProfile: async () => {
        try {
            // /admin/auth/profile n'est en réalité restreinte à aucun rôle
            // particulier (voir AdminAuthController) — c'est la seule route
            // qui renvoie le User complet (avec company), /auth/profile ne
            // renvoie que les claims du JWT.
            return await apiRequest<ApiResponse<IUser>>({
                endpoint: "/admin/auth/profile",
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
            endpoint: "/admin/user/profile",
            method: "PUT",
            data: profileData,
        })
    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData()
        formData.append("avatar", file)
        return apiRequest<ApiResponse<{ avatarUrl: string }>>({
            endpoint: "/admin/user/avatar",
            method: "POST",
            data: formData,
        })
    },
}
