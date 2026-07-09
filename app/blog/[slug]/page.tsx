"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { articleService, type IArticle } from "@/lib/api/article.service"

function formatDate(date: string | null) {
    if (!date) return ""
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export default function ArticlePage() {
    const params = useParams()
    const slug = params?.slug as string

    const [article, setArticle] = useState<IArticle | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!slug) return
        articleService.getArticleBySlug(slug)
            .then((res: any) => setArticle(res?.data ?? res))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [slug])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[760px] px-4 pt-10 pb-16">
                <Link href="/blog" className="inline-flex items-center gap-1 text-[12px] text-[#7f8796] dark:text-muted-foreground hover:text-[#2f6de6] dark:hover:text-primary">
                    <ChevronLeft className="w-3.5 h-3.5" /> Retour au blog
                </Link>

                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#2f6de6]" /></div>
                ) : error || !article ? (
                    <p className="text-center text-sm text-[#9aa3b2] dark:text-muted-foreground py-16">Article introuvable.</p>
                ) : (
                    <article className="mt-6">
                        {article.coverImage && (
                            <div className="w-full h-56 sm:h-72 rounded-xl overflow-hidden bg-gradient-to-br from-[#2f6de6] to-[#1539be] mb-6">
                                <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                            </div>
                        )}
                        <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground">
                            {article.authorName && <>{article.authorName} · </>}
                            {formatDate(article.publishedAt)}
                        </p>
                        <h1 className="mt-2 text-2xl sm:text-[34px] leading-tight font-extrabold text-[#121826] dark:text-foreground">{article.title}</h1>
                        <div className="mt-6 text-[14px] leading-7 text-[#2d3545] dark:text-muted-foreground whitespace-pre-line">
                            {article.content}
                        </div>
                    </article>
                )}
            </main>

            <Footer />
        </div>
    )
}
