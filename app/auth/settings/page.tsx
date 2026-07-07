"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function Page() {
    const router = useRouter()
    const [settings, setSettings] = useState({
        applications: true,
        emplois: false,
        recommandations: false,
    })

    const handleContinue = () => {
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left side - Illustration */}
            <div className="hidden md:block flex-1 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 relative overflow-hidden">
                <div className="p-6">
                    <Link href="/auth/loading" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        retour
                    </Link>
                </div>

                <div className="flex items-center justify-center h-full p-8">
                    <div className="max-w-lg">
                        <img
                            src="/woman-with-curly-hair-and-glasses-working-on-lapto.jpg"
                            alt="Femme travaillant sur ordinateur portable"
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            </div>

            {/* Right side - Settings */}
            <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-12 bg-background">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground mb-2">Notifications</h1>
                        <p className="text-muted-foreground">Personnalise tes préférences de notification générales</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="applications"
                                    checked={settings.applications}
                                    onCheckedChange={(checked) => setSettings({ ...settings, applications: checked as boolean })}
                                    className="mt-1"
                                />
                                <div>
                                    <Label htmlFor="applications" className="font-medium text-foreground">
                                        Applications
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Ces notifications sont pour les emplois auxquels tu as postulé
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="emplois"
                                    checked={settings.emplois}
                                    onCheckedChange={(checked) => setSettings({ ...settings, emplois: checked as boolean })}
                                    className="mt-1"
                                />
                                <div>
                                    <Label htmlFor="emplois" className="font-medium text-foreground">
                                        Emplois
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Il s'agit de notifications pour des offres d'emploi qui pourraient te plaire
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="recommandations"
                                    checked={settings.recommandations}
                                    onCheckedChange={(checked) => setSettings({ ...settings, recommandations: checked as boolean })}
                                    className="mt-1"
                                />
                                <div>
                                    <Label htmlFor="recommandations" className="font-medium text-foreground">
                                        Recommandations
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Ces notifications sont des recommandations personnalisées de nos services
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-6">
                            <Button variant="ghost" className="text-muted-foreground">
                                Ignorer
                            </Button>
                            <Button onClick={handleContinue} className="bg-primary hover:bg-primary/90 px-8">
                                Continuer
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
