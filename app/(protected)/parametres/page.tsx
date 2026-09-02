"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AutocompleteInput } from "@/components/autocomplete-input"
import { LOCALISATIONS } from "@/lib/data/afrique"
import { POSTES } from "@/lib/data/postes"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Bell, Shield, CreditCard, HelpCircle, LogOut, Palette, Globe } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { localeService, type Locale } from "@/lib/api/locale.service"
import { userService } from "@/lib/api/user.service"
import { notificationService } from "@/lib/api/notification.service"
import { subscriptionService } from "@/lib/api/subscription.service"
import { formatFileUrl } from "@/lib/utils"

const LOCALE_LABELS: Record<Locale, string> = { fr: "Français", en: "English", pt: "Português", ar: "العربية" }

interface Subscription {
    status: "ACTIVE" | "EXPIRED" | "CANCELLED"
    endDate: string
    plan: { name: string; price: number; billingPeriod: string } | null
}

function initials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

export default function ParametresPage() {
  const { theme, setTheme } = useTheme()
  const { user, logout, refreshProfile } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [notifications, setNotifications] = useState({
    applications: true,
    emplois: true,
    recommandations: true,
  })
  const [savingNotifications, setSavingNotifications] = useState(false)

  useEffect(() => {
    notificationService.getSettings()
      .then((res: any) => {
        const data = res?.data ?? res
        if (data) {
          setNotifications({
            applications: !!data.applications,
            emplois: !!data.emplois,
            recommandations: !!data.recommandations,
          })
        }
      })
      .catch((err) => console.error("[parametres] notification settings load error:", err))
  }, [])

  const [locale, setLocale] = useState<Locale>("fr")
  const [savingLocale, setSavingLocale] = useState(false)

  useEffect(() => {
    localeService.get()
      .then((res) => setLocale(((res as any)?.data ?? res)?.locale ?? "fr"))
      .catch((err) => console.error("[parametres] locale load error:", err))
  }, [])

  const handleLocaleChange = async (value: Locale) => {
    setLocale(value)
    setSavingLocale(true)
    try {
      await localeService.update(value)
    } catch (err) {
      console.error("[parametres] locale update error:", err)
    } finally {
      setSavingLocale(false)
    }
  }

  const handleNotificationChange = async (key: keyof typeof notifications, checked: boolean) => {
    const next = { ...notifications, [key]: checked }
    setNotifications(next)
    setSavingNotifications(true)
    try {
      await notificationService.updateSettings(next)
    } catch (err) {
      console.error("[parametres] notification settings error:", err)
    } finally {
      setSavingNotifications(false)
    }
  }

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    location: "",
    bio: "",
    avatar: "" as string | null,
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    userService.getProfile()
      .then((res: any) => {
        const data = res?.data ?? res
        const parts = (data?.name ?? "").trim().split(" ")
        setProfile({
          firstName: parts[0] ?? "",
          lastName: parts.slice(1).join(" "),
          email: data?.email ?? "",
          phone: data?.phone ?? "",
          title: data?.title ?? "",
          location: data?.location ?? "",
          bio: data?.bio ?? "",
          avatar: data?.avatar ?? null,
        })
      })
      .catch((err) => console.error("[parametres] profile load error:", err))
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await userService.updateProfile({
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        phone: profile.phone.trim(),
        title: profile.title.trim(),
        location: profile.location.trim(),
        bio: profile.bio.trim(),
      } as any)
      refreshProfile()
      toast.success("Profil mis à jour")
    } catch (err) {
      console.error("[parametres] profile save error:", err)
      toast.error("Échec de la mise à jour du profil")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarChange = async (file: File) => {
    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
      toast.error("Format non supporté (PNG, JPG ou WebP).")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse (max 5MB).")
      return
    }
    setUploadingAvatar(true)
    try {
      const res: any = await userService.uploadAvatar(file)
      const avatarUrl = res?.data?.avatarUrl ?? res?.avatarUrl
      if (avatarUrl) setProfile((prev) => ({ ...prev, avatar: avatarUrl }))
      refreshProfile()
      toast.success("Photo de profil mise à jour")
    } catch (err: any) {
      console.error("[parametres] avatar upload error:", err)
      toast.error(err?.message ?? err?.error ?? "Échec de l'envoi de la photo")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const [passwords, setPasswords] = useState({ next: "", confirm: "" })
  const [changingPassword, setChangingPassword] = useState(false)

  const handleChangePassword = async () => {
    if (!passwords.next || passwords.next.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères")
      return
    }
    if (passwords.next !== passwords.confirm) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }
    setChangingPassword(true)
    try {
      await userService.updateProfile({ password: passwords.next } as any)
      setPasswords({ next: "", confirm: "" })
      toast.success("Mot de passe modifié")
    } catch (err) {
      console.error("[parametres] password change error:", err)
      toast.error("Échec du changement de mot de passe")
    } finally {
      setChangingPassword(false)
    }
  }

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    subscriptionService.getMySubscription(user.id)
      .then((res: any) => setSubscription(res?.data ?? res ?? null))
      .catch((err) => console.error("[parametres] subscription load error:", err))
      .finally(() => setSubscriptionLoading(false))
  }, [user?.id])

  const handleCancelSubscription = async () => {
    if (!user?.id) return
    try {
      await subscriptionService.cancelSubscription(user.id)
      setSubscription(null)
      toast.success("Abonnement annulé")
    } catch (err) {
      console.error("[parametres] cancel subscription error:", err)
      toast.error("Échec de l'annulation")
    }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="text-gray-600 dark:text-gray-400">Gère tes préférences et paramètres de compte</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar ? formatFileUrl(profile.avatar) : undefined} />
                    <AvatarFallback>{initials(`${profile.firstName} ${profile.lastName}`.trim() || "?")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        e.target.value = ""
                        if (f) handleAvatarChange(f)
                      }}
                    />
                    <Button variant="outline" size="sm" disabled={uploadingAvatar} onClick={() => fileInputRef.current?.click()}>
                      {uploadingAvatar ? "Envoi..." : "Changer la photo"}
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG jusqu'à 5MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      placeholder="Ton prénom"
                      onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      placeholder="Ton nom"
                      onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      placeholder="Adresse e-mail"
                      onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      value={profile.phone}
                      placeholder="+225 07 39 47 82"
                      onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Titre professionnel</Label>
                  <AutocompleteInput
                    id="title"
                    value={profile.title}
                    onChange={(v) => setProfile((prev) => ({ ...prev, title: v }))}
                    options={POSTES}
                    placeholder="Ex : Développeur Full Stack"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <AutocompleteInput
                    id="location"
                    value={profile.location}
                    onChange={(v) => setProfile((prev) => ({ ...prev, location: v }))}
                    options={LOCALISATIONS}
                    placeholder="Ville, pays (ex: Abidjan, Côte d'Ivoire)"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profile.bio}
                    placeholder="Présente-toi en quelques lignes : ton parcours, ce que tu cherches…"
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    className="resize-none"
                  />
                </div>

                <Button disabled={savingProfile} onClick={handleSaveProfile}>
                  {savingProfile ? "Enregistrement..." : "Sauvegarder les modifications"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mes candidatures</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Suivi de tes candidatures envoyées</p>
                  </div>
                  <Switch
                    checked={notifications.applications}
                    disabled={savingNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("applications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nouvelles offres d'emploi</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sois alerté des nouvelles offres correspondant à ton profil
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emplois}
                    disabled={savingNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("emplois", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Recommandations</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Suggestions personnalisées pour ta carrière</p>
                  </div>
                  <Switch
                    checked={notifications.recommandations}
                    disabled={savingNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("recommandations", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={passwords.next}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, next: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                  />
                </div>
                <Button disabled={changingPassword} onClick={handleChangePassword}>
                  {changingPassword ? "Modification..." : "Changer le mot de passe"}
                </Button>
              </CardContent>
            </Card>

            {/* Theme/Appearance Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Apparence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Thème de l'application</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choisis l'apparence de l'interface</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                  >
                    <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
                    <span className="text-xs">Clair</span>
                  </Button>

                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                  >
                    <div className="w-6 h-6 bg-gray-800 border-2 border-gray-600 rounded"></div>
                    <span className="text-xs">Sombre</span>
                  </Button>

                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-white to-gray-800 border-2 border-gray-400 rounded"></div>
                    <span className="text-xs">Système</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Langue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Langue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Langue de l'interface</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Utilisée pour les emails, messages de validation et réponses de l'assistant IA</p>
                  </div>
                  <Select value={locale} onValueChange={(v) => handleLocaleChange(v as Locale)} disabled={savingLocale}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(LOCALE_LABELS) as Locale[]).map((l) => (
                        <SelectItem key={l} value={l}>{LOCALE_LABELS[l]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar : `self-start` pour ne pas s'étirer sur la hauteur de la
              colonne de gauche (bien plus longue), `sticky` pour rester visible
              au lieu de laisser un grand vide au bas du défilement. */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : subscription?.status === "ACTIVE" ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{subscription.plan?.name ?? "Premium"}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {subscription.plan ? `${Number(subscription.plan.price).toLocaleString("fr-FR")} FCFA / ${subscription.plan.billingPeriod === "ANNUAL" ? "an" : "mois"}` : ""}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                      Renouvellement le {new Date(subscription.endDate).toLocaleDateString("fr-FR")}
                    </p>
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={handleCancelSubscription}>
                      Annuler l'abonnement
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">Gratuit</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Plan actuel</p>
                    <Button className="w-full" onClick={() => router.push("/auth/plan")}>Passer au Premium</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/centre-assistance")}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Centre d'aide
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700" onClick={() => logout()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
