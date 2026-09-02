"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { portfolioService } from "@/lib/api/portfolio.service"
import { useAuth } from "@/contexts/auth-context"
import type { IPortfolio } from "@/lib/@types/entities"

export default function Page() {
    const router = useRouter()
    const { user } = useAuth()
    const [portfolios, setPortfolios] = useState<IPortfolio[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const load = async () => {
        setLoading(true)
        try {
            const res: any = await portfolioService.getPortfolios({ limit: 50, userId: user?.id })
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1b2331] dark:text-foreground">Mon portfolio</h1>
                    <p className="text-[13px] text-[#7f8796] dark:text-muted-foreground mt-1">Gère les portfolios que tu partages avec les recruteurs.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-xl p-4 sm:p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-7 w-7 animate-spin text-[#2f6de6]" />
                    </div>
                ) : portfolios.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-[13px] text-[#7f8796] text-center dark:text-muted-foreground">
                            Aucun portfolio créé. Clique sur « Ajouter » pour commencer.
                        </p>
                        <Button onClick={() => router.push("/creer-portfolio")} className="mt-4 rounded-full bg-[#2f6de6] hover:bg-[#2554b8]">
                            <Plus className="w-4 h-4 mr-1.5" /> Créer un portfolio
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {portfolios.map((portfolio) => (
                            <div
                                key={portfolio.id}
                                className="flex items-center gap-3 sm:gap-4 rounded-lg border border-[#e8edf6] dark:border-border p-3 hover:border-[#2f6de6] transition-colors"
                            >
                                <div className="w-14 h-14 bg-[#f0f3fb] dark:bg-muted rounded-lg flex-shrink-0 flex items-center justify-center text-[20px] font-bold text-[#2f6de6]">
                                    {portfolio.title.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.push(`/creer-portfolio?id=${portfolio.id}`)}
                                    className="flex-1 min-w-0 text-left"
                                >
                                    <div className="font-medium text-[#1b2331] dark:text-foreground text-sm sm:text-base leading-5 truncate">
                                        {portfolio.title}
                                        {portfolio.description && <span className="font-normal text-[#7f8796] dark:text-muted-foreground"> – {portfolio.description}</span>}
                                    </div>
                                    {portfolio.skills?.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {portfolio.skills.slice(0, 5).map((skill) => (
                                                <span key={skill} className="rounded-full bg-[#eff4ff] dark:bg-primary/10 px-2 py-0.5 text-[10px] text-[#2f6de6] dark:text-primary">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/creer-portfolio?id=${portfolio.id}`)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        disabled={deletingId === portfolio.id}
                                        onClick={() => handleDelete(portfolio.id)}
                                    >
                                        {deletingId === portfolio.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
