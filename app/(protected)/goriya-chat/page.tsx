"use client"

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Send, Trash2, Bot, MessageCircle, PanelLeft, PanelLeftClose, Paperclip, Search, FileText, X, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SubscriptionGate } from "@/components/subscription-gate"
import {
    CHAT_FILE_ACCEPT,
    CHAT_FILE_MAX_BYTES,
    CHAT_FILE_MAX_COUNT,
    chatService,
    type IChatSearchResult,
    type IChatThread,
} from "@/lib/api/chat.service"
import { cn } from "@/lib/utils"

const CLE_PANNEAU = "goriya:chat-panneau"

/**
 * Rend la réponse de l'IA sans ses marqueurs Markdown : `**texte**` devient
 * du gras, les titres (#) et les astérisques restants sont retirés. Pas de
 * moteur Markdown complet : le chat n'a besoin que du gras et des listes.
 */
function TexteRiche({ text }: { text: string }) {
    const lignes = text.split("\n").map((ligne) => ligne.replace(/^\s{0,3}#{1,6}\s+/, "").replace(/^(\s*)\*\s+/, "$1- "))

    const gras = (ligne: string): ReactNode[] =>
        ligne.split(/\*\*(.+?)\*\*/g).map((part, i) =>
            i % 2 === 1 ? (
                <strong key={i} className="font-semibold">
                    {part}
                </strong>
            ) : (
                // Astérisques orphelins (italique, gras non refermé) : retirés.
                <Fragment key={i}>{part.replace(/\*+/g, "")}</Fragment>
            ),
        )

    return (
        <>
            {lignes.map((ligne, i) => (
                <Fragment key={i}>
                    {i > 0 && "\n"}
                    {gras(ligne)}
                </Fragment>
            ))}
        </>
    )
}

function PuceFichier({ name, onRemove, inverse }: { name: string; onRemove?: () => void; inverse?: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs",
                inverse ? "bg-white/20 text-white" : "border border-border bg-background text-foreground",
            )}
        >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{name}</span>
            {onRemove && (
                <button type="button" onClick={onRemove} aria-label={`Retirer ${name}`} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </span>
    )
}

function GoriyaChatContent() {
    const [threads, setThreads] = useState<IChatThread[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeThread, setActiveThread] = useState<IChatThread | null>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [input, setInput] = useState("")
    const [files, setFiles] = useState<File[]>([])
    /** Message en cours d'envoi, affiché tout de suite en attendant la réponse. */
    const [pending, setPending] = useState<{ content: string; files: string[] } | null>(null)
    // Sur mobile la liste des conversations vit dans un panneau coulissant.
    const [listOpen, setListOpen] = useState(false)
    // Sur ordinateur, la colonne des conversations peut être repliée.
    const [panelOpen, setPanelOpen] = useState(true)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<IChatSearchResult[] | null>(null)
    const [searching, setSearching] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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
        try {
            if (localStorage.getItem(CLE_PANNEAU) === "ferme") setPanelOpen(false)
        } catch {
            /* stockage indisponible : le panneau reste ouvert */
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }, [activeThread?.messages?.length, pending])

    // Recherche : le serveur fouille aussi le contenu des messages ; s'il ne
    // répond pas, on se rabat sur les titres déjà chargés.
    useEffect(() => {
        if (!searchOpen) return
        const terme = searchTerm.trim()
        if (terme.length < 2) {
            setSearchResults(null)
            setSearching(false)
            return
        }
        let annule = false
        setSearching(true)
        const id = setTimeout(async () => {
            let resultats: IChatSearchResult[]
            try {
                const res = await chatService.search(terme)
                const items = (res as any)?.data ?? res
                if (!Array.isArray(items)) throw new Error("réponse inattendue")
                resultats = items
            } catch {
                resultats = threads
                    .filter((t) => (t.title ?? "").toLowerCase().includes(terme.toLowerCase()))
                    .map((t) => ({ id: t.id, title: t.title, excerpt: null, updatedAt: t.updatedAt }))
            }
            if (annule) return
            setSearchResults(resultats)
            setSearching(false)
        }, 300)
        return () => {
            annule = true
            clearTimeout(id)
        }
    }, [searchTerm, searchOpen, threads])

    const togglePanel = () => {
        setPanelOpen((open) => {
            try {
                localStorage.setItem(CLE_PANNEAU, open ? "ferme" : "ouvert")
            } catch {
                /* stockage indisponible */
            }
            return !open
        })
    }

    const openThread = async (id: string) => {
        setActiveId(id)
        try {
            const res = await chatService.getThread(id)
            setActiveThread((res as any)?.data ?? res)
        } catch (err) {
            console.error("[goriya-chat] open thread error:", err)
        }
    }

    const openSearch = () => {
        setSearchTerm("")
        setSearchResults(null)
        setSearchOpen(true)
        setListOpen(false)
    }

    const addFiles = (list: FileList | null) => {
        if (!list) return
        const next = [...files]
        for (const file of Array.from(list)) {
            if (next.length >= CHAT_FILE_MAX_COUNT) {
                toast.error(`${CHAT_FILE_MAX_COUNT} fichiers au maximum par message.`)
                break
            }
            const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`
            if (!CHAT_FILE_ACCEPT.split(",").includes(extension)) {
                toast.error(`${file.name} : format non pris en charge (PDF, Word .docx, image ou texte).`)
                continue
            }
            if (file.size > CHAT_FILE_MAX_BYTES) {
                toast.error(`${file.name} dépasse 5 Mo.`)
                continue
            }
            next.push(file)
        }
        setFiles(next)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleSend = async () => {
        const message = input.trim()
        if ((!message && files.length === 0) || sending) return
        const envoyes = files
        setSending(true)
        setPending({ content: message, files: envoyes.map((f) => f.name) })
        setInput("")
        setFiles([])
        try {
            if (activeId) {
                const res = await chatService.sendMessage(activeId, message, envoyes)
                const updated = (res as any)?.data ?? res
                setActiveThread(updated)
                setThreads((prev) => prev.map((t) => t.id === updated.id ? { ...t, title: updated.title, updatedAt: updated.updatedAt } : t))
            } else {
                const res = await chatService.createThread(message, envoyes)
                const created = (res as any)?.data ?? res
                setThreads((prev) => [created, ...prev])
                setActiveId(created.id)
                setActiveThread(created)
            }
        } catch (err) {
            console.error("[goriya-chat] send error:", err)
            toast.error("Le message n'a pas pu être envoyé. Réessaie.")
            // Rien n'est perdu : le texte et les fichiers reviennent dans la saisie.
            setInput(message)
            setFiles(envoyes)
        } finally {
            setPending(null)
            setSending(false)
        }
    }

    const handleNewThread = () => {
        setActiveId(null)
        setActiveThread(null)
        setInput("")
        setFiles([])
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

    const boutonRecherche = (
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={openSearch} aria-label="Rechercher une conversation" title="Rechercher une conversation">
            <Search className="h-4 w-4" />
        </Button>
    )

    /** Liste des fils, partagée entre la colonne desktop et le panneau mobile. */
    const renderThreads = () => (
        <>
            <div className="flex items-center gap-2">
                <Button variant="outline" className="min-w-0 flex-1 gap-1.5 rounded-full" onClick={handleNewThread}>
                    <Plus className="h-4 w-4 shrink-0" />
                    <span className="truncate">Nouvelle conversation</span>
                </Button>
                {boutonRecherche}
            </div>
            <p className="mt-2 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Conversations récentes</p>
            {threads.length === 0 && <p className="px-1 text-xs text-muted-foreground">Aucune conversation pour le moment.</p>}
            {threads.map((thread) => (
                <div
                    key={thread.id}
                    className={cn(
                        "group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer",
                        activeId === thread.id ? "bg-blue-50 text-blue-700 dark:bg-primary/10 dark:text-primary" : "hover:bg-muted/60 text-foreground"
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

    const messages = activeThread?.messages ?? []
    const vide = messages.length === 0 && !pending
    // Sans recherche saisie, la fenêtre de recherche propose les fils récents.
    const resultats: IChatSearchResult[] =
        searchResults ?? threads.slice(0, 8).map((t) => ({ id: t.id, title: t.title, excerpt: null, updatedAt: t.updatedAt }))

    return (
        // `dvh` et non `vh` : sur mobile, la barre d'adresse du navigateur
        // rogne la hauteur et la zone de saisie passait sous l'écran.
        <div className="flex h-[calc(100dvh-5.5rem)] min-h-[420px] gap-4 sm:h-[calc(100dvh-7rem)]">
            {/* Colonne des conversations : repliable sur ordinateur, panneau
                coulissant en dessous de `md` (256px fixes ne laissaient plus de
                place au fil de discussion sur un téléphone). */}
            {panelOpen && (
                <aside className="hidden w-64 shrink-0 flex-col gap-2 overflow-y-auto border-r border-border pr-3 md:flex">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">GORIYA Chat</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePanel} aria-label="Fermer le panneau des conversations" title="Fermer le panneau">
                            <PanelLeftClose className="h-4 w-4" />
                        </Button>
                    </div>
                    {renderThreads()}
                </aside>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Panneau replié (ordinateur) : ses actions restent à portée de main. */}
                {!panelOpen && (
                    <div className="mb-2 hidden items-center gap-2 md:flex">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={togglePanel} aria-label="Ouvrir le panneau des conversations" title="Ouvrir le panneau">
                            <PanelLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={handleNewThread} aria-label="Nouvelle conversation" title="Nouvelle conversation">
                            <Plus className="h-4 w-4" />
                        </Button>
                        {boutonRecherche}
                        <p className="min-w-0 truncate text-sm font-medium text-foreground">{activeThread?.title || "Nouvelle conversation"}</p>
                    </div>
                )}

                <div className="mb-2 flex items-center gap-2 md:hidden">
                    <Sheet open={listOpen} onOpenChange={setListOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-full" aria-label="Conversations">
                                <PanelLeft className="h-4 w-4" />
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
                    {boutonRecherche}
                    <p className="min-w-0 truncate text-sm font-medium text-foreground">
                        {activeThread?.title || "Nouvelle conversation"}
                    </p>
                </div>

                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-1 py-2 sm:px-2">
                    {vide ? (
                        <div className="flex h-full flex-col items-center justify-center px-4 text-center text-muted-foreground">
                            <MessageCircle className="mb-3 h-10 w-10 opacity-30" />
                            <p className="text-center text-sm">Posez une question à votre coach carrière GORIYA.</p>
                            <p className="mt-1 text-center text-xs">Vous pouvez joindre un CV, une offre d&apos;emploi ou une lettre à analyser.</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <div key={msg.id} className={cn("flex gap-2", msg.role === "USER" ? "justify-end" : "justify-start")}>
                                    {msg.role === "ASSISTANT" && (
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "max-w-[85%] rounded-2xl px-4 py-2 text-left text-sm break-words whitespace-pre-line sm:max-w-[75%]",
                                        msg.role === "USER" ? "bg-brand-gradient text-white" : "bg-muted text-foreground"
                                    )}>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mb-1.5 flex flex-wrap gap-1.5 whitespace-normal">
                                                {msg.attachments.map((a, i) => <PuceFichier key={i} name={a.name} inverse={msg.role === "USER"} />)}
                                            </div>
                                        )}
                                        {msg.role === "ASSISTANT" ? <TexteRiche text={msg.content} /> : msg.content}
                                    </div>
                                </div>
                            ))}
                            {pending && (
                                <>
                                    <div className="flex justify-end gap-2">
                                        <div className="max-w-[85%] rounded-2xl bg-brand-gradient px-4 py-2 text-left text-sm break-words whitespace-pre-line text-white opacity-80 sm:max-w-[75%]">
                                            {pending.files.length > 0 && (
                                                <div className="mb-1.5 flex flex-wrap gap-1.5 whitespace-normal">
                                                    {pending.files.map((name, i) => <PuceFichier key={i} name={name} inverse />)}
                                                </div>
                                            )}
                                            {pending.content}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        {pending.files.length > 0 ? "Goriya lit vos fichiers…" : "Goriya écrit…"}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="border-t border-border pt-3">
                    {files.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                            {files.map((file, i) => (
                                <PuceFichier key={`${file.name}-${i}`} name={file.name} onRemove={() => setFiles((prev) => prev.filter((_, k) => k !== i))} />
                            ))}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <input ref={fileInputRef} type="file" multiple accept={CHAT_FILE_ACCEPT} className="hidden" onChange={(e) => addFiles(e.target.files)} />
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 shrink-0 rounded-full"
                            disabled={sending || files.length >= CHAT_FILE_MAX_COUNT}
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Joindre un fichier"
                            title="Joindre un fichier (PDF, Word, image, texte - 5 Mo max)"
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder="Écrivez votre message..."
                            disabled={sending}
                            className="h-11 min-w-0 flex-1"
                        />
                        <Button className="h-11 w-11 shrink-0 rounded-full bg-brand-gradient p-0 hover:bg-brand-gradient-hover" disabled={sending || (!input.trim() && files.length === 0)} onClick={handleSend} aria-label="Envoyer">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogContent className="max-w-lg gap-3 p-4">
                    <DialogHeader>
                        <DialogTitle>Rechercher une conversation</DialogTitle>
                        <DialogDescription className="sr-only">Recherche dans les titres et le contenu de vos conversations.</DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            autoFocus
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Un mot, un sujet, une entreprise..."
                            className="h-10 rounded-full pl-9"
                        />
                    </div>
                    <div className="max-h-[50vh] space-y-1 overflow-y-auto">
                        {searchResults === null && !searching && resultats.length > 0 && (
                            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Récentes</p>
                        )}
                        {searching ? (
                            <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Recherche…
                            </p>
                        ) : resultats.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">Aucune conversation trouvée.</p>
                        ) : (
                            resultats.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => { openThread(r.id); setSearchOpen(false) }}
                                    className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-muted/60"
                                >
                                    <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-foreground">{r.title || "Nouvelle conversation"}</span>
                                        {r.excerpt && <span className="block truncate text-xs text-muted-foreground">{r.excerpt}</span>}
                                    </span>
                                    <span className="shrink-0 text-[11px] text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString("fr-FR")}</span>
                                </button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
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
