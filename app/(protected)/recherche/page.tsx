"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Building2, Filter } from "lucide-react"

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  // Mock search results
  const searchResults = [
    {
      id: "1",
      title: "Développeur Full Stack React/Node.js",
      company: "TechCorp Solutions",
      location: "Paris, France",
      type: "CDI",
      salary: "45k - 65k €",
      postedDate: "Il y a 2 jours",
      description: "Nous recherchons un développeur expérimenté pour rejoindre notre équipe...",
    },
    {
      id: "2",
      title: "Designer UX/UI Senior",
      company: "Creative Agency",
      location: "Lyon, France",
      type: "CDI",
      salary: "40k - 55k €",
      postedDate: "Il y a 1 jour",
      description: "Poste de designer senior pour créer des expériences utilisateur exceptionnelles...",
    },
    {
      id: "3",
      title: "Chef de Projet Digital",
      company: "Digital Solutions",
      location: "Marseille, France",
      type: "CDI",
      salary: "50k - 70k €",
      postedDate: "Il y a 3 jours",
      description: "Nous cherchons un chef de projet pour piloter nos projets digitaux...",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Résultats de recherche pour "{query}"</h1>
          <p className="text-muted-foreground">{searchResults.length} résultats trouvés</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Filter className="w-5 h-5" />
                  <h3 className="font-semibold">Filtres</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Localisation</label>
                    <Input placeholder="Ville, région..." />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Type de contrat</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cdi">CDI</SelectItem>
                        <SelectItem value="cdd">CDD</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="stage">Stage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Salaire minimum</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les salaires" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30k">30k € et plus</SelectItem>
                        <SelectItem value="40k">40k € et plus</SelectItem>
                        <SelectItem value="50k">50k € et plus</SelectItem>
                        <SelectItem value="60k">60k € et plus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">Appliquer les filtres</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {searchResults.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                          <p className="text-muted-foreground mb-2">{job.company}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {job.postedDate}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{job.type}</Badge>
                    </div>

                    <p className="text-muted-foreground mb-4">{job.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-600">{job.salary}</span>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          Sauvegarder
                        </Button>
                        <Button size="sm">Postuler</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Précédent
                </Button>
                <Button size="sm">1</Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SearchResults />
    </Suspense>
  )
}
