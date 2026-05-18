"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { setCookie } from "cookies-next"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/app-logo"
import { useAuth } from "@/contexts/auth-context"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import { OTPVerificationModal } from "@/components/modals/otp-verification-modal"
import { initializeGoogleAuth, signInWithGoogle, type GoogleUser, GOOGLE_CLIENT_ID } from "@/lib/google-auth"
import { authService } from "@/lib/api/auth.service"

export default function Page() {
    const router = useRouter()
    const { login } = useAuth()
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
            var res: any = null
            if (activeTab === "signup") {
                res = await authService.signup(formData)
                // setShowOTPModal(true)
            } else {
                res = await signIn("credentials", {
                    email: loginData.email,
                    password: loginData.password,
                    redirect: false,
                })                
            }

            const session = await getSession()

            if (session?.user) {
                const role = (session.user as any).role

                if (role !== "USER") {
                    toast.error("Vous n'êtes pas autorisé")
                    return
                }

                const authData = {
                    token: (session.user as any).access_token,
                    user: session.user,
                }

                localStorage.setItem("auth", JSON.stringify(authData))

                setCookie("auth", JSON.stringify(authData), {
                    maxAge: 60 * 60,
                    path: "/",
                    sameSite: "lax",
                })
            }

            if (res?.error) {
                throw new Error("Email ou mot de passe incorrect")
            }

            toast.success("Connexion réussie")
            router.push("/dashboard")
        } catch (err: any) {
            toast.error(err.message)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOTPVerification = async (otpCode: string) => {
        try {
            const response = await authService.verifyOtp(formData.email, otpCode)
            const user = response.data.user
            login({ ...user, avatar: user.avatar ?? null }, response.data.token)
            setShowOTPModal(false)
            router.push("/dashboard")
        } catch (error) {
            console.error("Erreur lors de la vérification OTP:", error)
        }
    }

    const handleGoogleAuth = async () => {
        if (!googleInitialized) {
            toast.error("Google Auth non initialisé")
            return
        }

        setIsGoogleLoading(true)
        try {
            const googleUser: GoogleUser = await signInWithGoogle()
            const response = await authService.googleAuth({
                googleId: googleUser.id,
                email: googleUser.email,
                name: googleUser.name,
                firstName: googleUser.given_name,
                lastName: googleUser.family_name,
                picture: googleUser.picture,
            })
            const user = response.data.user
            login({ ...user, avatar: user.avatar ?? null }, response.data.token)
            router.push("/dashboard")
        } catch (error: any) {
            if (!error.message?.includes("cancelled")) {
                toast.error("Erreur lors de la connexion avec Google. Veuillez réessayer.")
            }
        } finally {
            setIsGoogleLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            <div className="flex-1 flex flex-col justify-center px-12 py-8 bg-background">
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
                        <div className="flex bg-gray-100 rounded-full p-1">
                            <button
                                onClick={() => setActiveTab("login")}
                                className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                                    activeTab === "login"
                                        ? "bg-white text-foreground shadow-sm"
                                        : "text-muted-foreground"
                                }`}
                            >
                                Connexion
                            </button>
                            <button
                                onClick={() => setActiveTab("signup")}
                                className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                                    activeTab === "signup"
                                        ? "bg-white text-foreground shadow-sm"
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
                                            placeholder="Saisissez votre nom complet"
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
                                    placeholder={activeTab === "signup" ? "user@domaine.com" : "nom.prenom@mail.com"}
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
                                        placeholder="Saisissez votre mot de passe"
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
                    src="/professional-man-in-suit-working-on-tablet-in-mode.jpg"
                    alt="Professionnel travaillant"
                    className="relative z-10 w-full h-full object-cover"
                />
            </div>

            <OTPVerificationModal
                isOpen={showOTPModal}
                onClose={() => setShowOTPModal(false)}
                onVerify={handleOTPVerification}
            />
        </div>
    )
}
