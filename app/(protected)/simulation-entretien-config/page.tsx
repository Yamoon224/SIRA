"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AudioLines, Check, MessageSquare, Video, type LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { cn } from "@/lib/utils"
import { SubscriptionGate } from "@/components/subscription-gate"

type InterviewMode = "chat" | "video"

const MODES: { id: InterviewMode | "live"; label: string; description: string; icon: LucideIcon; bientot?: boolean }[] = [
  { id: "chat", label: "Chat en direct", description: "Entretien par messages", icon: MessageSquare },
  // Pas encore ouvert : le micro et l'analyse des réponses orales ne sont pas prêts.
  { id: "video", label: "Appel vidéo", description: "Entretien vidéo simulé", icon: Video, bientot: true },
  // Entretien à la voix, en conversation continue : ouvrira avec l'application mobile.
  { id: "live", label: "Goriya Live", description: "Entretien à la voix, sur l'application", icon: AudioLines, bientot: true },
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
    <SubscriptionGate featureLabel="la simulation d'entretien IA" feature="Simulation d'entretien">
    <div className="bg-background">
      <div className="mx-auto max-w-xl">
        <PageHeader title="Simulation d'Entretien avec Goriya" />

        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-5">
            {/* Goriya Avatar */}
            <div className="mb-4 flex items-center gap-3 text-left">
              <div className="h-10 w-10 shrink-0 bg-brand-gradient rounded-full flex items-center justify-center">
                <span className="text-white text-base font-bold">G</span>
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-card-foreground">Simulation d'entretien IA</h2>
                <p className="text-muted-foreground text-xs">
                  Prépare-toi pour tes entretiens avec notre assistant IA intelligent
                </p>
              </div>
            </div>

            {/* Configuration Form */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="typePoste" className="block text-xs font-medium text-foreground mb-1">Type de poste</label>
                <Input
                  id="typePoste"
                  value={formData.typePoste}
                  onChange={(e) => setFormData((prev) => ({ ...prev, typePoste: e.target.value }))}
                  placeholder="Ex: Développeur Full-Stack"
                  className="h-9 bg-background border-input text-sm"
                />
              </div>

              <div>
                <label htmlFor="entreprise" className="block text-xs font-medium text-foreground mb-1">Entreprise cible</label>
                <Input
                  id="entreprise"
                  value={formData.entreprise}
                  onChange={(e) => setFormData((prev) => ({ ...prev, entreprise: e.target.value }))}
                  placeholder="Ex: Google, Microsoft..."
                  className="h-9 bg-background border-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Niveau de difficulté</label>
                <Select
                  value={formData.niveau}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, niveau: value }))}
                >
                  <SelectTrigger className="h-9 bg-background border-input text-sm">
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
                <label className="block text-xs font-medium text-foreground mb-1">Durée de l'entretien</label>
                <Select
                  value={formData.duree}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, duree: value }))}
                >
                  <SelectTrigger className="h-9 bg-background border-input text-sm">
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
            <div role="radiogroup" aria-label="Type d'entretien" className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {MODES.map(({ id, label, description, icon: Icon, bientot }) => {
                const selected = mode === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-disabled={bientot}
                    disabled={bientot}
                    onClick={() => id === "chat" && setMode(id)}
                    className={cn(
                      "relative rounded-xl border bg-card p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-accent",
                      bientot && "cursor-not-allowed opacity-60 hover:bg-card",
                    )}
                  >
                    {bientot && (
                      <span className="absolute right-2 top-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Bientôt
                      </span>
                    )}
                    {selected && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                    <Icon className={cn("h-5 w-5 mx-auto mb-1.5", selected ? "text-primary" : "text-blue-500")} />
                    <h3 className="font-medium text-card-foreground text-[13px]">{label}</h3>
                    <p className="text-[11px] leading-tight text-muted-foreground">{description}</p>
                  </button>
                )
              })}
            </div>

            {/* Start Button */}
            <Button onClick={handleStart} className="h-10 w-full text-sm">
              Commencer la simulation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </SubscriptionGate>
  )
}
