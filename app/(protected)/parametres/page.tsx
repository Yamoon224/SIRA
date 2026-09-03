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
import { LOCALE_LABELS, SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/api/locale.service"
import { useI18n } from "@/contexts/i18n-context"
import { userService } from "@/lib/api/user.service"
import { notificationService } from "@/lib/api/notification.service"
import { subscriptionService } from "@/lib/api/subscription.service"
import { formatFileUrl } from "@/lib/utils"
import { PageHeader } from "@/components/layout/page-header"

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

  // La locale est portée par le contexte i18n : la changer ici bascule
  // immédiatement toute l'interface, en plus de la persister sur le compte.
  const { locale, setLocale, t } = useI18n()
  const [savingLocale, setSavingLocale] = useState(false)

  const handleLocaleChange = async (value: SupportedLocale) => {
    setSavingLocale(true)
    try {
      await setLocale(value)
    } catch (err) {
      console.error("[parametres] locale update error:", err)
    } finally {
      setSavingLocale(false)
    }
  }

  /** Notifie avec un message traduit ; `isError` choisit le style du toast. */
  const t2 = (key: Parameters<typeof t>[0], isError = false) =>
    isError ? toast.error(t(key)) : toast.success(t(key))

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
      t2("settings.profileUpdated")
    } catch (err) {
      console.error("[parametres] profile save error:", err)
      t2("settings.profileUpdateFailed", true)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarChange = async (file: File) => {
    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
      t2("settings.photoFormatError", true)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      t2("settings.photoSizeError", true)
      return
    }
    setUploadingAvatar(true)
    try {
      const res: any = await userService.uploadAvatar(file)
      const avatarUrl = res?.data?.avatarUrl ?? res?.avatarUrl
      if (avatarUrl) setProfile((prev) => ({ ...prev, avatar: avatarUrl }))
      refreshProfile()
      t2("settings.photoUpdated")
    } catch (err: any) {
      console.error("[parametres] avatar upload error:", err)
      toast.error(err?.message ?? err?.error ?? t("settings.photoUploadFailed"))
    } finally {
      setUploadingAvatar(false)
    }
  }

  const [passwords, setPasswords] = useState({ next: "", confirm: "" })
  const [changingPassword, setChangingPassword] = useState(false)

  const handleChangePassword = async () => {
    if (!passwords.next || passwords.next.length < 6) {
      t2("settings.passwordTooShort", true)
      return
    }
    if (passwords.next !== passwords.confirm) {
      t2("settings.passwordMismatch", true)
      return
    }
    setChangingPassword(true)
    try {
      await userService.updateProfile({ password: passwords.next } as any)
      setPasswords({ next: "", confirm: "" })
      t2("settings.passwordChanged")
    } catch (err) {
      console.error("[parametres] password change error:", err)
      t2("settings.passwordChangeFailed", true)
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
      t2("settings.subscriptionCancelled")
    } catch (err) {
      console.error("[parametres] cancel subscription error:", err)
      t2("settings.subscriptionCancelFailed", true)
    }
  }

  return (
      <div className="space-y-6">
        <PageHeader
          title={t("settings.title")}
          description={t("settings.subtitle")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t("settings.personalInfo")}
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
                      {uploadingAvatar ? t("settings.uploadingPhoto") : t("settings.changePhoto")}
                    </Button>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">{t("settings.photoHint")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t("settings.firstName")}</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      placeholder={t("settings.firstNamePlaceholder")}
                      onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t("settings.lastName")}</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      placeholder={t("settings.lastNamePlaceholder")}
                      onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">{t("settings.emailLabel")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      placeholder={t("settings.emailPlaceholder")}
                      onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("settings.phoneLabel")}</Label>
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
                  <Label htmlFor="title">{t("settings.professionalTitle")}</Label>
                  <AutocompleteInput
                    id="title"
                    value={profile.title}
                    onChange={(v) => setProfile((prev) => ({ ...prev, title: v }))}
                    options={POSTES}
                    placeholder={t("settings.professionalTitlePlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="location">{t("settings.location")}</Label>
                  <AutocompleteInput
                    id="location"
                    value={profile.location}
                    onChange={(v) => setProfile((prev) => ({ ...prev, location: v }))}
                    options={LOCALISATIONS}
                    placeholder={t("settings.locationPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">{t("settings.bio")}</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profile.bio}
                    placeholder={t("settings.bioPlaceholder")}
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    className="resize-none"
                  />
                </div>

                <Button disabled={savingProfile} onClick={handleSaveProfile}>
                  {savingProfile ? t("common.saving") : t("settings.saveProfile")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t("settings.notifications")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("settings.myApplications")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("settings.myApplicationsHint")}</p>
                  </div>
                  <Switch
                    checked={notifications.applications}
                    disabled={savingNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("applications", checked)}
                  />
                </div>

                <Separator className="mt-2" />

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-medium">{t("settings.newJobs")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("settings.newJobsHint")}
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emplois}
                    disabled={savingNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("emplois", checked)}
                  />
                </div>

                <Separator className="mt-2" />

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-medium">{t("settings.recommendations")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("settings.recommendationsHint")}</p>
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
                  {t("settings.security")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder={t("settings.newPasswordPlaceholder")}
                    value={passwords.next}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, next: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">{t("settings.confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t("settings.confirmPasswordPlaceholder")}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                  />
                </div>
                <Button disabled={changingPassword} onClick={handleChangePassword}>
                  {changingPassword ? t("settings.changingPassword") : t("settings.changePassword")}
                </Button>
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
                  {t("settings.subscription")}
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
                      {subscription.plan
                        ? `${Number(subscription.plan.price).toLocaleString(locale)} FCFA / ${subscription.plan.billingPeriod === "ANNUAL" ? t("settings.perYear") : t("settings.perMonth")}`
                        : ""}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                      {t("settings.renewsOn", { date: new Date(subscription.endDate).toLocaleDateString(locale) })}
                    </p>
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={handleCancelSubscription}>
                      {t("settings.cancelSubscription")}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{t("settings.freePlan")}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t("settings.currentPlan")}</p>
                    <Button className="w-full" onClick={() => router.push("/auth/plan")}>{t("settings.upgrade")}</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Theme/Appearance Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t("settings.appearance")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("settings.appTheme")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("settings.appThemeHint")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                </div>

                <Separator className="mt-2" />

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex flex-col items-center gap-2 h-auto py-3 rounded-2xl"
                  >
                    <div className="w-6 h-6 bg-white dark:bg-card border-2 border-gray-300 dark:border-border rounded"></div>
                    <span className="text-xs">{t("settings.themeLight")}</span>
                  </Button>

                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex flex-col items-center gap-2 h-auto py-3 rounded-2xl"
                  >
                    <div className="w-6 h-6 bg-gray-800 border-2 border-gray-600 rounded"></div>
                    <span className="text-xs">{t("settings.themeDark")}</span>
                  </Button>

                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="flex flex-col items-center gap-2 h-auto py-3 rounded-2xl"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-white to-gray-800 border-2 border-gray-400 rounded"></div>
                    <span className="text-xs">{t("settings.themeSystem")}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Langue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {t("settings.language")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Empilé : la carte vit désormais dans la colonne latérale,
                    trop étroite pour un libellé et un select côte à côte. */}
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{t("settings.interfaceLanguage")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("settings.interfaceLanguageHint")}</p>
                  </div>
                  <Select value={locale} onValueChange={(v) => handleLocaleChange(v as SupportedLocale)} disabled={savingLocale}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LOCALES.map((l) => (
                        <SelectItem key={l} value={l}>{LOCALE_LABELS[l]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/centre-assistance")}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {t("settings.helpCenter")}
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700" onClick={() => logout()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.signOut")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
