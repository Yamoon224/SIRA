"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { en } from "@/lib/i18n/en"
import { fr, type Dictionary } from "@/lib/i18n/fr"
import { localeService, type SupportedLocale } from "@/lib/api/locale.service"

const DICTIONARIES: Record<SupportedLocale, Dictionary> = { fr, en }

/**
 * Clé de stockage local. La locale du compte fait autorité, mais elle arrive
 * après un aller-retour réseau : sans cette copie, chaque chargement de page
 * afficherait le français une fraction de seconde avant de basculer.
 */
const STORAGE_KEY = "goriya.locale"

/** Chemins de clés valides, du type `"nav.home"`. */
type Leaves<T, P extends string = ""> = {
    [K in keyof T & string]: T[K] extends string
        ? `${P}${K}`
        : Leaves<T[K], `${P}${K}.`>
}[keyof T & string]

export type TranslationKey = Leaves<Dictionary>

interface I18nValue {
    locale: SupportedLocale
    setLocale: (locale: SupportedLocale) => Promise<void>
    /** Traduit une clé ; `vars` remplace les jetons `{nom}` du message. */
    t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function readStoredLocale(): SupportedLocale {
    if (typeof window === "undefined") return "fr"
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        return stored === "en" ? "en" : "fr"
    } catch {
        // Navigation privée ou stockage bloqué : le français reste le défaut.
        return "fr"
    }
}

function resolve(dictionary: Dictionary, key: string): string | undefined {
    return key.split(".").reduce<any>((node, part) => (node == null ? undefined : node[part]), dictionary)
}

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<SupportedLocale>("fr")

    useEffect(() => {
        setLocaleState(readStoredLocale())
    }, [])

    // La locale du compte prime : elle suit l'utilisateur d'un appareil à
    // l'autre. L'appel échoue silencieusement hors session.
    useEffect(() => {
        localeService
            .get()
            .then((res) => {
                const value = ((res as any)?.data ?? res)?.locale
                if (value === "fr" || value === "en") {
                    setLocaleState(value)
                    try {
                        window.localStorage.setItem(STORAGE_KEY, value)
                    } catch {
                        // Sans stockage, on garde simplement l'état mémoire.
                    }
                }
            })
            .catch(() => {
                // Visiteur non connecté : la locale locale suffit.
            })
    }, [])

    useEffect(() => {
        document.documentElement.lang = locale
    }, [locale])

    const setLocale = useCallback(async (next: SupportedLocale) => {
        setLocaleState(next)
        try {
            window.localStorage.setItem(STORAGE_KEY, next)
        } catch {
            // Idem : le changement reste valable pour la session en cours.
        }
        await localeService.update(next)
    }, [])

    const t = useCallback<I18nValue["t"]>(
        (key, vars) => {
            const dictionary = DICTIONARIES[locale]
            // Repli sur le français : une clé absente doit rester lisible.
            const message = resolve(dictionary, key) ?? resolve(fr, key) ?? key
            if (!vars) return message
            return message.replace(/\{(\w+)\}/g, (match, name) =>
                name in vars ? String(vars[name]) : match,
            )
        },
        [locale],
    )

    const value = useMemo<I18nValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t])

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
    const ctx = useContext(I18nContext)
    if (!ctx) throw new Error("useI18n doit être utilisé dans un <I18nProvider>")
    return ctx
}

/** Raccourci pour les composants qui n'ont besoin que de traduire. */
export function useT() {
    return useI18n().t
}
