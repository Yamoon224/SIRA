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
    // "Réessayer" relance la vérification du MÊME paiement — renvoyer vers la
    // page des forfaits ferait payer une seconde fois.
    const [retryKey, setRetryKey] = useState(0)

    // Réinitialisation d'un quota "Limité" (purpose=USAGE_RESET, voir
    // QuotaExceededNotice) plutôt qu'un abonnement : même page de retour,
    // mais on revient sur la page d'origine (returnTo) au lieu du dashboard,
    // sans le message "abonnement actif".
    const isUsageReset = params.get("purpose") === "USAGE_RESET"
    const returnTo = params.get("returnTo") ? decodeURIComponent(params.get("returnTo") as string) : "/dashboard"

    useEffect(() => {
        const userId = params.get("userId")
        const planId = params.get("planId")
        const gateway = params.get("gateway") ?? undefined
        // Paiement Pro (session hébergée) : la référence est portée par l'URL de
        // retour. Kkiapay (widget) : elle a été stockée par la page de choix.
        // Si Paiement Pro accole ses propres paramètres au returnURL avec un
        // "?" de trop, `ref` (dernier paramètre) arrive pollué : on le nettoie
        // et on retombe sur le `referenceNumber` qu'il renvoie.
        const transactionId = gateway === "paiementpro"
            ? (params.get("ref")?.split("?")[0] || params.get("referenceNumber"))
            : sessionStorage.getItem("kkiapay_transaction_id")

        if (!userId || !planId || !transactionId) {
            setErrorMsg("Paramètres de paiement introuvables.")
            setState("error")
            return
        }

        let cancelled = false
        // Paiement Pro confirme via une notification serveur-à-serveur qui peut
        // arriver après le retour du navigateur - on re-tente quelques fois.
        // (~1 min ; l'abonnement s'active de toute façon à la notification.)
        const maxAttempts = gateway === "paiementpro" ? 20 : 1
        setState("loading")

        const attempt = (n: number) => {
            subscriptionService.verifyCheckout(transactionId, userId, planId, gateway)
                .then(() => {
                    if (cancelled) return
                    sessionStorage.removeItem("kkiapay_transaction_id")
                    setState("success")
                })
                .catch((err: any) => {
                    if (cancelled) return
                    if (n < maxAttempts) {
                        setTimeout(() => attempt(n + 1), 3000)
                        return
                    }
                    const msg = gateway === "paiementpro"
                        ? "Ton paiement n'est pas encore confirmé. S'il a été débité, ne paie pas une seconde fois : ton abonnement s'activera dès la confirmation."
                        : err?.response?.data?.message ?? err?.message ?? "Paiement non confirmé."
                    setErrorMsg(msg)
                    setState("error")
                })
        }
        attempt(1)

        return () => { cancelled = true }
    }, [params, retryKey])

    useEffect(() => {
        if (state === "success") {
            const t = setTimeout(() => router.push(returnTo), 3000)
            return () => clearTimeout(t)
        }
    }, [state, router, returnTo])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-md text-center space-y-6">
                <AppLogo className="justify-center" />

                {state === "loading" && (
                    <>
                        <Loader2 className="mx-auto h-16 w-16 animate-spin text-[#2f6de6] dark:text-primary" />
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
                                {isUsageReset
                                    ? "Tes tentatives sont réinitialisées. Redirection en cours…"
                                    : "Ton abonnement est maintenant actif. Redirection en cours…"}
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push(returnTo)}
                            className="rounded-full bg-brand-gradient hover:bg-brand-gradient-hover text-white px-8"
                        >
                            {isUsageReset ? "Continuer" : "Accéder au tableau de bord"}
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
                            <Button variant="outline" onClick={() => setRetryKey((k) => k + 1)}>
                                Réessayer
                            </Button>
                            <Button onClick={() => router.push("/dashboard")} className="bg-brand-gradient text-white">
                                Continuer sans abonnement
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
