"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Download,
    FilePlus2,
    FileText,
    Loader2,
    Pencil,
    Sparkles,
    Star,
    Trash2,
    Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/layout/page-header"
import { cvService, type CvDraft } from "@/lib/api/cv.service"
import { brouillonNonVide, formatDerniereSauvegarde } from "@/lib/cv-draft"
import {
    RESUME_ACCEPT,
    RESUME_MAX_SIZE_BYTES,
    resumeService,
    type IResume,
} from "@/lib/api/resume.service"
import { LIBELLE_SOURCE, formatDateCourte, formatTailleFichier } from "@/lib/resume"

/** Aligné sur UserResumeService::MAX_PER_USER côté backend. */
const MAX_CV = 10

/** Les réponses de l'API sont encapsulées dans `data` (JsonResource). */
const contenu = <T,>(reponse: unknown): T => ((reponse as any)?.data ?? reponse) as T

/**
 * « Mes CV » : la bibliothèque du candidat, qu'il s'agisse d'un CV construit
 * avec le créateur de Goriya ou d'un fichier qu'il a déposé. C'est cette liste
 * que propose le wizard de candidature, d'où le CV par défaut marqué ici.
 */
export default function MesCvPage() {
    const router = useRouter()

    const [cvs, setCvs] = useState<IResume[]>([])
    const [chargement, setChargement] = useState(true)
    const [televersement, setTeleversement] = useState(false)
    /** Brouillon du créateur de CV, `null` s'il n'y a rien à reprendre. */
    const [brouillon, setBrouillon] = useState<CvDraft | null>(null)

    const [aRenommer, setARenommer] = useState<IResume | null>(null)
    const [nouveauNom, setNouveauNom] = useState("")
    const [renommage, setRenommage] = useState(false)
    const [aSupprimer, setASupprimer] = useState<IResume | null>(null)

    const inputFichier = useRef<HTMLInputElement>(null)

    useEffect(() => {
        let annule = false

        Promise.all([
            resumeService.list().catch(() => null),
            // Le brouillon du créateur de CV n'est pas un fichier : il est
            // présenté à part, au-dessus de la bibliothèque.
            cvService.get().catch(() => null),
        ])
            .then(([liste, draft]) => {
                if (annule) return
                const items = contenu<IResume[]>(liste)
                setCvs(Array.isArray(items) ? items : [])
                // La ligne est créée par le GET : seul le contenu dit s'il y a
                // quelque chose à reprendre.
                if (brouillonNonVide(draft?.data)) setBrouillon(draft?.data ?? null)
            })
            .finally(() => {
                if (!annule) setChargement(false)
            })

        return () => {
            annule = true
        }
    }, [])

    const recharger = async (repli: IResume[]) => {
        const liste = contenu<IResume[]>(await resumeService.list())
        setCvs(Array.isArray(liste) ? liste : repli)
    }

    const televerser = useCallback(async (fichier: File) => {
        if (fichier.size > RESUME_MAX_SIZE_BYTES) {
            toast.error("Le CV ne doit pas dépasser 5 Mo.")
            return
        }

        setTeleversement(true)
        try {
            const cv = contenu<IResume>(await resumeService.upload(fichier))
            // Le backend a pu marquer ce CV par défaut (premier de la
            // bibliothèque) : on relit la liste plutôt que de deviner l'état.
            await recharger([cv])
            toast.success("CV ajouté.")
        } catch (err: any) {
            toast.error(err?.message ?? "Le téléversement du CV a échoué.")
        } finally {
            setTeleversement(false)
            if (inputFichier.current) inputFichier.current.value = ""
        }
    }, [])

    const definirParDefaut = async (cv: IResume) => {
        const precedente = cvs
        setCvs((prev) => prev.map((item) => ({ ...item, isDefault: item.id === cv.id })))
        try {
            await resumeService.update(cv.id, { isDefault: true })
            toast.success(`« ${cv.name} » est ton CV par défaut.`)
        } catch (err: any) {
            setCvs(precedente)
            toast.error(err?.message ?? "La mise à jour du CV a échoué.")
        }
    }

    const renommer = async () => {
        if (!aRenommer) return
        const nom = nouveauNom.trim()
        if (!nom) return

        setRenommage(true)
        try {
            await resumeService.update(aRenommer.id, { name: nom })
            setCvs((prev) => prev.map((item) => (item.id === aRenommer.id ? { ...item, name: nom } : item)))
            setARenommer(null)
            toast.success("CV renommé.")
        } catch (err: any) {
            toast.error(err?.message ?? "Le renommage du CV a échoué.")
        } finally {
            setRenommage(false)
        }
    }

    const supprimer = async (cv: IResume) => {
        const precedente = cvs
        setCvs((prev) => prev.filter((item) => item.id !== cv.id))
        setASupprimer(null)
        try {
            await resumeService.remove(cv.id)
            // Supprimer le CV par défaut en promeut un autre côté backend.
            await recharger(precedente.filter((item) => item.id !== cv.id))
            toast.success("CV supprimé.")
        } catch (err: any) {
            setCvs(precedente)
            toast.error(err?.message ?? "La suppression du CV a échoué.")
        }
    }

    const bibliothequePleine = cvs.length >= MAX_CV

    const boutonAjouter = (
        <Button
            className="h-9 rounded-full bg-brand-gradient text-[12px] text-white hover:bg-brand-gradient-hover"
            disabled={televersement || bibliothequePleine}
            onClick={() => inputFichier.current?.click()}
        >
            {televersement ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
                <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            Ajouter un CV
        </Button>
    )

    const boutonCreer = (
        <Button variant="outline" className="h-9 rounded-full text-[12px]" onClick={() => router.push("/creer-cv")}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Créer un CV
        </Button>
    )

    return (
        <div className="bg-white dark:bg-background">
            <div className="mx-auto max-w-4xl">
                <PageHeader
                    title="Mes CV"
                    description={`Les CV créés sur Goriya ou ajoutés depuis ton appareil (${cvs.length}/${MAX_CV}). Le CV par défaut est celui proposé quand tu postules.`}
                    actions={
                        <>
                            {boutonCreer}
                            {boutonAjouter}
                        </>
                    }
                />

                <input
                    ref={inputFichier}
                    type="file"
                    accept={RESUME_ACCEPT}
                    className="hidden"
                    onChange={(e) => {
                        const fichier = e.target.files?.[0]
                        if (fichier) televerser(fichier)
                    }}
                />

                {brouillon && (
                    <Card className="mb-6 border-[#dfe5f1] dark:border-border bg-[#f8faff] dark:bg-card">
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eff4ff] dark:bg-primary/10">
                                    <FilePlus2 className="h-5 w-5 text-[#2f6de6] dark:text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] font-semibold text-[#1b2331] dark:text-foreground">
                                        CV en cours de création
                                    </p>
                                    <p className="text-[11px] text-[#7f8796] dark:text-muted-foreground">
                                        {brouillon.updatedAt
                                            ? `Brouillon modifié ${formatDerniereSauvegarde(brouillon.updatedAt)}`
                                            : "Brouillon non terminé"}{" "}
                                        - enregistre-le depuis le créateur pour pouvoir le joindre à une candidature.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="h-8 shrink-0 rounded-full text-[12px]"
                                onClick={() => router.push("/creer-cv")}
                            >
                                Reprendre
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {chargement ? (
                    <div className="space-y-3">
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} className="h-[76px] w-full rounded-xl" />
                        ))}
                    </div>
                ) : cvs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#dfe5f1] dark:border-border p-10 text-center">
                        <FileText className="mx-auto mb-3 h-8 w-8 text-[#9aa3b2] dark:text-muted-foreground" />
                        <p className="text-[13px] font-medium text-[#1b2331] dark:text-foreground">
                            Aucun CV pour le moment
                        </p>
                        <p className="mx-auto mt-1 max-w-md text-[12px] text-[#7f8796] dark:text-muted-foreground">
                            Crée ton CV avec Goriya ou ajoute un fichier PDF ou Word : il te sera proposé
                            automatiquement à chaque candidature.
                        </p>
                        <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
                            {boutonCreer}
                            {boutonAjouter}
                        </div>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {cvs.map((cv) => (
                            <li key={cv.id}>
                                <Card className="border-[#e8edf6] dark:border-border transition-shadow hover:shadow-md">
                                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eff4ff] dark:bg-primary/10">
                                                <FileText className="h-5 w-5 text-[#2f6de6] dark:text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate text-[13px] font-semibold text-[#1b2331] dark:text-foreground">
                                                        {cv.name}
                                                    </p>
                                                    {cv.isDefault && (
                                                        <Badge className="gap-1 border-transparent bg-[#eff4ff] px-2 py-0.5 text-[10px] text-[#2f6de6] hover:bg-[#eff4ff] dark:bg-primary/10 dark:text-primary">
                                                            <Star className="h-3 w-3 fill-current" />
                                                            Par défaut
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-[11px] text-[#7f8796] dark:text-muted-foreground">
                                                    {[
                                                        LIBELLE_SOURCE[cv.source] ?? LIBELLE_SOURCE.upload,
                                                        formatDateCourte(cv.createdAt),
                                                        formatTailleFichier(cv.size),
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap items-center gap-1">
                                            {!cv.isDefault && (
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 rounded-full px-3 text-[11px] text-[#5b6474] dark:text-muted-foreground"
                                                    onClick={() => definirParDefaut(cv)}
                                                >
                                                    <Star className="mr-1.5 h-3.5 w-3.5" />
                                                    Par défaut
                                                </Button>
                                            )}
                                            {cv.source === "builder" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full text-[#5b6474] dark:text-muted-foreground"
                                                    aria-label={`Modifier ${cv.name} dans le créateur de CV`}
                                                    title="Modifier dans le créateur de CV"
                                                    onClick={() => router.push("/creer-cv")}
                                                >
                                                    <Sparkles className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {cv.url && (
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full text-[#5b6474] dark:text-muted-foreground"
                                                >
                                                    <a
                                                        href={cv.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={`Ouvrir ${cv.name}`}
                                                        title="Ouvrir"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-[#5b6474] dark:text-muted-foreground"
                                                aria-label={`Renommer ${cv.name}`}
                                                title="Renommer"
                                                onClick={() => {
                                                    setARenommer(cv)
                                                    setNouveauNom(cv.name)
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-[#5b6474] transition-colors hover:text-destructive dark:text-muted-foreground"
                                                aria-label={`Supprimer ${cv.name}`}
                                                title="Supprimer"
                                                onClick={() => setASupprimer(cv)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </li>
                        ))}
                    </ul>
                )}

                {!chargement && (
                    <p className="mt-4 text-[11px] text-[#9aa3b2] dark:text-muted-foreground">
                        PDF ou Word, 5 Mo maximum, {MAX_CV} CV au plus.
                        {bibliothequePleine ? " Supprime un CV avant d'en ajouter un autre." : ""}
                    </p>
                )}

                <Dialog open={!!aRenommer} onOpenChange={(ouvert) => !ouvert && setARenommer(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Renommer le CV</DialogTitle>
                            <DialogDescription>
                                Ce nom n'est visible que par toi : il t'aide à choisir le bon CV au moment de postuler.
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            value={nouveauNom}
                            onChange={(e) => setNouveauNom(e.target.value)}
                            placeholder="CV développeur web"
                            maxLength={255}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") renommer()
                            }}
                        />
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setARenommer(null)}>
                                Annuler
                            </Button>
                            <Button onClick={renommer} disabled={renommage || !nouveauNom.trim()}>
                                {renommage && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                Renommer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!aSupprimer} onOpenChange={(ouvert) => !ouvert && setASupprimer(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce CV ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                « {aSupprimer?.name} » sera retiré de ta bibliothèque. Les candidatures déjà envoyées
                                avec ce CV ne sont pas modifiées.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-[#e0685f] hover:bg-[#cc5a51]"
                                onClick={() => aSupprimer && supprimer(aSupprimer)}
                            >
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
