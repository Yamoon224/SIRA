"use client"

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, RotateCcw, X, Camera, Mic, MessageSquare, Video, Send, Clock, ChevronRight, Settings2, Loader2 } from "lucide-react"
import { SubscriptionGate } from "@/components/subscription-gate"
import { interviewService } from "@/lib/api/interview.service"
import { PageHeader } from "@/components/layout/page-header"
import { cn } from "@/lib/utils"

type InterviewMode = "chat" | "video"
type Niveau = "debutant" | "intermediaire" | "avance"

interface Message {
    id: string
    content: string
    sender: "user" | "goriya"
    timestamp: string
}

/** Configuration choisie sur /simulation-entretien-config, transmise dans l'URL. */
interface InterviewConfig {
    mode: InterviewMode
    poste: string
    entreprise: string
    niveau: Niveau | ""
    /** En minutes. */
    duree: number
}

const QUESTIONS_PAR_NIVEAU: Record<Niveau, string[]> = {
    debutant: ["Qu'as-tu appris pendant ta formation ou tes stages qui te servira dans ce poste ?"],
    intermediaire: ["Comment organises-tu ton travail quand plusieurs priorités urgentes se chevauchent ?"],
    avance: [
        "Raconte une décision importante que tu as dû défendre face à ton équipe ou ta hiérarchie.",
        "Comment accompagnes-tu la montée en compétences de collègues moins expérimentés ?",
    ],
}

const heure = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

function useInterviewConfig(): InterviewConfig {
    const searchParams = useSearchParams()

    return useMemo(() => {
        const niveau = searchParams.get("niveau")
        const duree = Number(searchParams.get("duree"))
        return {
            mode: searchParams.get("mode") === "video" ? "video" : "chat",
            poste: searchParams.get("poste")?.trim() ?? "",
            entreprise: searchParams.get("entreprise")?.trim() ?? "",
            niveau: niveau === "debutant" || niveau === "intermediaire" || niveau === "avance" ? niveau : "",
            duree: Number.isFinite(duree) && duree > 0 ? Math.min(duree, 60) : 10,
        }
    }, [searchParams])
}

/** Analyse de fin d'entretien renvoyée par /api/simulation-entretien. */
interface Feedback {
    score: number
    summary: string
    strengths: string[]
    improvements: string[]
    recommendations: string[]
}

/** Tour « candidat » envoyé à l'IA en mode vidéo, où la réponse n'est pas transcrite. */
const REPONSE_ORALE = "(Réponse donnée à l'oral, non transcrite.)"

/**
 * Questions de secours, utilisées seulement si l'IA est injoignable : en temps
 * normal chaque question est générée à partir des réponses du candidat (voir
 * /api/simulation-entretien).
 */
function buildQuestions({ poste, niveau, duree }: InterviewConfig): string[] {
    const communes = [
        poste ? `Qu'est-ce qui t'attire dans le poste de ${poste} ?` : "Qu'est-ce qui t'attire dans ce poste ?",
        "Parle-moi d'un projet dont tu es particulièrement fier. Quel y était ton rôle ?",
        "Décris une situation difficile au travail et la manière dont tu l'as gérée.",
        "Quelles sont tes principales forces pour ce poste ? Et un point que tu cherches à améliorer ?",
        "Où te vois-tu dans trois ans ?",
        "As-tu des questions à me poser sur l'entreprise ou sur l'équipe ?",
    ]
    const toutes = [...communes.slice(0, 2), ...(niveau ? QUESTIONS_PAR_NIVEAU[niveau] : []), ...communes.slice(2)]
    const nombre = Math.max(3, Math.min(toutes.length, Math.round(duree / 2.5)))

    return nombre >= toutes.length ? toutes : [...toutes.slice(0, nombre - 1), toutes[toutes.length - 1]]
}

function welcomeMessage({ poste, entreprise }: InterviewConfig): string {
    const cadre = [poste && `pour le poste de ${poste}`, entreprise && `chez ${entreprise}`].filter(Boolean).join(" ")
    return `Bonjour, je suis Goriya et je vais mener ton entretien${cadre ? ` ${cadre}` : ""}. Pour commencer, présente-toi en quelques phrases.`
}

const CLOSING_MESSAGE =
    "Merci, l'entretien est terminé. Clique sur « Voir le Feedback » pour découvrir l'analyse de ta performance."

function formatRemaining(seconds: number): string {
    const s = Math.max(0, seconds)
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

function VideoInterviewBox({ question, progress, onNext, finished, thinking }: { question: string; progress: number; onNext: () => void; finished: boolean; thinking: boolean }) {
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraError, setCameraError] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (!cameraActive) return
        let active: MediaStream | null = null
        setCameraError(false)
        navigator.mediaDevices
            ?.getUserMedia({ video: true, audio: false })
            .then((mediaStream) => {
                active = mediaStream
                setStream(mediaStream)
                if (videoRef.current) videoRef.current.srcObject = mediaStream
            })
            .catch(() => {
                setCameraError(true)
                setCameraActive(false)
            })
        return () => {
            active?.getTracks().forEach((track) => track.stop())
            setStream(null)
        }
    }, [cameraActive])

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="rounded-2xl border border-[#e8edf6] dark:border-border bg-white dark:bg-card p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Goriya demande</p>
                {thinking ? (
                    <p className="flex items-center gap-2 text-[15px] text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Goriya prépare la question suivante…
                    </p>
                ) : (
                    <p className="text-[15px] font-medium text-foreground">{question}</p>
                )}
            </div>

            <div className="relative flex h-[380px] sm:h-[420px] w-full items-center justify-center rounded-2xl border border-[#e8edf6] dark:border-border bg-white dark:bg-card">
                {cameraActive && stream ? (
                    <video ref={videoRef} autoPlay playsInline muted className="h-full w-full rounded-2xl object-cover" />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center">
                        <Camera className="mb-2 h-10 w-10 text-[#7f8796] dark:text-muted-foreground" />
                        <span className="text-[15px] text-[#7f8796] dark:text-muted-foreground">
                            {cameraError ? "Caméra inaccessible : autorise son accès dans ton navigateur." : "Caméra désactivée"}
                        </span>
                    </div>
                )}
                <div className="absolute bottom-6 left-4 w-1/2 sm:w-1/3">
                    <div className="relative flex h-5 items-center rounded-full bg-[#e8edf6] dark:bg-muted">
                        <div className="my-1 ml-1 h-3 rounded-full bg-brand-gradient transition-all" style={{ width: `calc(${progress}% - 0.5rem)` }} />
                        <span className="absolute left-2 text-xs font-medium text-[#1b2331] dark:text-foreground">Progression : {progress}%</span>
                    </div>
                </div>
                <div className="absolute bottom-6 right-4 flex gap-2">
                    <button
                        className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8edf6] dark:border-border bg-white dark:bg-card hover:bg-[#f4f5f7] dark:hover:bg-muted",
                            cameraActive ? "text-[#2f6de6] dark:text-primary" : "text-[#7f8796] dark:text-muted-foreground",
                        )}
                        onClick={() => setCameraActive((v) => !v)}
                        type="button"
                        aria-label={cameraActive ? "Couper la caméra" : "Activer la caméra"}
                        aria-pressed={cameraActive}
                    >
                        <Camera className="h-5 w-5" />
                    </button>
                    <button
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8edf6] dark:border-border bg-white dark:bg-card text-[#7f8796] dark:text-muted-foreground"
                        type="button"
                        aria-label="Micro (bientôt disponible)"
                        disabled
                    >
                        <Mic className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={onNext} disabled={finished || thinking} className="gap-1.5 rounded-full bg-brand-gradient text-white hover:bg-brand-gradient-hover">
                    {finished ? "Entretien terminé" : "Question suivante"}
                    {!finished && <ChevronRight className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}

function ChatInterviewBox({
    messages,
    typing,
    disabled,
    onSend,
}: {
    messages: Message[]
    typing: boolean
    disabled: boolean
    onSend: (content: string) => void
}) {
    const [draft, setDraft] = useState("")
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, [messages, typing])

    const send = () => {
        if (!draft.trim() || disabled) return
        onSend(draft.trim())
        setDraft("")
    }

    return (
        <div className="flex h-[560px] w-full flex-col overflow-hidden rounded-2xl border border-[#e8edf6] dark:border-border bg-white dark:bg-card">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((message) => (
                    <div key={message.id} className={cn("flex items-end gap-2", message.sender === "user" ? "justify-end" : "justify-start")}>
                        {message.sender === "goriya" && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">G</div>
                        )}
                        <div
                            className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                                message.sender === "user"
                                    ? "rounded-br-sm bg-[#2f6de6] text-white"
                                    : "rounded-bl-sm bg-[#f4f6fb] dark:bg-muted text-foreground",
                            )}
                        >
                            <p className="whitespace-pre-line">{message.content}</p>
                            <p className={cn("mt-1 text-[10px]", message.sender === "user" ? "text-white/70" : "text-muted-foreground")}>{message.timestamp}</p>
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">G</div>
                        Goriya écrit…
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <div className="flex items-end gap-2 border-t border-[#e8edf6] dark:border-border p-3">
                <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            send()
                        }
                    }}
                    disabled={disabled}
                    placeholder={disabled ? "L'entretien est terminé." : "Écris ta réponse… (Entrée pour envoyer, Maj+Entrée pour aller à la ligne)"}
                    className="min-h-[44px] resize-none"
                    rows={2}
                />
                <Button onClick={send} disabled={disabled || !draft.trim()} size="icon" className="h-11 w-11 shrink-0 rounded-full bg-brand-gradient text-white hover:bg-brand-gradient-hover" aria-label="Envoyer">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

function SimulationEntretienContent() {
    const router = useRouter()
    const config = useInterviewConfig()
    const secours = useMemo(() => buildQuestions(config), [config])

    const initialMessages = useCallback(
        (): Message[] => [{ id: "accueil", content: welcomeMessage(config), sender: "goriya", timestamp: heure() }],
        [config],
    )

    const [messages, setMessages] = useState<Message[]>(initialMessages)
    /** Nombre de réponses données par le candidat. */
    const [step, setStep] = useState(0)
    const [typing, setTyping] = useState(false)
    const [remaining, setRemaining] = useState(config.duree * 60)
    const [showFeedback, setShowFeedback] = useState(false)
    const [feedback, setFeedback] = useState<Feedback | null>(null)
    const [feedbackLoading, setFeedbackLoading] = useState(false)
    const [feedbackError, setFeedbackError] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    /** Incrémenté à chaque fin/redémarrage : une réponse IA en retard est alors ignorée. */
    const runId = useRef(0)
    /** Incrémenté au redémarrage seulement : écarte un feedback de la simulation précédente. */
    const restarts = useRef(0)
    const remainingRef = useRef(remaining)
    remainingRef.current = remaining
    /** Nombre de messages couverts par le feedback affiché (évite de le recalculer). */
    const feedbackFor = useRef(0)
    const timeUpNotified = useRef(false)

    const finished = remaining <= 0

    const startSession = useCallback(() => {
        interviewService
            .startSession({ position: config.poste || "Simulation générale" })
            .then((res) => {
                const session = (res as any)?.data ?? res
                if (session?.id) setSessionId(session.id)
            })
            .catch(() => {})
    }, [config.poste])

    useEffect(() => {
        startSession()
    }, [startSession])

    // Compte à rebours : il s'arrête dès que l'entretien est terminé.
    useEffect(() => {
        if (finished) return
        const timer = setInterval(() => setRemaining((s) => s - 1), 1000)
        return () => clearInterval(timer)
    }, [finished])

    useEffect(() => {
        if (!finished || timeUpNotified.current) return
        timeUpNotified.current = true
        runId.current += 1
        setTyping(false)
        setMessages((prev) => [
            ...prev,
            { id: `fin-${Date.now()}`, content: `Le temps imparti est écoulé. ${CLOSING_MESSAGE}`, sender: "goriya", timestamp: heure() },
        ])
    }, [finished])

    const versApi = (historique: Message[]) =>
        historique.map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content }))

    /**
     * Demande à l'IA le prochain message du recruteur à partir de tout
     * l'échange : relance sur la dernière réponse, ou nouveau thème plus pointu.
     */
    const demanderQuestion = async (historique: Message[], reponses: number) => {
        const run = runId.current
        setTyping(true)
        let contenu: string
        try {
            const res = await fetch("/api/simulation-entretien", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "question", config, messages: versApi(historique), remaining: remainingRef.current }),
            })
            const payload = (await res.json()) as { question?: string }
            if (!res.ok || !payload.question) throw new Error("question indisponible")
            contenu = payload.question
        } catch {
            contenu = secours[(reponses - 1) % secours.length]
        }
        if (run !== runId.current) return
        setTyping(false)
        setMessages((prev) => [...prev, { id: `g-${Date.now()}`, content: contenu, sender: "goriya", timestamp: heure() }])
    }

    const repondre = (content: string) => {
        if (finished || typing) return
        const historique: Message[] = [...messages, { id: `u-${Date.now()}`, content, sender: "user", timestamp: heure() }]
        setMessages(historique)
        setStep(step + 1)
        void demanderQuestion(historique, step + 1)
    }

    const handleSendMessage = repondre
    const handleNextQuestion = () => repondre(REPONSE_ORALE)

    const videoQuestion = [...messages].reverse().find((m) => m.sender === "goriya")?.content ?? ""
    const progress = Math.min(100, Math.max(0, Math.round(((config.duree * 60 - remaining) / (config.duree * 60)) * 100)))
    const elapsedMinutes = Math.max(1, Math.round((config.duree * 60 - Math.max(0, remaining)) / 60))
    /** Réponses écrites : les seules que le feedback peut analyser. */
    const reponsesEcrites = messages.filter((m) => m.sender === "user" && m.content !== REPONSE_ORALE).length

    const handleShowFeedback = async () => {
        setShowFeedback(true)
        if (reponsesEcrites === 0 || feedbackLoading || feedbackFor.current === messages.length) return

        const run = restarts.current
        setFeedbackLoading(true)
        setFeedbackError(false)
        try {
            const res = await fetch("/api/simulation-entretien", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "feedback", config, messages: versApi(messages) }),
            })
            const payload = (await res.json()) as { feedback?: Feedback }
            if (!res.ok || !payload.feedback) throw new Error("feedback indisponible")
            if (run !== restarts.current) return
            setFeedback(payload.feedback)
            feedbackFor.current = messages.length
            // Trace côté compte (historique, backoffice) : sans incidence sur l'affichage.
            if (sessionId) {
                interviewService
                    .updateSession(sessionId, {
                        score: payload.feedback.score,
                        feedback: payload.feedback.summary,
                        duration: elapsedMinutes,
                        status: "COMPLETED",
                    })
                    .catch(() => {})
            }
        } catch {
            setFeedbackError(true)
        } finally {
            setFeedbackLoading(false)
        }
    }

    const handleRestart = () => {
        if (sessionId) {
            interviewService.deleteSession(sessionId).catch(() => {})
        }
        runId.current += 1
        restarts.current += 1
        timeUpNotified.current = false
        feedbackFor.current = 0
        setMessages(initialMessages())
        setStep(0)
        setTyping(false)
        setRemaining(config.duree * 60)
        setFeedback(null)
        setFeedbackError(false)
        setShowFeedback(false)
        startSession()
    }

    const ModeIcon = config.mode === "video" ? Video : MessageSquare

    return (
        <div className="p-0 sm:p-2">
            {/* Titre seul dans l'en-tête : sur une ligne, souligné par le filet.
                Les indicateurs passent dessous, sinon ils repoussaient le titre sur
                plusieurs lignes. */}
            <PageHeader
                title={<span className="sm:whitespace-nowrap">Simulation d'Entretien avec Goriya</span>}
                description={[config.poste, config.entreprise].filter(Boolean).join(" · ") || undefined}
            />

            <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground">
                    <ModeIcon className="h-3.5 w-3.5" />
                    {config.mode === "video" ? "Appel vidéo" : "Chat en direct"}
                </span>
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium tabular-nums",
                        remaining <= 60 && !finished ? "border-red-300 text-red-600" : "border-border text-foreground",
                    )}
                    aria-label="Temps restant"
                >
                    <Clock className="h-3.5 w-3.5" />
                    {formatRemaining(remaining)}
                </span>
                <Button variant="ghost" size="sm" onClick={() => router.push("/simulation-entretien-config")} className="gap-1.5">
                    <Settings2 className="h-4 w-4" />
                    Configurer
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-white dark:bg-card text-[#1b2331] dark:text-foreground border-[#d8deeb] dark:border-border hover:bg-[#f4f5f7] dark:hover:bg-muted" onClick={handleRestart}>
                    <RotateCcw className="w-4 h-4" />
                    Recommencer
                </Button>
                <Button className="flex items-center gap-2 bg-brand-gradient hover:bg-brand-gradient-hover text-white" onClick={handleShowFeedback}>
                    <Star className="w-4 h-4" />
                    Voir le Feedback
                </Button>
            </div>

            <div className="mx-auto flex max-w-3xl justify-center">
                {config.mode === "video" ? (
                    <VideoInterviewBox question={videoQuestion} progress={progress} onNext={handleNextQuestion} finished={finished} thinking={typing} />
                ) : (
                    <ChatInterviewBox messages={messages} typing={typing} disabled={finished || typing} onSend={handleSendMessage} />
                )}
            </div>

            {showFeedback && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-0 relative">
                        <button
                            onClick={() => setShowFeedback(false)}
                            className="absolute top-4 right-4 p-1 hover:bg-white dark:hover:bg-card border border-transparent hover:border-blue-500 rounded-full"
                            aria-label="Fermer"
                        >
                            <X className="w-6 h-6 text-[#7f8796] dark:text-muted-foreground" />
                        </button>
                        <div className="px-8 pt-8 pb-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-14 h-14 bg-brand-gradient rounded-full flex items-center justify-center mb-2">
                                    <span className="text-white text-2xl font-bold">g</span>
                                </div>
                                <h2 className="text-lg font-bold text-[#1b2331] dark:text-foreground mb-1">Feedback de ton entretien</h2>
                                <p className="text-[13px] text-[#7f8796] dark:text-muted-foreground text-center">Analyse de ta performance et conseils d'amélioration</p>
                            </div>
                            {reponsesEcrites === 0 ? (
                                <p className="mb-6 rounded-xl bg-[#f4f6fb] dark:bg-muted p-4 text-center text-[13px] text-[#5b6474] dark:text-muted-foreground">
                                    {config.mode === "video"
                                        ? "Les réponses orales ne sont pas encore analysées : fais la simulation en mode Chat pour obtenir un feedback détaillé."
                                        : "Réponds à au moins une question pour obtenir l'analyse de ton entretien."}
                                </p>
                            ) : feedbackLoading ? (
                                <p className="mb-6 flex items-center justify-center gap-2 py-8 text-[13px] text-[#7f8796] dark:text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Goriya analyse tes réponses…
                                </p>
                            ) : feedbackError || !feedback ? (
                                <div className="mb-6 text-center">
                                    <p className="mb-3 text-[13px] text-[#d9544d]">L&apos;analyse n&apos;a pas abouti.</p>
                                    <Button variant="outline" size="sm" onClick={handleShowFeedback}>Réessayer</Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center gap-4 mb-4">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[22px] font-bold text-[#2f6de6] dark:text-primary">{feedback.score}%</span>
                                            <span className="text-[12px] text-[#7f8796] dark:text-muted-foreground">Score global</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[22px] font-bold text-[#7c4dff] dark:text-primary">{reponsesEcrites}</span>
                                            <span className="text-[12px] text-[#7f8796] dark:text-muted-foreground">Réponses données</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[22px] font-bold text-[#a259e6]">{elapsedMinutes}min</span>
                                            <span className="text-[12px] text-[#7f8796] dark:text-muted-foreground">Durée totale</span>
                                        </div>
                                    </div>
                                    {feedback.summary && (
                                        <p className="mb-6 text-center text-[13px] leading-relaxed text-[#5b6474] dark:text-muted-foreground">{feedback.summary}</p>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="rounded-2xl border border-[#e8edf6] dark:border-border p-4">
                                            <div className="font-semibold text-[#2ecc71] mb-2 text-[14px]">Points forts</div>
                                            <ul className="text-[13px] text-[#1b2331] dark:text-foreground space-y-1.5">
                                                {feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}
                                            </ul>
                                        </div>
                                        <div className="rounded-2xl border border-[#e8edf6] dark:border-border p-4">
                                            <div className="font-semibold text-[#ff9800] mb-2 text-[14px]">Points d&apos;amélioration</div>
                                            <ul className="text-[13px] text-[#1b2331] dark:text-foreground space-y-1.5">
                                                {feedback.improvements.map((item, i) => <li key={i}>{item}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                    {feedback.recommendations.length > 0 && (
                                        <div className="rounded-xl bg-[#2f2e41] text-white p-4 mb-6">
                                            <div className="font-semibold mb-2">Recommandations</div>
                                            <ul className="text-[13px] list-disc pl-5 space-y-1">
                                                {feedback.recommendations.map((item, i) => <li key={i}>{item}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}
                            <Button
                                onClick={handleRestart}
                                className="w-full h-10 rounded-full bg-brand-gradient hover:bg-brand-gradient-hover text-white text-[15px] font-semibold"
                            >
                                Nouvelle simulation
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Page() {
    return (
        <SubscriptionGate featureLabel="la simulation d'entretien IA" feature="Simulation d'entretien">
            {/* useSearchParams exige une frontière Suspense au prérendu. */}
            <Suspense fallback={null}>
                <SimulationEntretienContent />
            </Suspense>
        </SubscriptionGate>
    )
}
