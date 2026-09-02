"use client"

import type React from "react"
import { useRef, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import type { CVAnalysis } from "@/lib/@types/openai"
import { AlertCircle, ArrowUpFromLine, Check, FileText, Sparkles, Target, X } from "lucide-react"
import { SubscriptionGate } from "@/components/subscription-gate"

const ACCEPTED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
]

const MAX_SIZE = 10 * 1024 * 1024

/** Verdict porté par le score : une couleur, un mot. */
function verdict(score: number) {
    if (score >= 80) return { color: "#1f9d63", label: "Prêt à envoyer" }
    if (score >= 60) return { color: "#c9871f", label: "Bon départ" }
    return { color: "#d9544d", label: "À retravailler" }
}

const formatSize = (bytes: number) =>
    bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} Mo` : `${Math.round(bytes / 1024)} Ko`

/**
 * Anneau de score, même géométrie que celui du créateur de CV pour que les
 * deux pages se lisent comme un seul produit.
 */
function ScoreRing({ score }: { score: number }) {
    const radius = 44
    const circumference = 2 * Math.PI * radius
    const pct = Math.min(Math.max(score, 0), 100)
    const { color } = verdict(pct)

    return (
        <div className="relative h-[132px] w-[132px] shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#dde4f2" strokeWidth="5" />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct / 100)}
                    className="transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[40px] font-semibold leading-none tabular-nums" style={{ color }}>
                    {pct}
                </span>
                <span className="mt-1 text-[11px] text-[#8b93a3] dark:text-muted-foreground">sur 100</span>
            </div>
        </div>
    )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="mb-3 text-[13px] font-semibold text-[#1b2331] dark:text-foreground">{children}</h2>
}

/** Silhouette des résultats pendant l'analyse : on annonce ce qui arrive. */
function ResultsSkeleton() {
    return (
        <div className="mt-8 animate-pulse motion-reduce:animate-none" aria-hidden>
            <div className="rounded-[14px] bg-[#eef2fd] dark:bg-primary/10 p-6">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
                    <div className="h-[132px] w-[132px] shrink-0 rounded-full border-[5px] border-[#dde4f2] dark:border-border" />
                    <div className="w-full space-y-2">
                        <div className="h-4 w-40 rounded bg-[#dde4f2] dark:bg-primary/10" />
                        <div className="h-3 w-full max-w-[380px] rounded bg-[#e4eaf6] dark:bg-primary/10" />
                        <div className="h-3 w-full max-w-[300px] rounded bg-[#e4eaf6] dark:bg-primary/10" />
                    </div>
                </div>
            </div>
            <div className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-3 rounded bg-[#eaeef7] dark:bg-muted" />
                ))}
            </div>
        </div>
    )
}

function AnalyserCVContent() {
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState<CVAnalysis | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const acceptFile = (file: File) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError("Ce format n'est pas lisible. Choisis un PDF, un document Word ou une image.")
            return
        }
        if (file.size > MAX_SIZE) {
            setError(`Ce fichier pèse ${formatSize(file.size)}. La limite est de 10 Mo.`)
            return
        }
        setCvFile(file)
        setError(null)
        setAnalysis(null)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) acceptFile(file)
        // Permet de resélectionner le même fichier après un retrait.
        e.target.value = ""
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) acceptFile(file)
    }

    const clearFile = () => {
        setCvFile(null)
        setAnalysis(null)
        setError(null)
    }

    const handleAnalyze = async () => {
        if (!cvFile) return

        setIsAnalyzing(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("file", cvFile)

            const response = await fetch("/api/analyse-cv", { method: "POST", body: formData })
            const payload = (await response.json()) as { analysis?: CVAnalysis; error?: string }
            if (!response.ok || !payload.analysis) {
                throw new Error(payload.error || "L'analyse n'a pas abouti. Réessaie dans un instant.")
            }
            setAnalysis(payload.analysis)
        } catch (err) {
            setError(err instanceof Error ? err.message : "L'analyse n'a pas abouti. Réessaie dans un instant.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const v = analysis ? verdict(analysis.score) : null

    return (
        <div className="min-h-[calc(100vh-80px)]">
            <div className="border-b border-[#d9dfea] dark:border-border px-4 py-4 sm:px-6">
                <h1 className="text-2xl sm:text-[32px] font-semibold leading-none text-[#1b2331] dark:text-foreground">Analyse ton CV</h1>
            </div>

            <div className="mx-auto w-full max-w-[840px] px-4 py-8 sm:px-6 sm:py-10">
                <p className="max-w-[52ch] text-[14px] leading-relaxed text-[#7b8496] dark:text-muted-foreground">
                    Dépose ton CV, Goriya le note et te dit précisément quoi corriger.
                </p>

                {/* ── Dépôt ─────────────────────────────────────────────────── */}
                <div className="mt-6">
                    {cvFile ? (
                        <div className="flex items-center gap-3 rounded-[12px] border border-[#dfe5f1] dark:border-border bg-white dark:bg-card px-4 py-3">
                            <FileText className="h-5 w-5 shrink-0 text-[#2f6de6] dark:text-primary" strokeWidth={1.8} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-[#1b2331] dark:text-foreground">{cvFile.name}</p>
                                <p className="text-[11px] text-[#8b93a3] dark:text-muted-foreground">{formatSize(cvFile.size)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={clearFile}
                                aria-label="Retirer le fichier"
                                className="rounded-full p-1 text-[#aab2c2] dark:text-muted-foreground transition-colors hover:bg-[#f1f3f8] dark:hover:bg-muted hover:text-[#d9544d]"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div
                            onDragOver={(e) => {
                                e.preventDefault()
                                setIsDragging(true)
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`rounded-[14px] border-2 border-dashed px-6 py-12 text-center transition-colors ${
                                isDragging ? "border-[#2f6de6] bg-[#eef2fd] dark:bg-primary/10" : "border-[#dbe2ef] dark:border-border bg-white dark:bg-card"
                            }`}
                        >
                            <ArrowUpFromLine
                                className={`mx-auto mb-4 h-8 w-8 transition-colors ${isDragging ? "text-[#2f6de6] dark:text-primary" : "text-[#b6bfd2] dark:text-muted-foreground"}`}
                                strokeWidth={1.6}
                            />
                            <p className="text-[15px] font-medium text-[#1b2331] dark:text-foreground">Dépose ton CV ici</p>
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="mt-1 text-[13px] text-[#2f6de6] dark:text-primary underline-offset-2 hover:underline"
                            >
                                ou choisis un fichier
                            </button>
                            <p className="mt-5 text-[11px] text-[#9aa3b5] dark:text-muted-foreground">PDF, Word ou image. 10 Mo maximum.</p>
                        </div>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpeg,.jpg,.webp"
                        onChange={handleInputChange}
                        className="hidden"
                    />
                </div>

                {error && (
                    <p
                        role="alert"
                        className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-[#d9544d]"
                    >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {error}
                    </p>
                )}

                {cvFile && !analysis && (
                    <div className="mt-6">
                        <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="h-11 w-full rounded-full bg-[#2f6de6] text-[14px] font-medium hover:bg-[#2157d3] sm:w-auto sm:px-8"
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {isAnalyzing ? "Goriya lit ton CV…" : "Analyser mon CV"}
                        </Button>
                    </div>
                )}

                <div aria-live="polite" className="sr-only">
                    {isAnalyzing ? "Analyse en cours" : analysis ? "Analyse terminée" : ""}
                </div>

                {isAnalyzing && !analysis && <ResultsSkeleton />}

                {/* ── Résultats ─────────────────────────────────────────────── */}
                {analysis && v && (
                    <div className="mt-8">
                        {/* Seule surface de la page : le verdict. */}
                        <div className="rounded-[14px] bg-[#eef2fd] dark:bg-primary/10 p-6">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-7 sm:text-left">
                                <ScoreRing score={analysis.score} />
                                <div>
                                    <p className="text-[18px] font-semibold" style={{ color: v.color }}>
                                        {v.label}
                                    </p>
                                    <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-[#5b6474] dark:text-muted-foreground">
                                        {analysis.summary}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {analysis.strengths.length > 0 || analysis.weaknesses.length > 0 ? (
                            <div className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                                {analysis.strengths.length > 0 && (
                                    <section>
                                        <SectionTitle>Points forts</SectionTitle>
                                        <ul className="space-y-2.5">
                                            {analysis.strengths.map((s, i) => (
                                                <li
                                                    key={i}
                                                    className="border-l-2 border-[#1f9d63] pl-3 text-[13px] leading-relaxed text-[#5b6474] dark:text-muted-foreground"
                                                >
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {analysis.weaknesses.length > 0 && (
                                    <section>
                                        <SectionTitle>À améliorer</SectionTitle>
                                        <ul className="space-y-2.5">
                                            {analysis.weaknesses.map((w, i) => (
                                                <li
                                                    key={i}
                                                    className="border-l-2 border-[#d9544d] pl-3 text-[13px] leading-relaxed text-[#5b6474] dark:text-muted-foreground"
                                                >
                                                    {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>
                        ) : null}

                        {analysis.suggestions.length > 0 && (
                            <section className="mt-9 border-t border-[#eef1f7] dark:border-border pt-7">
                                <SectionTitle>Ce que tu peux corriger</SectionTitle>
                                <ul className="divide-y divide-[#eef1f7]">
                                    {analysis.suggestions.map((s, i) => (
                                        <li key={i} className="flex gap-3 py-3">
                                            <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#2f6de6] dark:text-primary" strokeWidth={1.8} />
                                            <span className="text-[13px] leading-relaxed text-[#5b6474] dark:text-muted-foreground">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {analysis.keywords.length > 0 && (
                            <section className="mt-9 border-t border-[#eef1f7] dark:border-border pt-7">
                                <SectionTitle>Mots-clés repérés</SectionTitle>
                                <ul className="flex flex-wrap gap-2">
                                    {analysis.keywords.map((k, i) => (
                                        <li
                                            key={i}
                                            className="rounded-full border border-[#dfe5f1] dark:border-border px-3 py-1 text-[12px] text-[#5b6474] dark:text-muted-foreground"
                                        >
                                            {k}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <div className="mt-10 flex flex-col gap-3 border-t border-[#eef1f7] dark:border-border pt-7 sm:flex-row">
                            <Button
                                asChild
                                className="h-11 rounded-full bg-[#2f6de6] text-[14px] font-medium hover:bg-[#2157d3] sm:px-7"
                            >
                                <Link href="/creer-cv">
                                    <Check className="mr-2 h-4 w-4" />
                                    Créer un CV avec Goriya
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={clearFile}
                                className="h-11 rounded-full text-[14px] text-[#5b6474] dark:text-muted-foreground hover:bg-[#f1f3f8] dark:hover:bg-muted sm:px-7"
                            >
                                Analyser un autre CV
                            </Button>
                        </div>
                    </div>
                )}
            </div>
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
