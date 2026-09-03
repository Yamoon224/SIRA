"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, RotateCcw, X, Camera, Mic } from "lucide-react"
import { SubscriptionGate } from "@/components/subscription-gate"
import { interviewService } from "@/lib/api/interview.service"
import { PageHeader } from "@/components/layout/page-header"

interface Message {
    id: string
    content: string
    sender: "user" | "goriya"
    timestamp: string
}

const INITIAL_MESSAGES: Message[] = [
    {
        id: "1",
        content: "Bonjour, je suis très intéressé par le poste de Développeur Full-Stack Senior. J'ai 5 ans d'expérience en React et Node.js.",
        sender: "goriya",
        timestamp: "10:30",
    },
    {
        id: "2",
        content: "Bonjour, merci pour ta candidature. Ton profil nous intéresse beaucoup. Peux-tu me parler de ton expérience avec React?",
        sender: "user",
        timestamp: "10:32",
    },
    {
        id: "3",
        content: "Bien sûr ! J'ai utilisé React dans plusieurs projets, notamment pour une application de e-commerce où j'ai géré toute la partie front-end...",
        sender: "user",
        timestamp: "10:33",
    },
    {
        id: "4",
        content: "Merci pour ton retour, je suis très intéressé par cette opportunité. Je suis disponible mercredi après-midi ou vendredi matin. Que préfères-tu ?",
        sender: "goriya",
        timestamp: "10:35",
    },
]

function VideoInterviewBox() {
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [cameraActive, setCameraActive] = useState(false)
    const videoRef = React.useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
        if (cameraActive) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then((mediaStream) => {
                    setStream(mediaStream)
                    if (videoRef.current) videoRef.current.srcObject = mediaStream
                })
                .catch(() => setStream(null))
        } else {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
                setStream(null)
            }
        }
        return () => { if (stream) stream.getTracks().forEach((track) => track.stop()) }
        // eslint-disable-next-line
    }, [cameraActive])

    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[500px]">
            <div className="relative w-full h-[420px] flex items-center justify-center bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl">
                {cameraActive && stream ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-2xl" />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <Camera className="w-10 h-10 text-[#7f8796] dark:text-muted-foreground mb-2" />
                        <span className="text-[#7f8796] dark:text-muted-foreground text-[15px]">Caméra désactivée</span>
                    </div>
                )}
                <div className="absolute left-4 bottom-6 w-1/3">
                    <div className="bg-[#e8edf6] dark:bg-muted rounded-full h-5 flex items-center">
                        <div className="bg-[#7f8796] h-3 rounded-full ml-1 my-1" style={{ width: "60%" }} />
                        <span className="absolute left-2 text-xs text-white font-medium">Progression: 60</span>
                    </div>
                </div>
                <div className="absolute right-4 bottom-6 flex gap-2">
                    <button
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border border-[#e8edf6] dark:border-border bg-white dark:bg-card ${cameraActive ? "text-[#2f6de6] dark:text-primary" : "text-[#7f8796] dark:text-muted-foreground"} hover:bg-[#f4f5f7] dark:hover:bg-muted`}
                        onClick={() => setCameraActive((v) => !v)}
                        type="button"
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e8edf6] dark:border-border bg-white dark:bg-card text-[#7f8796] dark:text-muted-foreground hover:bg-[#f4f5f7] dark:hover:bg-muted"
                        type="button"
                        disabled
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function SimulationEntretienContent() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
    const [newMessage, setNewMessage] = useState("")
    const [showFeedback, setShowFeedback] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [sessionScore, setSessionScore] = useState<number | null>(null)
    const [sessionDuration, setSessionDuration] = useState<number | null>(null)

    useEffect(() => {
        interviewService.startSession({ position: "Simulation générale" })
            .then((res) => {
                const session = (res as any)?.data ?? res
                if (session?.id) setSessionId(session.id)
            })
            .catch(() => {})
    }, [])

    const handleSendMessage = () => {
        if (!newMessage.trim()) return
        const userMessage: Message = {
            id: Date.now().toString(),
            content: newMessage,
            sender: "user",
            timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, userMessage])
        setNewMessage("")
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: "Merci pour ta réponse. Peux-tu me parler de tes projets les plus significatifs ?",
                sender: "goriya",
                timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            }
            setMessages((prev) => [...prev, aiResponse])
        }, 1000)
    }

    const handleShowFeedback = async () => {
        if (sessionId) {
            try {
                const res = await interviewService.getSession(sessionId)
                const session = (res as any)?.data ?? res
                if (session?.score != null) setSessionScore(session.score)
                if (session?.duration != null) setSessionDuration(session.duration)
            } catch { /* show fallback values */ }
        }
        setShowFeedback(true)
    }

    const handleRestart = async () => {
        if (sessionId) {
            interviewService.deleteSession(sessionId).catch(() => {})
        }
        setMessages(INITIAL_MESSAGES)
        setSessionScore(null)
        setSessionDuration(null)
        setShowFeedback(false)
        interviewService.startSession({ position: "Simulation générale" })
            .then((res) => {
                const session = (res as any)?.data ?? res
                if (session?.id) setSessionId(session.id)
            })
            .catch(() => {})
    }

    return (
        <div className="p-6">
            <PageHeader
                title="Simulation d'Entretien avec Goriya"
                actions={
                    <>
                        <Button variant="outline" className="flex items-center gap-2 bg-white dark:bg-card text-[#1b2331] dark:text-foreground border-[#d8deeb] dark:border-border hover:bg-[#f4f5f7] dark:hover:bg-muted" onClick={handleRestart}>
                            <RotateCcw className="w-4 h-4" />
                            Recommencer
                        </Button>
                        <Button className="flex items-center gap-2 bg-[#2f6de6] hover:bg-[#2157d3] text-white" onClick={handleShowFeedback}>
                            <Star className="w-4 h-4" />
                            Voir le Feedback
                        </Button>
                    </>
                }
            />

            <div className="flex justify-center items-center min-h-[500px]">
                <VideoInterviewBox />
            </div>

            {showFeedback && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-card rounded-2xl shadow-xl max-w-lg w-full p-0 relative">
                        <button
                            onClick={() => setShowFeedback(false)}
                            className="absolute top-4 right-4 p-1 hover:bg-white dark:hover:bg-card border border-transparent hover:border-blue-500 rounded-full"
                        >
                            <X className="w-6 h-6 text-[#7f8796] dark:text-muted-foreground" />
                        </button>
                        <div className="px-8 pt-8 pb-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-14 h-14 bg-[#2f6de6] rounded-full flex items-center justify-center mb-2">
                                    <span className="text-white text-2xl font-bold">g</span>
                                </div>
                                <h2 className="text-lg font-bold text-[#1b2331] dark:text-foreground mb-1">Feedback de ton entretien</h2>
                                <p className="text-[13px] text-[#7f8796] dark:text-muted-foreground text-center">Analyse de ta performance et conseils d'amélioration</p>
                            </div>
                            <div className="flex justify-center gap-4 mb-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-[22px] font-bold text-[#2f6de6] dark:text-primary">{sessionScore != null ? `${sessionScore}%` : "85%"}</span>
                                    <span className="text-[12px] text-[#7f8796] dark:text-muted-foreground">Score global</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[22px] font-bold text-[#7c4dff] dark:text-primary">8.5/10</span>
                                    <span className="text-[12px] text-[#7f8796] dark:text-muted-foreground">Communication</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[22px] font-bold text-[#a259e6]">
                                        {sessionDuration != null ? `${sessionDuration}min` : "12min"}
                                    </span>
                                    <span className="text-[12px] text-[#7f8796] dark:text-muted-foreground">Durée totale</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="rounded-xl border border-[#e8edf6] dark:border-border p-4">
                                    <div className="font-semibold text-[#2ecc71] mb-2 text-[14px]">Points forts</div>
                                    <ul className="text-[13px] text-[#1b2331] dark:text-foreground space-y-1">
                                        <li>Excellente présentation personnelle</li>
                                        <li>Réponses structurées et claires</li>
                                        <li>Bonne connaissance des entreprises</li>
                                        <li>Confiance et professionnalisme</li>
                                    </ul>
                                </div>
                                <div className="rounded-xl border border-[#e8edf6] dark:border-border p-4">
                                    <div className="font-semibold text-[#ff9800] mb-2 text-[14px]">Points d'amélioration</div>
                                    <ul className="text-[13px] text-[#1b2331] dark:text-foreground space-y-1">
                                        <li>Développer davantage les exemples concrets</li>
                                        <li>Améliorer la gestion du stress</li>
                                        <li>Préparer plus de questions sur le poste</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="rounded-xl bg-[#2f2e41] text-white p-4 mb-6">
                                <div className="font-semibold mb-2">Recommandations</div>
                                <ul className="text-[13px] list-disc pl-5 space-y-1">
                                    <li>Utilise la méthode STAR pour structurer tes réponses</li>
                                    <li>Pratique la respiration profonde avant l'entretien</li>
                                    <li>Prépare 3-5 questions pertinentes sur l'entreprise</li>
                                    <li>Entraîne-toi régulièrement avec notre simulateur</li>
                                </ul>
                            </div>
                            <Button
                                onClick={handleRestart}
                                className="w-full h-10 rounded-full bg-[#2f6de6] hover:bg-[#2157d3] text-white text-[15px] font-semibold"
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
        <SubscriptionGate featureLabel="la simulation d'entretien IA">
            <SimulationEntretienContent />
        </SubscriptionGate>
    )
}
