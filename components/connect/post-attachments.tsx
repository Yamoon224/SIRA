"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { IPostAttachment } from "@/lib/api/connect.service"
import { cn, formatFileUrl } from "@/lib/utils"
import { formatBytes } from "./feed-format"

/**
 * Pièces jointes d'un post, rendues comme sur LinkedIn : mosaïque d'images
 * (visionneuse au clic) ou document PDF avec aperçu intégré.
 */
export function PostAttachments({ attachments }: { attachments: IPostAttachment[] }) {
    const images = attachments.filter((attachment) => attachment.type === "IMAGE")
    const documents = attachments.filter((attachment) => attachment.type === "DOCUMENT")
    const [viewerIndex, setViewerIndex] = useState<number | null>(null)

    if (attachments.length === 0) return null

    const visibles = images.slice(0, 4)
    const hidden = images.length - visibles.length

    return (
        <div className="mt-3 space-y-2">
            {images.length > 0 && (
                <div className={cn("grid gap-0.5 overflow-hidden bg-muted", images.length > 1 && "grid-cols-2")}>
                    {visibles.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            onClick={() => setViewerIndex(index)}
                            aria-label={`Agrandir l'image ${index + 1} sur ${images.length}`}
                            className={cn(
                                "relative block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                images.length === 1 && "max-h-[560px]",
                                images.length === 2 && "aspect-square",
                                images.length === 3 && (index === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"),
                                images.length >= 4 && "aspect-square",
                            )}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={formatFileUrl(image.url)}
                                alt={image.name}
                                loading="lazy"
                                className={cn("h-full w-full", images.length === 1 ? "max-h-[560px] object-contain" : "object-cover")}
                            />
                            {index === visibles.length - 1 && hidden > 0 && (
                                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-semibold text-white">
                                    +{hidden}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {documents.map((document) => (
                <div key={document.id} className="mx-4 overflow-hidden rounded-lg border border-border">
                    <div className="flex items-center gap-3 bg-muted/60 px-3 py-2">
                        <FileText className="h-8 w-8 shrink-0 text-red-600" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{document.name}</p>
                            <p className="text-xs text-muted-foreground">PDF{document.size ? ` · ${formatBytes(document.size)}` : ""}</p>
                        </div>
                        <Button asChild size="sm" variant="outline" className="h-8 shrink-0 gap-1.5 rounded-full text-xs">
                            <a href={formatFileUrl(document.url)} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                                Ouvrir
                            </a>
                        </Button>
                    </div>
                    {/* Aperçu intégré sur écran large ; sur mobile, les navigateurs
                        n'affichent pas les PDF en ligne : le bouton « Ouvrir » suffit. */}
                    <object data={formatFileUrl(document.url)} type="application/pdf" className="hidden h-[440px] w-full sm:block" aria-label={`Aperçu de ${document.name}`}>
                        <p className="p-6 text-center text-sm text-muted-foreground">
                            Aperçu indisponible dans ce navigateur —{" "}
                            <a href={formatFileUrl(document.url)} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                                ouvrir le PDF
                            </a>
                            .
                        </p>
                    </object>
                </div>
            ))}

            <Dialog open={viewerIndex !== null} onOpenChange={(open) => !open && setViewerIndex(null)}>
                <DialogContent className="max-w-5xl border-0 bg-black p-0 text-white sm:rounded-xl">
                    <DialogTitle className="sr-only">Images de la publication</DialogTitle>
                    {viewerIndex !== null && images[viewerIndex] && (
                        <div className="relative flex min-h-[50vh] items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={formatFileUrl(images[viewerIndex].url)} alt={images[viewerIndex].name} className="max-h-[85vh] w-auto max-w-full object-contain" />
                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setViewerIndex((i) => ((i ?? 0) - 1 + images.length) % images.length)}
                                        className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/30"
                                        aria-label="Image précédente"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewerIndex((i) => ((i ?? 0) + 1) % images.length)}
                                        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/30"
                                        aria-label="Image suivante"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs">
                                        {viewerIndex + 1} / {images.length}
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
