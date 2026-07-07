"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/app-logo"

export default function PaymentErrorPage() {
    const router = useRouter()
    const params = useSearchParams()
    const planId = params.get("planId")

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-md text-center space-y-6">
                <AppLogo className="justify-center" />

                <XCircle className="mx-auto h-16 w-16 text-red-500" />

                <div>
                    <h1 className="text-2xl font-bold text-foreground">Paiement annulé</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Ton paiement n'a pas abouti. Tu peux réessayer ou continuer avec le plan gratuit.
                    </p>
                </div>

                <div className="flex gap-3 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/auth/plan")}
                    >
                        Réessayer
                    </Button>
                    <Button
                        onClick={() => router.push("/dashboard")}
                        className="bg-[#2f6de6] hover:bg-[#2157d3] text-white"
                    >
                        Continuer gratuitement
                    </Button>
                </div>
            </div>
        </div>
    )
}
