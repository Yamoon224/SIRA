"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, UserMinus, Users, Plus, Briefcase, Newspaper, RefreshCw } from "lucide-react"
import {
    connectionService,
    communityService,
    postService,
    type IConnectUser,
    type ICommunity,
    type IPost,
    type CommunityType,
} from "@/lib/api/connect.service"
import { profilePath } from "@/lib/api/public-profile.service"
import type { IJobOffer } from "@/lib/@types/entities"
import { PageHeader } from "@/components/layout/page-header"
import { PostComposer } from "@/components/connect/post-composer"
import { PostCard } from "@/components/connect/post-card"
import { initials } from "@/components/connect/feed-format"
import { jobHref } from "@/lib/public-links"
import { formatFileUrl } from "@/lib/utils"

const TYPE_LABELS: Record<CommunityType, string> = { SECTOR: "Secteur", COUNTRY: "Pays", EXPERTISE: "Expertise" }

const FEED_PAGE_SIZE = 10

/** Carte « mon profil » à gauche du fil, comme sur LinkedIn. */
function ProfileSummaryCard() {
    const { user } = useAuth()
    if (!user) return null

    return (
        <Card className="overflow-hidden border border-border lg:sticky lg:top-4">
            <div className="h-14 bg-brand-gradient" />
            <CardContent className="-mt-8 flex flex-col items-center px-4 pb-4 text-center">
                <Avatar className="h-16 w-16 border-2 border-background">
                    <AvatarImage src={user.avatar ? formatFileUrl(user.avatar) : undefined} />
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <p className="mt-2 text-sm font-semibold text-foreground">{user.name}</p>
                {user.title && <p className="text-xs text-muted-foreground">{user.title}</p>}
                <Button asChild variant="outline" size="sm" className="mt-3 w-full rounded-full text-xs">
                    <Link href={profilePath(user.id)}>Voir mon profil</Link>
                </Button>
            </CardContent>
        </Card>
    )
}

function FeedTab() {
    const [posts, setPosts] = useState<IPost[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(false)

    const load = useCallback(async (nextPage: number) => {
        if (nextPage === 1) setLoading(true)
        else setLoadingMore(true)
        setError(false)
        try {
            const res = await postService.feed(nextPage, FEED_PAGE_SIZE)
            const items = Array.isArray(res?.data) ? res.data : []
            // Une publication ajoutée entre deux pages décale la pagination : on dédoublonne.
            setPosts((prev) => (nextPage === 1 ? items : [...prev, ...items.filter((item) => !prev.some((p) => p.id === item.id))]))
            setHasMore((res?.meta?.page ?? 1) < (res?.meta?.totalPages ?? 1))
            setPage(nextPage)
        } catch (err) {
            console.error("[connect] feed load error:", err)
            if (nextPage === 1) setError(true)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [])

    useEffect(() => {
        load(1)
    }, [load])

    const replacePost = (updated: IPost) => setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    const prependPost = (post: IPost) => setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)])
    const removePost = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id))

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
                <ProfileSummaryCard />
            </aside>

            <div className="mx-auto w-full max-w-2xl space-y-3">
                <PostComposer onPublished={prependPost} />

                {loading ? (
                    [0, 1, 2].map((i) => (
                        <Card key={i} className="border border-border p-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-1/3" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                            <Skeleton className="mt-4 h-16 w-full" />
                        </Card>
                    ))
                ) : error ? (
                    <Card className="border border-border">
                        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                            <p className="text-sm text-muted-foreground">Le fil d'actualité n'a pas pu être chargé.</p>
                            <Button variant="outline" size="sm" onClick={() => load(1)} className="gap-1.5 rounded-full">
                                <RefreshCw className="h-3.5 w-3.5" />
                                Réessayer
                            </Button>
                        </CardContent>
                    </Card>
                ) : posts.length === 0 ? (
                    <Card className="border border-border">
                        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                            <Newspaper className="h-10 w-10 text-muted-foreground/50" />
                            <p className="text-sm font-medium text-foreground">Aucune publication pour le moment</p>
                            <p className="max-w-sm text-xs text-muted-foreground">
                                Partagez une actualité, un projet ou un document : vos publications apparaîtront ici et dans le fil des autres membres.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    posts.map((post) => <PostCard key={post.id} post={post} onChange={replacePost} onDelete={removePost} onReposted={prependPost} />)
                )}

                {!loading && hasMore && (
                    <Button variant="outline" className="w-full rounded-full" onClick={() => load(page + 1)} disabled={loadingMore}>
                        {loadingMore ? "Chargement…" : "Afficher plus de publications"}
                    </Button>
                )}
            </div>
        </div>
    )
}

function CommunitiesTab() {
    const [communities, setCommunities] = useState<ICommunity[]>([])
    const [recommended, setRecommended] = useState<ICommunity[]>([])
    const [loading, setLoading] = useState(true)
    const [joined, setJoined] = useState<Set<string>>(new Set())
    const [createOpen, setCreateOpen] = useState(false)
    const [name, setName] = useState("")
    const [type, setType] = useState<CommunityType>("SECTOR")
    const [description, setDescription] = useState("")
    const [creating, setCreating] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const [listRes, recRes] = await Promise.all([communityService.list(), communityService.recommendations()])
            setCommunities(((listRes as any)?.data ?? listRes) as ICommunity[])
            setRecommended(((recRes as any)?.data ?? recRes) as ICommunity[])
        } catch (err) {
            console.error("[connect] communities load error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const toggleJoin = async (community: ICommunity) => {
        const isJoined = joined.has(community.id)
        try {
            if (isJoined) {
                await communityService.leave(community.id)
                setJoined((prev) => { const next = new Set(prev); next.delete(community.id); return next })
            } else {
                await communityService.join(community.id)
                setJoined((prev) => new Set(prev).add(community.id))
            }
        } catch (err) {
            console.error("[connect] join/leave error:", err)
        }
    }

    const handleCreate = async () => {
        if (!name.trim()) return
        setCreating(true)
        try {
            const res = await communityService.create(name.trim(), type, description.trim() || undefined)
            const community = (res as any)?.data ?? res
            setCommunities((prev) => [community, ...prev])
            setCreateOpen(false)
            setName("")
            setDescription("")
        } catch (err) {
            console.error("[connect] create community error:", err)
        } finally {
            setCreating(false)
        }
    }

    if (loading) return <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button size="sm" className="gap-1.5 bg-brand-gradient hover:bg-brand-gradient-hover" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-3.5 w-3.5" />Créer une communauté
                </Button>
            </div>

            {recommended.length > 0 && (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Suggestions pour vous</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {recommended.map((c) => <CommunityCard key={c.id} community={c} joined={joined.has(c.id)} onToggle={() => toggleJoin(c)} />)}
                    </div>
                </div>
            )}

            <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Toutes les communautés</p>
                {communities.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Aucune communauté pour le moment.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {communities.map((c) => <CommunityCard key={c.id} community={c} joined={joined.has(c.id)} onToggle={() => toggleJoin(c)} />)}
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Nouvelle communauté</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la communauté" />
                        <Select value={type} onValueChange={(v) => setType(v as CommunityType)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SECTOR">Secteur</SelectItem>
                                <SelectItem value="COUNTRY">Pays</SelectItem>
                                <SelectItem value="EXPERTISE">Expertise</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optionnel)" className="min-h-[60px]" />
                        <DialogFooter>
                            <Button disabled={creating || !name.trim()} onClick={handleCreate} className="w-full bg-brand-gradient hover:bg-brand-gradient-hover">
                                {creating ? "Création..." : "Créer"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function CommunityCard({ community, joined, onToggle }: { community: ICommunity; joined: boolean; onToggle: () => void }) {
    return (
        <Card className="border border-border">
            <CardContent className="p-3">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-semibold text-foreground">{community.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{TYPE_LABELS[community.type]}</Badge>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" />{community.membersCount}</span>
                        </div>
                    </div>
                    <Button size="sm" variant={joined ? "outline" : "default"} className={joined ? "h-8 text-xs" : "h-8 bg-brand-gradient text-xs hover:bg-brand-gradient-hover"} onClick={onToggle}>
                        {joined ? "Quitter" : "Rejoindre"}
                    </Button>
                </div>
                {community.description && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{community.description}</p>}
            </CardContent>
        </Card>
    )
}

function ReseauTab() {
    const [followers, setFollowers] = useState<IConnectUser[]>([])
    const [following, setFollowing] = useState<IConnectUser[]>([])
    const [suggestions, setSuggestions] = useState<IConnectUser[]>([])
    const [jobRecs, setJobRecs] = useState<IJobOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())

    const load = async () => {
        setLoading(true)
        try {
            const [followersRes, followingRes, suggRes, jobsRes] = await Promise.all([
                connectionService.followers(),
                connectionService.following(),
                connectionService.peopleRecommendations(),
                connectionService.jobOfferRecommendations(),
            ])
            const followersList = ((followersRes as any)?.data ?? followersRes) as IConnectUser[]
            const followingList = ((followingRes as any)?.data ?? followingRes) as IConnectUser[]
            setFollowers(followersList)
            setFollowing(followingList)
            setFollowingIds(new Set(followingList.map((u) => u.id)))
            setSuggestions(((suggRes as any)?.data ?? suggRes) as IConnectUser[])
            setJobRecs(((jobsRes as any)?.data ?? jobsRes) as IJobOffer[])
        } catch (err) {
            console.error("[connect] reseau load error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const toggleFollow = async (targetUser: IConnectUser) => {
        const isFollowing = followingIds.has(targetUser.id)
        try {
            if (isFollowing) {
                await connectionService.unfollow(targetUser.id)
                setFollowingIds((prev) => { const next = new Set(prev); next.delete(targetUser.id); return next })
            } else {
                await connectionService.follow(targetUser.id)
                setFollowingIds((prev) => new Set(prev).add(targetUser.id))
            }
        } catch (err) {
            console.error("[connect] follow/unfollow error:", err)
        }
    }

    if (loading) return <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Suggestions ({suggestions.length})</p>
                <div className="space-y-2">
                    {suggestions.length === 0 ? <p className="text-sm text-muted-foreground">Aucune suggestion.</p> : suggestions.map((u) => (
                        <UserRow key={u.id} connectUser={u} following={followingIds.has(u.id)} onToggle={() => toggleFollow(u)} />
                    ))}
                </div>

                <p className="mb-2 mt-4 text-xs font-semibold uppercase text-muted-foreground">Vous suivez ({following.length})</p>
                <div className="space-y-2">
                    {following.length === 0 ? <p className="text-sm text-muted-foreground">Vous ne suivez personne pour le moment.</p> : following.map((u) => (
                        <UserRow key={u.id} connectUser={u} following={followingIds.has(u.id)} onToggle={() => toggleFollow(u)} />
                    ))}
                </div>

                <p className="mb-2 mt-4 text-xs font-semibold uppercase text-muted-foreground">Vos abonnés ({followers.length})</p>
                <div className="space-y-2">
                    {followers.length === 0 ? <p className="text-sm text-muted-foreground">Aucun abonné pour le moment.</p> : followers.map((u) => (
                        <UserRow key={u.id} connectUser={u} following={followingIds.has(u.id)} onToggle={() => toggleFollow(u)} />
                    ))}
                </div>
            </div>

            <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Offres à ne pas manquer</p>
                <div className="space-y-2">
                    {jobRecs.length === 0 ? <p className="text-sm text-muted-foreground">Aucune offre suggérée.</p> : jobRecs.map((job) => (
                        <Link key={job.id} href={jobHref(job)}>
                            <Card className="border border-border transition-colors hover:border-blue-600">
                                <CardContent className="flex items-center gap-3 p-3">
                                    <Briefcase className="h-4 w-4 shrink-0 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{job.title}</p>
                                        <p className="text-xs text-muted-foreground">{job.company?.name ?? "-"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

function UserRow({ connectUser, following, onToggle }: { connectUser: IConnectUser; following: boolean; onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white dark:bg-card px-3 py-2">
            <Link href={profilePath(connectUser.id)} className="flex min-w-0 items-center gap-2.5 hover:opacity-90">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={connectUser.avatar ? formatFileUrl(connectUser.avatar) : undefined} />
                    <AvatarFallback>{initials(connectUser.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground hover:underline">{connectUser.name}</p>
                    {(connectUser.title || connectUser.companyName) && (
                        <p className="truncate text-xs text-muted-foreground">{connectUser.title || connectUser.companyName}</p>
                    )}
                </div>
            </Link>
            <Button size="sm" variant={following ? "outline" : "default"} className={following ? "h-8 shrink-0 gap-1 text-xs" : "h-8 shrink-0 gap-1 bg-brand-gradient text-xs hover:bg-brand-gradient-hover"} onClick={onToggle}>
                {following ? <UserMinus className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                {following ? "Ne plus suivre" : "Suivre"}
            </Button>
        </div>
    )
}

export default function Page() {
    return (
        <div className="space-y-4">
            <PageHeader
                title="GORIYA Connect"
                description="Votre réseau professionnel et vos communautés."
            />
            <Tabs defaultValue="feed">
                {/* Onglets sur toute la largeur, chacun centré dans son tiers. */}
                <TabsList className="grid h-auto w-full grid-cols-3">
                    <TabsTrigger value="feed" className="w-full">Fil d'actualité</TabsTrigger>
                    <TabsTrigger value="communities" className="w-full">Communautés</TabsTrigger>
                    <TabsTrigger value="reseau" className="w-full">Réseau</TabsTrigger>
                </TabsList>
                <TabsContent value="feed" className="mt-4"><FeedTab /></TabsContent>
                <TabsContent value="communities" className="mt-4"><CommunitiesTab /></TabsContent>
                <TabsContent value="reseau" className="mt-4"><ReseauTab /></TabsContent>
            </Tabs>
        </div>
    )
}
