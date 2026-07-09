"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Send, Paperclip, Star, MoreHorizontal, Bell, ChevronLeft } from "lucide-react"
import { messageService } from "@/lib/api/message.service"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect, useRef } from "react"

interface Message {
    id: string
    content: string
    createdAt: string
    senderId: string
}

interface Conversation {
    id: string
    name: string
    role: string
    lastMessageAt: string | null
    unreadCount: number
    lastMessage: string
}

function formatRelative(iso: string | null): string {
    if (!iso) return ""
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
}

export default function MessagesPage() {
    const { user } = useAuth()
    const currentUserId = user?.id ?? ""
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [showMobileList, setShowMobileList] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchConversations()
    }, [])

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
            if (convs.length > 0) {
                selectConversation(convs[0])
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
            await messageService.markAsRead(conversation.id)
            const response = await messageService.getConversationMessages(conversation.id)
            const items = (response as any)?.data ?? response ?? []
            setMessages(Array.isArray(items) ? items : [])
        } catch (error) {
            console.error("Erreur lors du chargement des messages:", error)
            setMessages([])
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return

        const content = newMessage
        setNewMessage("")

        const optimistic: Message = {
            id: `opt-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            senderId: currentUserId,
        }
        setMessages((prev) => [...prev, optimistic])
        setConversations((prev) =>
            prev.map((c) => (c.id === selectedConversation.id ? { ...c, lastMessage: content, lastMessageAt: optimistic.createdAt } : c)),
        )

        try {
            await messageService.sendMessage(selectedConversation.id, content)
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error)
        }
    }

    const filteredConversations = conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const initials = (name: string) => name.split(" ").map((n) => n[0]).join("")

    return (
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
                                    <AvatarImage src="/placeholder.svg" />
                                    <AvatarFallback>{initials(conversation.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-medium text-foreground truncate">{conversation.name}</h3>
                                        <div className="flex items-center space-x-1">
                                            {conversation.unreadCount > 0 && (
                                                <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1">
                                                    {conversation.unreadCount}
                                                </Badge>
                                            )}
                                            <Button variant="ghost" size="sm">
                                                <Star className="w-4 h-4" />
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
                                        <AvatarImage src="/placeholder.svg" />
                                        <AvatarFallback>{initials(selectedConversation.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="font-semibold text-foreground">{selectedConversation.name}</h2>
                                        <p className="text-sm text-muted-foreground">{selectedConversation.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm">
                                        <Star className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
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
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === currentUserId
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-foreground"
                                            }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                        <p
                                            className={`text-xs mt-1 ${message.senderId === currentUserId ? "text-primary-foreground/70" : "text-muted-foreground"
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
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Message de réponse"
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
                                    className="bg-primary hover:bg-primary/90"
                                    disabled={!newMessage.trim()}
                                >
                                    <Send className="w-4 h-4" />
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
    )
}
