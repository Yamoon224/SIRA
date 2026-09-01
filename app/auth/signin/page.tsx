"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, signOut, getSession } from "next-auth/react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/app-logo"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import { OTPVerificationModal } from "@/components/modals/otp-verification-modal"
import { initializeGoogleAuth, signInWithGoogle, GOOGLE_CLIENT_ID } from "@/lib/google-auth"
import { authService } from "@/lib/api/auth.service"

export default function Page() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: 'USER',
        acceptTerms: false,
    })
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [showOTPModal, setShowOTPModal] = useState(false)
    const [otpContext, setOtpContext] = useState<"signup" | "login">("signup")
    const [otpEmail, setOtpEmail] = useState("")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [googleInitialized, setGoogleInitialized] = useState(false)

    useEffect(() => {
        const initGoogle = async () => {
            try {
                await initializeGoogleAuth()
                setGoogleInitialized(true)
            } catch (error) {
                console.error("Failed to initialize Google Auth:", error)
            }
        }
        initGoogle()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // ── INSCRIPTION ──────────────────────────────────────────────
            if (activeTab === "signup") {
                const res = await authService.signup(formData)
                const payload = (res as any)?.data ?? res
                const userData = payload?.user

                if (!userData) throw new Error("Erreur lors de l'inscription")

                toast.success("Vérifie ta boîte mail pour le code de vérification")
                setOtpContext("signup")
                setOtpEmail(formData.email)
                setShowOTPModal(true)
                return
            }

            // ── CONNEXION ─────────────────────────────────────────────────
            const result = await signIn("credentials", {
                email: loginData.email,
                password: loginData.password,
                redirect: false,
            })

            if (result?.error) {
                // Compte non vérifié : le backend a renvoyé un nouveau code OTP,
                // on ouvre la modale de vérification au lieu d'un message d'erreur.
                if (result.error === "EMAIL_NOT_VERIFIED") {
                    toast.info("Ton compte n'est pas encore vérifié. Un code vient de t'être envoyé par email.")
                    setOtpContext("login")
                    setOtpEmail(loginData.email)
                    setShowOTPModal(true)
                    return
                }
                throw new Error("Email ou mot de passe incorrect")
            }

            const session = await getSession()
            if (!session?.user) throw new Error("Erreur lors de la connexion")

            const role = (session.user as any).role
            if (role !== "USER") {
                signOut({ redirect: false }).catch(() => {})
                toast.error("Ton compte n'est pas autorisé ici. Cette interface est réservée aux candidats.")
                return
            }

            toast.success("Connexion réussie !")
            router.replace("/dashboard")
            router.refresh()
        } catch (err: any) {
            const message =
                err?.message ||
                err?.error ||
                (err?.errors && Object.values(err.errors).flat()[0]) ||
                "Une erreur est survenue. Réessaie."
            toast.error(message)
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOTPVerification = async (otpCode: string) => {
        try {
            const response = await authService.verifyOtp(otpEmail, otpCode)
            const payload = (response as any)?.data ?? response
            const token = payload?.access_token

            if (!token) throw new Error("Code de vérification invalide")

            const tokenResult = await signIn("token", { token, redirect: false })
            if (tokenResult?.error) throw new Error("Code de vérification invalide")

            setShowOTPModal(false)
            toast.success("Compte vérifié avec succès !")
            router.push(otpContext === "login" ? "/dashboard" : "/auth/plan")
        } catch (error: any) {
            console.error("Erreur lors de la vérification OTP:", error)
            toast.error(error?.message || "Code de vérification invalide. Réessaie.")
        }
    }

    const handleResendOTP = async () => {
        try {
            await authService.requestOtp(otpEmail)
            toast.success("Un nouveau code a été envoyé")
        } catch (error: any) {
            toast.error(error?.message || "Impossible d'envoyer le code pour le moment")
        }
    }

    const handleGoogleAuth = async () => {
        if (!googleInitialized) {
            toast.error("Google Auth non initialisé")
            return
        }

        setIsGoogleLoading(true)
        try {
            const credential = await signInWithGoogle()
            const response = await authService.googleAuth(credential)
            const payload = (response as any)?.data ?? response
            const userData = payload?.user
            const token = payload?.access_token ?? payload?.accessToken
            const isNewUser = payload?.isNewUser === true

            if (!userData || !token) throw new Error("Réponse invalide du serveur")

            const tokenResult = await signIn("token", { token, redirect: false })
            if (tokenResult?.error) throw new Error("Erreur lors de la connexion avec Google")

            if (isNewUser) {
                toast.success("Compte créé avec succès !")
                router.push("/auth/complete-profile")
            } else {
                toast.success("Connexion réussie !")
                router.push("/dashboard")
            }
        } catch (error: any) {
            const msg = String(error?.message ?? "")
            if (!msg.includes("cancelled") && !msg.includes("not displayed")) {
                toast.error(error?.message || "Erreur lors de la connexion avec Google. Réessaie.")
            }
        } finally {
            setIsGoogleLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-12 bg-background">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-6">
                            <Link
                                href="/"
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors border border-blue-900 rounded-full px-3 py-1 focus:outline-none">
                                <ChevronLeft className="w-3 h-3 mr-1" />
                                Retour
                            </Link>
                            <AppLogo />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground text-center">
                            Bienvenue
                        </h1>
                    </div>

                    <div className="space-y-6">
                        <div className="flex bg-muted rounded-full p-1">
                            <button
                                onClick={() => setActiveTab("login")}
                                className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                                    activeTab === "login"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground"
                                }`}
                            >
                                Connexion
                            </button>
                            <button
                                onClick={() => setActiveTab("signup")}
                                className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                                    activeTab === "signup"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground"
                                }`}>
                                Inscription
                            </button>
                        </div>

                        {GOOGLE_CLIENT_ID && (
                        <>
                        <Button
                            onClick={handleGoogleAuth}
                            variant="outline"
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-card hover:bg-accent transition-colors"
                            disabled={isGoogleLoading || !googleInitialized}
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            <span>Se connecter avec Google</span>
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-background text-muted-foreground">ou</span>
                            </div>
                        </div>
                        </>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeTab === "signup" && (
                                <>
                                    {/* <div>
                                        <Label htmlFor="firstName">Prénom *</Label>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                            className="mt-1"
                                        />
                                    </div> */}

                                    <div>
                                        <Label htmlFor="name">Nom Complet *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            placeholder="Saisis ton nom complet"
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <Label htmlFor="email">
                                    {activeTab === "signup" ? "Adresse personnelle *" : "Adresse email *"}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={activeTab === "signup" ? "Votre adresse email" : "Votre adresse email"}
                                    value={activeTab === "signup" ? formData.email : loginData.email}
                                    onChange={(e) => {
                                        if (activeTab === "signup") {
                                            setFormData({ ...formData, email: e.target.value })
                                        } else {
                                            setLoginData({ ...loginData, email: e.target.value })
                                        }
                                    }}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="password">Mot de passe *</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Saisis ton mot de passe"
                                        value={activeTab === "signup" ? formData.password : loginData.password}
                                        onChange={(e) => {
                                            if (activeTab === "signup") {
                                                setFormData({ ...formData, password: e.target.value })
                                            } else {
                                                setLoginData({ ...loginData, password: e.target.value })
                                            }
                                        }}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {activeTab === "signup" && (
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={formData.acceptTerms}
                                        onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                                    />
                                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-5">
                                        J'ai lu et j'accepte les{" "}
                                        <Link href="/cgu" className="text-blue-600 hover:underline">
                                            CGU
                                        </Link>{" "}
                                        et la{" "}
                                        <Link href="/politique-protection-donnees" className="text-blue-600 hover:underline">
                                            politique de protection de données
                                        </Link>
                                    </Label>
                                </div>
                            )}

                            {activeTab === "login" && (
                                <div className="text-right">
                                    <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                            )}

                            {error && (
                                <p className="text-sm text-destructive text-center" role="alert">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-blue-900 hover:bg-blue-950 py-3 transition-colors"
                                disabled={isLoading || (activeTab === "signup" && !formData.acceptTerms)}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {activeTab === "signup" ? "Inscription..." : "Connexion..."}
                                    </>
                                ) : activeTab === "signup" ? (
                                    "Continuer"
                                ) : (
                                    "Se connecter"
                                )}
                            </Button>
                        </form>
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

            <OTPVerificationModal
                isOpen={showOTPModal}
                onClose={() => setShowOTPModal(false)}
                onVerify={handleOTPVerification}
                onResend={handleResendOTP}
            />
        </div>
    )
}
