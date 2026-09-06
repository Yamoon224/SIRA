"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface JobFiltersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JobFiltersModal({ open, onOpenChange }: JobFiltersModalProps) {
  const [selectedWorkType, setSelectedWorkType] = useState<string[]>([])
  const [selectedDuration, setSelectedDuration] = useState<string[]>([])
  const [selectedExperience, setSelectedExperience] = useState<string[]>([])

  const workTypes = ["CDI", "CDD"]
  const durations = ["1-3 mois", "4-6 mois", "7-12 mois", "13-24 mois", "25-36 mois"]
  const experienceLevels = ["0-10", "1-31", "3-50", "5-101", "10+0"]

  const toggleFilter = (category: string[], value: string, setter: (values: string[]) => void) => {
    if (category.includes(value)) {
      setter(category.filter((item) => item !== value))
    } else {
      setter([...category, value])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Tous les filtres</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Type de travail */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Type de travail</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Type de contrat ou temps de travail qui te correspond.
            </p>
            <div className="flex gap-2">
              {workTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedWorkType.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter(selectedWorkType, type, setSelectedWorkType)}
                  className="rounded-full"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Profession */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Profession</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Tes domaines de spécialité pour t'ouvrir à différents postes.
            </p>
            <Button variant="outline" className="rounded-full bg-transparent">
              Sélectionner des professions
            </Button>
          </div>

          {/* Durée du travail */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Durée du travail</h3>
            <p className="text-muted-foreground text-sm mb-4">Durée idéale pour les contrats courts.</p>
            <div className="flex flex-wrap gap-2">
              {durations.map((duration) => (
                <Button
                  key={duration}
                  variant={selectedDuration.includes(duration) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter(selectedDuration, duration, setSelectedDuration)}
                  className="rounded-full"
                >
                  {duration}
                </Button>
              ))}
            </div>
          </div>

          {/* Niveau d'expérience */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Niveau d'expérience</h3>
            <p className="text-muted-foreground text-sm mb-4">Ton expérience en années, à 1 ou 2 ans près.</p>
            <div className="flex flex-wrap gap-2">
              {experienceLevels.map((level) => (
                <Button
                  key={level}
                  variant={selectedExperience.includes(level) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter(selectedExperience, level, setSelectedExperience)}
                  className="rounded-full"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button className="bg-brand-gradient hover:bg-brand-gradient-hover" onClick={() => onOpenChange(false)}>
            Explorer les offres
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
