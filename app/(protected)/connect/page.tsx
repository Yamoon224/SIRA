"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Trash2, UserPlus, UserMinus, Users, Send, Plus, Briefcase } from "lucide-react"
import {
    connectionService,
    communityService,
    postService,
    type IConnectUser,
    type ICommunity,
    type IPost,
    type CommunityType,
} from "@/lib/api/connect.service"
import type { IJobOffer } from "@/lib/@types/entities"
import { PageHeader } from "@/components/layout/page-header"
import { jobHref } from "@/lib/public-links"

const TYPE_LABELS: Record<CommunityType, string> = { SECTOR: "Secteur", COUNTRY: "Pays", EXPERTISE: "Expertise" }

function initials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function FeedTab() {
    const { user } = useAuth()
    const [posts, setPosts] = useState<IPost[]>([])
    const [loading, setLoading] = useState(true)
    const [content, setContent] = useState("")
    const [posting, setPosting] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const res = await postService.feed(1, 20)
            const body = (res as any)?.data !== undefined ? res : { data: [] }
            setPosts(Array.isArray(body.data) ? body.data : [])
        } catch (err) {
            console.error("[connect] feed load error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const handlePost = async () => {
        if (!content.trim()) return
        setPosting(true)
        try {
            const res = await postService.create(content.trim())
            const post = (res as any)?.data ?? res
            setPosts((prev) => [post, ...prev])
            setContent("")
        } catch (err) {
            console.error("[connect] post error:", err)
        } finally {
            setPosting(false)
        }
    }

    const handleLike = async (post: IPost) => {
        try {
            const res = await postService.toggleLike(post.id)
            const liked = (res as any)?.data?.liked ?? (res as any)?.liked
            setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, likesCount: p.likesCount + (liked ? 1 : -1) } : p))
        } catch (err) {
            console.error("[connect] like error:", err)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await postService.remove(id)
            setPosts((prev) => prev.filter((p) => p.id !== id))
        } catch (err) {
            console.error("[connect] delete post error:", err)
        }
    }

    return (
        <div className="space-y-4">
            <Card className="border border-border">
                <CardContent className="space-y-2 p-4">
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Partagez une actualité avec votre réseau..." className="min-h-[70px]" />
                    <div className="flex justify-end">
                        <Button size="sm" disabled={posting || !content.trim()} onClick={handlePost} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                            <Send className="h-3.5 w-3.5" />Publier
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>
            ) : posts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucune publication dans votre fil pour le moment.</p>
            ) : (
                posts.map((post) => (
                    <Card key={post.id} className="border border-border my-2">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={post.author?.avatar ?? undefined} />
                                    <AvatarFallback>{post.author ? initials(post.author.name) : "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-foreground">{post.author?.name ?? "Utilisateur"}</p>
                                        {post.author?.id === user?.id && (
                                            <button onClick={() => handleDelete(post.id)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                        )}
                                    </div>
                                    {post.author?.companyName && <p className="text-xs text-muted-foreground">{post.author.companyName}</p>}
                                    <p className="mt-2 whitespace-pre-line text-sm text-foreground">{post.content}</p>
                                    <button onClick={() => handleLike(post)} className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500">
                                        <Heart className="h-3.5 w-3.5" />{post.likesCount}
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
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
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={() => setCreateOpen(true)}>
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
                            <Button disabled={creating || !name.trim()} onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">
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
                    <Button size="sm" variant={joined ? "outline" : "default"} className={joined ? "h-8 text-xs" : "h-8 bg-blue-600 text-xs hover:bg-blue-700"} onClick={onToggle}>
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
                        <UserRow key={u.id} connectUser={u} following onToggle={() => toggleFollow(u)} />
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
        <div className="flex items-center justify-between rounded-lg border border-border bg-white dark:bg-card px-3 py-2">
            <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={connectUser.avatar ?? undefined} />
                    <AvatarFallback>{initials(connectUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium text-foreground">{connectUser.name}</p>
                    {connectUser.companyName && <p className="text-xs text-muted-foreground">{connectUser.companyName}</p>}
                </div>
            </div>
            <Button size="sm" variant={following ? "outline" : "default"} className={following ? "h-8 gap-1 text-xs" : "h-8 gap-1 bg-blue-600 text-xs hover:bg-blue-700"} onClick={onToggle}>
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
                <TabsList>
                    <TabsTrigger value="feed">Fil d'actualité</TabsTrigger>
                    <TabsTrigger value="communities">Communautés</TabsTrigger>
                    <TabsTrigger value="reseau">Réseau</TabsTrigger>
                </TabsList>
                <TabsContent value="feed" className="mt-4"><FeedTab /></TabsContent>
                <TabsContent value="communities" className="mt-4"><CommunitiesTab /></TabsContent>
                <TabsContent value="reseau" className="mt-4"><ReseauTab /></TabsContent>
            </Tabs>
        </div>
    )
}
