"use client"

import { useState, useEffect, useRef } from "react"
import Script from "next/script"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, Phone, ChevronDown, ChevronRight, Check, Zap, Loader2, Briefcase, FileUser, Building2, CreditCard } from "lucide-react"
import { TawkToChat } from "@/components/tawk-to-chat"
import { subscriptionService } from "@/lib/api/subscription.service"
import { KKIAPAY_WIDGET_SRC, openKkiapayWidget } from "@/lib/kkiapay"
import { useAuth } from "@/contexts/auth-context"
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
    { id: "assistance", label: "Centre d'assistance" },
    { id: "tarifs", label: "Tarifs d'abonnement" },
] as const

type Tab = (typeof TABS)[number]["id"]

export default function Page() {
    const router = useRouter()
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<Tab>("assistance")
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
    const [plans, setPlans] = useState<Plan[]>([])
    const [loadingPlans, setLoadingPlans] = useState(true)
    const [subscribing, setSubscribing] = useState<string | null>(null)
    const [gateways, setGateways] = useState<string[]>([])
    const [gateway, setGateway] = useState<string>("paiementpro")
    const [phone, setPhone] = useState("")
    const pendingCheckoutRef = useRef<{ userId: string; planId: string } | null>(null)

    useEffect(() => {
        subscriptionService.getPlans("USER")
            .then((res) => {
                const data = (res as any)?.data ?? res ?? []
                setPlans(Array.isArray(data) ? data : [])
            })
            .catch(() => { })
            .finally(() => setLoadingPlans(false))
    }, [])

    useEffect(() => {
        subscriptionService.getPaymentGateways()
            .then((res) => {
                const data = (res as any)?.data ?? res
                setGateways(data?.enabledGateways ?? [])
                if (data?.defaultGateway) setGateway(data.defaultGateway)
            })
            .catch(() => { })
    }, [])

    const showGatewayPicker = gateways.includes("kkiapay") && gateways.includes("paiementpro")

    const handleSelectPlan = async (plan: Plan) => {
        if (!user?.id) {
            router.push("/auth/plan")
            return
        }
        if (Number(plan.price) > 0 && gateway === "paiementpro" && phone.trim().length < 8) {
            toast.error("Renseigne ton numéro de téléphone pour payer via Paiement Pro.")
            return
        }
        setSubscribing(plan.id)
        try {
            if (Number(plan.price) === 0) {
                await subscriptionService.subscribe({ userId: user.id, planId: plan.id })
                toast.success("Abonnement activé avec succès !")
                router.push("/dashboard")
                return
            }

            if (gateway === "paiementpro") {
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
                return
            }

            const res = await subscriptionService.createCheckout({ userId: user.id, planId: plan.id, gateway: "kkiapay" })
            const data = (res as any)?.data ?? res
            pendingCheckoutRef.current = { userId: user.id, planId: plan.id }
            openKkiapayWidget({ amount: data.amount, clientReference: data.clientReference })
        } catch {
            toast.error("Erreur lors de l'initialisation du paiement. Veuillez réessayer.")
            setSubscribing(null)
        }
    }

    // Callbacks du widget Kkiapay, branchés une seule fois via Script.onLoad -
    // pendingCheckoutRef reste à jour même si ce closure n'est pas recréé.
    const handleKkiapaySuccess = (response: { transactionId: string }) => {
        const pending = pendingCheckoutRef.current
        if (!pending) return
        sessionStorage.setItem("kkiapay_transaction_id", response.transactionId)
        router.push(`/auth/payment-success?userId=${pending.userId}&planId=${pending.planId}`)
    }

    const handleKkiapayFailed = () => {
        toast.error("Le paiement a été annulé ou a échoué.")
        setSubscribing(null)
    }

    const contactMethods = [
        {
            icon: MessageCircle,
            title: "Chat en direct",
            description: "Chate avec nos experts",
            color: "bg-blue-50 text-blue-600",
            href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Assistance GORIYA")}`,
        },
        {
            icon: Mail,
            title: "Envoyer un email",
            description: SUPPORT_EMAIL,
            color: "bg-green-50 text-green-600",
            href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Assistance GORIYA")}`,
        },
        {
            icon: Phone,
            title: "Téléphone",
            description: SUPPORT_PHONE,
            color: "bg-orange-50 text-orange-600",
            href: `tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`,
        },
    ]

    const categories = [
        { name: "Candidatures", icon: Briefcase, color: "bg-blue-500", count: "4 articles" },
        { name: "CV & Profil", icon: FileUser, color: "bg-green-500", count: "5 articles" },
        { name: "Entreprises", icon: Building2, color: "bg-orange-500", count: "3 articles" },
        { name: "Facturation", icon: CreditCard, color: "bg-red-500", count: "2 articles" },
    ]

    const faqItems = [
        { question: "Comment modifier mes informations après inscription ?", views: "89 vues" },
        { question: "Comment télécharger le carnet de candidats ?", views: "67 vues" },
        { question: "Puis-je modifier mes infos après inscription ?", views: "54 vues" },
        { question: "Comment annuler mon abonnement ?", views: "41 vues" },
    ]

    const resources = [
        {
            title: "Guide de démarrage rapide",
            description: "Apprends les étapes clés pour bien commencer",
            badge: "Nouveau",
        },
        {
            title: "Optimiser son profil Goriya",
            description: "Conseils pour améliorer ta visibilité",
            badge: "Populaire",
        },
    ]

    return (
        <>
            <TawkToChat />
            <Script
                src={KKIAPAY_WIDGET_SRC}
                strategy="afterInteractive"
                onLoad={() => {
                    window.addSuccessListener?.(handleKkiapaySuccess)
                    window.addFailedListener?.(handleKkiapayFailed)
                }}
            />

            <div className="bg-white dark:bg-background">
                <div className="mx-auto max-w-5xl">
                    <PageHeader title="Centre d'assistance" />

                    <Tabs defaultValue="assistance" className="w-full">
                        <TabsList className="mb-8 w-full justify-start rounded-full bg-[#f4f7ff] dark:bg-muted p-1">
                            {TABS.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="rounded-full px-5 py-2.5 text-sm font-medium
          text-[#7f8796]
          data-[state=active]:bg-white
          data-[state=active]:text-[#2f6de6]
          data-[state=active]:shadow-sm
          dark:text-muted-foreground
          dark:data-[state=active]:bg-background
          dark:data-[state=active]:text-primary"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* ── TAB: Centre d'assistance ── */}
                        <TabsContent value="assistance" className="mt-0">
                            {/* Hero */}
                            <div className="bg-gradient-to-r from-[#1d4db8] to-[#2566d9] rounded-2xl p-6 text-white mb-8">
                                <h2 className="text-3xl font-bold mb-2">
                                    Comment pouvons-nous t'aider ?
                                </h2>

                                <p className="text-white/90 mb-6">
                                    Trouve rapidement des réponses à tes questions ou consulte nos ressources
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
                                    Parcourir par catégorie
                                </h3>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                                    {categories.map((cat, i) => {
                                        const Icon = cat.icon

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                className="flex h-full flex-col items-center rounded-md border border-[#e8edf6] dark:border-border bg-white dark:bg-card p-4 text-center transition-colors hover:border-[#2f6de6]"
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
                                    Réponses aux questions
                                </h3>

                                <div className="space-y-3">
                                    {faqItems.map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                setOpenFaqIndex(openFaqIndex === i ? null : i)
                                            }
                                            className="w-full bg-white dark:bg-card border border-[#e8edf6] dark:border-border rounded-md p-4 hover:border-[#2f6de6] transition-colors text-left"
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
                                                        Réponse détaillée à la question...
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
                                    Ressources utiles
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {resources.map((resource, i) => (
                                        <Card
                                            key={i}
                                            className="rounded-md border border-[#e8edf6] dark:border-border hover:shadow-md transition-shadow"
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
                                        Choisis ton forfait
                                    </h2>

                                    <p className="text-[#7f8796] dark:text-muted-foreground text-sm max-w-md mx-auto">
                                        Choisis le plan qui correspond à tes ambitions professionnelles.
                                        Commence gratuitement et évolue selon tes besoins.
                                    </p>
                                </div>

                                {/* PaiementPro uniquement */}
                                <div className="mx-auto mb-6 max-w-md">
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Numéro de téléphone (Mobile Money)"
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
                                            const isPremium = Number(plan.price) > 0

                                            return (
                                                <div
                                                    key={plan.id}
                                                    className={`relative flex h-full min-h-[460px] flex-col rounded-md border-2 p-6 ${isPremium
                                                            ? "border-black dark:border-white shadow-lg shadow-blue-100"
                                                            : "border-[#e8edf6] dark:border-border"
                                                        }`}
                                                >
                                                    <div className="mb-4">
                                                        <div className="mb-3">
                                                            {isPremium ? (
                                                                <Zap className="w-8 h-8 text-[#2f6de6] dark:text-primary" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-[#f4f7ff] dark:bg-muted flex items-center justify-center text-[#2f6de6] dark:text-primary text-sm font-bold">
                                                                    G
                                                                </div>
                                                            )}
                                                        </div>

                                                        <h3
                                                            className={`text-xl font-bold mb-1 ${isPremium
                                                                    ? "text-[#2f6de6] dark:text-primary"
                                                                    : "text-[#1b2331] dark:text-foreground"
                                                                }`}
                                                        >
                                                            {plan.name}
                                                        </h3>

                                                        <p className="text-2xl font-bold text-[#1b2331] dark:text-foreground">
                                                            {Number(plan.price) === 0
                                                                ? "Gratuit"
                                                                : `${Number(plan.price).toLocaleString("fr-FR")} FCFA`}
                                                        </p>

                                                        {Number(plan.price) > 0 && (
                                                            <p className="text-[11px] text-[#9aa3b2] dark:text-muted-foreground mt-0.5">
                                                                {plan.billingPeriod === "ANNUAL"
                                                                    ? "par an"
                                                                    : "par mois"}
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
                                                                    className={`w-4 h-4 shrink-0 ${isPremium
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
                                                        className={`mt-auto w-full rounded-full font-semibold ${isPremium
                                                                ? "bg-[#2f6de6] hover:bg-[#2157d3] text-white"
                                                                : "bg-[#f4f7ff] dark:bg-muted hover:bg-[#e8edf6] dark:hover:bg-muted text-[#1b2331] dark:text-foreground"
                                                            }`}
                                                    >
                                                        {subscribing === plan.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : Number(plan.price) === 0 ? (
                                                            "Commencer gratuitement"
                                                        ) : (
                                                            "Opter pour ça"
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
                        <h3 className="text-lg font-bold text-[#1b2331] dark:text-foreground mb-2">Une question ? Besoin d'aide ?</h3>
                        <p className="text-[13px] text-[#7f8796] dark:text-muted-foreground mb-6">
                            Notre équipe est là pour t'accompagner dans ton choix et répondre à toutes tes questions.
                        </p>
                        <a
                            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Assistance GORIYA")}`}
                            className="inline-flex items-center px-6 h-9 rounded-full bg-[#f4f7ff] dark:bg-muted border border-[#d8deeb] dark:border-border text-[#2f6de6] dark:text-primary text-[12px] font-medium hover:bg-[#e8edf6] dark:hover:bg-muted transition-colors"
                        >
                            Contacter le support
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}
