"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CVAnalysis } from "@/lib/@types/openai"
import { AlertCircle, CheckCircle2, Lightbulb, Target } from "lucide-react"

type StoredAnalysis = {
  fileName: string
  analyzedAt: string
  analysis: CVAnalysis
}

export default function ResultatAnalyseCVPage() {
  const [result, setResult] = useState<StoredAnalysis | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("goriya_cv_analysis_result")
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as StoredAnalysis
      setResult(parsed)
    } catch {
      setResult(null)
    }
  }, [])

  const analyzedDate = useMemo(() => {
    if (!result?.analyzedAt) return ""
    return new Date(result.analyzedAt).toLocaleString("fr-FR")
  }, [result?.analyzedAt])

  if (!result) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] dark:bg-background px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#e5e9f2] dark:border-border bg-white dark:bg-card p-6 text-center">
          <h1 className="text-2xl font-bold text-[#1b2331] dark:text-foreground">Aucun résultat trouvé</h1>
          <p className="mt-2 text-sm text-[#7f8796] dark:text-muted-foreground">Téléverse ton CV depuis la page d'accueil pour lancer l'analyse.</p>
          <Link href="/">
            <Button className="mt-5 rounded-full bg-brand-gradient hover:bg-brand-gradient-hover">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb] dark:bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-[#e5e9f2] dark:border-border bg-white dark:bg-card p-5 sm:p-8">
          <h1 className="text-center text-xl sm:text-3xl leading-tight font-extrabold text-[#1b2331] dark:text-foreground">Super! Etoile, ton score est de {result.analysis.score}%</h1>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#f4f7ff] dark:bg-muted p-3 text-center">
              <p className="text-[11px] text-[#8792a8] dark:text-muted-foreground">Document analysé</p>
              <p className="mt-1 text-[13px] font-semibold text-[#1d2433] dark:text-foreground break-all">{result.fileName}</p>
            </div>
            <div className="rounded-xl bg-[#f4f7ff] dark:bg-muted p-3 text-center">
              <p className="text-[11px] text-[#8792a8] dark:text-muted-foreground">Date d'analyse</p>
              <p className="mt-1 text-[13px] font-semibold text-[#1d2433] dark:text-foreground">{analyzedDate}</p>
            </div>
            <div className="rounded-xl bg-[#f4f7ff] dark:bg-muted p-3 text-center">
              <p className="text-[11px] text-[#8792a8] dark:text-muted-foreground">Score global</p>
              <p className="mt-1 text-[13px] font-semibold text-[#1d2433] dark:text-foreground">{result.analysis.score}/100</p>
            </div>
          </div>

          <Card className="mt-6 border-[#e5e9f2] dark:border-border">
            <CardHeader>
              <CardTitle className="text-[16px] text-[#1b2331] dark:text-foreground">Résumé général</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[14px] leading-6 text-[#4a5568] dark:text-foreground">{result.analysis.summary}</p>
            </CardContent>
          </Card>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border-[#e5e9f2] dark:border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[15px] text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Points forts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.analysis.strengths.map((item, index) => (
                  <p key={index} className="text-[13px] text-[#334155] dark:text-foreground">• {item}</p>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#e5e9f2] dark:border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[15px] text-amber-700">
                  <AlertCircle className="h-4 w-4" />
                  Points à améliorer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.analysis.weaknesses.map((item, index) => (
                  <p key={index} className="text-[13px] text-[#334155] dark:text-foreground">• {item}</p>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-5 border-[#e5e9f2] dark:border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px] text-[#1b2331] dark:text-foreground">
                <Lightbulb className="h-4 w-4 text-[#2f6de6] dark:text-primary" />
                Recommandations IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.analysis.suggestions.map((item, index) => (
                <div key={index} className="rounded-lg bg-[#f4f7ff] dark:bg-muted p-3 text-[13px] text-[#334155] dark:text-foreground">
                  <span className="mr-2 font-semibold text-[#2f6de6] dark:text-primary">{index + 1}.</span>
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-5 border-[#e5e9f2] dark:border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px] text-[#1b2331] dark:text-foreground">
                <Target className="h-4 w-4 text-[#2f6de6] dark:text-primary" />
                Mots-clés détectés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.analysis.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="rounded-full bg-[#eef3ff] dark:bg-primary/10 text-[#2f6de6] dark:text-primary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/">
              <Button variant="outline" className="rounded-full border-[#b9c8ec] dark:border-border text-[#2f6de6] dark:text-primary bg-white dark:bg-card w-full sm:w-auto">
                Revenir à l'accueil
              </Button>
            </Link>
            <Link href="/explorer-emplois">
              <Button className="rounded-full bg-brand-gradient hover:bg-brand-gradient-hover w-full sm:w-auto">Postuler à un emploi</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}