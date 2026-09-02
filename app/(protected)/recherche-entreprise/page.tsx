"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Trash2, Building2, Sparkles } from "lucide-react"
import { SubscriptionGate } from "@/components/subscription-gate"
import { researchService, type IResearchQuery } from "@/lib/api/research.service"

function RechercheEntrepriseContent() {
    const [queries, setQueries] = useState<IResearchQuery[]>([])
    const [loading, setLoading] = useState(true)
    const [companyName, setCompanyName] = useState("")
    const [searching, setSearching] = useState(false)
    const [active, setActive] = useState<IResearchQuery | null>(null)

    const load = async () => {
        setLoading(true)
        try {
            const res = await researchService.list()
            const items = ((res as any)?.data ?? res) as IResearchQuery[]
            setQueries(Array.isArray(items) ? items : [])
            if (Array.isArray(items) && items.length > 0) setActive(items[0])
        } catch (err) {
            console.error("[recherche-entreprise] load error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleSearch = async () => {
        if (!companyName.trim()) return
        setSearching(true)
        try {
            const res = await researchService.create(companyName.trim())
            const query = ((res as any)?.data ?? res) as IResearchQuery
            setQueries((prev) => [query, ...prev])
            setActive(query)
            setCompanyName("")
        } catch (err) {
            console.error("[recherche-entreprise] search error:", err)
        } finally {
            setSearching(false)
        }
    }

    const handleToggleFavorite = async (query: IResearchQuery) => {
        try {
            const res = await researchService.toggleFavorite(query.id)
            const updated = ((res as any)?.data ?? res) as IResearchQuery
            setQueries((prev) => prev.map((q) => q.id === updated.id ? updated : q))
            if (active?.id === updated.id) setActive(updated)
        } catch (err) {
            console.error("[recherche-entreprise] favorite error:", err)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await researchService.remove(id)
            setQueries((prev) => prev.filter((q) => q.id !== id))
            if (active?.id === id) setActive(null)
        } catch (err) {
            console.error("[recherche-entreprise] delete error:", err)
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
                <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Goriya IA Research</h1>
                <p className="mt-1 text-sm text-muted-foreground">Recherchez une entreprise avant un entretien : histoire, valeurs, culture, actualités.</p>
            </div>

            <Card className="border border-border">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="Nom de l'entreprise (ex : Orange, MTN, Ecobank...)"
                                className="h-10 pl-9"
                            />
                        </div>
                        <Button disabled={searching || !companyName.trim()} onClick={handleSearch} className="h-10 gap-1.5 bg-blue-600 hover:bg-blue-700">
                            <Sparkles className="h-4 w-4" />{searching ? "Recherche..." : "Rechercher"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="space-y-2 lg:col-span-1">
                    {queries.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">Aucune recherche pour le moment.</p>
                    ) : (
                        queries.map((query) => (
                            <button
                                key={query.id}
                                onClick={() => setActive(query)}
                                className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${active?.id === query.id ? "border-blue-600 bg-blue-50" : "border-border bg-white dark:bg-card hover:bg-muted/50"}`}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Building2 className="h-3.5 w-3.5" />{query.companyName}
                                    </p>
                                    {query.isFavorite && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">{new Date(query.createdAt).toLocaleDateString("fr-FR")}</p>
                            </button>
                        ))
                    )}
                </div>

                <div className="lg:col-span-2">
                    {active ? (
                        <Card className="border border-border">
                            <CardContent className="space-y-4 p-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-foreground">{active.companyName}</h2>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleFavorite(active)}>
                                            <Star className={`h-4 w-4 ${active.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(active.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Section title="Synthèse" text={active.result.synthese} />
                                <Section title="Historique" text={active.result.historique} />
                                <Section title="Culture d'entreprise" text={active.result.culture} />
                                <ListSection title="Valeurs" items={active.result.valeurs} />
                                <ListSection title="Actualités récentes" items={active.result.actualites} />
                                <ListSection title="Recommandations pour votre entretien" items={active.result.recommandations} />
                            </CardContent>
                        </Card>
                    ) : (
                        <p className="py-6 text-center text-sm text-muted-foreground">Sélectionnez ou lancez une recherche.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function Section({ title, text }: { title: string; text?: string }) {
    if (!text) return null
    return (
        <div>
            <p className="mb-1 text-sm font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{text}</p>
        </div>
    )
}

function ListSection({ title, items }: { title: string; items?: string[] }) {
    if (!items || items.length === 0) return null
    return (
        <div>
            <p className="mb-1 text-sm font-medium text-foreground">{title}</p>
            <div className="flex flex-wrap gap-1.5">
                {items.map((item, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">{item}</Badge>
                ))}
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <SubscriptionGate featureLabel="Goriya IA Research">
            <RechercheEntrepriseContent />
        </SubscriptionGate>
    )
}
