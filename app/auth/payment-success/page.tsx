"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/app-logo"
import { subscriptionService } from "@/lib/api/subscription.service"
import { forgetPaymentReference, isPaiementProReturn, paymentReferenceCandidates } from "@/lib/payment-reference"

/** `pending` : toujours pas confirmé après 3 min ; `failed` : paiement refusé. */
type State = "loading" | "success" | "pending" | "failed" | "error"

export default function PaymentSuccessPage() {
    const router = useRouter()
    const params = useSearchParams()
    const [state, setState] = useState<State>("loading")
    const [errorMsg, setErrorMsg] = useState("")
    const [reference, setReference] = useState<string | null>(null)
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
        // L'URL de retour peut revenir abîmée par Paiement Pro : plusieurs
        // pistes sont essayées (voir lib/payment-reference).
        const isPaiementPro = isPaiementProReturn(params)
        const candidates = isPaiementPro ? paymentReferenceCandidates(params) : []
        const transactionId = isPaiementPro
            ? (candidates[0] ?? null)
            : sessionStorage.getItem("kkiapay_transaction_id")

        // Paiement Pro : la référence suffit (l'utilisateur et le plan sont
        // relus côté serveur sur la transaction).
        if (!transactionId || (!isPaiementPro && (!userId || !planId))) {
            setErrorMsg("Paramètres de paiement introuvables.")
            setState("error")
            return
        }

        let cancelled = false
        setState("loading")

        // Paiement Pro : le résultat arrive par une notification serveur-à-
        // serveur, parfois après le retour du navigateur. On interroge l'état
        // du paiement (endpoint public, par référence) toutes les 3 s pendant
        // 3 min, puis toutes les 10 s tant que la page reste ouverte : dès que
        // la confirmation tombe, l'écran passe au vert tout seul.
        if (isPaiementPro) {
            setReference(transactionId)
            let timer: ReturnType<typeof setTimeout> | undefined
            let attempts = 0
            let active: string | null = null

            const lireStatut = async (): Promise<"PENDING" | "SUCCESS" | "FAILED" | "UNKNOWN"> => {
                try {
                    // Première référence reconnue par le serveur : on s'y tient
                    // pour les interrogations suivantes.
                    for (const candidate of active ? [active] : candidates) {
                        const res = await subscriptionService.checkoutStatus(candidate)
                        const status = ((res as any)?.data ?? res)?.status
                        if (status === "UNKNOWN") continue
                        if (status !== "SUCCESS" && status !== "FAILED" && status !== "PENDING") throw new Error("réponse inattendue")
                        if (active !== candidate) {
                            active = candidate
                            setReference(candidate)
                        }
                        return status
                    }
                    return "UNKNOWN"
                } catch {
                    // Backend pas encore à jour, coupure réseau... : on retombe
                    // sur l'ancienne vérification, qui exige d'être connecté.
                    if (!userId || !planId) return "PENDING"
                    try {
                        await subscriptionService.verifyCheckout(transactionId, userId, planId, "paiementpro")
                        return "SUCCESS"
                    } catch {
                        return "PENDING"
                    }
                }
            }

            const tick = async () => {
                const status = await lireStatut()
                if (cancelled) return
                attempts += 1

                if (status === "SUCCESS") {
                    sessionStorage.removeItem("kkiapay_transaction_id")
                    forgetPaymentReference()
                    setState("success")
                    return
                }
                if (status === "UNKNOWN") {
                    setErrorMsg("Ce paiement est introuvable.")
                    setState("error")
                    return
                }
                if (status === "FAILED") setState("failed")
                else if (attempts >= 60) setState("pending")

                // Un refus peut être suivi d'un nouvel essai réussi sur la même
                // session : on continue donc de surveiller, plus lentement.
                timer = setTimeout(tick, status === "FAILED" || attempts >= 60 ? 10_000 : 3_000)
            }
            tick()

            return () => {
                cancelled = true
                if (timer) clearTimeout(timer)
            }
        }

        const maxAttempts = 1

        const attempt = (n: number) => {
            subscriptionService.verifyCheckout(transactionId, userId as string, planId as string, gateway)
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
                    setErrorMsg(err?.response?.data?.message ?? err?.message ?? "Paiement non confirmé.")
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

                {state === "pending" && (
                    <>
                        <Clock className="mx-auto h-16 w-16 text-amber-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Paiement en cours de confirmation</h1>
                            <p className="text-muted-foreground text-sm mt-1 text-center">
                                La confirmation de ton opérateur met plus de temps que prévu. Si ton compte a été débité,
                                ne paie pas une seconde fois : {isUsageReset ? "tes tentatives seront réinitialisées" : "ton abonnement s'activera"} automatiquement
                                dès la confirmation, même si tu fermes cette page.
                            </p>
                            {reference && (
                                <p className="text-muted-foreground text-xs mt-3 text-center break-all">
                                    Un souci ? Écris à support@goriya.net avec cette référence : <span className="font-medium text-foreground">{reference}</span>
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <Button variant="outline" onClick={() => setRetryKey((k) => k + 1)}>
                                Vérifier maintenant
                            </Button>
                            <Button onClick={() => router.push(returnTo)} className="bg-brand-gradient text-white">
                                Continuer
                            </Button>
                        </div>
                    </>
                )}

                {state === "failed" && (
                    <>
                        <XCircle className="mx-auto h-16 w-16 text-red-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Paiement non abouti</h1>
                            <p className="text-muted-foreground text-sm mt-1 text-center">
                                Ton opérateur a refusé ou annulé ce paiement : rien n&apos;a été activé. Vérifie ton solde puis relance le paiement.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <Button variant="outline" onClick={() => router.push(isUsageReset ? returnTo : "/auth/plan")}>
                                Relancer le paiement
                            </Button>
                            <Button onClick={() => router.push("/dashboard")} className="bg-brand-gradient text-white">
                                Continuer sans abonnement
                            </Button>
                        </div>
                    </>
                )}

                {state === "error" && (
                    <>
                        <XCircle className="mx-auto h-16 w-16 text-red-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Activation échouée</h1>
                            <p className="text-muted-foreground text-sm mt-1">{errorMsg}</p>
                            {reference && (
                                <p className="text-muted-foreground text-xs mt-3 text-center break-all">
                                    Si ton compte a été débité, ne paie pas une seconde fois : écris à support@goriya.net avec cette référence : <span className="font-medium text-foreground">{reference}</span>
                                </p>
                            )}
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
