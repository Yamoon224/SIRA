"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, MessageSquare, Video, X, type LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { cn } from "@/lib/utils"

type InterviewMode = "chat" | "video"

const MODES: { id: InterviewMode; label: string; description: string; icon: LucideIcon }[] = [
  { id: "chat", label: "Chat en direct", description: "Entretien par messages", icon: MessageSquare },
  { id: "video", label: "Appel vidéo", description: "Entretien vidéo simulé", icon: Video },
]

export default function SimulationEntretienConfigPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    typePoste: "",
    entreprise: "",
    niveau: "",
    duree: "",
  })
  // Le chat est présélectionné : on peut lancer la simulation sans choix
  // explicite, et la carte active dit clairement ce qui va se passer.
  const [mode, setMode] = useState<InterviewMode>("chat")

  const handleStart = () => {
    // La configuration voyage dans l'URL : la simulation se relance à
    // l'identique après un rechargement, et le lien peut être rouvert.
    const params = new URLSearchParams({ mode })
    if (formData.typePoste.trim()) params.set("poste", formData.typePoste.trim())
    if (formData.entreprise.trim()) params.set("entreprise", formData.entreprise.trim())
    if (formData.niveau) params.set("niveau", formData.niveau)
    if (formData.duree) params.set("duree", formData.duree)
    router.push(`/simulation-entretien?${params.toString()}`)
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Simulation d'Entretien avec Goriya"
          actions={
            <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Fermer">
              <X className="w-4 h-4" />
            </Button>
          }
        />

        <Card className="bg-card border-border">
          <CardContent className="p-6 sm:p-8">
            {/* Goriya Avatar */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">G</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 text-card-foreground">Simulation d'entretien IA</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Prépare-toi pour tes entretiens avec notre assistant IA intelligent
              </p>
            </div>

            {/* Configuration Form */}
            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              <div>
                <label htmlFor="typePoste" className="block text-sm font-medium text-foreground mb-2">Type de poste</label>
                <Input
                  id="typePoste"
                  value={formData.typePoste}
                  onChange={(e) => setFormData((prev) => ({ ...prev, typePoste: e.target.value }))}
                  placeholder="Ex: Développeur Full-Stack"
                  className="bg-background border-input"
                />
              </div>

              <div>
                <label htmlFor="entreprise" className="block text-sm font-medium text-foreground mb-2">Entreprise cible</label>
                <Input
                  id="entreprise"
                  value={formData.entreprise}
                  onChange={(e) => setFormData((prev) => ({ ...prev, entreprise: e.target.value }))}
                  placeholder="Ex: Google, Microsoft..."
                  className="bg-background border-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Niveau de difficulté</label>
                <Select
                  value={formData.niveau}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, niveau: value }))}
                >
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Sélectionne le niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debutant">Débutant</SelectItem>
                    <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                    <SelectItem value="avance">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Durée de l'entretien</label>
                <Select
                  value={formData.duree}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, duree: value }))}
                >
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Choisir la durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interview Type Selection */}
            <div role="radiogroup" aria-label="Type d'entretien" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
              {MODES.map(({ id, label, description, icon: Icon }) => {
                const selected = mode === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setMode(id)}
                    className={cn(
                      "relative rounded-xl border bg-card p-4 sm:p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-accent",
                    )}
                  >
                    {selected && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <Icon className={cn("w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-3", selected ? "text-primary" : "text-blue-500")} />
                    <h3 className="font-medium mb-1 text-card-foreground text-sm sm:text-base">{label}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
                  </button>
                )
              })}
            </div>

            {/* Start Button */}
            <Button onClick={handleStart} className="w-full py-3 text-base sm:text-lg">
              Commencer la simulation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
