"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Github, Plus, Upload, Eye, TrendingUp, Users } from "lucide-react"

export default function CreerPortfolioDetailPage() {
    const [formData, setFormData] = useState({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        siteWeb: "",
        profil: "",
        competences: [] as string[],
        github: "",
        linkedin: "",
        twitter: "",
    })

    const [selectedTheme, setSelectedTheme] = useState("default")
    const [newCompetence, setNewCompetence] = useState("")

    const themes = [
        { id: "default", name: "Défaut", color: "bg-gray-800" },
        { id: "blue", name: "Bleu", color: "bg-blue-500" },
        { id: "purple", name: "Violet", color: "bg-purple-500" },
        { id: "green", name: "Vert", color: "bg-green-500" },
    ]

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const addCompetence = () => {
        if (newCompetence.trim() && !formData.competences.includes(newCompetence.trim())) {
            setFormData((prev) => ({
                ...prev,
                competences: [...prev.competences, newCompetence.trim()],
            }))
            setNewCompetence("")
        }
    }

    const removeCompetence = (competence: string) => {
        setFormData((prev) => ({
            ...prev,
            competences: prev.competences.filter((c) => c !== competence),
        }))
    }

    return (
        <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-foreground">Créer un portfolio</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profil professionnel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Profil professionnel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-20 h-20 bg-gray-200 dark:bg-muted rounded-full flex items-center justify-center">
                                    <User className="w-8 h-8 text-gray-400 dark:text-muted-foreground" />
                                </div>
                                <Button variant="outline" size="sm">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Télécharger une photo
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">Nom</label>
                                    <Input
                                        value={formData.nom}
                                        onChange={(e) => handleInputChange("nom", e.target.value)}
                                        placeholder="Ton nom complet"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="ton@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">Bio professionnelle</label>
                                <Textarea
                                    value={formData.profil}
                                    onChange={(e) => handleInputChange("profil", e.target.value)}
                                    placeholder="Décris ton profil professionnel..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compétences */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Compétences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={newCompetence}
                                    onChange={(e) => setNewCompetence(e.target.value)}
                                    placeholder="Ajouter une compétence"
                                    onKeyPress={(e) => e.key === "Enter" && addCompetence()}
                                />
                                <Button onClick={addCompetence} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {formData.competences.map((competence, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-red-100"
                                        onClick={() => removeCompetence(competence)}
                                    >
                                        {competence} ×
                                    </Badge>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">JavaScript</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 dark:bg-muted rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "90%" }} />
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-muted-foreground">90%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">React</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 dark:bg-muted rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "85%" }} />
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-muted-foreground">85%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">Python</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 dark:bg-muted rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "75%" }} />
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-muted-foreground">75%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">TypeScript</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 dark:bg-muted rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "80%" }} />
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-muted-foreground">80%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mes projets */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Mes projets
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium">Application e-commerce</h4>
                                        <Badge variant="secondary">En cours</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-muted-foreground mb-3">
                                        Développement d'une plateforme e-commerce moderne avec React et Node.js
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Eye className="w-4 h-4 mr-1" />
                                            Aperçu
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Github className="w-4 h-4 mr-1" />
                                            Code
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Liens et réseaux */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Liens et réseaux</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">LinkedIn</label>
                                    <Input
                                        value={formData.linkedin}
                                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">GitHub</label>
                                    <Input
                                        value={formData.github}
                                        onChange={(e) => handleInputChange("github", e.target.value)}
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Theme & Stats */}
                <div className="space-y-6">
                    {/* Thème du portfolio */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thème du portfolio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {themes.map((theme) => (
                                    <div
                                        key={theme.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedTheme === theme.id ? "border-blue-500 bg-blue-50" : "border-gray-200 dark:border-border"
                                            }`}
                                        onClick={() => setSelectedTheme(theme.id)}
                                    >
                                        <div className={`w-full h-8 ${theme.color} rounded mb-2`} />
                                        <p className="text-sm font-medium text-center">{theme.name}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistiques */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistiques</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                                    <span className="text-sm">Vues du profil</span>
                                </div>
                                <span className="font-medium">1,234</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                                    <span className="text-sm">Croissance mensuelle</span>
                                </div>
                                <span className="font-medium text-green-600">+15%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                                    <span className="text-sm">Connexions</span>
                                </div>
                                <span className="font-medium">567</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conseils de Goriya */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Avatar className="w-6 h-6 bg-blue-500">
                                    <AvatarFallback className="text-white text-xs font-bold">G</AvatarFallback>
                                </Avatar>
                                Conseils de Goriya
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-gray-600 dark:text-muted-foreground">
                            <p className="text-blue-600">• Ajoute des captures d'écran de tes projets</p>
                            <p>• Rédige des descriptions détaillées de tes réalisations</p>
                            <p>• Mets à jour régulièrement ton portfolio</p>
                            <p>• Utilise des mots-clés pertinents pour ton secteur</p>
                            <p>• Ajoute des témoignages de clients ou collègues</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8">
                <Button variant="outline">Aperçu</Button>
                <Button>Publier</Button>
            </div>
        </div>
    )
}
