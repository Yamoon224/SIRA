"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { SubscriptionGate } from "@/components/subscription-gate"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Video, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"

function SimulationConfigContent() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        jobType: "",
        company: "",
        difficulty: "",
        duration: "",
    })

    const handleStartSimulation = () => {
        router.push("/simulation-entretien")
    }

    return (
        <div>
            <PageHeader title="Simulation d'Entretien avec Goriya" />

            {/* Modal-like container */}
            <div className="flex items-center justify-center min-h-[600px]">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div></div>
                            <Button variant="ghost" size="sm" onClick={() => router.back()}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="text-center mb-6">
                            <Avatar className="w-16 h-16 bg-brand-gradient mx-auto mb-4">
                                <AvatarFallback className="text-white text-2xl font-bold">G</AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-semibold mb-2">Simulation d'entretien IA</h2>
                            <p className="text-gray-600 dark:text-muted-foreground text-sm">
                                Prépare-toi pour tes entretiens avec notre assistant IA intelligent
                            </p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <Label htmlFor="jobType" className="text-sm font-medium text-gray-700 dark:text-foreground">
                                    Type de poste
                                </Label>
                                <Input
                                    id="jobType"
                                    placeholder="Ex: Développeur Full-Stack"
                                    value={formData.jobType}
                                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-foreground">
                                    Entreprise cible
                                </Label>
                                <Input
                                    id="company"
                                    placeholder="Ex: Google, Microsoft..."
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700 dark:text-foreground">
                                    Niveau de difficulté
                                </Label>
                                <Select
                                    value={formData.difficulty}
                                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Intermédiaire" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="facile">Facile</SelectItem>
                                        <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                                        <SelectItem value="difficile">Difficile</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="duration" className="text-sm font-medium text-gray-700 dark:text-foreground">
                                    Durée de l'entretien
                                </Label>
                                <Select
                                    value={formData.duration}
                                    onValueChange={(value) => setFormData({ ...formData, duration: value })}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="15 minutes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10 minutes</SelectItem>
                                        <SelectItem value="15">15 minutes</SelectItem>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="45">45 minutes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <Card className="p-4 text-center cursor-pointer hover:bg-white dark:hover:bg-card border-2 border-transparent hover:border-blue-200">
                                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                                <p className="text-sm font-medium">Chat en direct</p>
                            </Card>
                            <Card className="p-4 text-center cursor-pointer hover:bg-white dark:hover:bg-card border-2 border-transparent hover:border-blue-200">
                                <Video className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                                <p className="text-sm font-medium">Appel vidéo</p>
                            </Card>
                        </div>

                        <Button onClick={handleStartSimulation} className="w-full">
                            Commencer la simulation
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function SimulationConfigPage() {
    return (
        <SubscriptionGate featureLabel="la configuration d'entretien IA">
            <SimulationConfigContent />
        </SubscriptionGate>
    )
}
