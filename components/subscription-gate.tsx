"use client"

import Link from "next/link"
import { Lock, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/use-subscription"

interface SubscriptionGateProps {
    children: React.ReactNode
    featureLabel?: string
}

export function SubscriptionGate({ children, featureLabel = "cette fonctionnalité" }: SubscriptionGateProps) {
    const { hasSubscription, loading } = useSubscription()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#2f6de6] dark:text-primary" />
            </div>
        )
    }

    if (!hasSubscription) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#eef3ff] dark:bg-primary/10 flex items-center justify-center mb-5">
                    <Lock className="h-7 w-7 text-[#2f6de6] dark:text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                    Abonnement requis
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                    Un abonnement actif est nécessaire pour accéder à {featureLabel}.
                    Choisis un plan pour débloquer toutes les fonctionnalités IA.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/auth/plan">
                        <Button className="rounded-full bg-brand-gradient hover:bg-brand-gradient-hover text-white px-6 gap-2">
                            <Sparkles className="h-4 w-4" />
                            Voir les plans
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="outline" className="rounded-full px-6">
                            Retour au tableau de bord
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
