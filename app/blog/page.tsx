"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { articleService, type IArticle } from "@/lib/api/article.service"

const PAGE_SIZE = 9

function formatDate(date: string | null) {
    if (!date) return ""
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export default function BlogPage() {
    const [articles, setArticles] = useState<IArticle[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")

    // Débounce de la saisie pour éviter une requête par frappe
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput.trim())
            setPage(1)
        }, 400)
        return () => clearTimeout(t)
    }, [searchInput])

    useEffect(() => {
        setLoading(true)
        articleService
            .getArticles({ page, limit: PAGE_SIZE, search: search || undefined })
            .then((res: any) => {
                setArticles(res?.data ?? [])
                setTotalPages(Math.max(1, res?.meta?.totalPages ?? 1))
            })
            .catch(() => {
                setArticles([])
                setTotalPages(1)
            })
            .finally(() => setLoading(false))
    }, [page, search])

    const pageNumbers = useMemo(() => {
        const pages: number[] = []
        const start = Math.max(1, page - 2)
        const end = Math.min(totalPages, start + 4)
        for (let i = start; i <= end; i++) pages.push(i)
        return pages
    }, [page, totalPages])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[1180px] px-4 pt-10 pb-16">
                <section className="text-center">
                    <h1 className="text-[30px] sm:text-[46px] leading-none font-extrabold text-[#121826] dark:text-foreground">Blog Goriya</h1>
                    <p className="mt-4 text-[12px] text-[#7f8796] dark:text-muted-foreground max-w-[640px] mx-auto text-justify sm:text-center">
                        Conseils carrière, actualités emploi et bonnes pratiques pour booster ta recherche.
                    </p>
                </section>

                <div className="mt-8 max-w-[480px] mx-auto relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa3b2]" />
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Rechercher un article…"
                        className="h-11 pl-10 rounded-full"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#2f6de6]" /></div>
                ) : articles.length === 0 ? (
                    <p className="text-center text-sm text-[#9aa3b2] dark:text-muted-foreground py-16">
                        {search ? "Aucun article ne correspond à ta recherche." : "Aucun article publié pour l'instant."}
                    </p>
                ) : (
                    <>
                        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {articles.map((article) => (
                                <Link key={article.id} href={`/blog/${article.slug}`} className="cursor-pointer">
                                    <article className="rounded-xl border border-[#e9eef8] dark:border-border bg-white dark:bg-card overflow-hidden h-full hover:shadow-md transition-shadow">
                                        <div className="h-40 w-full bg-gradient-to-br from-[#2f6de6] to-[#1539be]">
                                            {article.coverImage && (
                                                <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                                            )}
                                        </div>
                                        <div className="p-4">
                                            {article.publishedAt && (
                                                <p className="text-[10px] text-[#9aa3b2] dark:text-muted-foreground">{formatDate(article.publishedAt)}</p>
                                            )}
                                            <h2 className="mt-1 text-[15px] font-bold text-[#1b2331] dark:text-foreground leading-snug line-clamp-2">{article.title}</h2>
                                            {article.excerpt && (
                                                <p className="mt-2 text-[12px] text-[#7f8796] dark:text-muted-foreground leading-5 line-clamp-3 text-justify">{article.excerpt}</p>
                                            )}
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-1.5">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full cursor-pointer disabled:cursor-not-allowed"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                {pageNumbers.map((n) => (
                                    <Button
                                        key={n}
                                        variant={n === page ? "default" : "outline"}
                                        size="icon"
                                        className="rounded-full cursor-pointer"
                                        onClick={() => setPage(n)}
                                    >
                                        {n}
                                    </Button>
                                ))}

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full cursor-pointer disabled:cursor-not-allowed"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}
