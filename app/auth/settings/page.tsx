"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Poppins } from "next/font/google"
import { Check, ChevronLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { setPendingNotifications, syncPendingOnboarding, type NotificationPrefs } from "@/lib/cv-onboarding"

// Même typographie que /resultat-analyse-cv, l'étape précédente du parcours.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" })

const OPTIONS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
    {
        key: "applications",
        label: "Applications",
        description: "Ces notifications sont pour les emplois auxquels vous avez postulé.",
    },
    {
        key: "emplois",
        label: "Emplois",
        description: "Il s'agit de notifications pour des offres d'emploi correspondant à votre profil.",
    },
    {
        key: "recommandations",
        label: "Recommandations",
        description: "Ces notifications sont des recommandations personnalisées de nos recruteurs.",
    },
]

export default function Page() {
    const router = useRouter()
    const { isAuthenticated, refreshProfile } = useAuth()
    const [settings, setSettings] = useState<NotificationPrefs>({
        applications: true,
        emplois: false,
        recommandations: false,
    })
    const [loading, setLoading] = useState(false)

    // « Ignorer » passe à la suite sans toucher aux préférences ; le profil
    // validé à l'étape précédente est enregistré dans les deux cas.
    const goNext = async (savePrefs: boolean) => {
        if (savePrefs) setPendingNotifications(settings)

        if (!isAuthenticated) {
            router.push("/auth/signin?tab=signup")
            return
        }

        setLoading(true)
        await syncPendingOnboarding()
        refreshProfile()
        router.push("/dashboard")
    }

    return (
        <div className={`${poppins.className} flex min-h-screen bg-white dark:bg-background`}>
            <div className="relative hidden w-[45.6%] shrink-0 md:block">
                <img
                    src="/images/onboarding-notifications.jpg"
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover object-left"
                />
            </div>

            <button
                type="button"
                onClick={() => router.back()}
                className="absolute left-4 top-5 inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#0b2ca8] bg-white/70 px-3 text-[13px] text-[#0b2ca8] backdrop-blur-sm hover:bg-white md:left-[8.3%] dark:bg-background/70 dark:text-primary dark:border-primary"
            >
                <ChevronLeft className="h-4 w-4" />
                retour
            </button>

            <div className="flex flex-1 items-center justify-center px-6 py-20">
                <div className="w-full max-w-[400px]">
                    <h1 className="text-[20px] font-semibold text-[#1b2331] dark:text-foreground">Notifications</h1>
                    <p className="mt-2 max-w-[210px] text-[12px] leading-relaxed text-[#3d4554] dark:text-muted-foreground">
                        Personnaliser vos paramètres de notification préférés
                    </p>

                    <div className="mt-12 space-y-7">
                        {OPTIONS.map(({ key, label, description }) => (
                            <label key={key} className="flex cursor-pointer items-start gap-3.5">
                                <input
                                    type="checkbox"
                                    checked={settings[key]}
                                    onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.checked }))}
                                    className="peer sr-only"
                                />
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border border-[#cfd4de] bg-white text-transparent transition-colors peer-checked:border-[#4338ca] peer-checked:bg-[#4338ca] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#4338ca]/40 dark:bg-background dark:border-border">
                                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                </span>
                                <span>
                                    <span className="block text-[14px] font-semibold text-[#1b2331] dark:text-foreground">{label}</span>
                                    <span className="mt-1.5 block max-w-[290px] text-[12px] leading-relaxed text-[#3d4554] dark:text-muted-foreground">
                                        {description}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="mt-9 flex items-center justify-end gap-6 sm:gap-10">
                        <button
                            type="button"
                            onClick={() => goNext(false)}
                            disabled={loading}
                            className="h-11 px-6 text-[14px] text-[#3d4554] hover:underline disabled:opacity-60 dark:text-muted-foreground"
                        >
                            Ignorer
                        </button>
                        <button
                            type="button"
                            onClick={() => goNext(true)}
                            disabled={loading}
                            className="inline-flex h-11 w-[156px] items-center justify-center rounded-[10px] bg-[#0b2ca8] text-[14px] font-semibold text-white transition-colors hover:bg-[#09248a] disabled:opacity-70"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Continuer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
