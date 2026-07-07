"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Send, Paperclip, Star, MoreHorizontal, Bell, ChevronLeft } from "lucide-react"
import { messageService } from "@/lib/api/message.service"
import { useState, useEffect, useRef } from "react"

interface Message {
    id: string
    senderId: string
    senderName: string
    content: string
    timestamp: string
    isRead: boolean
}

interface Conversation {
    id: string
    participantId: string
    participantName: string
    participantAvatar: string
    participantTitle: string
    lastMessage: string
    lastMessageTime: string
    unreadCount: number
    isOnline: boolean
    messages: Message[]
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
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
    }, [selectedConversation?.messages])

    const fetchConversations = async () => {
        try {
            const response = await messageService.getConversations()
            setConversations(response.data)
            if (response.data.length > 0) {
                setSelectedConversation(response.data[0])
            }
        } catch (error) {
            console.error("Erreur lors du chargement des conversations:", error)

            // Données de démonstration
            const mockConversations: Conversation[] = [
                {
                    id: "1",
                    participantId: "user1",
                    participantName: "Mina Moulot",
                    participantAvatar: "/placeholder.svg?height=40&width=40",
                    participantTitle: "Recruteur chez TechCorp",
                    lastMessage: "Nous aimerions t'inviter pour un entretien",
                    lastMessageTime: "il y a 5 minutes",
                    unreadCount: 1,
                    isOnline: true,
                    messages: [
                        {
                            id: "1",
                            senderId: "user1",
                            senderName: "Mina Moulot",
                            content:
                                "Bonjour ! J'ai consulté ton profil et je pense que tu pourrais être un excellent candidat pour notre poste de développeur senior.",
                            timestamp: "il y a 2 heures",
                            isRead: true,
                        },
                        {
                            id: "2",
                            senderId: "current-user",
                            senderName: "Toi",
                            content:
                                "Bonjour Mina, je te remercie pour ton message. Je suis très intéressé par cette opportunité. Pourrais-tu me donner plus de détails sur le poste ?",
                            timestamp: "il y a 1 heure",
                            isRead: true,
                        },
                        {
                            id: "3",
                            senderId: "user1",
                            senderName: "Mina Moulot",
                            content:
                                "Bien sûr ! Il s'agit d'un poste de développeur full-stack avec une expertise en React et Node.js. L'équipe travaille sur des projets innovants dans le domaine de la fintech.",
                            timestamp: "il y a 45 minutes",
                            isRead: true,
                        },
                        {
                            id: "4",
                            senderId: "current-user",
                            senderName: "Toi",
                            content:
                                "Cela correspond parfaitement à mon profil ! J'ai 5 ans d'expérience avec ces technologies. Quand pourrions-nous organiser un entretien ?",
                            timestamp: "il y a 30 minutes",
                            isRead: true,
                        },
                        {
                            id: "5",
                            senderId: "user1",
                            senderName: "Mina Moulot",
                            content:
                                "Parfait ! Nous aimerions t'inviter pour un entretien la semaine prochaine. Es-tu disponible mardi ou mercredi après-midi ?",
                            timestamp: "il y a 5 minutes",
                            isRead: false,
                        },
                    ],
                },
                {
                    id: "2",
                    participantId: "user2",
                    participantName: "Romain Taze",
                    participantAvatar: "/placeholder.svg?height=40&width=40",
                    participantTitle: "RH Manager",
                    lastMessage: "Merci pour ton interview",
                    lastMessageTime: "il y a 1 heure",
                    unreadCount: 0,
                    isOnline: false,
                    messages: [
                        {
                            id: "1",
                            senderId: "user2",
                            senderName: "Romain Taze",
                            content: "Bonjour, suite à notre entretien d'hier, nous souhaitons te faire une proposition.",
                            timestamp: "il y a 2 heures",
                            isRead: true,
                        },
                        {
                            id: "2",
                            senderId: "current-user",
                            senderName: "Toi",
                            content: "Bonjour Romain, merci pour ce retour rapide. Je suis impatient de connaître ta proposition.",
                            timestamp: "il y a 1 heure",
                            isRead: true,
                        },
                    ],
                },
            ]

            setConversations(mockConversations)
            setSelectedConversation(mockConversations[0])
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return

        try {
            const message: Message = {
                id: Date.now().toString(),
                senderId: "current-user",
                senderName: "Toi",
                content: newMessage,
                timestamp: "À l'instant",
                isRead: true,
            }

            await messageService.sendMessage(selectedConversation.id, newMessage)

            // Mettre à jour localement
            const updatedConversation = {
                ...selectedConversation,
                messages: [...selectedConversation.messages, message],
                lastMessage: newMessage,
                lastMessageTime: "À l'instant",
            }

            setSelectedConversation(updatedConversation)
            setConversations((prev) => prev.map((conv) => (conv.id === selectedConversation.id ? updatedConversation : conv)))
            setNewMessage("")
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error)
        }
    }

    const filteredConversations = conversations.filter((conv) =>
        conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()),
    )

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
                    {filteredConversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${selectedConversation?.id === conversation.id ? "bg-primary/10 border-primary/20" : ""
                                }`}
                            onClick={() => { setSelectedConversation(conversation); setShowMobileList(false) }}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="relative">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={conversation.participantAvatar || "/placeholder.svg"} />
                                        <AvatarFallback>
                                            {conversation.participantName
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    {conversation.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-medium text-foreground truncate">{conversation.participantName}</h3>
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
                                    <p className="text-sm text-muted-foreground mb-1">{conversation.participantTitle}</p>
                                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{conversation.lastMessageTime}</p>
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
                                        <AvatarImage src={selectedConversation.participantAvatar || "/placeholder.svg"} />
                                        <AvatarFallback>
                                            {selectedConversation.participantName
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="font-semibold text-foreground">{selectedConversation.participantName}</h2>
                                        <p className="text-sm text-muted-foreground">{selectedConversation.participantTitle}</p>
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
                            {selectedConversation.messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.senderId === "current-user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === "current-user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-foreground"
                                            }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                        <p
                                            className={`text-xs mt-1 ${message.senderId === "current-user" ? "text-primary-foreground/70" : "text-muted-foreground"
                                                }`}
                                        >
                                            {message.timestamp}
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
