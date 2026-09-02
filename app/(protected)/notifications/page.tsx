"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell, Briefcase, MessageSquare, Settings, Check, Trash2 } from "lucide-react"
import { notificationService } from "@/lib/api/notification.service"

interface Notification {
  id: string
  type: "job" | "message" | "system"
  title: string
  description: string
  timestamp: string
  isRead: boolean
}

function mapType(t: string): "job" | "message" | "system" {
  const lower = (t ?? "").toLowerCase()
  if (lower.includes("job") || lower.includes("offer") || lower.includes("emploi") || lower.includes("application")) return "job"
  if (lower.includes("message") || lower.includes("chat") || lower.includes("conversation")) return "message"
  return "system"
}

function mapNotification(raw: any): Notification {
  return {
    id: String(raw.id ?? raw._id ?? ""),
    type: mapType(raw.type ?? ""),
    title: raw.title ?? raw.subject ?? "",
    description: raw.description ?? raw.message ?? raw.body ?? "",
    timestamp: raw.createdAt
      ? new Date(raw.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
      : raw.timestamp ?? "",
    isRead: raw.isRead ?? raw.read ?? false,
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await notificationService.getNotifications()
        const items = (res as any)?.data ?? res ?? []
        setNotifications(Array.isArray(items) ? items.map(mapNotification) : [])
      } catch (err) {
        console.error("[notifications] load error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job": return <Briefcase className="w-5 h-5 text-blue-600" />
      case "message": return <MessageSquare className="w-5 h-5 text-green-600" />
      case "system": return <Settings className="w-5 h-5 text-purple-600" />
      default: return <Bell className="w-5 h-5 text-gray-600 dark:text-muted-foreground" />
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "job": return "Offre d'emploi"
      case "message": return "Message"
      case "system": return "Système"
      default: return "Notification"
    }
  }

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id).catch(() => {})
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  const markAllAsRead = () => {
    notificationService.markAllAsRead().catch(() => {})
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  const deleteSelected = () => {
    selectedNotifications.forEach((id) => notificationService.deleteNotification(id).catch(() => {}))
    setNotifications((prev) => prev.filter((notif) => !selectedNotifications.includes(notif.id)))
    setSelectedNotifications([])
  }

  const toggleSelection = (id: string) => {
    setSelectedNotifications((prev) => (prev.includes(id) ? prev.filter((notifId) => notifId !== id) : [...prev, id]))
  }

  const filterNotifications = (type?: string) => {
    if (!type) return notifications
    return notifications.filter((notif) => notif.type === type)
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2f6de6] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Tu as {unreadCount} notification{unreadCount !== 1 ? "s" : ""} non lue{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {selectedNotifications.length > 0 && (
              <Button variant="destructive" size="sm" onClick={deleteSelected}>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer ({selectedNotifications.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <Check className="w-4 h-4 mr-2" />
              Tout marquer comme lu
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Toutes ({notifications.length})</TabsTrigger>
            <TabsTrigger value="job">Emplois ({filterNotifications("job").length})</TabsTrigger>
            <TabsTrigger value="message">Messages ({filterNotifications("message").length})</TabsTrigger>
            <TabsTrigger value="system">Système ({filterNotifications("system").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <NotificationsList
              notifications={notifications}
              selectedNotifications={selectedNotifications}
              onToggleSelection={toggleSelection}
              onMarkAsRead={markAsRead}
              getNotificationIcon={getNotificationIcon}
              getNotificationTypeLabel={getNotificationTypeLabel}
            />
          </TabsContent>

          <TabsContent value="job" className="mt-6">
            <NotificationsList
              notifications={filterNotifications("job")}
              selectedNotifications={selectedNotifications}
              onToggleSelection={toggleSelection}
              onMarkAsRead={markAsRead}
              getNotificationIcon={getNotificationIcon}
              getNotificationTypeLabel={getNotificationTypeLabel}
            />
          </TabsContent>

          <TabsContent value="message" className="mt-6">
            <NotificationsList
              notifications={filterNotifications("message")}
              selectedNotifications={selectedNotifications}
              onToggleSelection={toggleSelection}
              onMarkAsRead={markAsRead}
              getNotificationIcon={getNotificationIcon}
              getNotificationTypeLabel={getNotificationTypeLabel}
            />
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <NotificationsList
              notifications={filterNotifications("system")}
              selectedNotifications={selectedNotifications}
              onToggleSelection={toggleSelection}
              onMarkAsRead={markAsRead}
              getNotificationIcon={getNotificationIcon}
              getNotificationTypeLabel={getNotificationTypeLabel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface NotificationsListProps {
  notifications: Notification[]
  selectedNotifications: string[]
  onToggleSelection: (id: string) => void
  onMarkAsRead: (id: string) => void
  getNotificationIcon: (type: string) => React.ReactNode
  getNotificationTypeLabel: (type: string) => string
}

function NotificationsList({
  notifications,
  selectedNotifications,
  onToggleSelection,
  onMarkAsRead,
  getNotificationIcon,
  getNotificationTypeLabel,
}: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Aucune notification</h3>
        <p className="text-muted-foreground">Tu n'as aucune notification dans cette catégorie.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`transition-all hover:shadow-md cursor-pointer ${
            !notification.isRead ? "border-l-4 border-l-accent bg-accent/5" : ""
          }`}
          onClick={() => onMarkAsRead(notification.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Checkbox
                checked={selectedNotifications.includes(notification.id)}
                onCheckedChange={() => onToggleSelection(notification.id)}
                onClick={(e) => e.stopPropagation()}
              />

              <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className={`text-sm font-medium ${
                      !notification.isRead ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {getNotificationTypeLabel(notification.type)}
                    </Badge>
                    {!notification.isRead && <div className="w-2 h-2 bg-accent rounded-full"></div>}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>

                <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
