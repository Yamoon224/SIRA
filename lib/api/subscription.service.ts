import { apiRequest } from "@/lib/api-client-http"
import { rememberPaymentReference } from "@/lib/payment-reference"

export interface CreateCheckoutData {
    userId: string
    planId: string
    gateway?: string
    successUrl?: string
    errorUrl?: string
    customerPhone?: string
    /** SUBSCRIPTION (défaut) active le plan payé ; USAGE_RESET remet à 0 le quota de `featureKey`. */
    purpose?: "SUBSCRIPTION" | "USAGE_RESET"
    /** Requis quand purpose = USAGE_RESET. */
    featureKey?: "cv_creation" | "document_generation" | "cv_analysis"
    /** Code promo optionnel — revalidé et recalculé côté serveur. */
    promoCode?: string
}

// Kkiapay (widget client) renvoie amount/clientReference ; les gateways à
// session hébergée (paiementpro, wave, stripe) renvoient une checkoutUrl.
// originalAmount/discountAmount ne sont présents que si un code promo a été
// appliqué (voir SubscriptionService::checkout()).
export type CheckoutResponse =
    | { amount: number; currency: string; clientReference: string; originalAmount?: number; discountAmount?: number }
    | { gateway: string; checkoutUrl: string; sessionId: string; amount?: number; originalAmount?: number; discountAmount?: number }

export const subscriptionService = {
    getPlans: (userType: "USER" | "ENTREPRISE" = "USER") =>
        apiRequest<any>({ endpoint: `/subscriptions/plans?userType=${userType}`, method: "GET" }),

    getPaymentGateways: () =>
        apiRequest<{ enabledGateways: string[]; defaultGateway: string }>({
            endpoint: "/subscriptions/payment-gateways",
            method: "GET",
        }),

    subscribe: (data: { userId: string; planId: string }) =>
        apiRequest<any>({ endpoint: "/subscriptions/subscribe", method: "POST", data }),

    createCheckout: async (data: CreateCheckoutData) => {
        const res = await apiRequest<CheckoutResponse>({
            endpoint: "/subscriptions/checkout",
            method: "POST",
            data,
        })
        // Session hébergée : on garde la référence avant de quitter le site,
        // au cas où l'URL de retour du prestataire reviendrait abîmée.
        rememberPaymentReference(((res as any)?.data ?? res)?.sessionId)
        return res
    },

    verifyCheckout: (transactionId: string, userId: string, planId: string, gateway?: string) =>
        apiRequest<any>({
            endpoint: `/subscriptions/checkout/verify/${transactionId}?userId=${userId}&planId=${planId}${gateway ? `&gateway=${gateway}` : ""}`,
            method: "GET",
        }),

    /**
     * État d'un paiement à partir de sa seule référence. Endpoint public :
     * après un paiement mobile, la page de retour s'ouvre souvent dans un
     * navigateur où l'utilisateur n'est pas connecté.
     */
    checkoutStatus: (reference: string) =>
        apiRequest<{ status: "PENDING" | "SUCCESS" | "FAILED" | "UNKNOWN"; purpose: string | null; planName: string | null }>({
            endpoint: `/subscriptions/checkout/status/${encodeURIComponent(reference)}`,
            method: "GET",
            skipAuth: true,
            silent: true,
        }),

    checkSubscription: (userId: string) =>
        apiRequest<{
            hasSubscription: boolean
            planName: string | null
            status: string | null
            planId?: string | null
            planPrice?: number | null
            tier?: "NONE" | "FREE" | "PAID"
        }>({
            endpoint: `/subscriptions/check/${userId}`,
            method: "GET",
        }),

    getMySubscription: (userId: string) =>
        apiRequest<any>({ endpoint: `/subscriptions/me/${userId}`, method: "GET" }),

    cancelSubscription: (userId: string) =>
        apiRequest<any>({ endpoint: `/subscriptions/me/${userId}`, method: "DELETE" }),
}
