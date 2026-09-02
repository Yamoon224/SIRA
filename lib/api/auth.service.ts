import { apiRequest } from "@/lib/api-client-http"
import { ApiResponse } from "@/lib/@types/api"
import { IUser } from "@/lib/@types/entities";

// `skipAuth: true` sur tout ce qui s'exécute avant qu'une session existe : ces
// endpoints sont publics, et passer par resolveToken() ferait dépendre la
// connexion de /api/auth/session — donc du backend — avant même d'avoir tenté
// de se connecter.
export const authService = {
    login: async (credentials: { email: string; password: string }) => {
        return apiRequest<{ access_token: string; user: IUser }>({
            endpoint: "/auth/login",
            method: "POST",
            data: credentials,
            skipAuth: true,
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
            skipAuth: true,
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
            skipAuth: true,
        })
    },

    verifyOtp: async (email: string, code: string, purpose: string = "EMAIL_VERIFICATION") => {
        return apiRequest<{ access_token: string; user: IUser }>({
            endpoint: "/auth/otp/verify",
            method: "POST",
            data: { email, code, purpose },
            skipAuth: true,
        })
    },

    // Réinitialisation de mot de passe : le backend répond toujours 200 avec
    // le même message, qu'un compte existe ou non pour l'adresse.
    forgotPassword: async (email: string) => {
        return apiRequest<{ message: string }>({
            endpoint: "/auth/password/forgot",
            method: "POST",
            data: { email },
            skipAuth: true,
        })
    },

    resetPassword: async (email: string, code: string, password: string) => {
        return apiRequest<{ message: string }>({
            endpoint: "/auth/password/reset",
            method: "POST",
            data: { email, code, password },
            skipAuth: true,
        })
    },

    googleAuth: async (credential: string) => {
        return apiRequest<{ access_token: string; user: IUser; isNewUser: boolean }>({
            endpoint: "/auth/google",
            method: "POST",
            data: { credential },
            skipAuth: true,
        })
    },

    // LinkedIn : on n'envoie que le code d'autorisation, le backend l'échange
    // contre le profil (voir lib/linkedin-auth.ts).
    linkedinAuth: async (code: string, redirectUri: string) => {
        return apiRequest<{ access_token: string; user: IUser; isNewUser: boolean }>({
            endpoint: "/auth/linkedin",
            method: "POST",
            data: { code, redirectUri },
            skipAuth: true,
        })
    },
}
