"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { articleService, type IArticle } from "@/lib/api/article.service"

function formatDate(date: string | null) {
    if (!date) return ""
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export default function BlogPage() {
    const [articles, setArticles] = useState<IArticle[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        articleService.getArticles({ limit: 12 })
            .then((res: any) => setArticles(res?.data ?? []))
            .catch(() => setArticles([]))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[1180px] px-4 pt-10 pb-16">
                <section className="text-center">
                    <h1 className="text-[30px] sm:text-[46px] leading-none font-extrabold text-[#121826] dark:text-foreground">Blog Goriya</h1>
                    <p className="mt-4 text-[12px] text-[#7f8796] dark:text-muted-foreground max-w-[640px] mx-auto">
                        Conseils carrière, actualités emploi et bonnes pratiques pour booster ta recherche.
                    </p>
                </section>

                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#2f6de6]" /></div>
                ) : articles.length === 0 ? (
                    <p className="text-center text-sm text-[#9aa3b2] dark:text-muted-foreground py-16">Aucun article publié pour l'instant.</p>
                ) : (
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {articles.map((article) => (
                            <Link key={article.id} href={`/blog/${article.slug}`}>
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
                                            <p className="mt-2 text-[12px] text-[#7f8796] dark:text-muted-foreground leading-5 line-clamp-3">{article.excerpt}</p>
                                        )}
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
