"use client"

import { useState, useEffect, useRef } from "react"
import Script from "next/script"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, Phone, ChevronDown, ChevronRight, Check, Zap, Loader2 } from "lucide-react"
import { TawkToChat } from "@/components/tawk-to-chat"
import { subscriptionService } from "@/lib/api/subscription.service"
import { KKIAPAY_WIDGET_SRC, openKkiapayWidget } from "@/lib/kkiapay"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Plan {
    id: string
    name: string
    price: number
    billingPeriod: string
    features: string[]
}

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
    const pendingCheckoutRef = useRef<{ userId: string; planId: string } | null>(null)

    useEffect(() => {
        subscriptionService.getPlans("USER")
            .then((res) => {
                const data = (res as any)?.data ?? res ?? []
                setPlans(Array.isArray(data) ? data : [])
            })
            .catch(() => {})
            .finally(() => setLoadingPlans(false))
    }, [])

    const handleSelectPlan = async (plan: Plan) => {
        if (!user?.id) {
            router.push("/auth/plan")
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
            const res = await subscriptionService.createCheckout({ userId: user.id, planId: plan.id })
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
        },
        {
            icon: Mail,
            title: "Envoyer un email",
            description: "Écris-nous ta demande",
            color: "bg-green-50 text-green-600",
        },
        {
            icon: Phone,
            title: "Téléphone",
            description: "Appelle notre équipe",
            color: "bg-orange-50 text-orange-600",
        },
    ]

    const categories = [
        { name: "Candidatures", color: "bg-blue-500", count: "4 articles" },
        { name: "CV & Profil", color: "bg-green-500", count: "5 articles" },
        { name: "Entreprises", color: "bg-orange-500", count: "3 articles" },
        { name: "Facturation", color: "bg-red-500", count: "2 articles" },
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

            <div className="bg-white">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <h1 className="text-xl font-bold text-[#1b2331] mb-6">Centre d'assistance</h1>

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-[#e8edf6] mb-8">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                                    activeTab === tab.id
                                        ? "border-[#2f6de6] text-[#2f6de6]"
                                        : "border-transparent text-[#7f8796] hover:text-[#1b2331]"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── TAB: Centre d'assistance ── */}
                    {activeTab === "assistance" && (
                        <>
                            {/* Hero */}
                            <div className="bg-gradient-to-r from-[#1d4db8] to-[#2566d9] rounded-2xl p-6 text-white mb-8">
                                <h2 className="text-3xl font-bold mb-2">Comment pouvons-nous t'aider ?</h2>
                                <p className="text-white/90 mb-6">
                                    Trouve rapidement des réponses à tes questions ou consulte nos ressources
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {contactMethods.map((method, i) => {
                                        const Icon = method.icon
                                        return (
                                            <button
                                                key={i}
                                                className={`${method.color} rounded-xl p-4 text-left hover:opacity-90 transition-opacity`}
                                            >
                                                <Icon className="w-6 h-6 mb-2" />
                                                <h3 className="font-semibold text-[13px]">{method.title}</h3>
                                                <p className="text-[11px] opacity-75">{method.description}</p>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-[#1b2331] mb-4">Parcourir par catégorie</h3>
                                <div className="flex justify-center gap-6 flex-wrap">
                                    {categories.map((cat, i) => (
                                        <button
                                            key={i}
                                            className="flex flex-col items-center gap-2 hover:opacity-75 transition-opacity"
                                        >
                                            <div className={`w-14 h-14 ${cat.color} rounded-full flex items-center justify-center text-white font-bold text-xl hover:shadow-lg transition-shadow cursor-pointer`}>
                                                {cat.name.charAt(0)}
                                            </div>
                                            <p className="text-[12px] font-medium text-[#1b2331]">{cat.name}</p>
                                            <p className="text-[11px] text-[#9aa3b2]">{cat.count}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-[#1b2331] mb-4">Réponses aux questions</h3>
                                <div className="space-y-3">
                                    {faqItems.map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                                            className="w-full bg-white border border-[#e8edf6] rounded-xl p-4 hover:border-[#2f6de6] transition-colors text-left"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-[13px] text-[#1b2331] mb-1">{item.question}</p>
                                                    <p className="text-[11px] text-[#9aa3b2]">{item.views}</p>
                                                </div>
                                                <ChevronDown className={`w-5 h-5 text-[#9aa3b2] transition-transform ${openFaqIndex === i ? "rotate-180" : ""}`} />
                                            </div>
                                            {openFaqIndex === i && (
                                                <div className="mt-4 pt-4 border-t border-[#e8edf6]">
                                                    <p className="text-[12px] text-[#4e5a6e] leading-relaxed">
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
                                <h3 className="text-lg font-bold text-[#1b2331] mb-4">Ressources utiles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {resources.map((resource, i) => (
                                        <Card key={i} className="border border-[#e8edf6] hover:shadow-md transition-shadow">
                                            <CardContent className="p-4 flex items-start gap-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-[13px] text-[#1b2331] mb-1">{resource.title}</h4>
                                                    <p className="text-[12px] text-[#7f8796] mb-2">{resource.description}</p>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#5b6f98]">
                                                        {resource.badge}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-[#9aa3b2] flex-shrink-0" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── TAB: Tarifs d'abonnement ── */}
                    {activeTab === "tarifs" && (
                        <div className="mb-8">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-[#1b2331] mb-3">Choisis ton forfait</h2>
                                <p className="text-[#7f8796] text-sm max-w-md mx-auto">
                                    Choisis le plan qui correspond à tes ambitions professionnelles.
                                    Commence gratuitement et évolue selon tes besoins.
                                </p>
                            </div>

                            {loadingPlans ? (
                                <div className="flex justify-center py-16">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#2f6de6]" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                    {plans.map((plan) => {
                                        const isPremium = Number(plan.price) > 0
                                        return (
                                            <div
                                                key={plan.id}
                                                className={`relative rounded-2xl border-2 p-6 flex flex-col ${
                                                    isPremium
                                                        ? "border-[#2f6de6] shadow-lg shadow-blue-100"
                                                        : "border-[#e8edf6]"
                                                }`}
                                            >
                                                {isPremium && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                        <span className="bg-[#2f6de6] text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                            Plan populaire
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="mb-4">
                                                    <div className="mb-3">
                                                        {isPremium ? (
                                                            <Zap className="w-8 h-8 text-[#2f6de6]" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-[#f4f7ff] flex items-center justify-center text-[#2f6de6] text-sm font-bold">G</div>
                                                        )}
                                                    </div>
                                                    <h3 className={`text-xl font-bold mb-1 ${isPremium ? "text-[#2f6de6]" : "text-[#1b2331]"}`}>
                                                        {plan.name}
                                                    </h3>
                                                    <p className="text-2xl font-bold text-[#1b2331]">
                                                        {Number(plan.price) === 0
                                                            ? "Gratuit"
                                                            : `${Number(plan.price).toLocaleString("fr-FR")} FCFA`}
                                                    </p>
                                                    {Number(plan.price) > 0 && (
                                                        <p className="text-[11px] text-[#9aa3b2] mt-0.5">
                                                            {plan.billingPeriod === "ANNUAL" ? "par an" : "par mois"}
                                                        </p>
                                                    )}
                                                </div>

                                                <ul className="space-y-2.5 mb-6 flex-1">
                                                    {plan.features.map((f, i) => (
                                                        <li key={i} className="flex items-center gap-2 text-sm text-[#4e5a6e]">
                                                            <Check className={`w-4 h-4 shrink-0 ${isPremium ? "text-[#2f6de6]" : "text-[#9aa3b2]"}`} />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <Button
                                                    onClick={() => handleSelectPlan(plan)}
                                                    disabled={subscribing === plan.id}
                                                    className={`w-full rounded-full font-semibold ${
                                                        isPremium
                                                            ? "bg-[#2f6de6] hover:bg-[#2157d3] text-white"
                                                            : "bg-[#f4f7ff] hover:bg-[#e8edf6] text-[#1b2331]"
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
                    )}

                    {/* CTA - visible sur les deux onglets */}
                    <div className="bg-white border border-[#e8edf6] rounded-2xl p-8 text-center">
                        <h3 className="text-lg font-bold text-[#1b2331] mb-2">Une question ? Besoin d'aide ?</h3>
                        <p className="text-[13px] text-[#7f8796] mb-6">
                            Notre équipe est là pour t'accompagner dans ton choix et répondre à toutes tes questions.
                        </p>
                        <button className="px-6 h-9 rounded-full bg-[#f4f7ff] border border-[#d8deeb] text-[#2f6de6] text-[12px] font-medium hover:bg-[#e8edf6] transition-colors">
                            Contacter le support
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
