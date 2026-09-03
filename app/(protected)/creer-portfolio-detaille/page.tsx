"use client"

import Image from "next/image"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Plus, X, Github, ExternalLink } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"

export default function Page() {
    const [selectedTheme, setSelectedTheme] = useState("default")
    const [projects, setProjects] = useState([
        {
            id: "1",
            title: "Application e-commerce",
            description: "Développement d'une plateforme e-commerce moderne avec React et Node.js",
            technologies: ["React", "Node.js", "MongoDB"],
            image: "/ecommerce-app-interface.png",
        },
    ])

    const themes = [
        { id: "default", name: "Défaut", color: "bg-gray-800" },
        { id: "modern", name: "Moderne", color: "bg-purple-500" },
        { id: "creative", name: "Créatif", color: "bg-pink-500" },
    ]

    const skills = ["JavaScript", "React", "Node.js", "Python", "TypeScript"]

    return (
        <div className="bg-gray-50 dark:bg-background">
            <div className="mx-auto max-w-7xl">
                <PageHeader title="Créer un portfolio" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profil professionnel</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-200 dark:bg-muted rounded-lg flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-gray-400 dark:text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <Button variant="outline" size="sm">
                                            Télécharger une photo
                                        </Button>
                                        <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">PNG, JPG jusqu'à 5MB</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">Bio professionnelle</label>
                                    <Textarea placeholder="Présente-toi en quelques lignes..." rows={3} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">Email</label>
                                    <Input placeholder="ton@email.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">Téléphone</label>
                                    <Input placeholder="+33 6 12 34 56 78" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Compétences</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {skills.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                                            {skill}
                                            <X className="w-3 h-3 cursor-pointer" />
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input placeholder="Ajouter une compétence" className="flex-1" />
                                    <Button size="sm">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Projects */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Mes projets</CardTitle>
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {projects.map((project) => (
                                        <div key={project.id} className="border rounded-lg p-4">
                                            <div className="flex gap-4">
                                                <div className="w-24 h-16 bg-gray-200 dark:bg-muted rounded overflow-hidden">
                                                    <Image
                                                        src={project.image || "/placeholder.svg"}
                                                        alt={project.title}
                                                        width={96}
                                                        height={64}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium mb-1">{project.title}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">{project.description}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {project.technologies.map((tech) => (
                                                            <Badge key={tech} variant="outline" className="text-xs">
                                                                {tech}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Github className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Links */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Liens et réseaux</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">LinkedIn</label>
                                    <Input placeholder="https://linkedin.com/in/ton-profil" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">Portfolio personnel</label>
                                    <Input placeholder="https://ton-site.com" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Theme Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thème du portfolio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    {themes.map((theme) => (
                                        <div
                                            key={theme.id}
                                            className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${selectedTheme === theme.id ? "border-blue-500" : "border-gray-200 dark:border-border"
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

                        {/* Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistiques</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Profil qualité</span>
                                    <span className="font-medium text-green-600">85%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Compétences de pointe</span>
                                    <span className="font-medium text-blue-600">75%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Mise en forme</span>
                                    <span className="font-medium text-purple-600">90%</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Goriya Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Conseils de Goriya</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-muted-foreground">
                                <p>• Ajoute des captures d'écran de tes projets</p>
                                <p>• Décris les technologies utilisées</p>
                                <p>• Inclus des liens vers tes réalisations</p>
                                <p>• Mets à jour régulièrement ton portfolio</p>
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
        </div>
    )
}
