"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mic, Plus, Trash2, Upload, Video, Sparkles, Eye, EyeOff } from "lucide-react"
import { SubscriptionGate } from "@/components/subscription-gate"
import { pitchService, type IPitch, type PitchType } from "@/lib/api/pitch.service"
import { PageHeader } from "@/components/layout/page-header"

const TYPE_LABELS: Record<PitchType, string> = {
    EMPLOI: "Candidature emploi",
    CONCOURS: "Concours / bourse",
    APPEL_PROJET: "Appel à projets",
    STARTUP: "Pitch startup",
}

const STATUS_META: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "Brouillon", className: "bg-gray-200 dark:bg-muted text-gray-700 dark:text-foreground" },
    PROCESSING: { label: "En traitement", className: "bg-blue-100 text-blue-600" },
    READY: { label: "Prêt", className: "bg-green-500 text-white" },
    FAILED: { label: "Échec", className: "bg-red-500 text-white" },
}

function PitchGoriyaContent() {
    const [pitches, setPitches] = useState<IPitch[]>([])
    const [loading, setLoading] = useState(true)
    const [active, setActive] = useState<IPitch | null>(null)

    const [newType, setNewType] = useState<PitchType>("EMPLOI")
    const [newDescription, setNewDescription] = useState("")
    const [newContent, setNewContent] = useState("")
    const [creating, setCreating] = useState(false)

    const [uploading, setUploading] = useState(false)
    const [renderingAvatar, setRenderingAvatar] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const load = async () => {
        setLoading(true)
        try {
            const res = await pitchService.list()
            const items = ((res as any)?.data ?? res) as IPitch[]
            setPitches(Array.isArray(items) ? items : [])
            if (Array.isArray(items) && items.length > 0) setActive(items[0])
        } catch (err) {
            console.error("[pitch-goriya] load error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
        return () => { if (pollRef.current) clearInterval(pollRef.current) }
    }, [])

    // Le rendu (scoring vidéo, avatar) est asynchrone côté backend - on
    // sonde le statut jusqu'à sortie de PROCESSING, comme le fait déjà
    // l'app entreprise pour le rapport d'évaluation candidat.
    const pollStatus = (id: string) => {
        if (pollRef.current) clearInterval(pollRef.current)
        pollRef.current = setInterval(async () => {
            try {
                const res = await pitchService.get(id)
                const updated = (res as any)?.data ?? res
                setPitches((prev) => prev.map((p) => p.id === updated.id ? updated : p))
                setActive((prev) => prev?.id === updated.id ? updated : prev)
                if (updated.status !== "PROCESSING" && pollRef.current) {
                    clearInterval(pollRef.current)
                    pollRef.current = null
                }
            } catch (err) {
                console.error("[pitch-goriya] poll error:", err)
            }
        }, 4000)
    }

    const handleCreate = async () => {
        setCreating(true)
        try {
            const res = await pitchService.create(
                newType,
                undefined,
                newContent.trim() || undefined,
                newDescription.trim() || undefined,
            )
            const pitch = (res as any)?.data ?? res
            setPitches((prev) => [pitch, ...prev])
            setActive(pitch)
            setNewContent("")
            setNewDescription("")
        } catch (err) {
            console.error("[pitch-goriya] create error:", err)
        } finally {
            setCreating(false)
        }
    }

    const handleUploadVideo = async (file: File) => {
        if (!active) return
        setUploading(true)
        try {
            const updated = await pitchService.uploadVideo(active.id, file)
            setPitches((prev) => prev.map((p) => p.id === updated.id ? updated : p))
            setActive(updated)
            pollStatus(updated.id)
        } catch (err) {
            console.error("[pitch-goriya] upload error:", err)
        } finally {
            setUploading(false)
        }
    }

    const handleRenderAvatar = async () => {
        if (!active) return
        setRenderingAvatar(true)
        try {
            const res = await pitchService.renderAvatar(active.id)
            const updated = (res as any)?.data ?? res
            setPitches((prev) => prev.map((p) => p.id === updated.id ? updated : p))
            setActive(updated)
            pollStatus(updated.id)
        } catch (err) {
            console.error("[pitch-goriya] avatar error:", err)
        } finally {
            setRenderingAvatar(false)
        }
    }

    const handleToggleVisibility = async () => {
        if (!active) return
        try {
            const res = await pitchService.toggleVisibility(active.id)
            const updated = (res as any)?.data ?? res
            setPitches((prev) => prev.map((p) => p.id === updated.id ? updated : p))
            setActive(updated)
        } catch (err) {
            console.error("[pitch-goriya] visibility error:", err)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await pitchService.remove(id)
            setPitches((prev) => prev.filter((p) => p.id !== id))
            if (active?.id === id) setActive(null)
        } catch (err) {
            console.error("[pitch-goriya] delete error:", err)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title="Pitch Goriya"
                description="Générez et scorez votre pitch - texte, vidéo ou avatar animé."
            />

            <Card className="border border-border">
                <CardContent className="space-y-3 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Select value={newType} onValueChange={(v) => setNewType(v as PitchType)}>
                            <SelectTrigger className="h-10 sm:w-56"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button disabled={creating} onClick={handleCreate} className="h-10 gap-1.5 bg-blue-600 hover:bg-blue-700 sm:w-auto">
                            <Sparkles className="h-4 w-4" />{creating ? "Génération..." : "Générer un pitch"}
                        </Button>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-foreground">Décris l'idée de ton pitch</label>
                        <Textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="De quoi parle ton pitch ? (ex : mon projet, ce qui me démarque, l'objectif visé...) - sert de base à la génération IA"
                            className="min-h-[80px]"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Script (optionnel)</label>
                        <Textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="Optionnel : écris toi-même le script mot pour mot (sinon généré par IA à partir de l'idée)..."
                            className="min-h-[70px]"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="space-y-2 lg:col-span-1">
                    {pitches.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">Aucun pitch pour le moment.</p>
                    ) : (
                        pitches.map((pitch) => (
                            <button
                                key={pitch.id}
                                onClick={() => setActive(pitch)}
                                className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${active?.id === pitch.id ? "border-blue-600 bg-blue-50" : "border-border bg-white dark:bg-card hover:bg-muted/50"}`}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-foreground">{TYPE_LABELS[pitch.type]}</p>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_META[pitch.status]?.className}`}>
                                        {STATUS_META[pitch.status]?.label}
                                    </span>
                                </div>
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                    {pitch.format === "VIDEO" ? <Video className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                                    {new Date(pitch.createdAt).toLocaleDateString("fr-FR")}
                                </p>
                            </button>
                        ))
                    )}
                </div>

                <div className="lg:col-span-2">
                    {active ? (
                        <Card className="border border-border">
                            <CardContent className="space-y-4 p-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-foreground">{TYPE_LABELS[active.type]}</h2>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(active.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {active.description && (
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="mb-1 text-xs font-medium text-foreground">Idée du pitch</p>
                                        <p className="whitespace-pre-line text-sm text-muted-foreground">{active.description}</p>
                                    </div>
                                )}

                                <p className="whitespace-pre-line text-sm text-muted-foreground">{active.content}</p>

                                {active.format === "VIDEO" && active.videoPath && (
                                    <video src={active.videoPath} controls className="w-full rounded-lg border border-border" />
                                )}

                                {active.score && (
                                    <div className="space-y-2">
                                        <ScoreRow label="Clarté" value={active.score.clarte} />
                                        <ScoreRow label="Impact" value={active.score.impact} />
                                        <ScoreRow label="Persuasion" value={active.score.persuasion} />
                                        <p className="text-xs text-muted-foreground">{active.score.feedback}</p>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleUploadVideo(e.target.files[0])}
                                    />
                                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="h-3.5 w-3.5" />{uploading ? "Envoi..." : "Attacher une vidéo"}
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" disabled={renderingAvatar || !active.content} onClick={handleRenderAvatar}>
                                        <Sparkles className="h-3.5 w-3.5" />{renderingAvatar ? "Génération..." : "Avatar animé (Studio IA)"}
                                    </Button>
                                    <div className="ml-auto flex items-center gap-2">
                                        {active.isPublic ? <Eye className="h-3.5 w-3.5 text-green-600" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                                        <span className="text-xs text-muted-foreground">Profil public</span>
                                        <Switch checked={active.isPublic} onCheckedChange={handleToggleVisibility} disabled={active.format !== "VIDEO"} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <p className="py-6 text-center text-sm text-muted-foreground">Sélectionnez ou générez un pitch.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function ScoreRow({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-foreground">{label}</span>
                <span className="font-semibold text-foreground">{value}/100</span>
            </div>
            <Progress value={value} className="h-1.5" />
        </div>
    )
}

export default function Page() {
    return (
        <SubscriptionGate featureLabel="Pitch Goriya">
            <PitchGoriyaContent />
        </SubscriptionGate>
    )
}
