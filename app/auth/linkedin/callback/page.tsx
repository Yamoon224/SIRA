"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/app-logo"
import { authService } from "@/lib/api/auth.service"
import { syncPendingOnboarding } from "@/lib/cv-onboarding"
import { consumeLinkedInState, getLinkedInRedirectUri } from "@/lib/linkedin-auth"

/**
 * Retour de la redirection LinkedIn (voir lib/linkedin-auth.ts). Le code
 * d'autorisation est à usage unique et expire en quelques dizaines de
 * secondes : on l'échange immédiatement, une seule fois (React 18 monte les
 * effets deux fois en dev, d'où le garde-fou `exchanged`).
 *
 * On lit la query string via window.location plutôt que useSearchParams : la
 * page est purement cliente et n'a rien à pré-rendre.
 */
export default function LinkedInCallbackPage() {
    const router = useRouter()
    const exchanged = useRef(false)
    const [errorMsg, setErrorMsg] = useState("")
    // Nomme l'étape en cours : un spinner qui tourne sans rien dire ne permet
    // pas de savoir si c'est l'échange du code ou l'ouverture de session qui
    // traîne.
    const [step, setStep] = useState("Vérification du retour LinkedIn…")

    useEffect(() => {
        if (exchanged.current) return
        exchanged.current = true

        const params = new URLSearchParams(window.location.search)
        const code = params.get("code")
        const state = params.get("state")
        const oauthError = params.get("error")

        // L'utilisateur a refusé l'autorisation sur l'écran LinkedIn.
        if (oauthError) {
            const cancelled = oauthError === "user_cancelled_login" || oauthError === "user_cancelled_authorize"
            if (cancelled) {
                router.replace("/auth/signin")
                return
            }
            setErrorMsg(params.get("error_description") || "Connexion LinkedIn refusée.")
            return
        }

        // Aucun paramètre : la page a été ouverte directement, ou la query
        // string a été perdue en route (redirection apex → www, proxy…).
        if (!code && !state) {
            setErrorMsg("Aucun retour LinkedIn dans l'URL. Relance la connexion depuis la page de connexion.")
            return
        }

        // `state` rejoué : protège du CSRF (un tiers qui ferait échanger son
        // propre code dans la session de la victime). Échoue aussi si l'onglet
        // qui a lancé la connexion n'est pas celui qui reçoit le retour :
        // sessionStorage est lié à l'onglet.
        if (!consumeLinkedInState(state)) {
            setErrorMsg("Session LinkedIn expirée ou ouverte dans un autre onglet. Relance la connexion.")
            return
        }

        if (!code) {
            setErrorMsg("Code LinkedIn manquant.")
            return
        }

        const run = async () => {
            try {
                setStep("Échange du code LinkedIn…")
                const response = await authService.linkedinAuth(code, getLinkedInRedirectUri())
                const payload = (response as any)?.data ?? response
                const userData = payload?.user
                const token = payload?.access_token ?? payload?.accessToken
                const isNewUser = payload?.isNewUser === true

                if (!userData || !token) throw new Error("Réponse invalide du serveur")

                setStep("Ouverture de la session…")
                const tokenResult = await signIn("token", { token, redirect: false })
                if (tokenResult?.error) throw new Error("Erreur lors de la connexion avec LinkedIn")

                await syncPendingOnboarding()

                if (isNewUser) {
                    toast.success("Compte créé avec succès !")
                    router.replace("/auth/complete-profile")
                } else {
                    toast.success("Connexion réussie !")
                    router.replace("/dashboard")
                }
            } catch (error: any) {
                // Le message du backend arrive tel quel (apiRequest relaie le
                // corps de la réponse) ; sans corps, c'est une panne réseau ou
                // une URL de backend injoignable - on le dit plutôt que
                // d'afficher un message générique qui masque la cause.
                console.error("[linkedin] échec de l'échange:", error)
                setErrorMsg(
                    error?.message ||
                    "Le backend n'a pas répondu. Vérifie NEXT_PUBLIC_BACKEND_URL et que /auth/linkedin est joignable."
                )
            }
        }

        run()
    }, [router])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
            <AppLogo />

            {errorMsg ? (
                <>
                    <XCircle className="w-10 h-10 text-destructive" />
                    <p className="text-sm text-muted-foreground max-w-sm">{errorMsg}</p>
                    <Button asChild variant="outline" className="rounded-full">
                        <Link href="/auth/signin">Retour à la connexion</Link>
                    </Button>
                </>
            ) : (
                <>
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{step}</p>
                </>
            )}
        </div>
    )
}
