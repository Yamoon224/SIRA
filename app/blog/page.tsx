"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Loader2, Search } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { articleService, type IArticle } from "@/lib/api/article.service"
import { DataPagination, DEFAULT_PAGE_SIZE } from "@/components/ui/data-pagination"

function formatDate(date: string | null) {
    if (!date) return ""
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export default function BlogPage() {
    const [articles, setArticles] = useState<IArticle[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
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
            .getArticles({ page, limit: pageSize, search: search || undefined })
            .then((res: any) => {
                const list = res?.data ?? []
                setArticles(list)
                setTotalPages(Math.max(1, res?.meta?.totalPages ?? 1))
                setTotal(res?.meta?.total ?? list.length)
            })
            .catch(() => {
                setArticles([])
                setTotalPages(1)
                setTotal(0)
            })
            .finally(() => setLoading(false))
    }, [page, pageSize, search])

    const changePageSize = (size: number) => {
        setPageSize(size)
        setPage(1)
    }

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
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa3b2] dark:text-muted-foreground" />
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Rechercher un article…"
                        className="h-11 pl-10 rounded-full"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#2f6de6] dark:text-primary" /></div>
                ) : articles.length === 0 ? (
                    <p className="text-center text-sm text-[#9aa3b2] dark:text-muted-foreground py-16">
                        {search ? "Aucun article ne correspond à ta recherche." : "Aucun article publié pour l'instant."}
                    </p>
                ) : (
                    <>
                        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {articles.map((article) => (
                                <Link key={article.id} href={`/blog/${article.slug}`} className="cursor-pointer">
                                    <article className="rounded-2xl border border-[#e9eef8] dark:border-border bg-white dark:bg-card overflow-hidden h-full hover:shadow-md transition-shadow">
                                        <div className="h-40 w-full bg-brand-gradient">
                                            {article.coverImage && (
                                                <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = "none" }} />
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

                        <DataPagination
                            page={page}
                            totalPages={totalPages}
                            total={total}
                            currentCount={articles.length}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={changePageSize}
                            disabled={loading}
                            className="mt-12"
                        />
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}
