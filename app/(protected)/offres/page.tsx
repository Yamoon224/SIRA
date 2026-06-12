"use client"

import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Star, Users, Briefcase } from "lucide-react"

interface PlanFeature {
  name: string
  basic: boolean | string
  pro: boolean | string
  premium: boolean | string
}

const jobSeekerFeatures: PlanFeature[] = [
  { name: "Candidatures par mois", basic: "5", pro: "25", premium: "Illimitées" },
  { name: "Profil visible par les recruteurs", basic: false, pro: true, premium: true },
  { name: "Accès aux offres premium", basic: false, pro: true, premium: true },
  { name: "Alertes emploi personnalisées", basic: "1", pro: "5", premium: "Illimitées" },
  { name: "Support prioritaire", basic: false, pro: false, premium: true },
  { name: "Analyse de CV par IA", basic: false, pro: true, premium: true },
  { name: "Coaching carrière", basic: false, pro: false, premium: true },
]

const employerFeatures: PlanFeature[] = [
  { name: "Offres d'emploi actives", basic: "1", pro: "10", premium: "Illimitées" },
  { name: "Candidatures reçues", basic: "50", pro: "500", premium: "Illimitées" },
  { name: "Recherche de candidats", basic: false, pro: true, premium: true },
  { name: "Outils de tri avancés", basic: false, pro: true, premium: true },
  { name: "Branding entreprise", basic: false, pro: false, premium: true },
  { name: "Statistiques détaillées", basic: false, pro: true, premium: true },
  { name: "Support dédié", basic: false, pro: false, premium: true },
]

const jobSeekerPlans = [
  {
    name: "Basique",
    price: "0",
    period: "Gratuit",
    description: "Parfait pour commencer votre recherche d'emploi",
    popular: false,
    color: "border-border",
  },
  {
    name: "Pro",
    price: "19",
    period: "/mois",
    description: "Idéal pour une recherche active et ciblée",
    popular: true,
    color: "border-blue-500 ring-2 ring-blue-500",
  },
  {
    name: "Premium",
    price: "39",
    period: "/mois",
    description: "Pour les professionnels exigeants",
    popular: false,
    color: "border-border",
  },
]

const employerPlans = [
  {
    name: "Starter",
    price: "49",
    period: "/mois",
    description: "Parfait pour les petites entreprises",
    popular: false,
    color: "border-border",
  },
  {
    name: "Business",
    price: "149",
    period: "/mois",
    description: "Idéal pour les entreprises en croissance",
    popular: true,
    color: "border-blue-500 ring-2 ring-blue-500",
  },
  {
    name: "Enterprise",
    price: "299",
    period: "/mois",
    description: "Pour les grandes organisations",
    popular: false,
    color: "border-border",
  },
]

export default function OffresPage() {
  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? <Check className="w-5 h-5 text-blue-600" /> : <span className="text-muted-foreground">-</span>
    }
    return <span className="font-medium">{value}</span>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 sm:py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Choisissez le plan qui vous convient</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto text-pretty">
            Trouvez votre match parfait avec les plans d'abonnement sur mesure de Goriya
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Tabs defaultValue="jobseekers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 sm:mb-12">
            <TabsTrigger value="jobseekers" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Candidats</span>
            </TabsTrigger>
            <TabsTrigger value="employers" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Employeurs</span>
            </TabsTrigger>
          </TabsList>

          {/* Job Seekers Plans */}
          <TabsContent value="jobseekers">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
              {jobSeekerPlans.map((plan, index) => (
                <Card key={plan.name} className={`relative ${plan.color} ${plan.popular ? "scale-105" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Populaire
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-6 sm:pb-8">
                    <CardTitle className="text-xl sm:text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl sm:text-4xl font-bold text-blue-600">{plan.price}€</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className={`w-full mb-4 sm:mb-6 ${
                        plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-primary hover:bg-primary/90"
                      }`}
                    >
                      {plan.price === "0" ? "Commencer gratuitement" : "Choisir ce plan"}
                    </Button>
                    <div className="space-y-3">
                      {jobSeekerFeatures.slice(0, 4).map((feature) => (
                        <div key={feature.name} className="flex items-center justify-between">
                          <span className="text-sm">{feature.name}</span>
                          {renderFeatureValue(
                            index === 0 ? feature.basic : index === 1 ? feature.pro : feature.premium,
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Job Seekers Feature Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Comparaison détaillée des fonctionnalités</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Fonctionnalités</th>
                        <th className="text-center py-3 px-4">Basique</th>
                        <th className="text-center py-3 px-4">Pro</th>
                        <th className="text-center py-3 px-4">Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobSeekerFeatures.map((feature, index) => (
                        <tr key={feature.name} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                          <td className="py-3 px-4 font-medium">{feature.name}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureValue(feature.basic)}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureValue(feature.pro)}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureValue(feature.premium)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employers Plans */}
          <TabsContent value="employers">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
              {employerPlans.map((plan, index) => (
                <Card key={plan.name} className={`relative ${plan.color} ${plan.popular ? "scale-105" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Populaire
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-6 sm:pb-8">
                    <CardTitle className="text-xl sm:text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl sm:text-4xl font-bold text-blue-600">{plan.price}€</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className={`w-full mb-4 sm:mb-6 ${
                        plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-primary hover:bg-primary/90"
                      }`}
                    >
                      Choisir ce plan
                    </Button>
                    <div className="space-y-3">
                      {employerFeatures.slice(0, 4).map((feature) => (
                        <div key={feature.name} className="flex items-center justify-between">
                          <span className="text-sm">{feature.name}</span>
                          {renderFeatureValue(
                            index === 0 ? feature.basic : index === 1 ? feature.pro : feature.premium,
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Employers Feature Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Comparaison détaillée des fonctionnalités</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Fonctionnalités</th>
                        <th className="text-center py-3 px-4">Starter</th>
                        <th className="text-center py-3 px-4">Business</th>
                        <th className="text-center py-3 px-4">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employerFeatures.map((feature, index) => (
                        <tr key={feature.name} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                          <td className="py-3 px-4 font-medium">{feature.name}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureValue(feature.basic)}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureValue(feature.pro)}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureValue(feature.premium)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* FAQ Section */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
                <p className="text-muted-foreground">
                  Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet
                  immédiatement.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Y a-t-il une période d'essai gratuite ?</h3>
                <p className="text-muted-foreground">
                  Tous nos plans payants incluent une période d'essai gratuite de 14 jours. Aucune carte de crédit
                  requise.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Comment fonctionne la facturation ?</h3>
                <p className="text-muted-foreground">
                  La facturation est mensuelle et automatique. Vous recevrez une facture par email chaque mois.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Puis-je annuler mon abonnement ?</h3>
                <p className="text-muted-foreground">
                  Vous pouvez annuler votre abonnement à tout moment depuis vos paramètres. L'accès reste actif jusqu'à
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
            Rejoignez des milliers de professionnels qui font confiance à Goriya pour leur carrière
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Commencer maintenant
            </Button>
            <Button size="lg" variant="outline">
              Nous contacter
            </Button>
          </div>
        </section>
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  )
}
