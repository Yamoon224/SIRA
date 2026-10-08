"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Send, Paperclip, Star, MoreHorizontal, MailOpen, RefreshCw, Trash2, Bell, ChevronLeft, FileText, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { messageService } from "@/lib/api/message.service"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface Attachment {
    name: string
    url: string
    mimeType: string | null
    size: number | null
}

interface Message {
    id: string
    content: string
    createdAt: string
    senderId: string
    /** Fichier joint au message, null quand il n'y en a pas. */
    attachment?: Attachment | null
    /** Vrai tant que l'envoi optimiste n'a pas ete confirme. */
    pending?: boolean
}

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024

function formatSize(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return ""
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

interface Conversation {
    id: string
    name: string
    role: string
    /** Logo de l'entreprise (ou photo du candidat), null quand il n'y en a pas. */
    avatar?: string | null
    lastMessageAt: string | null
    unreadCount: number
    lastMessage: string
    starred?: boolean
}

function formatRelative(iso: string | null): string {
    if (!iso) return ""
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
}

function MessagesContent() {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    // Deep link des notifications : /messages?conversation=<uuid> ouvre
    // directement le fil concerne plutot que le premier de la liste.
    const conversationParam = searchParams.get("conversation")
    const currentUserId = user?.id ?? ""
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [showMobileList, setShowMobileList] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Piece jointe : choisie puis envoyee avec (ou sans) le texte en cours.
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [sending, setSending] = useState(false)

    // Actions du menu « ... » de l'en-tête de conversation.
    const [confirmDelete, setConfirmDelete] = useState<Conversation | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        fetchConversations()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationParam])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const fetchConversations = async () => {
        try {
            const response = await messageService.getConversations()
            const items = (response as any)?.data ?? response ?? []
            const convs: Conversation[] = Array.isArray(items) ? items : []
            setConversations(convs)
            const aOuvrir = (conversationParam && convs.find((c) => c.id === conversationParam)) || convs[0]
            if (aOuvrir) {
                selectConversation(aOuvrir)
            }
        } catch (error) {
            console.error("Erreur lors du chargement des conversations:", error)
            setConversations([])
        }
    }

    const selectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation)
        setShowMobileList(false)
        setConversations((prev) => prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c)))
        try {
            // Les deux appels sont indépendants (l'un marque la conversation lue,
            // l'autre récupère les messages) : en parallèle plutôt qu'en série.
            const [, response] = await Promise.all([
                messageService.markAsRead(conversation.id),
                messageService.getConversationMessages(conversation.id),
            ])
            const items = (response as any)?.data ?? response ?? []
            setMessages(Array.isArray(items) ? items : [])
        } catch (error) {
            console.error("Erreur lors du chargement des messages:", error)
            setMessages([])
        }
    }

    const pickFile = (file: File | undefined) => {
        if (!file) return
        if (file.size > MAX_ATTACHMENT_BYTES) {
            toast.error(`« ${file.name} » dépasse 8 Mo. Choisis un fichier plus léger.`)
            return
        }
        setPendingFile(file)
    }

    const sendMessage = async () => {
        const content = newMessage.trim()
        if ((!content && !pendingFile) || !selectedConversation || sending) return

        const fichier = pendingFile
        setNewMessage("")
        setPendingFile(null)
        setSending(true)

        const optimistic: Message = {
            id: `opt-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            senderId: currentUserId,
            attachment: fichier ? { name: fichier.name, url: "", mimeType: fichier.type, size: fichier.size } : null,
            pending: !!fichier,
        }
        const apercu = content || (fichier ? `Pièce jointe : ${fichier.name}` : "")
        setMessages((prev) => [...prev, optimistic])
        setConversations((prev) =>
            prev.map((c) => (c.id === selectedConversation.id ? { ...c, lastMessage: apercu, lastMessageAt: optimistic.createdAt } : c)),
        )

        try {
            const res = fichier
                ? await messageService.sendAttachment(selectedConversation.id, fichier, content)
                : await messageService.sendMessage(selectedConversation.id, content)
            // Le message renvoye porte l'URL reelle de la piece jointe : on
            // remplace l'optimiste plutot que de laisser un lien mort.
            const envoye = (res as any)?.data ?? res
            if (envoye?.id) {
                setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? envoye : m)))
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error)
            setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
            setNewMessage(content)
            setPendingFile(fichier)
            toast.error("L'envoi du message a échoué.")
        } finally {
            setSending(false)
        }
    }

    const handleToggleStar = async () => {
        if (!selectedConversation) return
        const suivant = !selectedConversation.starred
        setSelectedConversation({ ...selectedConversation, starred: suivant })
        setConversations((prev) => prev.map((c) => (c.id === selectedConversation.id ? { ...c, starred: suivant } : c)))
        try {
            await messageService.setStarred(selectedConversation.id, suivant)
            toast.success(suivant ? "Conversation épinglée." : "Conversation retirée des épinglées.")
        } catch (error) {
            console.error("Erreur lors de l'épinglage:", error)
            setSelectedConversation({ ...selectedConversation, starred: !suivant })
            setConversations((prev) => prev.map((c) => (c.id === selectedConversation.id ? { ...c, starred: !suivant } : c)))
            toast.error("L'épinglage a échoué.")
        }
    }

    const handleMarkUnread = async () => {
        if (!selectedConversation) return
        try {
            await messageService.markAsUnread(selectedConversation.id)
            setConversations((prev) => prev.map((c) => (c.id === selectedConversation.id ? { ...c, unreadCount: Math.max(c.unreadCount, 1) } : c)))
            toast.success("Conversation marquée comme non lue.")
        } catch (error) {
            console.error("Erreur lors du marquage:", error)
            toast.error("Le marquage a échoué.")
        }
    }

    const handleRefresh = async () => {
        if (!selectedConversation) return
        await selectConversation(selectedConversation)
        toast.success("Conversation actualisée.")
    }

    const handleDelete = async () => {
        if (!confirmDelete) return
        setDeleting(true)
        try {
            await messageService.deleteConversation(confirmDelete.id)
            const restantes = conversations.filter((c) => c.id !== confirmDelete.id)
            setConversations(restantes)
            if (selectedConversation?.id === confirmDelete.id) {
                const suivante = restantes[0] ?? null
                setSelectedConversation(suivante)
                setMessages([])
                if (suivante) selectConversation(suivante)
            }
            setConfirmDelete(null)
            toast.success("Conversation supprimée de votre liste.")
        } catch (error) {
            console.error("Erreur lors de la suppression:", error)
            toast.error("La suppression a échoué.")
        } finally {
            setDeleting(false)
        }
    }

    const filteredConversations = conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const initials = (name: string) => name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()

    return (
        <>
        <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-2rem)] flex overflow-hidden">
            {/* Conversations List */}
            <div className={`${showMobileList ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-r border-border bg-background flex-col flex-shrink-0`}>
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-semibold text-foreground">Messages</h1>
                        <Button variant="ghost" size="sm">
                            <Bell className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">Aucune conversation.</p>
                    ) : filteredConversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${selectedConversation?.id === conversation.id ? "bg-primary/10 border-primary/20" : ""
                                }`}
                            onClick={() => selectConversation(conversation)}
                        >
                            <div className="flex items-start space-x-3">
                                <Avatar className="w-12 h-12">
                                    {conversation.avatar && <AvatarImage src={conversation.avatar} alt={conversation.name} className="object-cover" />}
                                    <AvatarFallback>{initials(conversation.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-medium text-foreground truncate">{conversation.name}</h3>
                                        <div className="flex items-center space-x-1">
                                            {conversation.unreadCount > 0 && (
                                                <Badge className="bg-brand-gradient text-white text-xs px-2 py-1">
                                                    {conversation.unreadCount}
                                                </Badge>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                aria-label={conversation.starred ? "Retirer des conversations épinglées" : "Épingler la conversation"}
                                                title={conversation.starred ? "Retirer des conversations épinglées" : "Épingler la conversation"}
                                                onClick={async (e) => {
                                                    e.stopPropagation()
                                                    const suivant = !conversation.starred
                                                    setConversations((prev) => prev.map((c) => (c.id === conversation.id ? { ...c, starred: suivant } : c)))
                                                    try {
                                                        await messageService.setStarred(conversation.id, suivant)
                                                    } catch (error) {
                                                        console.error("Erreur lors de l'épinglage:", error)
                                                        setConversations((prev) => prev.map((c) => (c.id === conversation.id ? { ...c, starred: !suivant } : c)))
                                                        toast.error("L'épinglage a échoué.")
                                                    }
                                                }}
                                            >
                                                <Star className={cn("w-4 h-4", conversation.starred && "fill-amber-400 text-amber-400")} />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{conversation.role}</p>
                                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{formatRelative(conversation.lastMessageAt)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${!showMobileList ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-background min-w-0`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border bg-background">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="md:hidden mr-1 -ml-2"
                                        onClick={() => setShowMobileList(true)}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <Avatar className="w-10 h-10">
                                        {selectedConversation.avatar && <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} className="object-cover" />}
                                        <AvatarFallback>{initials(selectedConversation.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="font-semibold text-foreground">{selectedConversation.name}</h2>
                                        <p className="text-sm text-muted-foreground">{selectedConversation.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleToggleStar}
                                        aria-label={selectedConversation.starred ? "Retirer des conversations épinglées" : "Épingler la conversation"}
                                        title={selectedConversation.starred ? "Retirer des conversations épinglées" : "Épingler la conversation"}
                                    >
                                        <Star className={cn("w-4 h-4", selectedConversation.starred && "fill-amber-400 text-amber-400")} />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" aria-label="Plus d'actions" title="Plus d'actions">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            {/* focus:bg-accent (par défaut) posait un aplat peu lisible : le
                                                dégradé de marque le remplace, comme ailleurs dans l'app. */}
                                            <DropdownMenuItem onClick={handleMarkUnread} className="gap-2 focus:bg-brand-gradient focus:text-white focus:[&_svg:not([class*='text-'])]:text-white">
                                                <MailOpen className="h-4 w-4" />
                                                Marquer comme non lue
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleToggleStar} className="gap-2 focus:bg-brand-gradient focus:text-white focus:[&_svg:not([class*='text-'])]:text-white">
                                                <Star className="h-4 w-4" />
                                                {selectedConversation.starred ? "Retirer des épinglées" : "Épingler la conversation"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleRefresh} className="gap-2 focus:bg-brand-gradient focus:text-white focus:[&_svg:not([class*='text-'])]:text-white">
                                                <RefreshCw className="h-4 w-4" />
                                                Actualiser les messages
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => setConfirmDelete(selectedConversation)}
                                                className="gap-2 text-red-500 focus:bg-brand-gradient focus:text-white focus:[&_svg:not([class*='text-'])]:text-white"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Supprimer la conversation
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={cn(
                                            // Bulle façon WhatsApp : coins arrondis, sauf celui qui pointe vers
                                            // l'expéditeur (queue de bulle) pour marquer la direction du message.
                                            "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                                            message.senderId === currentUserId
                                                ? "bg-brand-gradient text-white rounded-br-sm"
                                                : "bg-muted text-foreground rounded-bl-sm",
                                        )}
                                    >
                                        {message.content && <p className="text-sm">{message.content}</p>}
                                        {message.attachment && (
                                            <a
                                                href={message.attachment.url || undefined}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`mt-1.5 flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${message.pending ? "pointer-events-none opacity-70" : ""} ${message.senderId === currentUserId ? "bg-white/15 hover:bg-white/25" : "bg-background hover:bg-background/70"
                                                    }`}
                                            >
                                                {message.pending
                                                    ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                                                    : <FileText className="w-4 h-4 shrink-0" />}
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-xs font-medium">{message.attachment.name}</span>
                                                    <span className={`block text-[10px] ${message.senderId === currentUserId ? "text-white/70" : "text-muted-foreground"}`}>
                                                        {message.pending ? "Envoi…" : formatSize(message.attachment.size)}
                                                    </span>
                                                </span>
                                            </a>
                                        )}
                                        <p
                                            className={`text-xs mt-1 ${message.senderId === currentUserId ? "text-white/70" : "text-muted-foreground"
                                                }`}
                                        >
                                            {formatRelative(message.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-border bg-background">
                            {pendingFile && (
                                <div className="mb-2 flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                                    <FileText className="w-4 h-4 shrink-0 text-primary" />
                                    <span className="min-w-0 flex-1 truncate text-xs text-foreground">{pendingFile.name}</span>
                                    <span className="shrink-0 text-[11px] text-muted-foreground">{formatSize(pendingFile.size)}</span>
                                    <button
                                        onClick={() => setPendingFile(null)}
                                        aria-label="Retirer la pièce jointe"
                                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-background"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp"
                                    onChange={(e) => {
                                        pickFile(e.target.files?.[0])
                                        // Permet de re-selectionner le meme fichier apres un retrait.
                                        e.target.value = ""
                                    }}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Joindre un fichier (PDF, Word, Excel, texte ou image - 8 Mo max)"
                                    aria-label="Joindre un fichier"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder={pendingFile ? "Ajouter un message (facultatif)…" : "Message de réponse"}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault()
                                                sendMessage()
                                            }
                                        }}
                                        className="pr-12"
                                    />
                                </div>
                                <Button
                                    onClick={sendMessage}
                                    className="bg-brand-gradient hover:bg-brand-gradient-hover"
                                    disabled={sending || (!newMessage.trim() && !pendingFile)}
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">Sélectionne une conversation</h3>
                            <p className="text-muted-foreground">
                                Choisis une conversation dans la liste pour commencer à discuter
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cette conversation ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Elle disparaîtra de votre liste. {confirmDelete?.name} conserve la conversation ; un nouveau message la fera réapparaître.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-500 hover:bg-red-600">
                        {deleting ? "Suppression…" : "Supprimer"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        }>
            <MessagesContent />
        </Suspense>
    )
}
