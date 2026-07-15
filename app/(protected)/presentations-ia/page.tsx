"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Presentation as PresentationIcon, Trash2, Download, Sparkles, ArrowRight } from "lucide-react"
import { SubscriptionGate } from "@/components/subscription-gate"
import {
    presentationService,
    type IPresentation,
    type PresentationType,
    type ISlide,
    type ISchemaNode,
    type ISchemaEdge,
} from "@/lib/api/presentation.service"

function isSlidesContent(content: IPresentation["content"]): content is { slides: ISlide[] } {
    return Array.isArray((content as any)?.slides)
}

function PresentationsIaContent() {
    const [presentations, setPresentations] = useState<IPresentation[]>([])
    const [loading, setLoading] = useState(true)
    const [active, setActive] = useState<IPresentation | null>(null)

    const [title, setTitle] = useState("")
    const [type, setType] = useState<PresentationType>("SLIDES")
    const [brief, setBrief] = useState("")
    const [creating, setCreating] = useState(false)
    const [exporting, setExporting] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const res = await presentationService.list()
            const items = ((res as any)?.data ?? res) as IPresentation[]
            setPresentations(Array.isArray(items) ? items : [])
            if (Array.isArray(items) && items.length > 0) setActive(items[0])
        } catch (err) {
            console.error("[presentations-ia] load error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const handleCreate = async () => {
        if (!title.trim() || !brief.trim()) return
        setCreating(true)
        try {
            const res = await presentationService.create(title.trim(), type, brief.trim())
            const presentation = (res as any)?.data ?? res
            setPresentations((prev) => [presentation, ...prev])
            setActive(presentation)
            setTitle("")
            setBrief("")
        } catch (err) {
            console.error("[presentations-ia] create error:", err)
        } finally {
            setCreating(false)
        }
    }

    const handleExport = async () => {
        if (!active) return
        setExporting(true)
        try {
            const res = await presentationService.exportPptx(active.id)
            const url = (res as any)?.data?.url ?? (res as any)?.url
            if (url) window.open(url, "_blank")
        } catch (err) {
            console.error("[presentations-ia] export error:", err)
        } finally {
            setExporting(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await presentationService.remove(id)
            setPresentations((prev) => prev.filter((p) => p.id !== id))
            if (active?.id === id) setActive(null)
        } catch (err) {
            console.error("[presentations-ia] delete error:", err)
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
            <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Présentations & Schémas IA</h1>
                <p className="mt-1 text-sm text-muted-foreground">Générez la structure d'une présentation ou d'un schéma à partir d'un simple brief.</p>
            </div>

            <Card className="border border-border">
                <CardContent className="space-y-3 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" className="flex-1" />
                        <Select value={type} onValueChange={(v) => setType(v as PresentationType)}>
                            <SelectTrigger className="h-10 sm:w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SLIDES">Slides</SelectItem>
                                <SelectItem value="SCHEMA">Schéma</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Décrivez le contenu attendu (sujet, objectif, points clés)..." className="min-h-[80px]" />
                    <div className="flex justify-end">
                        <Button disabled={creating || !title.trim() || !brief.trim()} onClick={handleCreate} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                            <Sparkles className="h-4 w-4" />{creating ? "Génération..." : "Générer"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="space-y-2 lg:col-span-1">
                    {presentations.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">Aucune présentation pour le moment.</p>
                    ) : (
                        presentations.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setActive(p)}
                                className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${active?.id === p.id ? "border-blue-600 bg-blue-50" : "border-border bg-white hover:bg-muted/50"}`}
                            >
                                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <PresentationIcon className="h-3.5 w-3.5" />{p.title}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{p.type === "SLIDES" ? "Slides" : "Schéma"} · {new Date(p.createdAt).toLocaleDateString("fr-FR")}</p>
                            </button>
                        ))
                    )}
                </div>

                <div className="lg:col-span-2">
                    {active ? (
                        <Card className="border border-border">
                            <CardContent className="space-y-4 p-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-foreground">{active.title}</h2>
                                    <div className="flex items-center gap-1">
                                        {active.type === "SLIDES" && (
                                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" disabled={exporting} onClick={handleExport}>
                                                <Download className="h-3.5 w-3.5" />{exporting ? "Export..." : "Exporter .pptx"}
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(active.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {isSlidesContent(active.content) ? (
                                    <div className="space-y-3">
                                        {active.content.slides.map((slide, i) => (
                                            <div key={i} className="rounded-lg border border-border p-3">
                                                <p className="mb-1.5 text-sm font-semibold text-foreground">{i + 1}. {slide.title}</p>
                                                <ul className="list-disc space-y-0.5 pl-4 text-sm text-muted-foreground">
                                                    {slide.bullets.map((b, j) => <li key={j}>{b}</li>)}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {(active.content as { nodes: ISchemaNode[] }).nodes.map((node) => (
                                                <span key={node.id} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-foreground">{node.label}</span>
                                            ))}
                                        </div>
                                        <div className="space-y-1.5">
                                            {(active.content as { nodes: ISchemaNode[]; edges: ISchemaEdge[] }).edges.map((edge, i) => {
                                                const nodes = (active.content as { nodes: ISchemaNode[] }).nodes
                                                const from = nodes.find((n) => n.id === edge.from)?.label ?? edge.from
                                                const to = nodes.find((n) => n.id === edge.to)?.label ?? edge.to
                                                return (
                                                    <p key={i} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        {from}<ArrowRight className="h-3.5 w-3.5" />{to}
                                                        {edge.label && <span className="text-xs">({edge.label})</span>}
                                                    </p>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <p className="py-6 text-center text-sm text-muted-foreground">Sélectionnez ou générez une présentation.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <SubscriptionGate featureLabel="Présentations & Schémas IA">
            <PresentationsIaContent />
        </SubscriptionGate>
    )
}
