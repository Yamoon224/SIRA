"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useT } from "@/contexts/i18n-context"
import { subscriptionService } from "@/lib/api/subscription.service"
import { toast } from "sonner"

interface Plan {
    id: string
    name: string
    price: number
    billingPeriod: string
    features: string[]
}

export default function PlanPage() {
    const router = useRouter()
    const { user } = useAuth()
    const t = useT()
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [subscribing, setSubscribing] = useState<string | null>(null)
    const [phone, setPhone] = useState("")

    useEffect(() => {
        subscriptionService.getPlans("USER")
            .then((res) => {
                const data = (res as any)?.data ?? res ?? []
                setPlans(Array.isArray(data) ? data : [])
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const handleSelectPlan = async (plan: Plan) => {
        if (!user?.id) {
            router.push("/dashboard")
            return
        }
        if (Number(plan.price) > 0 && phone.trim().length < 8) {
            toast.error(t("plans.phoneRequired"))
            return
        }
        setSubscribing(plan.id)
        try {
            if (Number(plan.price) === 0) {
                // Free plan - activate directly
                await subscriptionService.subscribe({ userId: user.id, planId: plan.id })
                toast.success(t("plans.subscribed"))
                router.push("/dashboard")
                return
            }

            // Paiement Pro en session hébergée : on redirige le navigateur vers
            // la page de paiement. C'est l'unique moyen de paiement proposé.
            const origin = window.location.origin
            const res = await subscriptionService.createCheckout({
                userId: user.id,
                planId: plan.id,
                gateway: "paiementpro",
                customerPhone: phone.trim(),
                successUrl: `${origin}/auth/payment-success?userId=${user.id}&planId=${plan.id}&gateway=paiementpro`,
                errorUrl: `${origin}/auth/payment-error?planId=${plan.id}`,
            })
            const data = (res as any)?.data ?? res
            if (!data?.checkoutUrl) throw new Error("checkoutUrl manquante")
            window.location.href = data.checkoutUrl
        } catch {
            toast.error(t("plans.paymentError"))
            setSubscribing(null)
        }
    }

    const handleSkip = () => router.push("/dashboard")

    const formatPrice = (price: number, period: string) => {
        if (price === 0) return t("plans.free")
        return `${price.toLocaleString("fr-FR")} FCFA / ${period === "ANNUAL" ? t("settings.perYear") : t("settings.perMonth")}`
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-10">
                    <img src="/goriya-logo-mark.png" alt="" aria-hidden className="mx-auto mb-4 h-12 w-12 object-contain dark:brightness-0 dark:invert" />
                    <h1 className="text-3xl font-bold text-foreground mb-2">{t("plans.title")}</h1>
                    <p className="text-muted-foreground text-sm">{t("plans.authSubtitle")}</p>
                </div>

                <div className="mx-auto mb-8 max-w-md">
                    <input
                        type="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t("plans.phonePlaceholder")}
                        className="w-full rounded-full border border-gray-200 dark:border-border px-4 py-2 text-sm outline-none focus:border-[#2f6de6]"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2f6de6] border-t-transparent" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
                        {plans.map((plan) => {
                            const isPaid = plan.price > 0
                            const planKey = plan.name?.toLowerCase() ?? ""
                            // Standard porte le badge « Choix populaire » et le contour bleu ;
                            // Premium garde son contour noir, sans badge.
                            const isPopular = planKey === "standard"
                            const isPremium = planKey === "premium"
                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex h-full min-h-[460px] w-full flex-col rounded-2xl border-2 p-6 ${
                                        isPopular
                                            ? "border-[#2f6de6] shadow-lg shadow-blue-100"
                                            : isPremium
                                              ? "border-black dark:border-white"
                                              : "border-gray-200 dark:border-border"
                                    }`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="bg-[#2f6de6] text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                {t("plans.popularChoice")}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <div className="mb-2">
                                            {isPaid ? (
                                                <Zap className="w-8 h-8 text-[#2f6de6] dark:text-primary" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-muted flex items-center justify-center text-gray-500 dark:text-muted-foreground text-sm font-bold">G</div>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                                        <p className={`text-2xl font-bold mt-2 ${isPaid ? "text-[#2f6de6] dark:text-primary" : "text-foreground"}`}>
                                            {formatPrice(plan.price, plan.billingPeriod)}
                                        </p>
                                    </div>

                                    <ul className="space-y-2 mb-6 flex-1">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Check className={`w-4 h-4 shrink-0 ${isPaid ? "text-[#2f6de6] dark:text-primary" : "text-gray-400 dark:text-muted-foreground"}`} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => handleSelectPlan(plan)}
                                        disabled={subscribing === plan.id}
                                        className={`mt-auto w-full rounded-full font-semibold ${
                                            isPaid
                                                ? "bg-[#2f6de6] hover:bg-[#2157d3] text-white"
                                                : "bg-white dark:bg-card hover:bg-blue-50 text-foreground border border-blue-500"
                                        }`}
                                    >
                                        {subscribing === plan.id ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white dark:border-border border-t-transparent" />
                                        ) : plan.price === 0 ? (
                                            t("plans.startFree")
                                        ) : (
                                            t("plans.choosePlan")
                                        )}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="text-center">
                    <button
                        onClick={handleSkip}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                    >
                        {t("auth.skip")}
                    </button>
                </div>
            </div>
        </div>
    )
}
