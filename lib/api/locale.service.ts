import { apiRequest } from "@/lib/api-client-http"

/** Valeurs acceptées par l'API (enum `Locale` côté backend). */
export type Locale = "fr" | "en" | "pt" | "ar"

/**
 * Langues réellement proposées dans l'interface. Le backend en accepte
 * davantage, mais seules celles-ci sont traduites.
 */
export const SUPPORTED_LOCALES = ["fr", "en"] as const satisfies readonly Locale[]

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
    fr: "Français",
    en: "English",
}

export const localeService = {
    get: async () => {
        return apiRequest<{ locale: Locale }>({ endpoint: "/me/locale", method: "GET" })
    },

    update: async (locale: Locale) => {
        return apiRequest<{ locale: Locale }>({ endpoint: "/me/locale", method: "PATCH", data: { locale } })
    },
}
