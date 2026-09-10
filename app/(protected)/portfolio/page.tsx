"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { portfolioService } from "@/lib/api/portfolio.service"
import { useAuth } from "@/contexts/auth-context"
import type { IPortfolio } from "@/lib/@types/entities"
import { PageHeader } from "@/components/layout/page-header"
import { formatFileUrl } from "@/lib/utils"

export default function Page() {
    const router = useRouter()
    const { user } = useAuth()
    const [portfolios, setPortfolios] = useState<IPortfolio[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const load = async () => {
        if (!user?.id) return
        setLoading(true)
        try {
            // `userId` = membre connecté : l'API renvoie aussi ses brouillons.
            const res: any = await portfolioService.getPortfolios({ limit: 50, userId: user.id })
            const items = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? [])
            setPortfolios(Array.isArray(items) ? items : [])
        } catch (err) {
            console.error("[portfolio] load error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce portfolio ? Cette action est irréversible.")) return
        setDeletingId(id)
        try {
            await portfolioService.deletePortfolio(id)
            setPortfolios((prev) => prev.filter((p) => p.id !== id))
            toast.success("Portfolio supprimé")
        } catch (err) {
            console.error("[portfolio] delete error:", err)
            toast.error("Échec de la suppression")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="mx-auto w-full max-w-4xl">
            <PageHeader
                title="Mon portfolio"
                description="Gère les portfolios que tu partages avec les recruteurs."
                actions={
                    portfolios.length > 0 ? (
                        <Button onClick={() => router.push("/portfolio/creer")} className="rounded-full bg-brand-gradient hover:bg-brand-gradient-hover">
                            <Plus className="mr-1.5 h-4 w-4" /> Nouveau portfolio
                        </Button>
                    ) : undefined
                }
            />

            <div className="bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl p-4 sm:p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-7 w-7 animate-spin text-[#2f6de6] dark:text-primary" />
                    </div>
                ) : portfolios.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-[13px] text-[#7f8796] text-center dark:text-muted-foreground">
                            Aucun portfolio créé pour le moment.
                        </p>
                        <Button onClick={() => router.push("/portfolio/creer")} className="mt-4 rounded-full bg-brand-gradient hover:bg-brand-gradient-hover">
                            <Plus className="w-4 h-4 mr-1.5" /> Créer un portfolio
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {portfolios.map((portfolio) => {
                            const editHref = `/portfolio/creer?id=${portfolio.id}`
                            const draft = portfolio.status === "DRAFT"
                            return (
                                <div
                                    key={portfolio.id}
                                    className="flex items-center gap-3 sm:gap-4 rounded-lg border border-[#e8edf6] dark:border-border p-3 hover:border-[#2f6de6] transition-colors"
                                >
                                    <div className="w-14 h-14 bg-[#f0f3fb] dark:bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden text-[20px] font-bold text-[#2f6de6] dark:text-primary">
                                        {portfolio.photo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={formatFileUrl(portfolio.photo)} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            portfolio.title.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <button type="button" onClick={() => router.push(editHref)} className="flex-1 min-w-0 text-left">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium text-[#1b2331] dark:text-foreground text-sm sm:text-base leading-5 truncate">{portfolio.title}</span>
                                            <Badge variant={draft ? "secondary" : "default"} className="text-[10px]">
                                                {draft ? "Brouillon" : "Publié"}
                                            </Badge>
                                        </div>
                                        {portfolio.description && (
                                            <p className="mt-0.5 truncate text-[13px] text-[#7f8796] dark:text-muted-foreground">{portfolio.description}</p>
                                        )}
                                        <div className="mt-1 flex flex-wrap items-center gap-1">
                                            {portfolio.skills?.slice(0, 5).map((skill) => (
                                                <span key={skill} className="rounded-full bg-[#eff4ff] dark:bg-primary/10 px-2 py-0.5 text-[10px] text-[#2f6de6] dark:text-primary">
                                                    {skill}
                                                </span>
                                            ))}
                                            {!draft && (
                                                <span className="ml-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Eye className="h-3 w-3" />
                                                    {portfolio.views ?? 0}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Button variant="ghost" size="sm" onClick={() => router.push(editHref)} aria-label={`Modifier ${portfolio.title}`}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            disabled={deletingId === portfolio.id}
                                            onClick={() => handleDelete(portfolio.id)}
                                            aria-label={`Supprimer ${portfolio.title}`}
                                        >
                                            {deletingId === portfolio.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
