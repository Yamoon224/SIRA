"use client"

import { useState } from "react"
import { Loader2, Sparkles, Ticket } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/contexts/i18n-context"
import { courseService, type ICourseAccess } from "@/lib/api/course.service"

/**
 * Bandeau d'accès au catalogue : propose le pass découverte de 7 jours tant
 * qu'il n'a pas été utilisé, sinon rappelle sa date de fin. Rien à afficher
 * quand le forfait couvre déjà les formations.
 */
export function PassBanner({ access, onChange, compact = false }: { access: ICourseAccess | null; onChange: (a: ICourseAccess) => void; compact?: boolean }) {
    const { t, locale } = useI18n()
    const [activating, setActivating] = useState(false)

    if (!access || access.viaPlan) return null

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "long" })

    if (access.pass?.active) {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Ticket className="h-4 w-4 shrink-0" />
                {t("training.pass.activeUntil", { date: formatDate(access.pass.endsAt) })}
            </div>
        )
    }

    if (!access.passAvailable) return null

    const activate = async () => {
        setActivating(true)
        try {
            const res = await courseService.activatePass()
            onChange(res)
            toast.success(t("training.pass.activated"))
        } catch (err: any) {
            toast.error(err?.message || t("common.error"))
        } finally {
            setActivating(false)
        }
    }

    return (
        <div className={`flex flex-col gap-3 rounded-2xl bg-brand-gradient p-4 text-white sm:flex-row sm:items-center sm:justify-between ${compact ? "" : "sm:p-5"}`}>
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Sparkles className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[15px] font-semibold">{t("training.pass.title")}</p>
                    <p className="text-[13px] text-white/85">{t("training.pass.description", { days: access.passDays })}</p>
                </div>
            </div>
            <Button onClick={activate} disabled={activating} className="shrink-0 rounded-full bg-white font-semibold text-[#0b2ca8] hover:bg-white/90">
                {activating && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("training.pass.cta")}
            </Button>
        </div>
    )
}
