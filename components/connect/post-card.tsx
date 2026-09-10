"use client"

import { Fragment, useState, type ReactNode } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Link2, Loader2, MessageSquare, MoreHorizontal, PenLine, Repeat2, Send, Share2, ThumbsUp, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { POST_MAX_LENGTH, postService, type IConnectUser, type IPost } from "@/lib/api/connect.service"
import { profilePath } from "@/lib/api/public-profile.service"
import { cn, formatFileUrl } from "@/lib/utils"
import { PostAttachments } from "./post-attachments"
import { PostComments } from "./post-comments"
import { initials, plural, postPath, timeAgo } from "./feed-format"

interface PostCardProps {
    post: IPost
    /** Ouvre directement les commentaires (page d'un post partagé). */
    defaultShowComments?: boolean
    onChange: (post: IPost) => void
    onDelete: (id: string) => void
    onReposted?: (post: IPost) => void
    /** Masque la ligne d'actions (aperçu en lecture seule, ex. profil public). */
    readOnly?: boolean
}

/** Republication sans commentaire ni pièce jointe : la carte montre l'original. */
const isPlainRepost = (post: IPost) => post.repostOf !== undefined && !post.content && (post.attachments?.length ?? 0) === 0

const URL_PATTERN = /(https?:\/\/[^\s]+)/g

/** Texte du post, liens cliquables, replié au-delà de 5 lignes. */
function PostText({ content }: { content: string }) {
    const [expanded, setExpanded] = useState(false)
    const long = content.length > 320 || content.split("\n").length > 5

    return (
        <div className="px-4">
            <p className={cn("whitespace-pre-line break-words text-sm text-foreground", !expanded && long && "line-clamp-5")}>
                {content.split(URL_PATTERN).map((part, index) =>
                    index % 2 === 1 ? (
                        <a key={index} href={part} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-primary hover:underline">
                            {part}
                        </a>
                    ) : (
                        <Fragment key={index}>{part}</Fragment>
                    ),
                )}
            </p>
            {long && !expanded && (
                <button type="button" onClick={() => setExpanded(true)} className="text-xs font-semibold text-muted-foreground hover:text-primary hover:underline">
                    …voir plus
                </button>
            )}
        </div>
    )
}

function AuthorHeader({ author, createdAt, compact = false, menu }: { author: IConnectUser | null; createdAt: string; compact?: boolean; menu?: ReactNode }) {
    const subtitle = author?.title || author?.companyName
    return (
        <div className={cn("flex items-start gap-3 px-4", compact ? "pt-3" : "pt-4")}>
            <Link href={author ? profilePath(author.id) : "#"} className="shrink-0" aria-label={author ? `Profil de ${author.name}` : undefined}>
                <Avatar className={compact ? "h-9 w-9" : "h-12 w-12"}>
                    <AvatarImage src={author?.avatar ? formatFileUrl(author.avatar) : undefined} />
                    <AvatarFallback>{initials(author?.name)}</AvatarFallback>
                </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
                {author ? (
                    <Link href={profilePath(author.id)} className="text-sm font-semibold text-foreground hover:text-primary hover:underline">
                        {author.name}
                    </Link>
                ) : (
                    <span className="text-sm font-semibold text-foreground">Membre GORIYA</span>
                )}
                {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
                <p className="text-xs text-muted-foreground">{timeAgo(createdAt)}</p>
            </div>
            {menu}
        </div>
    )
}

function PostBody({ post }: { post: IPost }) {
    return (
        <div className="space-y-1 pt-2">
            {post.content && <PostText content={post.content} />}
            <PostAttachments attachments={post.attachments ?? []} />
        </div>
    )
}

function Unavailable() {
    return <div className="mx-4 mt-3 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">Cette publication n'est plus disponible.</div>
}

/**
 * Carte d'un post du fil, sur le modèle de LinkedIn : j'aime, commentaires,
 * republication (simple ou avec avis) et partage.
 */
export function PostCard({ post, defaultShowComments = false, onChange, onDelete, onReposted, readOnly = false }: PostCardProps) {
    const { user } = useAuth()
    const plain = isPlainRepost(post)
    // Sur une republication « nue », les actions visent le post d'origine.
    const target = plain && post.repostOf ? post.repostOf : post

    const [showComments, setShowComments] = useState(defaultShowComments)
    const [focusComment, setFocusComment] = useState(false)
    const [liking, setLiking] = useState(false)
    const [reposting, setReposting] = useState(false)
    const [repostOpen, setRepostOpen] = useState(false)
    const [repostComment, setRepostComment] = useState("")
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const updateTarget = (patch: Partial<IPost>) => {
        if (target === post) onChange({ ...post, ...patch })
        else if (post.repostOf) onChange({ ...post, repostOf: { ...post.repostOf, ...patch } })
    }

    const likes = target.likesCount ?? 0
    const comments = target.commentsCount ?? 0
    const reposts = target.repostsCount ?? 0
    const isOwner = !!user && post.author?.id === user.id
    const canRepost = !target.communityId && !(plain && post.repostOf === null)

    const toggleLike = async () => {
        if (liking) return
        const before = { likedByMe: target.likedByMe, likesCount: likes }
        updateTarget({ likedByMe: !before.likedByMe, likesCount: Math.max(0, likes + (before.likedByMe ? -1 : 1)) })
        setLiking(true)
        try {
            const res = await postService.toggleLike(target.id)
            updateTarget({ likedByMe: res.liked, likesCount: res.likesCount })
        } catch {
            updateTarget(before)
            toast.error("Votre réaction n'a pas pu être enregistrée.")
        } finally {
            setLiking(false)
        }
    }

    const repost = async (comment?: string) => {
        setReposting(true)
        try {
            const created = await postService.repost(target.id, comment)
            updateTarget({ repostsCount: reposts + 1, repostedByMe: true })
            onReposted?.(created)
            setRepostOpen(false)
            setRepostComment("")
            toast.success(comment?.trim() ? "Publication partagée avec votre avis." : "Publication republiée.")
        } catch (err: any) {
            toast.error(err?.message ?? "La republication a échoué.")
        } finally {
            setReposting(false)
        }
    }

    const shareUrl = () => `${window.location.origin}${postPath(target.id)}`

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl())
            toast.success("Lien de la publication copié.")
        } catch {
            toast.error("Impossible de copier le lien.")
        }
    }

    const nativeShare = async () => {
        if (!navigator.share) return copyLink()
        try {
            await navigator.share({ title: "Publication GORIYA Connect", text: target.content?.slice(0, 140) ?? undefined, url: shareUrl() })
        } catch {
            /* partage annulé */
        }
    }

    const remove = async () => {
        setDeleting(true)
        try {
            await postService.remove(post.id)
            onDelete(post.id)
            toast.success(plain ? "Republication retirée." : "Publication supprimée.")
        } catch (err: any) {
            toast.error(err?.message ?? "La suppression a échoué.")
        } finally {
            setDeleting(false)
            setConfirmDelete(false)
        }
    }

    const menu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full text-muted-foreground" aria-label="Plus d'actions">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={copyLink}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Copier le lien
                </DropdownMenuItem>
                {isOwner && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {plain ? "Retirer la republication" : "Supprimer la publication"}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )

    return (
        <Card className="overflow-hidden border border-border">
            {plain ? (
                <>
                    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
                        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                            <Repeat2 className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                                {post.author ? (
                                    <Link href={profilePath(post.author.id)} className="font-semibold text-foreground hover:text-primary hover:underline">
                                        {post.author.name}
                                    </Link>
                                ) : (
                                    "Un membre"
                                )}{" "}
                                a republié · {timeAgo(post.createdAt)}
                            </span>
                        </p>
                        {menu}
                    </div>
                    {post.repostOf ? (
                        <>
                            <AuthorHeader author={post.repostOf.author} createdAt={post.repostOf.createdAt} compact />
                            <PostBody post={post.repostOf} />
                        </>
                    ) : (
                        <div className="pb-3">
                            <Unavailable />
                        </div>
                    )}
                </>
            ) : (
                <>
                    <AuthorHeader author={post.author} createdAt={post.createdAt} menu={menu} />
                    <PostBody post={post} />
                    {post.repostOf !== undefined &&
                        (post.repostOf ? (
                            <div className="mx-4 mt-3 overflow-hidden rounded-lg border border-border pb-3">
                                <AuthorHeader author={post.repostOf.author} createdAt={post.repostOf.createdAt} compact />
                                <PostBody post={post.repostOf} />
                            </div>
                        ) : (
                            <Unavailable />
                        ))}
                </>
            )}

            {!readOnly && !(plain && post.repostOf === null) && (
                <>
                    {(likes > 0 || comments > 0 || reposts > 0) && (
                        <div className="mt-3 flex items-center justify-between gap-2 px-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                {likes > 0 && (
                                    <>
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2f6de6] text-white">
                                            <ThumbsUp className="h-2.5 w-2.5 fill-current" />
                                        </span>
                                        {likes}
                                    </>
                                )}
                            </span>
                            <span className="flex items-center gap-2">
                                {comments > 0 && (
                                    <button type="button" onClick={() => setShowComments((v) => !v)} className="hover:text-primary hover:underline">
                                        {plural(comments, "commentaire")}
                                    </button>
                                )}
                                {reposts > 0 && <span>{plural(reposts, "republication")}</span>}
                            </span>
                        </div>
                    )}

                    <div className="mx-4 mt-2 grid grid-cols-4 border-t border-border py-1">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={toggleLike}
                            aria-pressed={target.likedByMe}
                            className={cn("h-10 gap-1.5 px-1 text-xs font-semibold sm:text-sm", target.likedByMe ? "text-[#2f6de6] dark:text-primary" : "text-muted-foreground")}
                        >
                            <ThumbsUp className={cn("h-4 w-4", target.likedByMe && "fill-current")} />
                            <span className="hidden sm:inline">J'aime</span>
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setShowComments(true)
                                setFocusComment(true)
                            }}
                            className="h-10 gap-1.5 px-1 text-xs font-semibold text-muted-foreground sm:text-sm"
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden sm:inline">Commenter</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={!canRepost || reposting}
                                    className={cn("h-10 gap-1.5 px-1 text-xs font-semibold sm:text-sm", target.repostedByMe ? "text-emerald-600" : "text-muted-foreground")}
                                    title={canRepost ? undefined : "Les publications de communauté ne peuvent pas être republiées"}
                                >
                                    {reposting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat2 className="h-4 w-4" />}
                                    <span className="hidden sm:inline">Republier</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-72">
                                <DropdownMenuItem onClick={() => setRepostOpen(true)} className="items-start gap-3 py-2">
                                    <PenLine className="mt-0.5 h-4 w-4" />
                                    <span>
                                        <span className="block text-sm font-medium">Republier avec votre avis</span>
                                        <span className="block text-xs text-muted-foreground">Ajoutez un commentaire à la publication</span>
                                    </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => repost()} className="items-start gap-3 py-2">
                                    <Repeat2 className="mt-0.5 h-4 w-4" />
                                    <span>
                                        <span className="block text-sm font-medium">Republier</span>
                                        <span className="block text-xs text-muted-foreground">Partagez-la instantanément avec votre réseau</span>
                                    </span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="ghost" className="h-10 gap-1.5 px-1 text-xs font-semibold text-muted-foreground sm:text-sm">
                                    <Send className="h-4 w-4" />
                                    <span className="hidden sm:inline">Partager</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={copyLink}>
                                    <Link2 className="mr-2 h-4 w-4" />
                                    Copier le lien
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={nativeShare}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Partager via…
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl())}`, "_blank", "noopener,noreferrer")}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Envoyer sur WhatsApp
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {showComments && (
                        <PostComments
                            postId={target.id}
                            postAuthorId={target.author?.id}
                            currentUser={user}
                            autoFocus={focusComment}
                            onCountChange={(delta) => updateTarget({ commentsCount: Math.max(0, comments + delta) })}
                        />
                    )}
                </>
            )}

            <Dialog open={repostOpen} onOpenChange={setRepostOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Republier avec votre avis</DialogTitle>
                        <DialogDescription>Votre commentaire apparaîtra au-dessus de la publication d'origine.</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={repostComment}
                        onChange={(e) => setRepostComment(e.target.value)}
                        maxLength={POST_MAX_LENGTH}
                        placeholder="Qu'en pensez-vous ?"
                        className="min-h-[100px]"
                        autoFocus
                    />
                    <div className="max-h-64 overflow-y-auto rounded-lg border border-border pb-3">
                        <AuthorHeader author={target.author} createdAt={target.createdAt} compact />
                        <PostBody post={target} />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRepostOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={() => repost(repostComment)} disabled={reposting} className="rounded-full bg-brand-gradient text-white hover:bg-brand-gradient-hover">
                            {reposting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                            Publier
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{plain ? "Retirer la republication ?" : "Supprimer la publication ?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {plain
                                ? "La publication d'origine reste en ligne ; elle disparaît seulement de votre activité."
                                : "La publication, ses commentaires et ses pièces jointes seront définitivement supprimés."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={remove} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {plain ? "Retirer" : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}
