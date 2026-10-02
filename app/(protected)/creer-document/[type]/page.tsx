"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Save } from "lucide-react"
import { toast } from "sonner"
import { SubscriptionGate } from "@/components/subscription-gate"
import { useAuth } from "@/contexts/auth-context"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { generateDocumentContent, generatePDF, type DocumentData } from "@/lib/document-generator"
import { featureUsageService } from "@/lib/api/feature-usage.service"
import { QuotaExceededNotice } from "@/components/feature-usage/quota-exceeded-notice"

type TemplateField = {
  id: string
  label: string
  required: boolean
  split?: boolean
  /** `date` bascule le champ sur le sélecteur natif (cf. components/ui/input.tsx). */
  type?: "text" | "date" | "tel" | "email"
}

type TemplateConfig = {
  title: string
  fields: TemplateField[]
}

const documentTemplates: Record<string, TemplateConfig> = {
  motivation: {
    title: "Lettre de motivation",
    fields: [
      { id: "nom", label: "Ton nom", required: true, split: true },
      { id: "titre", label: "Ton titre", required: false, split: true },
      { id: "destinataire", label: "Nom du destinataire", required: false, split: true },
      { id: "titreDestinataire", label: "Titre du destinataire", required: false, split: true },
      { id: "adresse", label: "Ton adresse", required: false, split: true },
      { id: "ville", label: "Ville, code postal", required: false, split: true },
      { id: "telephone", label: "Ton téléphone", required: false, split: true, type: "tel" },
      { id: "email", label: "Ton email", required: false, split: true, type: "email" },
      { id: "entreprise", label: "Nom de l'entreprise", required: true },
      { id: "adresseEntreprise", label: "Adresse de l'entreprise", required: false },
      { id: "poste", label: "Poste visé", required: true },
      { id: "competences", label: "Tes compétences clés (ex. : communication digitale, relations presse)", required: false },
      { id: "date", label: "Date", required: false, type: "date" },
    ],
  },
  demission: {
    title: "Lettre de démission",
    fields: [
      { id: "nom", label: "Ton nom", required: true, split: true },
      { id: "poste", label: "Ton poste", required: true, split: true },
      { id: "manager", label: "Nom du destinataire", required: false, split: true },
      { id: "entreprise", label: "Nom de l'entreprise", required: true, split: true },
      { id: "adresse", label: "Ton adresse", required: false, split: true },
      { id: "ville", label: "Ville, code postal", required: false, split: true },
      { id: "telephone", label: "Ton téléphone", required: false, split: true, type: "tel" },
      { id: "email", label: "Ton email", required: false, split: true, type: "email" },
      { id: "adresseEntreprise", label: "Adresse de l'entreprise", required: false },
      { id: "dateFin", label: "Date de fin souhaitée", required: true, type: "date" },
      { id: "date", label: "Date", required: false, type: "date" },
    ],
  },
  recommandation: {
    title: "Lettre de recommandation",
    fields: [
      { id: "nom", label: "Ton nom", required: true, split: true },
      { id: "poste", label: "Ton titre", required: true, split: true },
      { id: "candidat", label: "Nom du destinataire", required: true, split: true },
      { id: "posteCandidatActuel", label: "Titre du destinataire", required: false, split: true },
      { id: "entreprise", label: "Ton entreprise", required: false, split: true },
      { id: "adresse", label: "Adresse", required: false, split: true },
      { id: "telephone", label: "Ton téléphone", required: false, split: true, type: "tel" },
      { id: "email", label: "Ton email", required: false, split: true, type: "email" },
      { id: "posteCandidatVise", label: "Poste visé", required: false },
      { id: "date", label: "Date", required: false, type: "date" },
    ],
  },
}

/** "Lettre de motivation" + "Ange Axel" -> "lettre-de-motivation-ange-axel.pdf" */
function nomFichier(titre: string, nom?: string): string {
  const slug = [titre, nom]
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `${slug || "document"}.pdf`
}

function CreerDocumentContent() {
  const params = useParams()
  const documentType = params.type as string
  const template = documentTemplates[documentType]
  const { user } = useAuth()
  const storageKey = `goriya:document-draft:${user?.id ?? "anon"}:${documentType}`

  const [formData, setFormData] = useState<DocumentData>({})
  const [previewContent, setPreviewContent] = useState("")
  // Une fois le document généré, l'aperçu devient modifiable à la main.
  const [isGenerated, setIsGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [quotaLimit, setQuotaLimit] = useState<number | null>(null)

  // Tant que rien n'a été généré, l'aperçu suit la saisie en direct.
  const defaultPreview = useMemo(() => generateDocumentContent(documentType, formData), [documentType, formData])

  // Reprend le brouillon enregistré sur cet appareil, puis complète les champs
  // encore vides avec les coordonnées du profil.
  const hydratedKey = useRef<string | null>(null)
  useEffect(() => {
    if (!template || !user || hydratedKey.current === storageKey) return
    hydratedKey.current = storageKey

    let draft: DocumentData = {}
    try {
      draft = JSON.parse(localStorage.getItem(storageKey) ?? "{}") ?? {}
    } catch {
      // Brouillon illisible ou stockage indisponible : on repart du profil.
    }

    const profil: DocumentData = {
      nom: user.name ?? "",
      email: user.email ?? "",
      telephone: user.phone ?? "",
      ville: user.location ?? "",
      ...(documentType === "motivation" ? { titre: user.title ?? "" } : {}),
    }
    const champs = new Set(template.fields.map((field) => field.id))
    const prefill = Object.fromEntries(Object.entries(profil).filter(([id, value]) => champs.has(id) && value))

    setFormData((prev) => ({ ...prefill, ...draft, ...prev }))
  }, [template, user, storageKey, documentType])

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }))
    }
  }

  const validateForm = (): boolean => {
    if (!template) return false

    const newErrors: Record<string, string> = {}
    template.fields.forEach((field) => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = "Ce champ est requis"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateDocument = async () => {
    if (!validateForm()) return

    setIsGenerating(true)
    setQuotaLimit(null)
    try {
      // "Générer des documents" est une fonctionnalité "Limité" (Standard: 5,
      // Premium: 20) - voir UserFeatureUsageService. Entièrement côté client
      // (pas de génération serveur), donc consommée ici, au clic, plutôt
      // qu'après un appel backend qui n'existe pas pour cette fonctionnalité.
      const usage = await featureUsageService.consume("document_generation")
      if (!usage.allowed) {
        setQuotaLimit(usage.limit)
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 400))
      setPreviewContent(generateDocumentContent(documentType, formData))
      setIsGenerated(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClear = () => {
    setFormData({})
    setErrors({})
    setPreviewContent("")
    setIsGenerated(false)
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // Stockage indisponible : rien à effacer.
    }
  }

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(formData))
      toast.success("Brouillon enregistré sur cet appareil")
    } catch {
      toast.error("L'enregistrement du brouillon a échoué.")
    }
  }

  const handleDownloadPDF = () => {
    if (!previewContent.trim() || !template) return
    generatePDF(previewContent, nomFichier(template.title, formData.nom))
  }

  const handleRegenerate = () => {
    if (!validateForm()) return
    setPreviewContent(generateDocumentContent(documentType, formData))
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Type de document non trouvé. Sélectionne un type de document valide.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const splitFields = template.fields.filter((field) => field.split)
  const singleFields = template.fields.filter((field) => !field.split)

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="border-b border-[#d9dfea] dark:border-border px-4 py-4 sm:px-6">
        <Link
          href="/nouveau-document"
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#646d80] dark:text-muted-foreground hover:text-[#1b2331] dark:hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au choix du document
        </Link>
        <h1 className="text-2xl sm:text-[32px] font-semibold leading-none text-[#1b2331] dark:text-foreground">Nouveau document</h1>
      </div>

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-2">
        <section className="flex min-h-0 min-w-0 lg:min-h-[548px] flex-col rounded-[12px] border border-[#e5e9f2] dark:border-border bg-white dark:bg-card p-4 sm:p-5">
          <h2 className="mb-3 text-[14px] font-semibold text-[#1d2433] dark:text-foreground">{template.title}</h2>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {splitFields.map((field) => (
              <div key={field.id}>
                <label className="mb-1 block text-[11px] text-[#8b93a3] dark:text-muted-foreground">{field.label}</label>
                <Input
                  type={field.type ?? "text"}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.label}
                  className={`h-8 rounded-[7px] border-0 bg-[#f1f2f5] dark:bg-muted text-[12px] shadow-none focus-visible:ring-0 ${
                    errors[field.id] ? "ring-1 ring-red-400" : ""
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="mt-2 space-y-2">
            {singleFields.map((field) => (
              <div key={field.id}>
                <label className="mb-1 block text-[11px] text-[#8b93a3] dark:text-muted-foreground">{field.label}</label>
                <Input
                  type={field.type ?? "text"}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.label}
                  className={`h-8 rounded-[7px] border-0 bg-[#f1f2f5] dark:bg-muted text-[12px] shadow-none focus-visible:ring-0 ${
                    errors[field.id] ? "ring-1 ring-red-400" : ""
                  }`}
                />
              </div>
            ))}
          </div>

          {/* `mt-auto` seul tombait à 0 dès que le formulaire remplissait la
              carte : le `pt-5` garantit l'écart avec le dernier champ. */}
          <div className="mt-auto pt-5">
            <Button
              onClick={generateDocument}
              disabled={isGenerating}
              className="h-9 w-full sm:w-fit rounded-full bg-brand-gradient px-11 text-[12px] font-semibold text-white hover:bg-brand-gradient-hover"
            >
              {isGenerating ? "Génération..." : "Générer le document"}
            </Button>
          </div>

          {quotaLimit !== null && (
            <div className="mt-3">
              <QuotaExceededNotice featureKey="document_generation" limit={quotaLimit} featureLabel="documents générés" />
            </div>
          )}
        </section>

        <section className="flex min-h-0 min-w-0 lg:min-h-[548px] flex-col rounded-[12px] border border-[#e5e9f2] dark:border-border bg-white dark:bg-card p-4 sm:p-5">
          <h2 className="mb-3 text-[14px] font-semibold text-[#1d2433] dark:text-foreground">Aperçu du document</h2>

          <div className="relative h-[320px] sm:h-[418px] overflow-hidden rounded-[12px] bg-[#f2f5fb] dark:bg-muted p-4">
            <div className="pointer-events-none absolute -left-14 bottom-3 h-48 w-48 rounded-full border-[22px] border-[#dce4f4] dark:border-border opacity-70" />
            <div className="pointer-events-none absolute left-4 bottom-7 h-12 w-12 rounded-full bg-[#dce4f4] dark:bg-primary/10 opacity-80" />
            <div className="pointer-events-none absolute left-16 bottom-0 h-4 w-4 rounded-full bg-[#dce4f4] dark:bg-primary/10 opacity-80" />

            {isGenerated ? (
              <textarea
                value={previewContent}
                onChange={(e) => setPreviewContent(e.target.value)}
                aria-label="Texte du document, modifiable"
                className="relative z-10 h-full w-full resize-none overflow-y-auto rounded-[8px] border border-transparent bg-transparent pr-2 font-sans text-[12px] leading-[1.55] text-[#3d4554] outline-none focus:border-[#9aa6d8] dark:text-foreground"
              />
            ) : (
              <pre className="relative z-10 h-full overflow-y-auto pr-2 whitespace-pre-wrap break-words font-sans text-[12px] leading-[1.55] text-[#7d8595] dark:text-muted-foreground">
                {defaultPreview}
              </pre>
            )}
          </div>
          <p className="mt-2 text-[11px] text-[#8b93a3] dark:text-muted-foreground">
            {isGenerated
              ? "Clique dans le texte pour le modifier (par exemple « Monsieur » ou « Madame ») : le PDF reprend tes corrections."
              : "Génère le document pour pouvoir modifier le texte avant de le télécharger."}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              onClick={handleClear}
              className="h-9 rounded-full bg-[#eaedf8] dark:bg-primary/10 text-[12px] font-medium text-[#646d80] dark:text-muted-foreground hover:bg-[#dfe4f4] dark:hover:bg-primary/10"
            >
              Effacer
            </Button>
            <Button
              variant="ghost"
              onClick={handleRegenerate}
              className="h-9 rounded-full bg-[#eaedf8] dark:bg-primary/10 text-[12px] font-medium text-[#646d80] dark:text-muted-foreground hover:bg-[#dfe4f4] dark:hover:bg-primary/10"
            >
              Régénérer
            </Button>
            <Button
              variant="ghost"
              onClick={handleSaveDraft}
              className="h-9 rounded-full bg-[#eaedf8] dark:bg-primary/10 text-[12px] font-medium text-[#646d80] dark:text-muted-foreground hover:bg-[#dfe4f4] dark:hover:bg-primary/10"
            >
              <Save className="h-3.5 w-3.5" />
              Enregistrer
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={!previewContent.trim()}
              title={previewContent.trim() ? undefined : "Génère d'abord le document"}
              className="h-9 rounded-full bg-brand-gradient text-[12px] font-semibold text-white hover:bg-brand-gradient-hover"
            >
              <Download className="h-3.5 w-3.5" />
              Télécharger PDF
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <SubscriptionGate featureLabel="la génération de documents" feature="Générer des documents">
      <CreerDocumentContent />
    </SubscriptionGate>
  )
}
