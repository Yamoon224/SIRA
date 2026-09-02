"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppLogo } from "@/components/app-logo"
import { toast } from "sonner"

export default function CompleteProfilePage() {
    const router = useRouter()
    const { user } = useAuth()
    const [form, setForm] = useState({
        titre: "",
        ville: "",
        bio: "",
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Ces informations seront exploitées dans le profil ultérieurement
        // Pour l'instant, on les stocke localement et on passe au choix du plan
        try {
            // Stockage temporaire dans sessionStorage pour usage ultérieur
            if (form.titre || form.ville || form.bio) {
                sessionStorage.setItem("profileExtras", JSON.stringify(form))
            }
            toast.success("Profil complété !")
            router.push("/auth/plan")
        } catch {
            toast.error("Une erreur est survenue")
        } finally {
            setLoading(false)
        }
    }

    const handleSkip = () => {
        router.push("/auth/plan")
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <AppLogo className="justify-center mb-4" />
                    <div className="w-14 h-14 bg-[#2f6de6] rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl">👋</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                        Bienvenue{user?.name ? `, ${user.name.split(" ")[0]}` : ""} !
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Complète ton profil pour une meilleure expérience. Tu peux passer cette étape.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-[#e8edf6] p-6 shadow-sm">
                    <div className="space-y-1.5">
                        <Label htmlFor="titre" className="text-sm font-medium text-foreground">
                            Titre professionnel
                        </Label>
                        <Input
                            id="titre"
                            name="titre"
                            placeholder="Ex: Développeur Full-Stack, Designer UX…"
                            value={form.titre}
                            onChange={handleChange}
                            className="h-10 text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ville" className="text-sm font-medium text-foreground">
                            Ville / Localisation
                        </Label>
                        <Input
                            id="ville"
                            name="ville"
                            placeholder="Ex: Abidjan, Dakar, Paris…"
                            value={form.ville}
                            onChange={handleChange}
                            className="h-10 text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="bio" className="text-sm font-medium text-foreground">
                            Bio courte
                        </Label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            placeholder="Parle brièvement de toi et de tes objectifs…"
                            value={form.bio}
                            onChange={handleChange}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#2f6de6] resize-none"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 rounded-full bg-[#2f6de6] hover:bg-[#2157d3] text-white font-semibold"
                    >
                        {loading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            "Continuer"
                        )}
                    </Button>

                    <button
                        type="button"
                        onClick={handleSkip}
                        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Passer cette étape
                    </button>
                </form>
            </div>
        </div>
    )
}
