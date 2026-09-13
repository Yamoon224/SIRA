"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { subscriptionService } from "@/lib/api/subscription.service"
import type { FeatureUsageKey } from "@/lib/api/feature-usage.service"

interface QuotaExceededNoticeProps {
    featureKey: FeatureUsageKey
    /** Nombre de tentatives incluses dans le forfait actif (0 = fonctionnalité non incluse). */
    limit: number
    /** Montant XOF de la réinitialisation - voir SubscriptionPlan.resetPrice (500 XOF pour Standard/Premium). */
    resetPrice?: number
    /** Ex. "analyses de CV", "CV créés", "documents générés". */
    featureLabel: string
}

/**
 * Affichée quand un quota "Limité" (Créer un CV / Générer des documents /
 * Analyse de CV) est épuisé. Propose de le remettre à 0 via un paiement
 * Paiement Pro dédié (purpose: USAGE_RESET) - voir
 * SubscriptionService::checkoutUsageReset() et /auth/payment-success qui
 * détecte ce `purpose` pour revenir sur la page d'origine plutôt que
 * /dashboard.
 */
export function QuotaExceededNotice({ featureKey, limit, resetPrice = 500, featureLabel }: QuotaExceededNoticeProps) {
    const { user } = useAuth()
    const [phone, setPhone] = useState("")
    const [showPhoneField, setShowPhoneField] = useState(false)
    const [loading, setLoading] = useState(false)

    const handlePay = async () => {
        if (!user?.id) return
        if (phone.trim().length < 8) {
            toast.error("Renseigne un numéro Mobile Money complet.")
            return
        }

        setLoading(true)
        try {
            const check = await subscriptionService.checkSubscription(user.id)
            const planId = (check as any)?.planId
            if (!planId) throw new Error("Aucun forfait actif")

            const origin = window.location.origin
            const returnTo = encodeURIComponent(window.location.pathname)
            const res = await subscriptionService.createCheckout({
                userId: user.id,
                planId,
                gateway: "paiementpro",
                customerPhone: phone.trim(),
                purpose: "USAGE_RESET",
                featureKey,
                successUrl: `${origin}/auth/payment-success?userId=${user.id}&planId=${planId}&gateway=paiementpro&purpose=USAGE_RESET&returnTo=${returnTo}`,
                errorUrl: `${origin}/auth/payment-error?planId=${planId}`,
            })
            const data = (res as any)?.data ?? res
            if (!data?.checkoutUrl) throw new Error("checkoutUrl manquante")
            window.location.href = data.checkoutUrl
        } catch {
            toast.error("Erreur lors de l'initialisation du paiement.")
            setLoading(false)
        }
    }

    return (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900/40 dark:bg-amber-950/30">
            <p className="text-amber-900 dark:text-amber-200">
                {limit > 0
                    ? `Tu as utilisé tes ${limit} ${featureLabel} inclus dans ton forfait ce mois-ci.`
                    : `${featureLabel} ne fait pas partie de ton forfait actuel.`}
            </p>

            {limit > 0 && (
                showPhoneField ? (
                    <div className="mt-3 space-y-2">
                        <input
                            type="tel"
                            inputMode="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="07 00 00 00 00"
                            className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#2f6de6] dark:border-border dark:bg-background"
                        />
                        <Button size="sm" disabled={loading} onClick={handlePay}>
                            {loading ? "Redirection…" : `Payer ${resetPrice} XOF et réinitialiser`}
                        </Button>
                    </div>
                ) : (
                    <Button size="sm" className="mt-3" onClick={() => setShowPhoneField(true)}>
                        Recharger pour {resetPrice} XOF
                    </Button>
                )
            )}
        </div>
    )
}
