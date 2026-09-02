"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, CheckCircle } from "lucide-react"

export default function ProgrammerEntretienPage() {
  const [formData, setFormData] = useState({
    formation: "",
    entreprise: "",
    posteVise: "",
    typeEntretien: "",
    date: "",
    heure: "",
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
  })

  return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-6">Programmer un interview</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Détails de formation */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Détails de formation</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="entreprise">Entreprise</Label>
                    <Input
                      id="entreprise"
                      placeholder="Nom de l'entreprise"
                      value={formData.entreprise}
                      onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="posteVise">Poste visé</Label>
                    <Input
                      id="posteVise"
                      placeholder="Intitulé du poste souhaité"
                      value={formData.posteVise}
                      onChange={(e) => setFormData({ ...formData, posteVise: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="typeEntretien">Type d'entretien</Label>
                    <Select
                      value={formData.typeEntretien}
                      onValueChange={(value) => setFormData({ ...formData, typeEntretien: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technique">Technique</SelectItem>
                        <SelectItem value="rh">RH</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date et heure */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="heure">Heure</Label>
                    <Input
                      id="heure"
                      type="time"
                      value={formData.heure}
                      onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de contact */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Informations de contact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input
                      id="prenom"
                      placeholder="Ton prénom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nom">Nom</Label>
                    <Input
                      id="nom"
                      placeholder="Ton nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ton.email@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      placeholder="+33 6 12 34 56 78"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Créneaux disponibles */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Créneaux disponibles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="font-medium">Lundi</div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground">09:00</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Mardi</div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground">14:00</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Mercredi</div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground">11:00</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full">Et Confirmer le rendez-vous</Button>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <Card className="bg-blue-500 text-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Résumé de ta demande</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Dates intéressé</div>
                      <div className="text-sm opacity-90">Lundi - Vendredi</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Format</div>
                      <div className="text-sm opacity-90">Entretien en présentiel</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Lieu</div>
                      <div className="text-sm opacity-90">Bureau de l'entreprise</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-blue-400">
                  <h3 className="font-semibold mb-3">Prochaines étapes</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmation automatique de disponibilité</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Préparation personnalisée</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Localisation</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
