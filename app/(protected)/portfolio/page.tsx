"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { portfolioService } from "@/lib/api/portfolio.service"
import type { IPortfolio } from "@/lib/@types/entities"

export default function Page() {
    const [portfolios, setPortfolios] = useState<IPortfolio[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await portfolioService.getPortfolios({ page: 1, limit: 20 })
                const payload = (res as any)?.data ?? res
                const items = Array.isArray(payload) ? payload : payload?.data ?? []
                setPortfolios(items)
            } catch (err) {
                console.error("[portfolio] load error:", err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div className="min-h-screen bg-[#fafbfc] flex">
            <div className="flex-1 flex flex-col items-center w-full">
                <div className="w-full max-w-4xl mx-auto pt-6 sm:pt-8 px-4 sm:px-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1b2331] mb-4 sm:mb-6">Créer un portfolio</h1>
                    <div className="bg-white border border-[#e8edf6] rounded-xl p-0 sm:p-0">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
                            <div>
                                <h2 className="text-lg font-semibold text-[#1b2331]">Ton portfolio</h2>
                                <div className="text-[15px] text-[#7f8796] mt-1">CV</div>
                            </div>
                            <Button className="bg-[#2f6de6] hover:bg-[#2554b8] text-white font-medium rounded-full px-4 py-2 text-sm flex items-center justify-center gap-2 shadow-none w-full sm:w-auto">
                                <Plus className="w-4 h-4" />
                                Ajouter
                            </Button>
                        </div>

                        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
                            {loading ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2f6de6] border-t-transparent" />
                                </div>
                            ) : portfolios.length === 0 ? (
                                <p className="text-center text-[13px] text-[#7f8796] py-8">
                                    Aucun portfolio créé. Clique sur "Ajouter" pour commencer.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {portfolios.map((portfolio) => (
                                        <div key={portfolio.id} className="flex items-center gap-3 sm:gap-4 bg-white rounded-lg border border-[#e8edf6] p-3">
                                            <div className="w-16 h-16 bg-[#f0f3fb] rounded-lg flex-shrink-0 flex items-center justify-center text-[22px] font-bold text-[#2f6de6]">
                                                {portfolio.title.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-[#1b2331] text-sm sm:text-base leading-5">
                                                    {portfolio.title}{" "}
                                                    <span className="font-normal text-[#7f8796]">– {portfolio.description}</span>
                                                </div>
                                                {portfolio.skills.length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {portfolio.skills.slice(0, 4).map((skill) => (
                                                            <span key={skill} className="rounded-full bg-[#eff4ff] px-2 py-0.5 text-[10px] text-[#2f6de6]">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
