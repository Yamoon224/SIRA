"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { Check, Zap, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { subscriptionService } from "@/lib/api/subscription.service"
import { KKIAPAY_WIDGET_SRC, openKkiapayWidget } from "@/lib/kkiapay"
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
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [subscribing, setSubscribing] = useState<string | null>(null)
    const pendingCheckoutRef = useRef<{ userId: string; planId: string } | null>(null)

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
        setSubscribing(plan.id)
        try {
            if (Number(plan.price) === 0) {
                // Free plan - activate directly
                await subscriptionService.subscribe({ userId: user.id, planId: plan.id })
                toast.success("Abonnement activé avec succès !")
                router.push("/dashboard")
                return
            }

            // Paid plan - ouvre le widget de paiement Kkiapay
            const res = await subscriptionService.createCheckout({ userId: user.id, planId: plan.id })
            const data = (res as any)?.data ?? res
            pendingCheckoutRef.current = { userId: user.id, planId: plan.id }
            openKkiapayWidget({ amount: data.amount, clientReference: data.clientReference })
        } catch {
            toast.error("Erreur lors de l'initialisation du paiement. Réessaie.")
            setSubscribing(null)
        }
    }

    // Callbacks du widget Kkiapay, branchés une seule fois via Script.onLoad -
    // pendingCheckoutRef reste à jour même si ce closure n'est pas recréé.
    const handleKkiapaySuccess = (response: { transactionId: string }) => {
        const pending = pendingCheckoutRef.current
        if (!pending) return
        sessionStorage.setItem("kkiapay_transaction_id", response.transactionId)
        router.push(`/auth/payment-success?userId=${pending.userId}&planId=${pending.planId}`)
    }

    const handleKkiapayFailed = () => {
        toast.error("Le paiement a été annulé ou a échoué.")
        setSubscribing(null)
    }

    const handleSkip = () => router.push("/dashboard")

    const formatPrice = (price: number, period: string) => {
        if (price === 0) return "Gratuit"
        return `${price.toLocaleString("fr-FR")} FCFA / ${period === "ANNUAL" ? "an" : "mois"}`
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
            <Script
                src={KKIAPAY_WIDGET_SRC}
                strategy="afterInteractive"
                onLoad={() => {
                    window.addSuccessListener?.(handleKkiapaySuccess)
                    window.addFailedListener?.(handleKkiapayFailed)
                }}
            />
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-[#2f6de6] rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl font-bold">G</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Choisis ton forfait</h1>
                    <p className="text-muted-foreground text-sm">Commence gratuitement, passe au Premium quand tu veux</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2f6de6] border-t-transparent" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {plans.map((plan) => {
                            const isPremium = plan.price > 0
                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-2xl border-2 p-6 flex flex-col ${
                                        isPremium
                                            ? "border-[#2f6de6] shadow-lg shadow-blue-100"
                                            : "border-gray-200"
                                    }`}
                                >
                                    {isPremium && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="bg-[#2f6de6] text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                                <Star className="w-3 h-3" /> Recommandé
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <div className="mb-2">
                                            {isPremium ? (
                                                <Zap className="w-8 h-8 text-[#2f6de6]" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold">G</div>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                                        <p className={`text-2xl font-bold mt-2 ${isPremium ? "text-[#2f6de6]" : "text-foreground"}`}>
                                            {formatPrice(plan.price, plan.billingPeriod)}
                                        </p>
                                    </div>

                                    <ul className="space-y-2 mb-6 flex-1">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Check className={`w-4 h-4 shrink-0 ${isPremium ? "text-[#2f6de6]" : "text-gray-400"}`} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => handleSelectPlan(plan)}
                                        disabled={subscribing === plan.id}
                                        className={`w-full rounded-full font-semibold ${
                                            isPremium
                                                ? "bg-[#2f6de6] hover:bg-[#2157d3] text-white"
                                                : "bg-white hover:bg-blue-50 text-foreground border border-blue-500"
                                        }`}
                                    >
                                        {subscribing === plan.id ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : plan.price === 0 ? (
                                            "Commencer gratuitement"
                                        ) : (
                                            "Choisir ce plan"
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
                        Passer cette étape
                    </button>
                </div>
            </div>
        </div>
    )
}
