"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { PostCard } from "@/components/connect/post-card"
import { postService, type IPost } from "@/lib/api/connect.service"

/** Lien permanent d'un post (bouton « Partager » → « Copier le lien »). */
export default function PostPermalinkPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const [post, setPost] = useState<IPost | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!params?.id) return
        let cancelled = false
        setLoading(true)
        postService
            .get(params.id)
            .then((res) => !cancelled && setPost(((res as any)?.data ?? res) as IPost))
            .catch(() => !cancelled && setPost(null))
            .finally(() => !cancelled && setLoading(false))
        return () => {
            cancelled = true
        }
    }, [params?.id])

    return (
        <div className="mx-auto w-full max-w-2xl space-y-4">
            <Link href="/connect" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                Retour au fil d'actualité
            </Link>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : post ? (
                <PostCard post={post} defaultShowComments onChange={setPost} onDelete={() => router.push("/connect")} />
            ) : (
                <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                    Cette publication est introuvable ou n'est plus disponible.
                </p>
            )}
        </div>
    )
}
