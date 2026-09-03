import jsPDF from "jspdf"

export interface DocumentData {
  [key: string]: string
}

const escapeHtml = (value: unknown): string =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&": return "&amp;"
      case "<": return "&lt;"
      case ">": return "&gt;"
      case '"': return "&quot;"
      case "'": return "&#39;"
      default: return char
    }
  })

/**
 * Les champs date du formulaire renvoient désormais du "AAAA-MM-JJ" (sélecteur
 * natif) : on le repasse en JJ/MM/AAAA pour le corps de la lettre. Toute autre
 * saisie est laissée telle quelle.
 */
const formatDateFr = (valeur: string | undefined): string => {
  if (!valeur) return ""
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valeur)
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : valeur
}

export const generatePDF = (content: string, filename = "document.pdf"): void => {
  const pdf = new jsPDF()

  // Set font
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(12)

  // Split content into lines that fit the page width
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  const maxLineWidth = pageWidth - margin * 2

  const lines = pdf.splitTextToSize(content, maxLineWidth)

  // Add content to PDF
  let yPosition = margin
  const lineHeight = 7

  lines.forEach((line: string) => {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage()
      yPosition = margin
    }

    pdf.text(line, margin, yPosition)
    yPosition += lineHeight
  })

  // Download the PDF
  pdf.save(filename)
}

export const generateDocumentContent = (type: string, data: DocumentData): string => {
  switch (type) {
    case "motivation":
      return generateMotivationLetter(data)
    case "demission":
      return generateResignationLetter(data)
    case "recommandation":
      return generateRecommendationLetter(data)
    default:
      return "Type de document non supporté"
  }
}

const generateMotivationLetter = (data: DocumentData): string => {
  const today = new Date().toLocaleDateString("fr-FR")

  return `${data.nom || "[Ton nom]"}
${data.titre || "[Ton titre]"}
[Ton adresse]
[Ville, Code postal]
[Téléphone]
[Email]

${formatDateFr(data.date) || today}

${data.destinataire || "[Nom du destinataire]"}
${data.entreprise || "[Nom de l'entreprise]"}
[Adresse de l'entreprise]

Objet : Candidature pour le poste de ${data.poste || "[Poste visé]"}

${data.destinataire ? `Madame, Monsieur ${data.destinataire}` : "Madame, Monsieur"},

Je me permets de vous adresser ma candidature pour le poste de ${data.poste || "[poste visé]"} au sein de votre équipe chez ${data.entreprise || "[entreprise]"}.

Diplômé(e) et fort(e) de mon expérience professionnelle, je suis convaincu(e) que mon profil correspond aux exigences de ce poste. Mes compétences techniques et ma motivation à contribuer efficacement aux objectifs de votre équipe constituent des atouts majeurs pour votre organisation.

Mon parcours professionnel m'a permis de développer des compétences solides en [mentionnez vos compétences clés], particulièrement adaptées aux défis que représente le poste proposé. Je suis persuadé(e) que mes qualités personnelles et professionnelles seront un véritable atout pour ${data.entreprise || "[entreprise]"}.

Je serais ravi(e) de vous rencontrer pour discuter de ma candidature et vous démontrer ma motivation. Je reste à votre disposition pour tout complément d'information.

Dans l'attente de votre retour, je vous prie d'agréer, ${data.destinataire ? `Madame, Monsieur ${data.destinataire}` : "Madame, Monsieur"}, l'expression de mes salutations distinguées.

${data.nom || "[Ton nom]"}

Pièces jointes : CV, diplômes, références`
}

const generateResignationLetter = (data: DocumentData): string => {
  const today = new Date().toLocaleDateString("fr-FR")

  return `${data.nom || "[Ton nom]"}
${data.poste || "[Ton poste actuel]"}
[Ton adresse]
[Ville, Code postal]

${formatDateFr(data.date) || today}

${data.manager || "[Nom du manager]"}
${data.entreprise || "[Nom de l'entreprise]"}
[Adresse de l'entreprise]

Objet : Démission de mon poste de ${data.poste || "[ton poste]"}

${data.manager ? `Madame, Monsieur ${data.manager}` : "Madame, Monsieur"},

Par la présente, je vous informe de ma décision de démissionner de mon poste de ${data.poste || "[ton poste]"} au sein de ${data.entreprise || "[entreprise]"}.

Conformément aux dispositions de mon contrat de travail et aux conventions collectives en vigueur, je respecterai la période de préavis légale. Mon dernier jour de travail sera donc le ${formatDateFr(data.dateFin) || "[date de fin]"}.

Cette décision, mûrement réfléchie, s'inscrit dans le cadre de mon évolution professionnelle. Je tiens à vous assurer que je mettrai tout en œuvre pour assurer une transition harmonieuse de mes responsabilités et former, si nécessaire, la personne qui me succédera.

Je vous remercie pour la confiance que vous m'avez accordée durant ces années de collaboration et pour les opportunités de développement professionnel que j'ai pu saisir au sein de votre équipe.

Je reste à votre disposition pour organiser au mieux cette transition et vous prie d'agréer, ${data.manager ? `Madame, Monsieur ${data.manager}` : "Madame, Monsieur"}, l'expression de mes salutations respectueuses.

${data.nom || "[Ton nom]"}
Signature`
}

const generateRecommendationLetter = (data: DocumentData): string => {
  const today = new Date().toLocaleDateString("fr-FR")

  return `${data.nom || "[Ton nom]"}
${data.poste || "[Ton poste]"}
[Ton entreprise]
[Adresse]
[Téléphone]
[Email]

${formatDateFr(data.date) || today}

LETTRE DE RECOMMANDATION

Je soussigné(e), ${data.nom || "[ton nom]"}, ${data.poste || "[ton poste]"}, certifie avoir eu ${data.candidat || "[nom du candidat]"} sous ma responsabilité en qualité de ${data.posteCandidatActuel || "[poste du candidat]"}.

Durant cette période de collaboration, ${data.candidat || "[nom du candidat]"} a fait preuve de qualités professionnelles remarquables :

• Compétences techniques solides et adaptabilité
• Excellent relationnel et esprit d'équipe
• Autonomie et prise d'initiative
• Respect des délais et qualité du travail fourni
• Capacité d'analyse et de résolution de problèmes

${data.candidat || "[Nom du candidat]"} s'est toujours montré(e) impliqué(e) dans ses missions et a contribué de manière significative aux résultats de notre équipe. Sa rigueur professionnelle et son sens des responsabilités en font un(e) collaborateur/trice de confiance.

Je recommande vivement ${data.candidat || "[nom du candidat]"} pour le poste de ${data.posteCandidatVise || "[poste visé]"}. Ses compétences et son expérience constituent des atouts certains pour votre organisation.

Je reste à votre disposition pour tout complément d'information concernant cette recommandation.

Cordialement,

${data.nom || "[Ton nom]"}
${data.poste || "[Ton poste]"}
Signature`
}

export const previewDocument = (content: string): void => {
  const previewWindow = window.open("", "_blank")
  if (previewWindow) {
    // `content` est composé à partir de champs utilisateur (nom, entreprise, poste, etc.) :
    // on l'échappe avant de l'injecter dans le HTML pour éviter toute XSS via document.write.
    const safeContent = escapeHtml(content)
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Aperçu du document</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              background: #f5f5f5;
            }
            .document {
              background: white;
              padding: 60px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              min-height: 800px;
            }
            .content {
              white-space: pre-line;
              font-size: 14px;
              line-height: 1.8;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 10px 20px;
              background: #2563eb;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            }
            .print-button:hover {
              background: #1d4ed8;
            }
            @media print {
              body { background: white; }
              .document { box-shadow: none; padding: 40px; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">Imprimer</button>
          <div class="document">
            <div class="content">${safeContent}</div>
          </div>
        </body>
      </html>
    `)
    previewWindow.document.close()
  }
}
