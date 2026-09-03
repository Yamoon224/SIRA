"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Video, Plus, PhoneOff, LogIn, Calendar } from "lucide-react"
import { callSessionService, type ICallSession, type CallSessionStatus } from "@/lib/api/call-session.service"
import { CallEmbed } from "@/components/call-embed"
import { PageHeader } from "@/components/layout/page-header"

const STATUS_META: Record<CallSessionStatus, { label: string; className: string }> = {
    SCHEDULED: { label: "Planifié", className: "bg-blue-100 text-blue-600" },
    ACTIVE: { label: "En cours", className: "bg-green-500 text-white" },
    ENDED: { label: "Terminé", className: "bg-gray-200 dark:bg-muted text-gray-700 dark:text-foreground" },
}

export default function Page() {
    const { user } = useAuth()
    const [sessions, setSessions] = useState<ICallSession[]>([])
    const [loading, setLoading] = useState(true)

    const [createOpen, setCreateOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [scheduledAt, setScheduledAt] = useState("")
    const [creating, setCreating] = useState(false)

    const [joiningId, setJoiningId] = useState<string | null>(null)
    const [activeCall, setActiveCall] = useState<{ session: ICallSession; token: string; url: string; room: string } | null>(null)

    const load = async () => {
        setLoading(true)
        try {
            const res = await callSessionService.list()
            setSessions(((res as any)?.data ?? res) as ICallSession[])
        } catch (err) {
            console.error("[appels] load error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const handleCreate = async () => {
        if (!title.trim()) return
        setCreating(true)
        try {
            const res = await callSessionService.schedule(title.trim(), scheduledAt ? new Date(scheduledAt).toISOString() : undefined)
            const body = ((res as any)?.data ?? res) as ICallSession
            setSessions((prev) => [body, ...prev])
            setCreateOpen(false)
            setTitle("")
            setScheduledAt("")
        } catch (err) {
            console.error("[appels] create error:", err)
        } finally {
            setCreating(false)
        }
    }

    const handleJoin = async (callSession: ICallSession) => {
        setJoiningId(callSession.id)
        try {
            const res = await callSessionService.join(callSession.id)
            const body = (res as any)?.data ?? res
            setActiveCall({ session: callSession, token: body.token, url: body.url, room: body.room })
            setSessions((prev) => prev.map((s) => s.id === callSession.id ? { ...s, status: "ACTIVE" } : s))
        } catch (err) {
            console.error("[appels] join error:", err)
        } finally {
            setJoiningId(null)
        }
    }

    const handleEnd = async (callSession: ICallSession) => {
        try {
            await callSessionService.end(callSession.id)
            setSessions((prev) => prev.map((s) => s.id === callSession.id ? { ...s, status: "ENDED" } : s))
            if (activeCall?.session.id === callSession.id) setActiveCall(null)
        } catch (err) {
            console.error("[appels] end error:", err)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <PageHeader
                className="mb-0"
                title="Appels vidéo"
                description="Entretiens et sessions de coaching en visioconférence (GORIYA Call)"
                actions={
                    <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" />Planifier un appel
                    </Button>
                }
            />

            {sessions.length === 0 ? (
                <Card className="border border-border">
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <Video className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>Aucun appel planifié.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {sessions.map((callSession) => (
                        <div key={callSession.id} className="rounded-xl border border-border bg-white dark:bg-card px-4 py-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-foreground">{callSession.title}</p>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_META[callSession.status].className}`}>
                                            {STATUS_META[callSession.status].label}
                                        </span>
                                    </div>
                                    {callSession.scheduledAt && (
                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(callSession.scheduledAt).toLocaleString("fr-FR")}
                                        </p>
                                    )}
                                </div>
                                {callSession.status !== "ENDED" && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            className="h-9 gap-1.5 bg-blue-600 text-xs hover:bg-blue-700"
                                            disabled={joiningId === callSession.id}
                                            onClick={() => handleJoin(callSession)}
                                        >
                                            <LogIn className="h-3.5 w-3.5" />
                                            {joiningId === callSession.id ? "Connexion..." : "Rejoindre"}
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs text-red-500 hover:bg-red-50" onClick={() => handleEnd(callSession)}>
                                            <PhoneOff className="h-3.5 w-3.5" />Clôturer
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Planifier un appel vidéo</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Entretien avec Goriya Corp" />
                        <div>
                            <label className="mb-1 block text-xs font-medium text-foreground">Date/heure (optionnel - sinon démarrage immédiat)</label>
                            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button disabled={creating || !title.trim()} onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">
                                {creating ? "Création..." : "Planifier"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {activeCall && (
                <CallEmbed
                    token={activeCall.token}
                    url={activeCall.url}
                    room={activeCall.room}
                    name={user?.name ?? "Candidat"}
                    title={activeCall.session.title}
                    onClose={() => setActiveCall(null)}
                />
            )}
        </div>
    )
}
