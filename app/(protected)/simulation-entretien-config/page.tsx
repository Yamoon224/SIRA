"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Video, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SimulationEntretienConfigPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    typePoste: "",
    entreprise: "",
    niveau: "",
    duree: "",
  })

  const handleStart = () => {
    // Redirect to simulation chat
    router.push("/simulation-entretien")
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Simulation d'Entretien avec Goriya</h1>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6 sm:p-8">
            {/* Goriya Avatar */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                <label className="block text-sm font-medium text-foreground mb-2">Type de poste</label>
                <Input
                  value={formData.typePoste}
                  onChange={(e) => setFormData((prev) => ({ ...prev, typePoste: e.target.value }))}
                  placeholder="Ex: Développeur Full-Stack"
                  className="bg-background border-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Entreprise cible</label>
                <Input
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
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 heure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interview Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
              <Card className="cursor-pointer hover:bg-accent transition-colors border-border">
                <CardContent className="p-4 sm:p-6 text-center">
                  <MessageSquare className="w-6 sm:w-8 h-6 sm:h-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-medium mb-1 text-card-foreground text-sm sm:text-base">Chat en direct</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Entretien par messages</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent transition-colors border-border">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Video className="w-6 sm:w-8 h-6 sm:h-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-medium mb-1 text-card-foreground text-sm sm:text-base">Appel vidéo</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Entretien vidéo simulé</p>
                </CardContent>
              </Card>
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
