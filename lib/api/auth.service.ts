import { apiRequest } from "@/lib/api-client-http"
import { ApiResponse } from "@/lib/@types/api"
import { IUser } from "@/lib/@types/entities";

export const authService = {
    login: async (credentials: { email: string; password: string }) => {
        return apiRequest<{ access_token: string; user: IUser }>({
            endpoint: "/auth/login",
            method: "POST",
            data: credentials,
        })
    },

    signup: async (userData: {
        name: string
        email: string
        password: string,
        role: string,
        acceptTerms?: boolean
    }) => {
        return apiRequest<ApiResponse<{ token: string; user: IUser }>>({
            endpoint: "/users",
            method: "POST",
            data: userData,
        })
    },

    logout: async () => {
        return apiRequest<ApiResponse<null>>({
            endpoint: "/auth/logout",
            method: "POST",
        })
    },

    refreshToken: async () => {
        return apiRequest<ApiResponse<{ token: string }>>(  {
            endpoint: "/auth/refresh",
            method: "POST",
        })
    },

    requestOtp: async (email: string, purpose: string = "EMAIL_VERIFICATION") => {
        return apiRequest<{ message: string }>({
            endpoint: "/auth/otp/request",
            method: "POST",
            data: { email, purpose },
        })
    },

    verifyOtp: async (email: string, code: string, purpose: string = "EMAIL_VERIFICATION") => {
        return apiRequest<{ access_token: string; user: IUser }>({
            endpoint: "/auth/otp/verify",
            method: "POST",
            data: { email, code, purpose },
        })
    },

    googleAuth: async (credential: string) => {
        return apiRequest<{ access_token: string; user: IUser; isNewUser: boolean }>({
            endpoint: "/auth/google",
            method: "POST",
            data: { credential },
        })
    },

    // LinkedIn : on n'envoie que le code d'autorisation, le backend l'échange
    // contre le profil (voir lib/linkedin-auth.ts).
    linkedinAuth: async (code: string, redirectUri: string) => {
        return apiRequest<{ access_token: string; user: IUser; isNewUser: boolean }>({
            endpoint: "/auth/linkedin",
            method: "POST",
            data: { code, redirectUri },
        })
    },
}
