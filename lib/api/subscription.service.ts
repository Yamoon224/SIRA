import { apiRequest } from "@/lib/api-client-http"

export const subscriptionService = {
    getPlans: (userType: "USER" | "ENTREPRISE" = "USER") =>
        apiRequest<any>({ endpoint: `/subscriptions/plans?userType=${userType}`, method: "GET" }),

    subscribe: (data: { userId: string; planId: string }) =>
        apiRequest<any>({ endpoint: "/subscriptions/subscribe", method: "POST", data }),

    createCheckout: (data: { userId: string; planId: string }) =>
        apiRequest<{ amount: number; currency: string; clientReference: string }>({
            endpoint: "/subscriptions/checkout",
            method: "POST",
            data,
        }),

    verifyCheckout: (transactionId: string, userId: string, planId: string) =>
        apiRequest<any>({
            endpoint: `/subscriptions/checkout/verify/${transactionId}?userId=${userId}&planId=${planId}`,
            method: "GET",
        }),

    checkSubscription: (userId: string) =>
        apiRequest<{ hasSubscription: boolean; planName: string | null; status: string | null }>({
            endpoint: `/subscriptions/check/${userId}`,
            method: "GET",
        }),

    getMySubscription: (userId: string) =>
        apiRequest<any>({ endpoint: `/subscriptions/me/${userId}`, method: "GET" }),

    cancelSubscription: (userId: string) =>
        apiRequest<any>({ endpoint: `/subscriptions/me/${userId}`, method: "DELETE" }),
}
