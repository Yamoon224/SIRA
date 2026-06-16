"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { subscriptionService } from "@/lib/api/subscription.service"

export interface SubscriptionInfo {
    hasSubscription: boolean
    planName: string | null
    status: string | null
}

export function useSubscription() {
    const { user, isLoading: authLoading } = useAuth()
    const [info, setInfo] = useState<SubscriptionInfo>({ hasSubscription: false, planName: null, status: null })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return
        if (!user?.id) {
            setInfo({ hasSubscription: false, planName: null, status: null })
            setLoading(false)
            return
        }

        subscriptionService.checkSubscription(user.id)
            .then((res: any) => {
                const data = res?.data ?? res
                setInfo({
                    hasSubscription: data?.hasSubscription ?? false,
                    planName: data?.planName ?? null,
                    status: data?.status ?? null,
                })
            })
            .catch(() => setInfo({ hasSubscription: false, planName: null, status: null }))
            .finally(() => setLoading(false))
    }, [user?.id, authLoading])

    return { ...info, loading }
}
