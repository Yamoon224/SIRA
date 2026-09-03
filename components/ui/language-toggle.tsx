"use client"

import { useEffect, useState } from "react"
import { Check, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/contexts/i18n-context"
import { LOCALE_LABELS, SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/api/locale.service"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/**
 * Sélecteur de langue du header. La locale réelle n'est connue qu'après
 * hydratation (localStorage puis compte) : on réserve la place d'ici là pour
 * éviter un décalage de mise en page.
 */
export function LanguageToggle() {
    const [mounted, setMounted] = useState(false)
    const { locale, setLocale, t } = useI18n()
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSelect = async (next: SupportedLocale) => {
        if (next === locale) return
        setSaving(true)
        try {
            await setLocale(next)
        } catch (err) {
            console.error("[language-toggle] locale update error:", err)
        } finally {
            setSaving(false)
        }
    }

    if (!mounted) {
        return <Button variant="outline" size="icon" disabled className="opacity-0 rounded-full" aria-hidden />
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full" disabled={saving}>
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">{t("nav.changeLanguage")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {SUPPORTED_LOCALES.map((value) => (
                    <DropdownMenuItem key={value} onClick={() => handleSelect(value)} className="justify-between gap-4">
                        {LOCALE_LABELS[value]}
                        {locale === value && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
