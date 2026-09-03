"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Send, Trash2, Bot, MessageCircle, PanelLeft } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SubscriptionGate } from "@/components/subscription-gate"
import { chatService, type IChatThread } from "@/lib/api/chat.service"
import { cn } from "@/lib/utils"

function GoriyaChatContent() {
    const [threads, setThreads] = useState<IChatThread[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeThread, setActiveThread] = useState<IChatThread | null>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [input, setInput] = useState("")
    // Sur mobile la liste des conversations vit dans un panneau coulissant.
    const [listOpen, setListOpen] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const loadThreads = async () => {
        setLoading(true)
        try {
            const res = await chatService.listThreads()
            const items = ((res as any)?.data ?? res) as IChatThread[]
            setThreads(Array.isArray(items) ? items : [])
            if (Array.isArray(items) && items.length > 0) openThread(items[0].id)
        } catch (err) {
            console.error("[goriya-chat] load threads error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadThreads()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }, [activeThread?.messages?.length])

    const openThread = async (id: string) => {
        setActiveId(id)
        try {
            const res = await chatService.getThread(id)
            setActiveThread((res as any)?.data ?? res)
        } catch (err) {
            console.error("[goriya-chat] open thread error:", err)
        }
    }

    const handleSend = async () => {
        const message = input.trim()
        if (!message || sending) return
        setSending(true)
        setInput("")
        try {
            if (activeId) {
                const res = await chatService.sendMessage(activeId, message)
                const updated = (res as any)?.data ?? res
                setActiveThread(updated)
                setThreads((prev) => prev.map((t) => t.id === updated.id ? { ...t, title: updated.title, updatedAt: updated.updatedAt } : t))
            } else {
                const res = await chatService.createThread(message)
                const created = (res as any)?.data ?? res
                setThreads((prev) => [created, ...prev])
                setActiveId(created.id)
                setActiveThread(created)
            }
        } catch (err) {
            console.error("[goriya-chat] send error:", err)
        } finally {
            setSending(false)
        }
    }

    const handleNewThread = () => {
        setActiveId(null)
        setActiveThread(null)
        setInput("")
        setListOpen(false)
    }

    const handleDelete = async (id: string) => {
        try {
            await chatService.deleteThread(id)
            setThreads((prev) => prev.filter((t) => t.id !== id))
            if (activeId === id) handleNewThread()
        } catch (err) {
            console.error("[goriya-chat] delete error:", err)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    /** Liste des fils, partagée entre la colonne desktop et le panneau mobile. */
    const renderThreads = () => (
        <>
            <Button variant="outline" className="w-full gap-1.5" onClick={handleNewThread}>
                <Plus className="h-4 w-4" />Nouvelle conversation
            </Button>
            {threads.map((thread) => (
                <div
                    key={thread.id}
                    className={cn(
                        "group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer",
                        activeId === thread.id ? "bg-blue-50 text-blue-700" : "hover:bg-muted/60 text-foreground"
                    )}
                    onClick={() => { openThread(thread.id); setListOpen(false) }}
                >
                    <span className="truncate">{thread.title || "Nouvelle conversation"}</span>
                    <button
                        aria-label="Supprimer la conversation"
                        className="shrink-0 text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); handleDelete(thread.id) }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
        </>
    )

    return (
        // `dvh` et non `vh` : sur mobile, la barre d'adresse du navigateur
        // rogne la hauteur et la zone de saisie passait sous l'écran.
        <div className="flex h-[calc(100dvh-5.5rem)] min-h-[420px] gap-4 sm:h-[calc(100dvh-7rem)]">
            {/* Colonne des conversations : 256px fixes ne laissaient plus de
                place au fil de discussion sur un téléphone, elle passe donc en
                panneau coulissant en dessous de `md`. */}
            <aside className="hidden w-64 shrink-0 flex-col gap-2 overflow-y-auto border-r border-border pr-3 md:flex">
                {renderThreads()}
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="mb-2 flex items-center gap-2 md:hidden">
                    <Sheet open={listOpen} onOpenChange={setListOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                                <PanelLeft className="h-4 w-4" />Conversations
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[85vw] max-w-xs">
                            <SheetHeader>
                                <SheetTitle>Conversations</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-2 overflow-y-auto px-4 pb-4">
                                {renderThreads()}
                            </div>
                        </SheetContent>
                    </Sheet>
                    <p className="min-w-0 truncate text-sm font-medium text-foreground">
                        {activeThread?.title || "Nouvelle conversation"}
                    </p>
                </div>

                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-1 py-2 sm:px-2">
                    {!activeThread || !activeThread.messages || activeThread.messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center px-4 text-center text-muted-foreground">
                            <MessageCircle className="mb-3 h-10 w-10 opacity-30" />
                            <p className="text-sm">Posez une question à votre coach carrière GORIYA.</p>
                        </div>
                    ) : (
                        activeThread.messages.map((msg) => (
                            <div key={msg.id} className={cn("flex gap-2", msg.role === "USER" ? "justify-end" : "justify-start")}>
                                {msg.role === "ASSISTANT" && (
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                )}
                                <div className={cn(
                                    "max-w-[85%] rounded-2xl px-4 py-2 text-sm break-words whitespace-pre-line sm:max-w-[75%]",
                                    msg.role === "USER" ? "bg-blue-600 text-white" : "bg-muted text-foreground"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex items-center gap-2 border-t border-border pt-3">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Écrivez votre message..."
                        disabled={sending}
                        className="h-11 min-w-0 flex-1"
                    />
                    <Button className="h-11 w-11 shrink-0 bg-blue-600 p-0 hover:bg-blue-700" disabled={sending || !input.trim()} onClick={handleSend}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <SubscriptionGate featureLabel="GORIYA Chat">
            <GoriyaChatContent />
        </SubscriptionGate>
    )
}
