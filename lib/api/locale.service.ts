import { apiRequest } from "@/lib/api-client-http"

export type Locale = "fr" | "en" | "pt" | "ar"

export const localeService = {
    get: async () => {
        return apiRequest<{ locale: Locale }>({ endpoint: "/me/locale", method: "GET" })
    },

    update: async (locale: Locale) => {
        return apiRequest<{ locale: Locale }>({ endpoint: "/me/locale", method: "PATCH", data: { locale } })
    },
}
