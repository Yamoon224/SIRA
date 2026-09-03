"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Star, CheckCircle2 } from "lucide-react"
import { employeeSurveyService, type IEmployeeSurvey } from "@/lib/api/employee-survey.service"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/layout/page-header"

export default function Page() {
    const [surveys, setSurveys] = useState<IEmployeeSurvey[]>([])
    const [loading, setLoading] = useState(true)
    const [unavailable, setUnavailable] = useState(false)
    const [answers, setAnswers] = useState<Record<string, Record<string, string | number>>>({})
    const [submitting, setSubmitting] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState<Set<string>>(new Set())

    useEffect(() => {
        const load = async () => {
            try {
                const res = await employeeSurveyService.list()
                const items = ((res as any)?.data ?? res) as IEmployeeSurvey[]
                setSurveys(Array.isArray(items) ? items.filter((s) => s.status === "ACTIVE") : [])
            } catch (err) {
                console.error("[enquetes-employe] load error:", err)
                setUnavailable(true)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const setAnswer = (surveyId: string, questionId: string, value: string | number) => {
        setAnswers((prev) => ({ ...prev, [surveyId]: { ...prev[surveyId], [questionId]: value } }))
    }

    const handleSubmit = async (survey: IEmployeeSurvey) => {
        const surveyAnswers = answers[survey.id] ?? {}
        const payload = survey.questions
            .filter((q) => surveyAnswers[q.id] !== undefined && surveyAnswers[q.id] !== "")
            .map((q) => ({ questionId: q.id, value: surveyAnswers[q.id] }))

        if (payload.length === 0) return
        setSubmitting(survey.id)
        try {
            await employeeSurveyService.submitResponse(survey.id, payload)
            setSubmitted((prev) => new Set(prev).add(survey.id))
        } catch (err) {
            console.error("[enquetes-employe] submit error:", err)
        } finally {
            setSubmitting(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    if (unavailable || surveys.length === 0) {
        return (
            <div className="space-y-4">
                <PageHeader title="Enquêtes internes" className="mb-0" />
                <Card className="border border-border">
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <ClipboardList className="mx-auto mb-3 h-12 w-12 opacity-30" />
                        <p>{unavailable ? "Cette fonctionnalité est réservée aux comptes rattachés à une entreprise." : "Aucune enquête active pour le moment."}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <PageHeader
                className="mb-0"
                title="Enquêtes internes"
                description="Vos réponses sont anonymes - jamais associées à votre identité par votre entreprise."
            />

            {surveys.map((survey) => {
                const isSubmitted = submitted.has(survey.id)
                return (
                    <Card key={survey.id} className="border border-border">
                        <CardContent className="space-y-4 p-4">
                            <div>
                                <p className="text-sm font-semibold text-foreground">{survey.title}</p>
                                {survey.description && <p className="text-xs text-muted-foreground">{survey.description}</p>}
                            </div>

                            {isSubmitted ? (
                                <p className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" />Réponse envoyée - merci !</p>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {survey.questions.map((q) => (
                                            <div key={q.id}>
                                                <p className="mb-1.5 text-sm text-foreground">{q.question}</p>
                                                {q.type === "RATING" ? (
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((n) => (
                                                            <button key={n} onClick={() => setAnswer(survey.id, q.id, n)}>
                                                                <Star className={cn("h-6 w-6", (answers[survey.id]?.[q.id] as number) >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <Textarea
                                                        value={(answers[survey.id]?.[q.id] as string) ?? ""}
                                                        onChange={(e) => setAnswer(survey.id, q.id, e.target.value)}
                                                        placeholder="Votre réponse..."
                                                        className="min-h-[60px]"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button disabled={submitting === survey.id} onClick={() => handleSubmit(survey)} className="bg-blue-600 hover:bg-blue-700">
                                        {submitting === survey.id ? "Envoi..." : "Envoyer ma réponse"}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
