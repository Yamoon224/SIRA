"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Edit, Eye, FolderOpen, Globe2, Link2, Loader2, Lock, Mail, MapPin, Pencil, Phone, Plus, RotateCcw, Share2, Users } from "lucide-react"
import { userService } from "@/lib/api/user.service"
import { portfolioService } from "@/lib/api/portfolio.service"
import type { IPortfolio } from "@/lib/@types/entities"
import {
    PROFILE_SLUG_PATTERN,
    profilePath,
    publicProfileService,
    slugify,
    type IPublicProfile,
    type ProfileTheme,
} from "@/lib/api/public-profile.service"
import { useAuth } from "@/contexts/auth-context"
import { CvProfileSections } from "@/components/cv-profile-sections"
import { FormationsBottomNav, FROM_FORMATIONS_PARAM } from "@/app/(protected)/formations/_components/formations-nav"
import { capitalizeFirst, formatFileUrl } from "@/lib/utils"

const THEME_LABELS: Record<ProfileTheme, string> = {
    DEFAULT: "Par défaut",
    CREATIF: "Créatif",
    TECHNIQUE: "Technique",
    COMMERCIAL: "Commercial",
    ACADEMIQUE: "Académique",
}

type SavingKey = "slug" | "reset" | "visibility" | "theme"

/**
 * Gestion du profil public, sur le modèle de LinkedIn : URL personnalisée (ou
 * identifiant par défaut), visibilité hors connexion, thème, et aperçu des
 * deux modes de lecture (éditeur / visiteur).
 */
function PublicProfileCard({ suggestedName }: { suggestedName: string }) {
    const [profile, setProfile] = useState<IPublicProfile | null>(null)
    const [loadError, setLoadError] = useState(false)
    const [slugInput, setSlugInput] = useState("")
    const [saving, setSaving] = useState<SavingKey | null>(null)
    const [origin, setOrigin] = useState("https://goriya.net")

    useEffect(() => {
        setOrigin(window.location.origin)
        publicProfileService
            .me()
            .then((res) => {
                const p = ((res as any)?.data?.ref ? (res as any).data : res) as IPublicProfile
                setProfile(p)
                setSlugInput(p.slug ?? "")
            })
            .catch(() => setLoadError(true))
    }, [])

    const run = async (key: SavingKey, action: () => Promise<unknown>, success: string) => {
        setSaving(key)
        try {
            const res = await action()
            const p = ((res as any)?.data?.ref ? (res as any).data : res) as IPublicProfile
            setProfile(p)
            setSlugInput(p.slug ?? "")
            toast.success(success)
        } catch (err: any) {
            toast.error(err?.message ?? "La mise à jour du profil public a échoué.")
        } finally {
            setSaving(null)
        }
    }

    if (loadError) {
        return (
            <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">Le profil public n'a pas pu être chargé. Réessaie plus tard.</CardContent>
            </Card>
        )
    }

    if (!profile) {
        return (
            <Card>
                <CardContent className="flex justify-center p-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    const url = `${origin}${profilePath(profile.ref)}`
    const host = origin.replace(/^https?:\/\//, "")
    const normalized = slugInput.trim().toLowerCase()
    const slugError =
        normalized === ""
            ? null
            : normalized.length < 3
              ? "3 caractères minimum."
              : !PROFILE_SLUG_PATTERN.test(normalized)
                ? "Lettres minuscules, chiffres et tirets simples uniquement (ex. awa-kone)."
                : null
    const slugChanged = normalized !== (profile.slug ?? "")
    const suggestion = slugify(suggestedName)

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            toast.success("Lien du profil copié.")
        } catch {
            toast.error("Impossible de copier le lien.")
        }
    }

    const share = async () => {
        if (!navigator.share) return copy()
        try {
            await navigator.share({ title: `${suggestedName} sur GORIYA`, url })
        } catch {
            /* partage annulé */
        }
    }

    return (
        <Card id="profil-public" className="scroll-mt-24">
            <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                        <Globe2 className="h-5 w-5" />
                        Profil Public GORIYA
                    </span>
                    <Badge variant={profile.isPublic ? "default" : "secondary"} className="gap-1">
                        {profile.isPublic ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {profile.isPublic ? "Public" : "Membres uniquement"}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <section>
                    <p className="text-sm font-medium">Votre URL publique</p>
                    <p className="text-xs text-muted-foreground">
                        Partagez ce lien : il ouvre votre profil en mode éditeur quand c'est vous qui êtes connecté, en vue membre ou visiteur pour les autres.
                    </p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate text-sm text-foreground">{url}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={copy} className="gap-1.5">
                                <Copy className="h-4 w-4" />
                                Copier
                            </Button>
                            <Button variant="outline" size="sm" onClick={share} className="gap-1.5">
                                <Share2 className="h-4 w-4" />
                                Partager
                            </Button>
                        </div>
                    </div>
                </section>

                <section>
                    <Label htmlFor="profile-slug">URL personnalisée</Label>
                    <p className="text-xs text-muted-foreground">
                        {profile.hasCustomUrl
                            ? "Votre identifiant membre reste valable : les liens déjà partagés redirigent vers cette URL."
                            : "Sans URL personnalisée, votre profil s'ouvre avec votre identifiant membre par défaut."}
                    </p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <div className="flex min-w-0 flex-1 items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                            <span className="whitespace-nowrap pl-3 text-sm text-muted-foreground">{host}/p/</span>
                            <input
                                id="profile-slug"
                                value={slugInput}
                                onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                                placeholder={suggestion || "prenom-nom"}
                                maxLength={100}
                                aria-invalid={!!slugError}
                                className="h-10 min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
                            />
                        </div>
                        <Button
                            onClick={() => run("slug", () => publicProfileService.update({ slug: normalized }), "URL personnalisée enregistrée.")}
                            disabled={!normalized || !!slugError || !slugChanged || saving !== null}
                        >
                            {saving === "slug" && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                            Enregistrer
                        </Button>
                    </div>
                    {slugError && <p className="mt-1 text-xs text-destructive">{slugError}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        {!slugInput && suggestion && (
                            <button type="button" onClick={() => setSlugInput(suggestion)} className="text-xs font-medium text-primary hover:underline">
                                Utiliser « {suggestion} »
                            </button>
                        )}
                        {profile.hasCustomUrl && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 text-muted-foreground"
                                disabled={saving !== null}
                                onClick={() => run("reset", () => publicProfileService.update({ slug: null }), "Identifiant par défaut rétabli.")}
                            >
                                {saving === "reset" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                                Revenir à l'identifiant par défaut
                            </Button>
                        )}
                    </div>
                </section>

                <section className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                    <div>
                        <p className="text-sm font-medium">Visible sans connexion</p>
                        <p className="text-xs text-muted-foreground">
                            Activé : toute personne disposant du lien voit votre profil (vue publique). Désactivé : seuls les membres connectés de GORIYA peuvent le consulter.
                            Vos coordonnées ne sont jamais montrées aux autres.
                        </p>
                    </div>
                    <Switch
                        checked={profile.isPublic}
                        disabled={saving !== null}
                        aria-label="Profil visible sans connexion"
                        onCheckedChange={(isPublic) =>
                            run("visibility", () => publicProfileService.update({ isPublic }), isPublic ? "Votre profil est désormais public." : "Votre profil est réservé aux membres.")
                        }
                    />
                </section>

                <section>
                    <p className="mb-1 text-sm font-medium">Thème</p>
                    <Select
                        value={profile.theme}
                        onValueChange={(theme) => run("theme", () => publicProfileService.update({ theme: theme as ProfileTheme }), "Thème mis à jour.")}
                        disabled={saving !== null}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(THEME_LABELS) as ProfileTheme[]).map((t) => (
                                <SelectItem key={t} value={t}>
                                    {THEME_LABELS[t]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </section>

                <section className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild variant="outline" className="flex-1 gap-1.5">
                        <Link href={profilePath(profile.ref)}>
                            <Pencil className="h-4 w-4" />
                            Ouvrir en mode éditeur
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 gap-1.5">
                        <Link href={`${profilePath(profile.ref)}?vue=publique`}>
                            <Eye className="h-4 w-4" />
                            Voir comme un visiteur
                        </Link>
                    </Button>
                </section>
            </CardContent>
        </Card>
    )
}

interface ProfileData {
    name: string
    title: string
    location: string
    email: string
    phone: string
    avatar: string
    bio: string
}

function buildProfile(apiData: any, authUser: { name?: string; email?: string; avatar?: string | null } | null): ProfileData {
    return {
        name: (apiData?.name || authUser?.name || "").trim(),
        title: apiData?.title || "",
        location: apiData?.location || "",
        email: apiData?.email || authUser?.email || "",
        phone: apiData?.phone || "",
        avatar: apiData?.avatar || authUser?.avatar || "",
        bio: apiData?.bio || "",
    }
}

const initialsOf = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

export default function ProfilePage() {
    const { user } = useAuth()
    const router = useRouter()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [portfolios, setPortfolios] = useState<IPortfolio[]>([])
    const [portfoliosLoading, setPortfoliosLoading] = useState(true)
    // Arrivée depuis l'onglet « Profil » du module Formation : on garde sa
    // barre du bas pour pouvoir revenir aux cours. Lu dans un effet plutôt
    // qu'avec useSearchParams, qui imposerait une frontière Suspense.
    const [fromFormations, setFromFormations] = useState(false)

    useEffect(() => {
        setFromFormations(window.location.search.includes(FROM_FORMATIONS_PARAM))
    }, [])

    useEffect(() => {
        userService
            .getProfile()
            .then((response: any) => setProfile(buildProfile(response?.data ?? response, user)))
            .catch((error) => {
                console.error("Erreur lors du chargement du profil:", error)
                setProfile(buildProfile(null, user))
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])

    // Uniquement les portfolios du membre (brouillons compris) : sans `userId`,
    // l'API renvoyait les portfolios de tout le monde.
    useEffect(() => {
        if (!user?.id) return
        portfolioService
            .getPortfolios({ page: 1, limit: 3, userId: user.id })
            .then((res: any) => {
                const payload = res?.data ?? res
                const items = Array.isArray(payload) ? payload : (payload?.data ?? [])
                setPortfolios(Array.isArray(items) ? items : [])
            })
            .catch((err) => console.error("[profil] portfolios load error:", err))
            .finally(() => setPortfoliosLoading(false))
    }, [user?.id])

    if (!profile) {
        return (
            <div>
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
                    <div className="space-y-4">
                        <div className="h-32 bg-muted rounded"></div>
                        <div className="h-32 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`mx-auto max-w-4xl space-y-6 ${fromFormations ? "pb-24 lg:pb-0" : ""}`}>
            {fromFormations && <FormationsBottomNav pathname="/profil" />}

            {/* Profile Header */}
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                            <Avatar className="h-20 w-20 flex-shrink-0 sm:h-24 sm:w-24">
                                <AvatarImage src={profile.avatar ? formatFileUrl(profile.avatar) : undefined} />
                                <AvatarFallback className="text-2xl">{initialsOf(profile.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="mb-1 text-xl font-bold text-foreground sm:text-2xl">{profile.name}</h1>
                                {profile.title ? (
                                    <p className="mb-2 text-base text-muted-foreground sm:text-lg">{profile.title}</p>
                                ) : (
                                    <button onClick={() => router.push("/parametres")} className="mb-2 text-sm text-blue-600 hover:underline">
                                        Ajouter un titre professionnel
                                    </button>
                                )}
                                <div className="mb-2 flex items-center text-muted-foreground">
                                    <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                                    {profile.location ? (
                                        capitalizeFirst(profile.location)
                                    ) : (
                                        <button onClick={() => router.push("/parametres")} className="text-sm text-blue-600 hover:underline">
                                            Ajouter ma localisation
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Mail className="mr-1 h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{profile.email}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="mr-1 h-4 w-4 flex-shrink-0" />
                                        {profile.phone || (
                                            <button onClick={() => router.push("/parametres")} className="text-blue-600 hover:underline">
                                                Ajouter un numéro
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto">
                            <Button variant="outline" onClick={() => router.push("/parametres")} className="w-full sm:w-auto">
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier le profil
                            </Button>
                            {user?.id && (
                                <Button asChild variant="ghost" className="w-full gap-1.5 sm:w-auto">
                                    <Link href={profilePath(user.id)}>
                                        <Users className="h-4 w-4" />
                                        Voir mon profil public
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                    {profile.bio ? (
                        <p className="whitespace-pre-line text-foreground">{profile.bio}</p>
                    ) : (
                        <button onClick={() => router.push("/parametres")} className="text-sm text-blue-600 hover:underline">
                            Ajouter une bio professionnelle
                        </button>
                    )}
                </CardContent>
            </Card>

            <CvProfileSections />

            {/* Portfolio Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                        <span>Portfolio</span>
                        <div className="flex items-center gap-1">
                            {portfolios.length > 0 && (
                                <Button variant="ghost" size="sm" onClick={() => router.push("/portfolio")}>
                                    Tout voir
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => router.push("/portfolio/creer")} aria-label="Créer un portfolio">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {portfoliosLoading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : portfolios.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-6 text-center">
                            <FolderOpen className="h-8 w-8 text-muted-foreground/60" />
                            <p className="text-sm text-muted-foreground">Aucun portfolio pour le moment.</p>
                            <Button size="sm" onClick={() => router.push("/portfolio/creer")} className="rounded-full bg-brand-gradient text-white hover:bg-brand-gradient-hover">
                                <Plus className="mr-1.5 h-4 w-4" />
                                Créer mon portfolio
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {portfolios.map((item) => (
                                <div key={item.id} className="flex flex-col rounded-lg border border-border p-4 transition-shadow hover:shadow-md">
                                    <div className="mb-2 flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f0f3fb] font-bold text-[#2f6de6] dark:bg-muted dark:text-primary">
                                            {item.photo ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={formatFileUrl(item.photo)} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                item.title.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="truncate font-semibold text-foreground">{item.title}</h4>
                                            <Badge variant={item.status === "DRAFT" ? "secondary" : "default"} className="mt-0.5 text-[10px]">
                                                {item.status === "DRAFT" ? "Brouillon" : "Publié"}
                                            </Badge>
                                        </div>
                                    </div>
                                    {item.description && <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
                                    {item.skills?.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-1.5">
                                            {item.skills.slice(0, 3).map((skill, i) => (
                                                <Badge key={i} variant="secondary" className="text-[10px]">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <Button size="sm" variant="outline" className="mt-auto w-full bg-transparent" onClick={() => router.push(`/portfolio/creer?id=${item.id}`)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Modifier
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <PublicProfileCard suggestedName={profile.name} />
        </div>
    )
}
