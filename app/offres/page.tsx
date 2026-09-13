"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { subscriptionService } from "@/lib/api/subscription.service"
import { PlanFeatureList } from "@/components/pricing/plan-feature-list"

interface IPlan {
  id: string
  name: string
  price: number
  billingPeriod: "MONTHLY" | "ANNUAL"
  features: string[]
}

function formatFcfa(price: number) {
  return price.toLocaleString("fr-FR")
}

export default function OffresPage() {
  const [plans, setPlans] = useState<IPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    subscriptionService.getPlans("USER")
      .then((res: any) => {
        const data = res?.data ?? res ?? []
        setPlans(Array.isArray(data) ? [...data].sort((a, b) => a.price - b.price) : [])
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-12 sm:py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Choisis le plan qui te convient</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto text-pretty">
            Trouve ton match parfait avec les plans d'abonnement sur mesure de Goriya
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : plans.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Les plans ne sont pas disponibles pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 items-stretch">
            {plans.map((plan) => {
              const planKey = plan.name?.toLowerCase() ?? ""
              // Standard est le « choix populaire » (contour bleu + badge) ;
              // Premium se distingue par son seul contour noir, sans badge.
              const isPopular = planKey === "standard"
              const isPremium = planKey === "premium"
              return (
                <Card
                  key={plan.id}
                  className={`relative h-full ${
                    isPopular
                      ? "border-blue-500 ring-2 ring-blue-500"
                      : isPremium
                        ? "border-2 border-black dark:border-white"
                        : "border-border"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-brand-gradient text-white px-4 py-1">
                        Choix populaire
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-6 sm:pb-8">
                    <CardTitle className="text-xl sm:text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl sm:text-4xl font-bold text-blue-600">{formatFcfa(plan.price)}</span>
                      <span className="text-muted-foreground ml-1">FCFA{plan.price > 0 ? (plan.billingPeriod === "ANNUAL" ? " / an" : " / mois") : ""}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href="/auth/signin">   
                      <Button className={`w-full rounded-full mb-4 sm:mb-6 ${isPopular ? "bg-brand-gradient hover:bg-brand-gradient-hover" : "bg-primary hover:bg-primary/90"}`}>
                        {plan.price === 0 ? "Commencer gratuitement" : "Choisir ce plan"}
                      </Button>
                    </Link>
                    <PlanFeatureList planName={plan.name} className="space-y-3" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* FAQ Section */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
                <p className="text-muted-foreground">
                  Oui, tu peux upgrader ou downgrader ton plan à tout moment. Les changements prennent effet
                  immédiatement.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Y a-t-il une période d'essai gratuite ?</h3>
                <p className="text-muted-foreground">
                  Le plan Grouilleur est gratuit et sans engagement - de quoi tester Goriya avant de passer à un
                  plan payant.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Comment fonctionne la facturation ?</h3>
                <p className="text-muted-foreground">
                  La facturation est automatique selon la période choisie (mensuelle ou annuelle). Tu reçois une
                  confirmation par email à chaque paiement.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Puis-je annuler mon abonnement ?</h3>
                <p className="text-muted-foreground">
                  Tu peux annuler ton abonnement à tout moment depuis tes paramètres. L'accès reste actif jusqu'à
                  la fin de la période payée.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mt-16 sm:mt-20 py-12 sm:py-16 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-2xl border border-border">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Prêt à commencer ?</h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Rejoins des milliers de professionnels qui font confiance à Goriya pour leur carrière
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-brand-gradient hover:bg-brand-gradient-hover w-full sm:w-auto rounded-full ">Commencer maintenant</Button>
            </Link>
            <Link href="/a-propos">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full">Nous contacter</Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
