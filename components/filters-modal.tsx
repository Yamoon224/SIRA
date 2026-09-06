"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"

interface FiltersModalProps {
  trigger?: React.ReactNode
  onFiltersChange?: (filters: any) => void
}

export function FiltersModal({ trigger, onFiltersChange }: FiltersModalProps) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState({
    contractType: [] as string[],
    location: [] as string[],
    experience: [] as string[],
    salary: [0, 500000] as number[],
    company: [] as string[],
    sector: [] as string[],
    workMode: [] as string[],
  })

  const contractTypes = ["CDI", "CDD", "Stage", "Freelance", "Temps partiel", "Alternance", "Intérim"]

  const locations = [
    "Abidjan",
    "Bouaké",
    "Daloa",
    "Yamoussoukro",
    "San-Pédro",
    "Korhogo",
    "Man",
    "Divo",
    "Gagnoa",
    "Abengourou",
  ]

  const experienceLevels = [
    "Débutant (0-1 an)",
    "Junior (1-3 ans)",
    "Confirmé (3-5 ans)",
    "Senior (5-10 ans)",
    "Expert (10+ ans)",
  ]

  const companies = [
    "Pitch",
    "Twitter",
    "Marketing REVOLUT",
    "Orange CI",
    "MTN CI",
    "Société Générale",
    "Ecobank",
    "Total Energies",
  ]

  const sectors = [
    "Technologie",
    "Finance",
    "Marketing",
    "Santé",
    "Éducation",
    "Commerce",
    "Industrie",
    "Télécommunications",
  ]

  const workModes = ["Sur site", "Télétravail", "Hybride", "Déplacements fréquents"]

  const handleFilterChange = (filterType: keyof typeof filters, value: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: checked
        ? [...(prev[filterType] as string[]), value]
        : (prev[filterType] as string[]).filter((item) => item !== value),
    }))
  }

  const handleSalaryChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      salary: value,
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      contractType: [],
      location: [],
      experience: [],
      salary: [0, 500000],
      company: [],
      sector: [],
      workMode: [],
    })
  }

  const applyFilters = () => {
    onFiltersChange?.(filters)
    setOpen(false)
  }

  const getActiveFiltersCount = () => {
    return (
      filters.contractType.length +
      filters.location.length +
      filters.experience.length +
      filters.company.length +
      filters.sector.length +
      filters.workMode.length +
      (filters.salary[0] > 0 || filters.salary[1] < 500000 ? 1 : 0)
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="relative bg-transparent">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            {getActiveFiltersCount() > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-brand-gradient">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filtres de recherche</span>
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-blue-600 hover:text-blue-700">
              Effacer tout
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
          {/* Contract Type */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Type de contrat</h3>
            <div className="space-y-3">
              {contractTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`contract-${type}`}
                    checked={filters.contractType.includes(type)}
                    onCheckedChange={(checked) => handleFilterChange("contractType", type, checked as boolean)}
                  />
                  <Label htmlFor={`contract-${type}`} className="text-sm text-muted-foreground cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Localisation</h3>
            <div className="space-y-3">
              {locations.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${location}`}
                    checked={filters.location.includes(location)}
                    onCheckedChange={(checked) => handleFilterChange("location", location, checked as boolean)}
                  />
                  <Label htmlFor={`location-${location}`} className="text-sm text-muted-foreground cursor-pointer">
                    {location}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Niveau d'expérience</h3>
            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`experience-${level}`}
                    checked={filters.experience.includes(level)}
                    onCheckedChange={(checked) => handleFilterChange("experience", level, checked as boolean)}
                  />
                  <Label htmlFor={`experience-${level}`} className="text-sm text-muted-foreground cursor-pointer">
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Entreprise</h3>
            <div className="space-y-3">
              {companies.map((company) => (
                <div key={company} className="flex items-center space-x-2">
                  <Checkbox
                    id={`company-${company}`}
                    checked={filters.company.includes(company)}
                    onCheckedChange={(checked) => handleFilterChange("company", company, checked as boolean)}
                  />
                  <Label htmlFor={`company-${company}`} className="text-sm text-muted-foreground cursor-pointer">
                    {company}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Sector */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Secteur d'activité</h3>
            <div className="space-y-3">
              {sectors.map((sector) => (
                <div key={sector} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sector-${sector}`}
                    checked={filters.sector.includes(sector)}
                    onCheckedChange={(checked) => handleFilterChange("sector", sector, checked as boolean)}
                  />
                  <Label htmlFor={`sector-${sector}`} className="text-sm text-muted-foreground cursor-pointer">
                    {sector}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Work Mode */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Mode de travail</h3>
            <div className="space-y-3">
              {workModes.map((mode) => (
                <div key={mode} className="flex items-center space-x-2">
                  <Checkbox
                    id={`workmode-${mode}`}
                    checked={filters.workMode.includes(mode)}
                    onCheckedChange={(checked) => handleFilterChange("workMode", mode, checked as boolean)}
                  />
                  <Label htmlFor={`workmode-${mode}`} className="text-sm text-muted-foreground cursor-pointer">
                    {mode}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Range */}
        <div className="py-6 border-t">
          <h3 className="font-semibold text-foreground mb-4">Fourchette de salaire (FCFA/mois)</h3>
          <div className="px-4">
            <Slider
              value={filters.salary}
              onValueChange={handleSalaryChange}
              max={500000}
              min={0}
              step={10000}
              className="mb-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{filters.salary[0].toLocaleString()} FCFA</span>
              <span>{filters.salary[1].toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="py-4 border-t">
            <h4 className="font-medium text-foreground mb-3">Filtres actifs ({getActiveFiltersCount()})</h4>
            <div className="flex flex-wrap gap-2">
              {filters.contractType.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange("contractType", type, false)}
                  />
                </Badge>
              ))}
              {filters.location.map((location) => (
                <Badge key={location} variant="secondary" className="flex items-center gap-1">
                  {location}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange("location", location, false)}
                  />
                </Badge>
              ))}
              {filters.experience.map((exp) => (
                <Badge key={exp} variant="secondary" className="flex items-center gap-1">
                  {exp}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("experience", exp, false)} />
                </Badge>
              ))}
              {filters.company.map((company) => (
                <Badge key={company} variant="secondary" className="flex items-center gap-1">
                  {company}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("company", company, false)} />
                </Badge>
              ))}
              {filters.sector.map((sector) => (
                <Badge key={sector} variant="secondary" className="flex items-center gap-1">
                  {sector}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("sector", sector, false)} />
                </Badge>
              ))}
              {filters.workMode.map((mode) => (
                <Badge key={mode} variant="secondary" className="flex items-center gap-1">
                  {mode}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("workMode", mode, false)} />
                </Badge>
              ))}
              {(filters.salary[0] > 0 || filters.salary[1] < 500000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.salary[0].toLocaleString()} - {filters.salary[1].toLocaleString()} FCFA
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleSalaryChange([0, 500000])} />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
            Annuler
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearAllFilters} className="bg-transparent">
              Réinitialiser
            </Button>
            <Button onClick={applyFilters} className="bg-brand-gradient hover:bg-brand-gradient-hover">
              Appliquer les filtres ({getActiveFiltersCount()})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
