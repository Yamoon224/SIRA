"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AutocompleteInput } from "@/components/autocomplete-input"
import { LOCALISATIONS } from "@/lib/data/afrique"
import { Label } from "@/components/ui/label"
import { userService } from "@/lib/api/user.service"
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

        // Formulaire vide : rien à enregistrer, on passe à la suite.
        if (!form.titre.trim() && !form.ville.trim() && !form.bio.trim()) {
            router.push("/auth/plan")
            return
        }

        setLoading(true)
        try {
            await userService.updateMyProfile({
                title: form.titre.trim(),
                location: form.ville.trim(),
                bio: form.bio.trim(),
            })
            toast.success("Profil enregistré")
            router.push("/auth/plan")
        } catch {
            // Sans persistance, la saisie serait perdue : on garde l'utilisateur
            // sur l'écran plutôt que d'avancer en silence.
            toast.error("Impossible d'enregistrer ton profil. Réessaie.")
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
                    <img src="/goriya-logo-mark.png" alt="" aria-hidden className="mx-auto mb-4 h-14 w-14 object-contain" />
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                        Bienvenue{user?.name ? `, ${user.name.split(" ")[0]}` : ""} !
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Complète ton profil pour une meilleure expérience. Tu peux passer cette étape.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-card rounded-2xl border border-[#e8edf6] dark:border-border p-6 shadow-sm">
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
                        <AutocompleteInput
                            id="ville"
                            name="ville"
                            value={form.ville}
                            onChange={(v) => setForm((prev) => ({ ...prev, ville: v }))}
                            options={LOCALISATIONS}
                            placeholder="Ex: Abidjan, Dakar, Paris…"
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
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white dark:border-border border-t-transparent" />
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
