"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, SendHorizontal, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { COMMENT_MAX_LENGTH, postService, type IPostComment } from "@/lib/api/connect.service"
import { profilePath } from "@/lib/api/public-profile.service"
import type { IUser } from "@/lib/@types/entities"
import { formatFileUrl } from "@/lib/utils"
import { initials, timeAgo } from "./feed-format"

const PAGE_SIZE = 5

interface PostCommentsProps {
    postId: string
    postAuthorId?: string | null
    currentUser: Pick<IUser, "id" | "name" | "avatar"> | null
    /** +1 / -1 : l'appelant tient le compteur affiché sur la carte. */
    onCountChange: (delta: number) => void
    autoFocus?: boolean
}

export function PostComments({ postId, postAuthorId, currentUser, onCountChange, autoFocus = false }: PostCommentsProps) {
    const [comments, setComments] = useState<IPostComment[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(true)
    const [draft, setDraft] = useState("")
    const [sending, setSending] = useState(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const load = useCallback(
        async (nextPage: number) => {
            setLoading(true)
            try {
                const res = await postService.comments(postId, nextPage, PAGE_SIZE)
                const items = Array.isArray(res?.data) ? res.data : []
                // Un commentaire ajouté entre-temps décale les pages : on dédoublonne.
                setComments((prev) => (nextPage === 1 ? items : [...prev, ...items.filter((item) => !prev.some((c) => c.id === item.id))]))
                setHasMore((res?.meta?.page ?? 1) < (res?.meta?.totalPages ?? 1))
                setPage(nextPage)
            } catch {
                toast.error("Impossible de charger les commentaires.")
            } finally {
                setLoading(false)
            }
        },
        [postId],
    )

    useEffect(() => {
        load(1)
    }, [load])

    useEffect(() => {
        if (autoFocus) inputRef.current?.focus()
    }, [autoFocus])

    const send = async () => {
        const content = draft.trim()
        if (!content || sending) return
        setSending(true)
        try {
            const comment = await postService.addComment(postId, content)
            setComments((prev) => [comment, ...prev])
            setDraft("")
            onCountChange(1)
        } catch (err: any) {
            toast.error(err?.message ?? "Le commentaire n'a pas pu être publié.")
        } finally {
            setSending(false)
        }
    }

    const remove = async (comment: IPostComment) => {
        const previous = comments
        setComments((prev) => prev.filter((c) => c.id !== comment.id))
        onCountChange(-1)
        try {
            await postService.deleteComment(postId, comment.id)
        } catch {
            setComments(previous)
            onCountChange(1)
            toast.error("La suppression du commentaire a échoué.")
        }
    }

    return (
        <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
            <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={currentUser?.avatar ? formatFileUrl(currentUser.avatar) : undefined} />
                    <AvatarFallback className="text-xs">{initials(currentUser?.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 items-end gap-2 rounded-2xl border border-border px-3 py-1.5 focus-within:ring-1 focus-within:ring-ring">
                    <Textarea
                        ref={inputRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                send()
                            }
                        }}
                        maxLength={COMMENT_MAX_LENGTH}
                        rows={1}
                        placeholder="Ajouter un commentaire…"
                        aria-label="Ajouter un commentaire"
                        className="min-h-[32px] resize-none border-0 bg-transparent p-0 py-1 text-sm shadow-none focus-visible:ring-0"
                    />
                    {draft.trim() && (
                        <Button type="button" size="icon" variant="ghost" onClick={send} disabled={sending} className="h-8 w-8 shrink-0 rounded-full text-primary" aria-label="Publier le commentaire">
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                        </Button>
                    )}
                </div>
            </div>

            {comments.map((comment) => {
                const canDelete = !!currentUser && (comment.author?.id === currentUser.id || postAuthorId === currentUser.id)
                return (
                    <div key={comment.id} className="group flex items-start gap-2">
                        <Link href={comment.author ? profilePath(comment.author.id) : "#"} className="shrink-0">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.author?.avatar ? formatFileUrl(comment.author.avatar) : undefined} />
                                <AvatarFallback className="text-xs">{initials(comment.author?.name)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="min-w-0 flex-1">
                            <div className="rounded-xl rounded-tl-sm bg-muted/70 px-3 py-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        {comment.author ? (
                                            <Link href={profilePath(comment.author.id)} className="text-[13px] font-semibold text-foreground hover:text-primary hover:underline">
                                                {comment.author.name}
                                            </Link>
                                        ) : (
                                            <span className="text-[13px] font-semibold text-foreground">Membre</span>
                                        )}
                                        {(comment.author?.title || comment.author?.companyName) && (
                                            <p className="truncate text-[11px] text-muted-foreground">{comment.author.title || comment.author.companyName}</p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <span className="text-[11px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                                        {canDelete && (
                                            <button
                                                type="button"
                                                onClick={() => remove(comment)}
                                                className="rounded p-1 text-muted-foreground opacity-100 transition-opacity hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                                                aria-label="Supprimer le commentaire"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-1 whitespace-pre-line break-words text-sm text-foreground">{comment.content}</p>
                            </div>
                        </div>
                    </div>
                )
            })}

            {loading && (
                <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
            )}

            {!loading && hasMore && (
                <button type="button" onClick={() => load(page + 1)} className="text-xs font-semibold text-muted-foreground hover:text-primary hover:underline">
                    Charger plus de commentaires
                </button>
            )}
        </div>
    )
}
