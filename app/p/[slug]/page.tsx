"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
    CalendarDays,
    Copy,
    Eye,
    FolderOpen,
    Globe2,
    Loader2,
    Lock,
    Mail,
    MapPin,
    Newspaper,
    Pencil,
    Phone,
    Settings2,
    Share2,
    Star,
    UserCheck,
    UserPlus,
    Users,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { PostCard } from "@/components/connect/post-card"
import { initials, plural } from "@/components/connect/feed-format"
import { PortfolioPreview, toPreviewData } from "@/components/portfolio/portfolio-preview"
import { useAuth } from "@/contexts/auth-context"
import { connectionService, type IPost } from "@/lib/api/connect.service"
import {
    profilePath,
    publicProfileService,
    type IPublicPortfolio,
    type IPublicProfileView,
    type ProfileTheme,
    type ProfileViewerMode,
} from "@/lib/api/public-profile.service"
import { capitalizeFirst, cn, formatFileUrl } from "@/lib/utils"

const THEME_COVERS: Record<ProfileTheme, string> = {
    DEFAULT: "bg-brand-gradient",
    CREATIF: "bg-gradient-to-r from-fuchsia-500 via-rose-400 to-orange-300",
    TECHNIQUE: "bg-gradient-to-r from-slate-800 via-slate-700 to-cyan-600",
    COMMERCIAL: "bg-gradient-to-r from-blue-700 via-blue-500 to-emerald-400",
    ACADEMIQUE: "bg-gradient-to-r from-indigo-800 via-indigo-600 to-amber-400",
}

function SectionCard({ title, icon, action, children }: { title: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    {icon}
                    {title}
                </CardTitle>
                {action}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}

/**
 * Profil public façon LinkedIn. Le même lien sert trois lectures :
 *  - propriétaire connecté : mode éditeur (raccourcis de gestion, coordonnées,
 *    brouillons) avec bascule « Voir comme un visiteur » ;
 *  - membre connecté : profil complet sans coordonnées, bouton Suivre ;
 *  - visiteur non connecté : vue publique, si le membre l'a autorisée.
 */
function PublicProfileContent() {
    const params = useParams<{ slug: string }>()
    const ref = decodeURIComponent(params?.slug ?? "")
    const searchParams = useSearchParams()
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    const [profile, setProfile] = useState<IPublicProfileView | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [viewAsVisitor, setViewAsVisitor] = useState(searchParams.get("vue") === "publique")
    const [followBusy, setFollowBusy] = useState(false)
    const [openPortfolio, setOpenPortfolio] = useState<IPublicPortfolio | null>(null)
    const lastLoaded = useRef<string | null>(null)

    useEffect(() => {
        if (!ref) return
        const key = `${ref}|${isAuthenticated}`
        if (lastLoaded.current === key) return
        lastLoaded.current = key

        let cancelled = false
        setLoading(true)
        setNotFound(false)
        publicProfileService
            .show(ref)
            .then((res) => {
                if (cancelled) return
                const data = res as IPublicProfileView
                setProfile(data)
                // URL canonique : l'URL personnalisée remplace l'uuid dans la barre d'adresse.
                if (data.ref && data.ref !== ref) {
                    lastLoaded.current = `${data.ref}|${isAuthenticated}`
                    const query = searchParams.toString()
                    router.replace(`${profilePath(data.ref)}${query ? `?${query}` : ""}`, { scroll: false })
                }
            })
            .catch(() => {
                if (cancelled) return
                setProfile(null)
                setNotFound(true)
            })
            .finally(() => !cancelled && setLoading(false))

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, isAuthenticated])

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
        )
    }

    if (notFound || !profile) {
        return (
            <Card className="mx-auto max-w-lg border border-border">
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                    <Lock className="h-10 w-10 text-muted-foreground/60" />
                    <p className="text-base font-semibold text-foreground">Profil indisponible</p>
                    <p className="text-sm text-muted-foreground">
                        {isAuthenticated
                            ? "Ce profil est introuvable ou n'existe plus."
                            : "Ce profil n'existe pas ou n'est visible que des membres connectés de GORIYA."}
                    </p>
                    {!isAuthenticated && (
                        <Button asChild className="mt-2 rounded-full bg-brand-gradient text-white hover:bg-brand-gradient-hover">
                            <Link href="/auth/signin">Se connecter pour le consulter</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        )
    }

    const isOwner = profile.viewerMode === "owner"
    const mode: ProfileViewerMode = isOwner && viewAsVisitor ? "public" : profile.viewerMode
    const editing = mode === "owner"
    const firstName = profile.name.split(" ")[0] || profile.name
    const portfolios = editing ? profile.portfolios : profile.portfolios.filter((p) => p.status === "PUBLISHED")

    const toggleView = () => {
        const next = !viewAsVisitor
        setViewAsVisitor(next)
        router.replace(`${profilePath(profile.ref)}${next ? "?vue=publique" : ""}`, { scroll: false })
    }

    const shareUrl = () => `${window.location.origin}${profilePath(profile.ref)}`

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl())
            toast.success("Lien du profil copié.")
        } catch {
            toast.error("Impossible de copier le lien.")
        }
    }

    const share = async () => {
        if (!navigator.share) return copyLink()
        try {
            await navigator.share({ title: `${profile.name} sur GORIYA`, text: profile.title ?? undefined, url: shareUrl() })
        } catch {
            /* partage annulé */
        }
    }

    const toggleFollow = async () => {
        setFollowBusy(true)
        try {
            if (profile.isFollowing) {
                await connectionService.unfollow(profile.userId)
                setProfile({ ...profile, isFollowing: false, stats: { ...profile.stats, followers: Math.max(0, profile.stats.followers - 1) } })
            } else {
                await connectionService.follow(profile.userId)
                setProfile({ ...profile, isFollowing: true, stats: { ...profile.stats, followers: profile.stats.followers + 1 } })
                toast.success(`Vous suivez désormais ${firstName}.`)
            }
        } catch (err: any) {
            toast.error(err?.message ?? "Action impossible pour le moment.")
        } finally {
            setFollowBusy(false)
        }
    }

    const updatePost = (updated: IPost) =>
        setProfile((prev) => (prev ? { ...prev, recentPosts: prev.recentPosts.map((p) => (p.id === updated.id ? updated : p)) } : prev))
    const removePost = (id: string) =>
        setProfile((prev) => (prev ? { ...prev, recentPosts: prev.recentPosts.filter((p) => p.id !== id), stats: { ...prev.stats, posts: Math.max(0, prev.stats.posts - 1) } } : prev))

    const memberSince = profile.memberSince
        ? new Date(profile.memberSince).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
        : null

    return (
        <div className="space-y-4">
            {isOwner && (
                <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-start gap-2 text-sm text-foreground">
                        {viewAsVisitor ? <Eye className="mt-0.5 h-4 w-4 shrink-0" /> : <Pencil className="mt-0.5 h-4 w-4 shrink-0" />}
                        {viewAsVisitor
                            ? profile.isPublic
                                ? "Vue publique : c'est ainsi que les visiteurs non connectés voient votre profil."
                                : "Votre profil n'est pas public : les visiteurs non connectés ne peuvent pas l'ouvrir. Voici ce que voient les membres."
                            : "Mode éditeur : vous seul voyez les options de gestion, vos coordonnées et vos brouillons."}
                    </p>
                    <Button size="sm" variant="outline" onClick={toggleView} className="shrink-0">
                        {viewAsVisitor ? "Revenir au mode éditeur" : "Voir comme un visiteur"}
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0 space-y-4">
                    {/* Carte d'identité */}
                    <Card className="overflow-hidden border border-border">
                        <div className={cn("h-28 sm:h-40", THEME_COVERS[profile.theme] ?? THEME_COVERS.DEFAULT)} />
                        <CardContent className="px-4 pb-5 sm:px-6">
                            <Avatar className="-mt-14 h-28 w-28 border-4 border-card sm:-mt-20 sm:h-36 sm:w-36">
                                <AvatarImage src={profile.avatar ? formatFileUrl(profile.avatar) : undefined} alt={profile.name} />
                                <AvatarFallback className="text-3xl">{initials(profile.name)}</AvatarFallback>
                            </Avatar>
                            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                                    {profile.title ? (
                                        <p className="mt-0.5 text-base text-foreground/90">{profile.title}</p>
                                    ) : (
                                        editing && (
                                            <Link href="/parametres" className="mt-0.5 inline-block text-sm text-primary hover:underline">
                                                Ajouter un titre professionnel
                                            </Link>
                                        )
                                    )}
                                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                        {profile.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {capitalizeFirst(profile.location)}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 font-medium text-primary">
                                            <Users className="h-3.5 w-3.5" />
                                            {plural(profile.stats.followers, "abonné")}
                                        </span>
                                    </p>
                                    {editing && (
                                        <Badge variant={profile.isPublic ? "default" : "secondary"} className="mt-2 gap-1">
                                            {profile.isPublic ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                            {profile.isPublic ? "Profil public" : "Visible par les membres uniquement"}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 sm:justify-end">
                                    {editing ? (
                                        <>
                                            <Button asChild className="rounded-full bg-brand-gradient text-white hover:bg-brand-gradient-hover">
                                                <Link href="/parametres">
                                                    <Pencil className="mr-1.5 h-4 w-4" />
                                                    Modifier le profil
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="rounded-full">
                                                <Link href="/profil#profil-public">
                                                    <Settings2 className="mr-1.5 h-4 w-4" />
                                                    Gérer le profil public
                                                </Link>
                                            </Button>
                                        </>
                                    ) : mode === "member" ? (
                                        <Button
                                            onClick={toggleFollow}
                                            disabled={followBusy}
                                            variant={profile.isFollowing ? "outline" : "default"}
                                            className={cn("rounded-full", !profile.isFollowing && "bg-brand-gradient text-white hover:bg-brand-gradient-hover")}
                                        >
                                            {followBusy ? (
                                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                            ) : profile.isFollowing ? (
                                                <UserCheck className="mr-1.5 h-4 w-4" />
                                            ) : (
                                                <UserPlus className="mr-1.5 h-4 w-4" />
                                            )}
                                            {profile.isFollowing ? "Abonné" : "Suivre"}
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild={!isOwner}
                                            disabled={isOwner}
                                            className="rounded-full bg-brand-gradient text-white hover:bg-brand-gradient-hover"
                                        >
                                            {isOwner ? (
                                                <span>
                                                    <UserPlus className="mr-1.5 inline h-4 w-4" />
                                                    Suivre
                                                </span>
                                            ) : (
                                                <Link href="/auth/signin">
                                                    <UserPlus className="mr-1.5 h-4 w-4" />
                                                    Suivre
                                                </Link>
                                            )}
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={share} className="rounded-full">
                                        <Share2 className="mr-1.5 h-4 w-4" />
                                        Partager
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* À propos */}
                    {(profile.bio || editing) && (
                        <SectionCard title="Infos">
                            {profile.bio ? (
                                <p className="whitespace-pre-line text-sm text-foreground">{profile.bio}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Présentez votre parcours en quelques lignes.{" "}
                                    <Link href="/parametres" className="font-medium text-primary hover:underline">
                                        Ajouter une bio
                                    </Link>
                                </p>
                            )}
                        </SectionCard>
                    )}

                    {/* Activité */}
                    <SectionCard
                        title="Activité"
                        icon={<Newspaper className="h-5 w-5" />}
                        action={<span className="text-sm text-muted-foreground">{plural(profile.stats.posts, "publication")}</span>}
                    >
                        {profile.recentPosts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {editing ? (
                                    <>
                                        Vous n'avez encore rien publié.{" "}
                                        <Link href="/connect" className="font-medium text-primary hover:underline">
                                            Partager une actualité
                                        </Link>
                                    </>
                                ) : (
                                    `${firstName} n'a encore rien publié.`
                                )}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {profile.recentPosts.map((post) => (
                                    <PostCard key={post.id} post={post} readOnly={mode === "public"} onChange={updatePost} onDelete={removePost} />
                                ))}
                                {isAuthenticated && (
                                    <Button asChild variant="ghost" className="w-full">
                                        <Link href="/connect">Voir le fil d'actualité</Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </SectionCard>

                    {/* Portfolio */}
                    {(portfolios.length > 0 || editing) && (
                        <SectionCard
                            title="Portfolio"
                            icon={<FolderOpen className="h-5 w-5" />}
                            action={
                                editing ? (
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href="/portfolio/nouveau">Ajouter</Link>
                                    </Button>
                                ) : undefined
                            }
                        >
                            {portfolios.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Publiez un portfolio pour présenter vos projets aux recruteurs.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {portfolios.map((item) => (
                                        <div key={item.id} className="flex flex-col rounded-lg border border-border p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted font-bold text-primary">
                                                    {item.photo ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={formatFileUrl(item.photo)} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        item.title.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-foreground">{item.title}</p>
                                                    {editing && (
                                                        <Badge variant={item.status === "DRAFT" ? "secondary" : "default"} className="mt-0.5 text-[10px]">
                                                            {item.status === "DRAFT" ? "Brouillon" : `Publié · ${plural(item.views, "vue")}`}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {item.description && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.description}</p>}
                                            {item.skills?.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {item.skills.slice(0, 5).map((skill) => (
                                                        <Badge key={skill} variant="secondary" className="text-[10px]">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-3 flex gap-2 pt-1">
                                                <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpenPortfolio(item)}>
                                                    <Eye className="mr-1.5 h-4 w-4" />
                                                    Voir
                                                </Button>
                                                {editing && (
                                                    <Button asChild size="sm" variant="ghost">
                                                        <Link href={`/portfolio/creer?id=${item.id}`}>
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Modifier {item.title}</span>
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    )}

                    {/* Pitchs vidéo */}
                    {profile.videoPitches.length > 0 && (
                        <SectionCard title="Pitchs vidéo">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {profile.videoPitches.map((pitch) => (
                                    <div key={pitch.id} className="rounded-lg border border-border p-3">
                                        <video src={formatFileUrl(pitch.videoUrl)} controls className="w-full rounded-lg" />
                                        <div className="mt-2 flex items-center justify-between">
                                            <Badge variant="outline" className="text-[10px]">
                                                {pitch.type}
                                            </Badge>
                                            {typeof (pitch.score as any)?.impact === "number" && (
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    {(pitch.score as any).impact}/100
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Compétences */}
                    {profile.skills.length > 0 && (
                        <SectionCard title="Compétences">
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="px-3 py-1 text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </div>

                <aside className="space-y-4">
                    <Card className="border border-border">
                        <CardContent className="space-y-3 p-4">
                            <p className="text-sm font-semibold text-foreground">Profil public et URL</p>
                            <p className="break-all text-xs text-muted-foreground">goriya.net{profilePath(profile.ref)}</p>
                            <Button variant="outline" size="sm" onClick={copyLink} className="w-full gap-1.5">
                                <Copy className="h-4 w-4" />
                                Copier le lien
                            </Button>
                            {editing && (
                                <Button asChild variant="ghost" size="sm" className="w-full">
                                    <Link href="/profil#profil-public">Personnaliser l'URL</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {editing && (profile.email || profile.phone) && (
                        <Card className="border border-border">
                            <CardContent className="space-y-2 p-4">
                                <p className="flex items-center justify-between text-sm font-semibold text-foreground">
                                    Coordonnées
                                    <span className="flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
                                        <Lock className="h-3 w-3" />
                                        Vous seul
                                    </span>
                                </p>
                                {profile.email && (
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{profile.email}</span>
                                    </p>
                                )}
                                {profile.phone && (
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4 shrink-0" />
                                        {profile.phone}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border border-border">
                        <CardContent className="grid grid-cols-3 gap-2 p-4 text-center">
                            <div>
                                <p className="text-lg font-bold text-foreground">{profile.stats.followers}</p>
                                <p className="text-[11px] text-muted-foreground">Abonnés</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-foreground">{profile.stats.following}</p>
                                <p className="text-[11px] text-muted-foreground">Abonnements</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-foreground">{profile.stats.posts}</p>
                                <p className="text-[11px] text-muted-foreground">Publications</p>
                            </div>
                            {memberSince && (
                                <p className="col-span-3 mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Membre depuis {memberSince}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {!isAuthenticated && (
                        <Card className="border border-border bg-primary/5">
                            <CardContent className="space-y-3 p-4 text-center">
                                <p className="text-sm font-semibold text-foreground">Rejoignez GORIYA</p>
                                <p className="text-xs text-muted-foreground">Suivez {firstName}, échangez avec votre réseau et trouvez votre prochain emploi.</p>
                                <Button asChild className="w-full rounded-full bg-brand-gradient text-white hover:bg-brand-gradient-hover">
                                    <Link href="/auth/signin">Se connecter / S'inscrire</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </aside>
            </div>

            <Dialog open={openPortfolio !== null} onOpenChange={(open) => !open && setOpenPortfolio(null)}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogTitle className="sr-only">Portfolio {openPortfolio?.title}</DialogTitle>
                    {openPortfolio && <PortfolioPreview data={toPreviewData(openPortfolio)} />}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function PublicProfilePage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:pt-10">
                {/* useSearchParams exige une frontière Suspense au prérendu. */}
                <Suspense
                    fallback={
                        <div className="flex justify-center py-24">
                            <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        </div>
                    }
                >
                    <PublicProfileContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    )
}
