"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, Phone, ChevronDown, ChevronRight, Check, Crown, Zap, Loader2, Briefcase, FileUser, Building2, CreditCard } from "lucide-react"
import { TawkToChat } from "@/components/tawk-to-chat"
import { subscriptionService } from "@/lib/api/subscription.service"
import { useAuth } from "@/contexts/auth-context"
import { useT, type TranslationKey } from "@/contexts/i18n-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { PageHeader } from "@/components/layout/page-header"

interface Plan {
    id: string
    name: string
    price: number
    billingPeriod: string
    features: string[]
}

const SUPPORT_EMAIL = "support@goriya.net"
const SUPPORT_PHONE = "+225 07 58 70 06 92"

const TABS = [
    { id: "assistance", labelKey: "help.tabAssistance" },
    { id: "tarifs", labelKey: "help.tabPricing" },
] as const satisfies readonly { id: string; labelKey: TranslationKey }[]

export default function Page() {
    const router = useRouter()
    const { user } = useAuth()
    const t = useT()
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
    const [plans, setPlans] = useState<Plan[]>([])
    const [loadingPlans, setLoadingPlans] = useState(true)
    const [subscribing, setSubscribing] = useState<string | null>(null)
    const [phone, setPhone] = useState("")

    useEffect(() => {
        subscriptionService.getPlans("USER")
            .then((res) => {
                const data = (res as any)?.data ?? res ?? []
                setPlans(Array.isArray(data) ? data : [])
            })
            .catch(() => { })
            .finally(() => setLoadingPlans(false))
    }, [])

    const handleSelectPlan = async (plan: Plan) => {
        if (!user?.id) {
            router.push("/auth/plan")
            return
        }
        if (Number(plan.price) > 0 && phone.trim().length < 8) {
            toast.error(t("plans.phoneRequired"))
            return
        }
        setSubscribing(plan.id)
        try {
            if (Number(plan.price) === 0) {
                await subscriptionService.subscribe({ userId: user.id, planId: plan.id })
                toast.success(t("plans.subscribed"))
                router.push("/dashboard")
                return
            }

            // Paiement Pro en session hébergée : unique moyen de paiement proposé.
            const origin = window.location.origin
            const res = await subscriptionService.createCheckout({
                userId: user.id,
                planId: plan.id,
                gateway: "paiementpro",
                customerPhone: phone.trim(),
                successUrl: `${origin}/auth/payment-success?userId=${user.id}&planId=${plan.id}&gateway=paiementpro`,
                errorUrl: `${origin}/auth/payment-error?planId=${plan.id}`,
            })
            const data = (res as any)?.data ?? res
            if (!data?.checkoutUrl) throw new Error("checkoutUrl manquante")
            window.location.href = data.checkoutUrl
        } catch {
            toast.error(t("plans.paymentError"))
            setSubscribing(null)
        }
    }

    const contactMethods = [
        {
            icon: MessageCircle,
            title: t("help.liveChat"),
            description: t("help.liveChatHint"),
            color: "bg-blue-50 text-blue-600",
            href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Assistance GORIYA")}`,
        },
        {
            icon: Mail,
            title: t("help.sendEmail"),
            description: SUPPORT_EMAIL,
            color: "bg-green-50 text-green-600",
            href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Assistance GORIYA")}`,
        },
        {
            icon: Phone,
            title: t("help.phone"),
            description: SUPPORT_PHONE,
            color: "bg-orange-50 text-orange-600",
            href: `tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`,
        },
    ]

    const categories = [
        { name: t("help.categoryApplications"), icon: Briefcase, color: "bg-blue-500", count: t("help.articleCount", { count: 4 }) },
        { name: t("help.categoryCvProfile"), icon: FileUser, color: "bg-green-500", count: t("help.articleCount", { count: 5 }) },
        { name: t("help.categoryCompanies"), icon: Building2, color: "bg-orange-500", count: t("help.articleCount", { count: 3 }) },
        { name: t("help.categoryBilling"), icon: CreditCard, color: "bg-red-500", count: t("help.articleCount", { count: 2 }) },
    ]

    const faqItems = [
        { question: t("help.faq1"), views: t("help.viewCount", { count: 89 }) },
        { question: t("help.faq2"), views: t("help.viewCount", { count: 67 }) },
        { question: t("help.faq3"), views: t("help.viewCount", { count: 54 }) },
        { question: t("help.faq4"), views: t("help.viewCount", { count: 41 }) },
    ]

    const resources = [
        {
            title: t("help.resource1Title"),
            description: t("help.resource1Description"),
            badge: t("help.resource1Badge"),
        },
        {
            title: t("help.resource2Title"),
            description: t("help.resource2Description"),
            badge: t("help.resource2Badge"),
        },
    ]

    return (
        <>
            <TawkToChat />

            <div className="bg-white dark:bg-background">
                <div className="mx-auto max-w-5xl">
                    <PageHeader title={t("nav.helpCenter")} />

                    <Tabs defaultValue="assistance" className="w-full">
                        <TabsList className="mb-8 grid h-auto w-full grid-cols-2 rounded-full bg-[#f4f7ff] p-1.5 dark:bg-muted">
                            {TABS.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="w-full rounded-full px-5 py-2.5 text-sm font-medium leading-none text-[#7f8796] data-[state=active]:bg-white data-[state=active]:text-[#2f6de6] data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:bg-background dark:data-[state=active]:text-primary"
                                >
                                    {t(tab.labelKey)}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* ── TAB: Centre d'assistance ── */}
                        <TabsContent value="assistance" className="mt-0">
                            {/* Hero */}
                            <div className="bg-brand-gradient rounded-2xl p-6 text-white mb-8">
                                <h2 className="text-3xl font-bold mb-2">
                                    {t("help.heroTitle")}
                                </h2>

                                <p className="text-white/90 mb-6">
                                    {t("help.heroSubtitle")}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {contactMethods.map((method, i) => {
                                        const Icon = method.icon

                                        return (
                                            <a
                                                key={i}
                                                href={method.href}
                                                className={`${method.color} rounded-xl p-4 text-left hover:opacity-90 transition-opacity block`}
                                            >
                                                <Icon className="w-6 h-6 mb-2" />

                                                <h3 className="font-semibold text-[13px]">
                                                    {method.title}
                                                </h3>

                                                <p className="text-[11px] opacity-75 break-all">
                                                    {method.description}
                                                </p>
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-[#1b2331] dark:text-foreground mb-4">
                                    {t("help.browseByCategory")}
                                </h3>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                                    {categories.map((cat, i) => {
                                        const Icon = cat.icon

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                className="flex h-full flex-col items-center rounded-2xl border border-[#e8edf6] dark:border-border bg-white dark:bg-card p-4 text-center transition-colors hover:border-[#2f6de6]"
                                            >
                                                <div
                                                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${cat.color} text-white`}
                                                >
                                                    <Icon className="h-6 w-6" strokeWidth={1.9} />
                                                </div>

                                                <p className="text-[13px] font-medium leading-tight text-[#1b2331] dark:text-foreground">
                                                    {cat.name}
                                                </p>

                                                <p className="mt-auto pt-2 text-[11px] text-[#9aa3b2] dark:text-muted-foreground">
                                                    {cat.count}
                                                </p>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-[#1b2331] dark:text-foreground mb-4">
                                    {t("help.faqTitle")}
                                </h3>

                                <div className="space-y-3">
                                    {faqItems.map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                setOpenFaqIndex(openFaqIndex === i ? null : i)
                                            }
                                            className="w-full bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl p-4 hover:border-[#2f6de6] transition-colors text-left"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-[13px] text-[#1b2331] dark:text-foreground mb-1">
                                                        {item.question}
                                                    </p>

                                                    <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground">
                                                        {item.views}
                                                    </p>
                                                </div>

                                                <ChevronDown
                                                    className={`w-5 h-5 text-[#9aa3b2] dark:text-muted-foreground transition-transform ${openFaqIndex === i ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </div>

                                            {openFaqIndex === i && (
                                                <div className="mt-4 pt-4 border-t border-[#e8edf6] dark:border-border">
                                                    <p className="text-[12px] text-[#4e5a6e] dark:text-foreground leading-relaxed">
                                                        {t("help.faqAnswerPlaceholder")}
                                                    </p>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Resources */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-[#1b2331] dark:text-foreground mb-4">
                                    {t("help.resourcesTitle")}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {resources.map((resource, i) => (
                                        <Card
                                            key={i}
                                            className="rounded-2xl border border-[#e8edf6] dark:border-border hover:shadow-md transition-shadow"
                                        >
                                            <CardContent className="p-4 flex items-start gap-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-[13px] text-[#1b2331] dark:text-foreground mb-1">
                                                        {resource.title}
                                                    </h4>

                                                    <p className="text-[12px] text-[#7f8796] dark:text-muted-foreground mb-2">
                                                        {resource.description}
                                                    </p>

                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eff4ff] dark:bg-primary/10 text-[#5b6f98] dark:text-muted-foreground">
                                                        {resource.badge}
                                                    </span>
                                                </div>

                                                <ChevronRight className="w-5 h-5 text-[#9aa3b2] dark:text-muted-foreground flex-shrink-0" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        {/* ── TAB: Tarifs d'abonnement ── */}
                        <TabsContent value="tarifs" className="mt-0">
                            <div className="mb-8">
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-bold text-[#1b2331] dark:text-foreground mb-3">
                                        {t("plans.title")}
                                    </h2>

                                    <p className="text-[#7f8796] dark:text-muted-foreground text-sm max-w-md mx-auto">
                                        {t("plans.subtitle")}
                                    </p>
                                </div>

                                {/* PaiementPro uniquement */}
                                <div className="mx-auto mb-6 max-w-md">
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder={t("plans.phonePlaceholder")}
                                        className="w-full rounded-full border border-[#e8edf6] dark:border-border px-4 py-2 text-sm outline-none focus:border-[#2f6de6]"
                                    />
                                </div>

                                {loadingPlans ? (
                                    <div className="flex justify-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin text-[#2f6de6] dark:text-primary" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto items-stretch">
                                        {plans.map((plan) => {
                                            const isPaid = Number(plan.price) > 0
                                            const planKey = plan.name?.toLowerCase() ?? ""
                                            const isPopular = planKey === "standard"
                                            // Le contour noir distingue Premium sans lui donner de badge.
                                            const isPremium = planKey === "premium"

                                            return (
                                                <div
                                                    key={plan.id}
                                                    className={`relative flex h-full min-h-[460px] flex-col rounded-2xl border-2 p-6 ${isPopular
                                                        ? "border-[#2f6de6] shadow-lg shadow-blue-100"
                                                        : isPremium
                                                            ? "border-black dark:border-white"
                                                            : "border-[#e8edf6] dark:border-border"
                                                        }`}
                                                >
                                                    {isPopular && (
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                            <span className="rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white">
                                                                Choix populaire
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="mb-4">
                                                        <div className="mb-3">
                                                            {isPremium ? (
                                                                <Crown className="h-8 w-8 text-amber-400" />
                                                            ) : isPaid ? (
                                                                <Zap className="h-8 w-8 text-[#2f6de6] dark:text-primary" />
                                                            ) : (
                                                                <img
                                                                    src="/goriya-symbol.png"
                                                                    alt=""
                                                                    aria-hidden
                                                                    className="h-8 w-8 object-contain"
                                                                />
                                                            )}
                                                        </div>

                                                        <h3
                                                            className={`mb-1 text-xl font-bold ${isPopular || isPaid
                                                                ? "text-[#2f6de6] dark:text-primary"
                                                                : "text-[#1b2331] dark:text-foreground"
                                                                }`}
                                                        >
                                                            {plan.name}
                                                        </h3>

                                                        <p className="text-2xl font-bold text-[#1b2331] dark:text-foreground">
                                                            {Number(plan.price) === 0
                                                                ? t("plans.free")
                                                                : `${Number(plan.price).toLocaleString("fr-FR")} FCFA`}
                                                        </p>

                                                        {Number(plan.price) > 0 && (
                                                            <p className="mt-0.5 text-[11px] text-[#9aa3b2] dark:text-muted-foreground">
                                                                {plan.billingPeriod === "ANNUAL" ? t("plans.perYear") : t("plans.perMonth")}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <ul className="mb-6 flex-1 space-y-2.5">
                                                        {plan.features.map((f, i) => (
                                                            <li
                                                                key={i}
                                                                className="flex items-center gap-2 text-sm text-[#4e5a6e] dark:text-foreground"
                                                            >
                                                                <Check
                                                                    className={`h-4 w-4 shrink-0 ${isPopular || isPaid
                                                                        ? "text-[#2f6de6] dark:text-primary"
                                                                        : "text-[#9aa3b2] dark:text-muted-foreground"
                                                                        }`}
                                                                />
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    <Button
                                                        onClick={() => handleSelectPlan(plan)}
                                                        disabled={subscribing === plan.id}
                                                        className={`mt-auto w-full rounded-full font-semibold ${isPopular || isPaid
                                                            ? "bg-brand-gradient text-white hover:bg-brand-gradient-hover"
                                                            : "bg-[#f4f7ff] text-[#1b2331] hover:bg-[#e8edf6] dark:bg-muted dark:text-foreground dark:hover:bg-muted"
                                                            }`}
                                                    >
                                                        {subscribing === plan.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : Number(plan.price) === 0 ? (
                                                            t("plans.startFree")
                                                        ) : (
                                                            t("plans.choosePlan")
                                                        )}
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* CTA - visible sur les deux onglets */}
                    <div className="bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-2xl p-8 text-center">
                        <h3 className="text-lg font-bold text-[#1b2331] dark:text-foreground mb-2">{t("help.ctaTitle")}</h3>
                        <p className="text-[13px] text-[#7f8796] dark:text-muted-foreground mb-6">
                            {t("help.ctaSubtitle")}
                        </p>
                        <a
                            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Assistance GORIYA")}`}
                            className="inline-flex items-center px-6 h-9 rounded-full bg-[#f4f7ff] dark:bg-muted border border-[#d8deeb] dark:border-border text-[#2f6de6] dark:text-primary text-[12px] font-medium hover:bg-[#e8edf6] dark:hover:bg-muted transition-colors"
                        >
                            {t("help.ctaButton")}
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}
