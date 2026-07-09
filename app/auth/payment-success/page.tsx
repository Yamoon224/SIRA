"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/app-logo"
import { subscriptionService } from "@/lib/api/subscription.service"

type State = "loading" | "success" | "error"

export default function PaymentSuccessPage() {
    const router = useRouter()
    const params = useSearchParams()
    const [state, setState] = useState<State>("loading")
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        const userId = params.get("userId")
        const planId = params.get("planId")
        const transactionId = sessionStorage.getItem("kkiapay_transaction_id")

        if (!userId || !planId || !transactionId) {
            setErrorMsg("Paramètres de paiement introuvables.")
            setState("error")
            return
        }

        subscriptionService.verifyCheckout(transactionId, userId, planId)
            .then(() => {
                sessionStorage.removeItem("kkiapay_transaction_id")
                setState("success")
            })
            .catch((err: any) => {
                const msg = err?.response?.data?.message ?? err?.message ?? "Paiement non confirmé."
                setErrorMsg(msg)
                setState("error")
            })
    }, [params])

    useEffect(() => {
        if (state === "success") {
            const t = setTimeout(() => router.push("/dashboard"), 3000)
            return () => clearTimeout(t)
        }
    }, [state, router])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-md text-center space-y-6">
                <AppLogo className="justify-center" />

                {state === "loading" && (
                    <>
                        <Loader2 className="mx-auto h-16 w-16 animate-spin text-[#2f6de6]" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Vérification du paiement…</h1>
                            <p className="text-muted-foreground text-sm mt-1">Merci de patienter quelques instants.</p>
                        </div>
                    </>
                )}

                {state === "success" && (
                    <>
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Paiement réussi !</h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Ton abonnement est maintenant actif. Redirection en cours…
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push("/dashboard")}
                            className="rounded-full bg-[#2f6de6] hover:bg-[#2157d3] text-white px-8"
                        >
                            Accéder au tableau de bord
                        </Button>
                    </>
                )}

                {state === "error" && (
                    <>
                        <XCircle className="mx-auto h-16 w-16 text-red-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Activation échouée</h1>
                            <p className="text-muted-foreground text-sm mt-1">{errorMsg}</p>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={() => router.push("/auth/plan")}>
                                Réessayer
                            </Button>
                            <Button onClick={() => router.push("/dashboard")} className="bg-[#2f6de6] text-white">
                                Continuer sans abonnement
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
