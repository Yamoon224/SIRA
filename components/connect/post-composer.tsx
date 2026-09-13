"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { FileText, ImageIcon, Loader2, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import {
    POST_DOCUMENT_TYPES,
    POST_IMAGE_TYPES,
    POST_MAX_DOCUMENT_BYTES,
    POST_MAX_IMAGE_BYTES,
    POST_MAX_IMAGES,
    POST_MAX_LENGTH,
    postService,
    type IPost,
} from "@/lib/api/connect.service"
import { cn, formatFileUrl } from "@/lib/utils"
import { formatBytes, initials } from "./feed-format"

interface ImageDraft {
    file: File
    preview: string
}

/**
 * Zone « Commencer un post » : texte, jusqu'à 9 images ou un PDF seul - les
 * mêmes règles que PostService côté backend, vérifiées ici pour répondre
 * avant l'envoi.
 */
export function PostComposer({ onPublished }: { onPublished: (post: IPost) => void }) {
    const { user } = useAuth()
    const [content, setContent] = useState("")
    const [images, setImages] = useState<ImageDraft[]>([])
    const [document, setDocument] = useState<File | null>(null)
    const [publishing, setPublishing] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const imageInput = useRef<HTMLInputElement>(null)
    const documentInput = useRef<HTMLInputElement>(null)

    // Les aperçus sont des URL blob : à libérer, y compris au démontage.
    const imagesRef = useRef<ImageDraft[]>([])
    imagesRef.current = images
    useEffect(() => () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview)), [])

    const addImages = (files: FileList | null) => {
        if (!files?.length) return
        if (document) {
            toast.error("Un PDF se publie seul : retirez-le pour ajouter des images.")
            return
        }

        const valid: File[] = []
        Array.from(files).forEach((file) => {
            if (!POST_IMAGE_TYPES.includes(file.type)) {
                toast.error(`« ${file.name} » : format non pris en charge (JPG, PNG, WebP ou GIF).`)
            } else if (file.size > POST_MAX_IMAGE_BYTES) {
                toast.error(`« ${file.name} » dépasse 8 Mo.`)
            } else {
                valid.push(file)
            }
        })

        const room = POST_MAX_IMAGES - images.length
        if (valid.length > room) toast.error(`${POST_MAX_IMAGES} images au maximum par publication.`)
        setImages((prev) => [...prev, ...valid.slice(0, Math.max(0, room)).map((file) => ({ file, preview: URL.createObjectURL(file) }))])
        setExpanded(true)
    }

    const addDocument = (files: FileList | null) => {
        const file = files?.[0]
        if (!file) return
        if (images.length > 0) {
            toast.error("Un PDF se publie seul : retirez les images pour joindre un document.")
            return
        }
        if (!POST_DOCUMENT_TYPES.includes(file.type)) {
            toast.error("Seuls les documents PDF peuvent être joints.")
            return
        }
        if (file.size > POST_MAX_DOCUMENT_BYTES) {
            toast.error("Le PDF ne doit pas dépasser 10 Mo.")
            return
        }
        setDocument(file)
        setExpanded(true)
    }

    const removeImage = (index: number) => {
        setImages((prev) => {
            URL.revokeObjectURL(prev[index].preview)
            return prev.filter((_, i) => i !== index)
        })
    }

    const reset = () => {
        images.forEach((image) => URL.revokeObjectURL(image.preview))
        setImages([])
        setDocument(null)
        setContent("")
        setExpanded(false)
    }

    const tooLong = content.length > POST_MAX_LENGTH
    const canPublish = !publishing && !tooLong && (content.trim() !== "" || images.length > 0 || document !== null)

    const publish = async () => {
        if (!canPublish) return
        setPublishing(true)
        try {
            const post = await postService.create({ content, files: document ? [document] : images.map((image) => image.file) })
            onPublished(post)
            reset()
            toast.success("Publication partagée.")
        } catch (err: any) {
            toast.error(err?.message ?? "La publication a échoué.")
        } finally {
            setPublishing(false)
        }
    }

    return (
        <Card className="border border-border">
            <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11 shrink-0">
                        <AvatarImage src={user?.avatar ? formatFileUrl(user.avatar) : undefined} />
                        <AvatarFallback>{initials(user?.name)}</AvatarFallback>
                    </Avatar>
                    {/* Même arrondi replié ou déplié : un `rounded-full` sur un textarea
                        de plusieurs lignes le déformait en ellipse jusqu'au focus. */}
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setExpanded(true)}
                        placeholder="Commencer un post…"
                        aria-label="Contenu de la publication"
                        className={cn(
                            "resize-none rounded-2xl px-4 py-3 text-sm transition-[min-height]",
                            expanded ? "min-h-[110px]" : "min-h-[48px]",
                        )}
                    />
                </div>

                {images.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {images.map((image, index) => (
                            <div key={image.preview} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={image.preview} alt={image.file.name} className="h-full w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                                    aria-label={`Retirer ${image.file.name}`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {document && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2">
                        <FileText className="h-7 w-7 shrink-0 text-red-600" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{document.name}</p>
                            <p className="text-xs text-muted-foreground">PDF · {formatBytes(document.size)}</p>
                        </div>
                        <button type="button" onClick={() => setDocument(null)} className="rounded-full p-1 text-muted-foreground hover:text-foreground" aria-label="Retirer le document">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <input
                    ref={imageInput}
                    type="file"
                    accept={POST_IMAGE_TYPES.join(",")}
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        addImages(e.target.files)
                        e.target.value = ""
                    }}
                />
                <input
                    ref={documentInput}
                    type="file"
                    accept={POST_DOCUMENT_TYPES.join(",")}
                    className="hidden"
                    onChange={(e) => {
                        addDocument(e.target.files)
                        e.target.value = ""
                    }}
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => imageInput.current?.click()}
                            disabled={publishing || !!document || images.length >= POST_MAX_IMAGES}
                            className="gap-1.5 text-muted-foreground"
                        >
                            <ImageIcon className="h-4 w-4 text-sky-600" />
                            Photo
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => documentInput.current?.click()}
                            disabled={publishing || images.length > 0 || !!document}
                            className="gap-1.5 text-muted-foreground"
                        >
                            <FileText className="h-4 w-4 text-orange-600" />
                            Document PDF
                        </Button>
                    </div>
                    <div className="flex items-center gap-3">
                        {content.length > POST_MAX_LENGTH - 300 && (
                            <span className={cn("text-xs tabular-nums", tooLong ? "text-destructive" : "text-muted-foreground")}>
                                {content.length}/{POST_MAX_LENGTH}
                            </span>
                        )}
                        {expanded && !publishing && (content || images.length > 0 || document) && (
                            <Button type="button" variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
                                Annuler
                            </Button>
                        )}
                        <Button type="button" size="sm" onClick={publish} disabled={!canPublish} className="rounded-full bg-brand-gradient px-5 text-white hover:bg-brand-gradient-hover">
                            {publishing && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                            Publier
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
