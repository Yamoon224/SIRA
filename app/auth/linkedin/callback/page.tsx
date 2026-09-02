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

        // `state` rejoué : protège du CSRF (un tiers qui ferait échanger son
        // propre code dans la session de la victime).
        if (!consumeLinkedInState(state)) {
            setErrorMsg("Session LinkedIn expirée ou invalide. Relance la connexion.")
            return
        }

        if (!code) {
            setErrorMsg("Code LinkedIn manquant.")
            return
        }

        const run = async () => {
            try {
                const response = await authService.linkedinAuth(code, getLinkedInRedirectUri())
                const payload = (response as any)?.data ?? response
                const userData = payload?.user
                const token = payload?.access_token ?? payload?.accessToken
                const isNewUser = payload?.isNewUser === true

                if (!userData || !token) throw new Error("Réponse invalide du serveur")

                const tokenResult = await signIn("token", { token, redirect: false })
                if (tokenResult?.error) throw new Error("Erreur lors de la connexion avec LinkedIn")

                if (isNewUser) {
                    toast.success("Compte créé avec succès !")
                    router.replace("/auth/complete-profile")
                } else {
                    toast.success("Connexion réussie !")
                    router.replace("/dashboard")
                }
            } catch (error: any) {
                setErrorMsg(error?.message || "Erreur lors de la connexion avec LinkedIn. Réessaie.")
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
                    <p className="text-sm text-muted-foreground">Connexion à LinkedIn en cours…</p>
                </>
            )}
        </div>
    )
}
