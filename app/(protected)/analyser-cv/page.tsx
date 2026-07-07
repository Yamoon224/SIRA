"use client"

import type React from "react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CVAnalysis } from "@/lib/@types/openai"
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Target, Lightbulb, Eye } from "lucide-react"
import { SubscriptionGate } from "@/components/subscription-gate"

function AnalyserCVContent() {
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState<CVAnalysis | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const allowedTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/webp",
            ]

            if (!allowedTypes.includes(file.type)) {
                setError("Format de fichier non supporté. Veuillez télécharger un fichier PDF, Word ou image (PNG, JPEG, JPG).")
                return
            }

            if (file.size > 10 * 1024 * 1024) {
                // 10MB limit
                setError("Le fichier est trop volumineux. Taille maximale : 10MB.")
                return
            }

            setCvFile(file)
            setError(null)
            setAnalysis(null)
        }
    }

    const handleAnalyze = async () => {
        if (!cvFile) {
            setError("Sélectionne un fichier CV à analyser.")
            return
        }

        setIsAnalyzing(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("file", cvFile)

            const response = await fetch("/api/analyse-cv", {
                method: "POST",
                body: formData,
            })

            const payload = (await response.json()) as { analysis?: CVAnalysis; error?: string }
            if (!response.ok || !payload.analysis) {
                throw new Error(payload.error || "Analyse IA indisponible")
            }

            setAnalysis(payload.analysis)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'analyse.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 dark:text-green-400"
        if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
        return "text-red-600 dark:text-red-400"
    }

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return "bg-green-100 dark:bg-green-900/20"
        if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20"
        return "bg-red-100 dark:bg-red-900/20"
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Analyser ton CV</h1>
                <p className="text-muted-foreground">
                    Télécharge ton CV pour obtenir une analyse détaillée et des conseils d'amélioration
                </p>
            </div>

            {/* Upload Section */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Upload className="w-5 h-5 mr-2" />
                        Télécharger ton CV
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <div className="space-y-4">
                            <div>
                                <p className="text-muted-foreground mb-2">Formats acceptés : PDF, Word, PNG, JPEG, JPG</p>
                                <p className="text-sm text-muted-foreground">Taille maximale : 10MB</p>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("cv-upload")?.click()}
                                className="mx-auto"
                            >
                                Choisir un fichier
                            </Button>

                            <input
                                id="cv-upload"
                                type="file"
                                accept=".pdf,.doc,.docx,.png,.jpeg,.jpg,.webp"
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            {cvFile && (
                                <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">{cvFile.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <Alert className="mt-4" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {cvFile && !analysis && (
                        <div className="mt-4 text-center">
                            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-primary hover:bg-primary/90">
                                {isAnalyzing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Analyse en cours...
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4 mr-2" />
                                        Analyser mon CV
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysis && (
                <div className="space-y-6">
                    {/* Score Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2" />
                                Score global
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className={`text-4xl font-bold flex-shrink-0 ${getScoreColor(analysis.score)}`}>{analysis.score}/100</div>
                                <div className="flex-1 w-full">
                                    <Progress value={analysis.score} className="h-3" />
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{analysis.summary}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Strengths */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-green-600 dark:text-green-400">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Points forts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {analysis.strengths.map((strength, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{strength}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weaknesses */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Points à améliorer
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {analysis.weaknesses.map((weakness, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{weakness}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Suggestions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-primary dark:text-primary">
                                <Lightbulb className="w-5 h-5 mr-2" />
                                Suggestions d'amélioration
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analysis.suggestions.map((suggestion, index) => (
                                    <div key={index} className="p-3 bg-primary/10 dark:bg-primary/10 rounded-lg">
                                        <div className="flex items-start space-x-2">
                                            <Target className="w-4 h-4 text-primary dark:text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{suggestion}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Keywords */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mots-clés identifiés</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {analysis.keywords.map((keyword, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCvFile(null)
                                setAnalysis(null)
                                setError(null)
                            }}
                        >
                            Analyser un autre CV
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 dark:bg-primary hover:dark:bg-primary/90">
                            Améliorer mon CV
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Page() {
    return (
        <SubscriptionGate featureLabel="l'analyse IA de CV">
            <AnalyserCVContent />
        </SubscriptionGate>
    )
}
