"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { FileBadge2, Download, Save, Sparkles } from "lucide-react"
import { generatePDF } from "@/lib/document-generator"
import { SubscriptionGate } from "@/components/subscription-gate"

interface CVData {
    nom: string
    email: string
    telephone: string
    adresse: string
    profil: string
    competences: string
    experience: string
    formation: string
    langues: string
}

function CreerCVContent() {
    const [analysisProgress, setAnalysisProgress] = useState(0)
    const [formData, setFormData] = useState<CVData>({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        profil: "",
        competences: "",
        experience: "",
        formation: "",
        langues: "",
    })

    const handleInputChange = (field: keyof CVData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleAnalyze = () => {
        setAnalysisProgress(0)
        let progress = 0
        const timer = setInterval(() => {
            progress += 10
            setAnalysisProgress(progress)
            if (progress >= 100) {
                clearInterval(timer)
            }
        }, 180)
    }

    const handleDownloadPDF = () => {
        const filename = `cv-${formData.nom.toLowerCase().replace(/\s+/g, "-") || "document"}.pdf`
        const content = `${formData.nom || "Ton nom"}\n${formData.email || "email@example.com"}\n${formData.telephone || "Téléphone"}\n${formData.adresse || "Ville, Pays"}\n\n${formData.profil || "Résumé professionnel"}`
        generatePDF(content, filename)
    }

    return (
        <div className="min-h-[calc(100vh-80px)]">
            <div className="border-b border-[#d9dfea] px-4 py-4 sm:px-6">
                <h1 className="text-2xl sm:text-[32px] font-semibold leading-none text-[#1b2331]">Créer CV Intelligent</h1>
            </div>

            <div className="mx-auto w-full max-w-[1240px] px-4 py-4 sm:px-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
                    <div className="space-y-4">
                        <Card className="overflow-hidden rounded-[12px] border-[#dfe5f1] bg-[#edf0ff]">
                            <CardContent className="p-4">
                                <div className="mb-4 text-center">
                                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-white/80 text-[#2f6de6]">
                                        <FileBadge2 className="h-6 w-6" />
                                    </div>
                                    <p className="text-[15px] font-semibold text-[#1f4ec2]">Créateur de CV</p>
                                    <p className="mt-1 text-[11px] text-[#7d86a0]">Construis ton CV professionnel</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 rounded-md bg-[#b8bfce] px-3 py-1.5 text-[12px] font-medium text-white">
                                        <span>🧍</span>
                                        <span>Informations personnelles</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-[#8b94ab]">
                                        <span>👨‍💼</span>
                                        <span>Expériences professionnelle</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-[#8b94ab]">
                                        <span>📘</span>
                                        <span>Formation</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-[#8b94ab]">
                                        <span>🏅</span>
                                        <span>Compétences</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden rounded-[12px] border-[#e1e6f1] bg-[#f2f4fb]">
                            <CardContent className="p-4">
                                <div className="relative mb-2 flex justify-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2e6fe9] text-white">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="text-center text-[13px] font-semibold text-[#2e6fe9]">Analyse avec Goriya</p>
                                <p className="mb-2 text-center text-[11px] text-[#8b94ab]">Score d'optimisation de ton CV</p>

                                <div className="text-center text-[38px] font-bold leading-none text-[#2e6fe9]">{analysisProgress}%</div>
                                <Progress value={analysisProgress} className="mt-2 h-1.5 bg-[#e6eaf4]" />

                                <div className="mt-3 space-y-2 text-[10px] text-[#99a3b8]">
                                    <div className="flex items-center justify-between">
                                        <span>Structure</span>
                                        <span className="text-[#8dc79b]">Excellent</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Mots-clés</span>
                                        <span className="text-[#c9b26f]">Moyen</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Expérience</span>
                                        <span className="text-[#8dc79b]">Très bon</span>
                                    </div>
                                </div>

                                <Button onClick={handleAnalyze} className="mt-3 h-8 w-full rounded-full bg-[#2e6fe9] text-[11px] hover:bg-[#275ec6]">
                                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                                    Analyser avec Goriya
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-[12px] border-[#dfe5f1] bg-white">
                        <CardContent className="p-4">
                            <h2 className="mb-3 text-[15px] font-semibold text-[#2a3242]">Informations personnelles</h2>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-[11px] text-[#8b93a3]">Nom complet</label>
                                    <Input
                                        value={formData.nom}
                                        onChange={(e) => handleInputChange("nom", e.target.value)}
                                        placeholder="Ton nom complet"
                                        className="h-8 rounded-[7px] border-0 bg-[#f1f2f5] text-[12px] shadow-none focus-visible:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] text-[#8b93a3]">Email</label>
                                    <Input
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="ton.email@exemple.com"
                                        className="h-8 rounded-[7px] border-0 bg-[#f1f2f5] text-[12px] shadow-none focus-visible:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] text-[#8b93a3]">Téléphone</label>
                                    <Input
                                        value={formData.telephone}
                                        onChange={(e) => handleInputChange("telephone", e.target.value)}
                                        placeholder="+229 97 39 47 82"
                                        className="h-8 rounded-[7px] border-0 bg-[#f1f2f5] text-[12px] shadow-none focus-visible:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] text-[#8b93a3]">Adresse</label>
                                    <Input
                                        value={formData.adresse}
                                        onChange={(e) => handleInputChange("adresse", e.target.value)}
                                        placeholder="Ville, Pays"
                                        className="h-8 rounded-[7px] border-0 bg-[#f1f2f5] text-[12px] shadow-none focus-visible:ring-0"
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="mb-1 block text-[11px] text-[#8b93a3]">Résumé professionnel</label>
                                <Textarea
                                    value={formData.profil}
                                    onChange={(e) => handleInputChange("profil", e.target.value)}
                                    placeholder="Décris brièvement ton profil professionnel..."
                                    className="min-h-[112px] resize-none rounded-[7px] border-0 bg-[#f1f2f5] text-[12px] shadow-none focus-visible:ring-0"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mx-auto mt-6 flex w-full max-w-[720px] flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                        variant="ghost"
                        disabled
                        className="h-9 w-full sm:min-w-[230px] sm:w-auto rounded-full bg-[#f0f2f8] text-[12px] text-[#a9afbe] hover:bg-[#f0f2f8]"
                    >
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Sauvegarder
                    </Button>
                    <Button
                        onClick={handleDownloadPDF}
                        className="h-9 w-full sm:min-w-[330px] sm:w-auto rounded-full bg-[#7fa6e8] text-[12px] text-white hover:bg-[#6f96d8]"
                    >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Télécharger
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <SubscriptionGate featureLabel="la création de CV assistée par IA">
            <CreerCVContent />
        </SubscriptionGate>
    )
}
