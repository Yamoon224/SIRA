"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import type { CVAnalysis } from "@/lib/@types/openai"
import { analysisErrorMessage, CV_ACCEPT, cvFileError } from "@/lib/cv-file"
import { AlertCircle, Check, FileText, Sparkles, Target, UploadCloud, X } from "lucide-react"
import { SubscriptionGate } from "@/components/subscription-gate"
import { QuotaExceededNotice } from "@/components/feature-usage/quota-exceeded-notice"
import { GoriyaLogoLoader } from "@/components/goriya-loader"

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

/** Occupe la zone des résultats pendant l'analyse : le logo se remplit en boucle. */
function AnalyzingPanel() {
    return (
        <div className="mt-8 flex flex-col items-center justify-center gap-5 rounded-[14px] bg-[#eef2fd] dark:bg-primary/10 px-6 py-16 text-center">
            <GoriyaLogoLoader width={100} />
            <p className="text-[13px] text-[#5b6474] dark:text-muted-foreground">Goriya analyse votre CV…</p>
        </div>
    )
}

function AnalyserCVContent() {
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState<CVAnalysis | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [quotaLimit, setQuotaLimit] = useState<number | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    /** CV choisi dans « Mes CV » (`?cv=<id>&nom=<nom>`) : analysé sans nouveau dépôt. */
    const [libraryCv, setLibraryCv] = useState<{ id: string; name: string } | null>(null)

    const acceptFile = (file: File) => {
        const fileError = cvFileError(file)
        if (fileError) {
            setError(fileError)
            return
        }
        setCvFile(file)
        setLibraryCv(null)
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
        setLibraryCv(null)
        setAnalysis(null)
        setError(null)
    }

    const handleAnalyze = async (fromLibrary: { id: string; name: string } | null = libraryCv) => {
        if (!cvFile && !fromLibrary) return

        setIsAnalyzing(true)
        setError(null)
        setQuotaLimit(null)

        try {
            const formData = new FormData()
            if (fromLibrary) formData.append("resumeId", fromLibrary.id)
            else if (cvFile) formData.append("file", cvFile)

            const response = await fetch("/api/analyse-cv", { method: "POST", body: formData })
            const payload = (await response.json()) as {
                analysis?: CVAnalysis
                error?: string
                requiresReset?: boolean
                limit?: number
            }
            if (!response.ok || !payload.analysis) {
                if (payload.requiresReset) {
                    setQuotaLimit(payload.limit ?? 0)
                }
                throw new Error(payload.error || "L'analyse n'a pas abouti. Réessaie dans un instant.")
            }
            setAnalysis(payload.analysis)
        } catch (err) {
            setError(analysisErrorMessage(err))
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Arrivée depuis le bouton « Faire analyser » de « Mes CV » : l'analyse part
    // tout de suite. `window.location` plutôt que useSearchParams, qui imposerait
    // une frontière Suspense à toute la page.
    const startedFromLibrary = useRef(false)
    useEffect(() => {
        if (startedFromLibrary.current) return
        startedFromLibrary.current = true

        const params = new URLSearchParams(window.location.search)
        const id = params.get("cv")
        if (!id) return

        const cv = { id, name: params.get("nom") || "CV de ta bibliothèque" }
        setLibraryCv(cv)
        void handleAnalyze(cv)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const v = analysis ? verdict(analysis.score) : null
    const hasCv = Boolean(cvFile || libraryCv)

    return (
        <div className="min-h-[calc(100vh-80px)]">
            <div className="border-b border-[#d9dfea] dark:border-border px-4 py-4 sm:px-6">
                <h1 className="text-2xl sm:text-[32px] font-semibold leading-none text-[#1b2331] dark:text-foreground">Analyse ton CV</h1>
            </div>

            <div className="mx-auto w-full max-w-[840px] px-4 py-8 sm:px-6 sm:py-10">
                {/* ── Dépôt : reprend la présentation du modal « Soumettez
                    votre CV » - libellé, cadre pointillé, actions à droite. ── */}
                <div className="mt-4 rounded-[14px] border border-[#dfe5f1] dark:border-border bg-white dark:bg-card p-5 sm:p-6">
                    <p className="mb-3 text-[13px] text-[#5b6474] dark:text-muted-foreground">Importer votre CV</p>

                    <div
                        onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`rounded-[10px] border border-dashed px-6 py-10 text-center transition-colors ${
                            isDragging
                                ? "border-[#2f6de6] bg-[#eef2fd] dark:bg-primary/10"
                                : "border-[#c8d0e0] dark:border-border bg-[#fbfcfe] dark:bg-background"
                        }`}
                    >
                        {hasCv ? (
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="h-5 w-5 shrink-0 text-[#2f6de6] dark:text-primary" strokeWidth={1.8} />
                                <div className="min-w-0 text-left">
                                    <p className="truncate text-[13px] font-medium text-[#1b2331] dark:text-foreground">{cvFile?.name ?? libraryCv?.name}</p>
                                    <p className="text-[11px] text-[#8b93a3] dark:text-muted-foreground">
                                        {cvFile ? formatSize(cvFile.size) : "Depuis « Mes CV »"}
                                    </p>
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
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="mx-auto block w-full"
                            >
                                <UploadCloud
                                    className={`mx-auto mb-4 h-10 w-10 transition-colors ${
                                        isDragging ? "text-[#2f6de6] dark:text-primary" : "text-[#b6bfd2] dark:text-muted-foreground"
                                    }`}
                                    strokeWidth={1.5}
                                />
                                <p className="text-[13px] text-[#5b6474] dark:text-muted-foreground">
                                    Téléchargez votre CV ou faites glisser-déposer le fichier ici
                                </p>
                                <p className="mt-1.5 text-[12px] text-[#9aa3b5] dark:text-muted-foreground">
                                    PDF ou Word (.docx), 4 Mo maximum
                                </p>
                            </button>
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        type="file"
                        accept={CV_ACCEPT}
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    {error && quotaLimit === null && (
                        <p role="alert" className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-[#d9544d]">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            {error}
                        </p>
                    )}

                    {quotaLimit !== null && (
                        <div className="mt-4">
                            <QuotaExceededNotice featureKey="cv_analysis" limit={quotaLimit} featureLabel="analyses de CV" />
                        </div>
                    )}

                    <div className="mt-5 flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={clearFile}
                            disabled={!hasCv || isAnalyzing}
                            className="h-10 px-6 text-[13px] text-[#5b6474] dark:text-muted-foreground hover:bg-[#f1f3f8] dark:hover:bg-muted"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={() => handleAnalyze()}
                            disabled={!hasCv || isAnalyzing}
                            className="h-10 bg-brand-gradient px-6 text-[13px] font-medium hover:bg-brand-gradient-hover"
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {isAnalyzing ? "Goriya lit votre CV…" : "Analyser mon CV"}
                        </Button>
                    </div>
                </div>

                <div aria-live="polite" className="sr-only">
                    {isAnalyzing ? "Analyse en cours" : analysis ? "Analyse terminée" : ""}
                </div>

                {isAnalyzing && !analysis && <AnalyzingPanel />}

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

                        {(analysis.strengths.length > 0 || analysis.weaknesses.length > 0 || analysis.suggestions.length > 0) && (
                            <div className="mt-9 space-y-5">
                                {(analysis.strengths.length > 0 || analysis.weaknesses.length > 0) && (
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {analysis.strengths.length > 0 && (
                                            <section className="rounded-[14px] border border-[#dfe5f1] dark:border-border bg-white dark:bg-card p-5">
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
                                            <section className="rounded-[14px] border border-[#dfe5f1] dark:border-border bg-white dark:bg-card p-5">
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
                                )}

                                {analysis.suggestions.length > 0 && (
                                    <section className="rounded-[14px] border border-[#dfe5f1] dark:border-border bg-white dark:bg-card p-5">
                                        <SectionTitle>Ce que tu peux corriger</SectionTitle>
                                        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                                            {analysis.suggestions.map((s, i) => (
                                                <li key={i} className="flex gap-2.5">
                                                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#2f6de6] dark:text-primary" strokeWidth={1.8} />
                                                    <span className="text-[13px] leading-relaxed text-[#5b6474] dark:text-muted-foreground">{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>
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
                                className="h-11 rounded-full bg-brand-gradient text-[14px] font-medium hover:bg-brand-gradient-hover sm:px-7"
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
