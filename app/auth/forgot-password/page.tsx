"use client"

import Link from "next/link"
import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/app-logo"
import { ChevronLeft, Eye, EyeOff, Loader2, MailCheck } from "lucide-react"
import { authService } from "@/lib/api/auth.service"

// Cooldown du renvoi côté backend (OtpService::RESEND_COOLDOWN_SECONDS) :
// on le reflète ici pour éviter un 429 sur un clic trop rapide.
const RESEND_COOLDOWN_SECONDS = 45

export default function Page() {
    const router = useRouter()
    const [step, setStep] = useState<"email" | "reset">("email")
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
        return () => clearTimeout(timer)
    }, [cooldown])

    const requestCode = async (isResend = false) => {
        setIsLoading(true)
        setError("")

        try {
            const res = await authService.forgotPassword(email.trim())
            setCooldown(RESEND_COOLDOWN_SECONDS)
            setStep("reset")
            toast.success(isResend ? "Un nouveau code vient d'être envoyé." : (res as any)?.message)
        } catch (err: any) {
            setError(err?.message || "Impossible d'envoyer le code. Réessaie dans un instant.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await requestCode()
    }

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Les deux mots de passe ne correspondent pas.")
            return
        }

        setIsLoading(true)

        try {
            await authService.resetPassword(email.trim(), code, password)
            toast.success("Mot de passe réinitialisé. Tu peux te connecter.")
            router.push("/auth/signin")
        } catch (err: any) {
            setError(err?.message || "Le code est invalide ou expiré. Redemande un code.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-screen overflow-hidden flex">
            <div className="flex-1 overflow-y-auto bg-background">
                <div className="min-h-full flex flex-col justify-center px-6 py-6 sm:px-12">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-5">
                            <div className="flex items-center gap-4 mb-5">
                                <Link
                                    href="/auth/signin"
                                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors border border-blue-900 rounded-full px-3 py-1 focus:outline-none">
                                    <ChevronLeft className="w-3 h-3 mr-1" />
                                    Connexion
                                </Link>
                            </div>
                            <AppLogo width={120} className="mx-auto" />
                        </div>

                        <div className="space-y-4">
                            <div className="text-center space-y-2">
                                <h1 className="text-xl font-semibold text-foreground">
                                    {step === "email" ? "Mot de passe oublié" : "Nouveau mot de passe"}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {step === "email"
                                        ? "Saisis l'adresse email de ton compte : nous t'enverrons un code à 6 chiffres."
                                        : "Saisis le code reçu par email, puis choisis ton nouveau mot de passe."}
                                </p>
                            </div>

                            {step === "email" ? (
                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="email">Adresse email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="Votre adresse email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="mt-1"
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-sm text-destructive text-center" role="alert">
                                            {error}
                                        </p>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full rounded-full bg-blue-900 hover:bg-blue-950 py-3 transition-colors"
                                        disabled={isLoading || !email.trim()}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Envoi...
                                            </>
                                        ) : (
                                            "Envoyer le code"
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleResetSubmit} className="space-y-4">
                                    <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
                                        <MailCheck className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                                        <p className="text-sm text-muted-foreground">
                                            Si un compte existe pour <span className="font-medium text-foreground">{email}</span>,
                                            un code vient d'y être envoyé. Il expire dans 10 minutes.
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="code">Code reçu par email *</Label>
                                        <Input
                                            id="code"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            placeholder="Code OTP"
                                            maxLength={6}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            required
                                            // L'interlettrage n'est là que pour aérer les 6 chiffres : appliqué
                                            // au placeholder, il le déséquilibrait sur la droite.
                                            className={`mt-1 text-center ${code ? "tracking-[0.5em]" : ""}`}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="password">Nouveau mot de passe *</Label>
                                        <div className="relative mt-1">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder="Au moins 6 caractères"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="confirmPassword">Confirme le mot de passe *</Label>
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            placeholder="Saisis à nouveau le mot de passe"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="mt-1"
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-sm text-destructive text-center" role="alert">
                                            {error}
                                        </p>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full rounded-full bg-blue-900 hover:bg-blue-950 py-3 transition-colors"
                                        disabled={isLoading || code.length !== 6 || password.length < 6}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Réinitialisation...
                                            </>
                                        ) : (
                                            "Réinitialiser le mot de passe"
                                        )}
                                    </Button>

                                    <div className="text-center text-sm text-muted-foreground">
                                        Code non reçu ?{" "}
                                        <button
                                            type="button"
                                            onClick={() => requestCode(true)}
                                            disabled={isLoading || cooldown > 0}
                                            className="text-blue-600 hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                                        >
                                            {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : "Renvoyer le code"}
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep("email")
                                                setCode("")
                                                setError("")
                                            }}
                                            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                                        >
                                            Utiliser une autre adresse email
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex flex-1 bg-white relative overflow-hidden" style={{ borderTopLeftRadius: 120, borderBottomLeftRadius: 120 }}>
                <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-50/70 pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full bg-blue-100/50 pointer-events-none" />
                <img
                    src="/signin-illustration.webp"
                    alt="Professionnel travaillant"
                    className="relative z-10 w-full h-full object-cover"
                />
            </div>
        </div>
    )
}
