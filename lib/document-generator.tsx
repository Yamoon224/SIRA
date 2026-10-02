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

type Rgb = [number, number, number]

const hex = (h: string): Rgb => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]

// Même palette que le modèle de CV « Moderne » (lib/cv-pdf.ts) : la lettre et
// le CV d'un même candidat se répondent.
const MARINE = hex("#16264a")
const ACCENT = hex("#2f6de6")
const ENCRE = hex("#1b2331")
const TEXTE = hex("#2b3342")
const GRIS = hex("#5b6474")
const GRIS_CLAIR = hex("#8b93a3")
const FILET = hex("#dfe4ee")

const PAGE_W = 210
const PAGE_H = 297
const MARGE = 24
const MARGE_BAS = 20
/** Un point typographique en millimètres. */
const PT = 0.3528

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]

/** "02/10/2026" -> "2 octobre 2026" ; toute autre saisie est laissée telle quelle. */
const dateLongue = (valeur: string): string => {
  const fr = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(valeur)
  const mois = fr ? MOIS[Number(fr[2]) - 1] : undefined
  if (!fr || !mois) return valeur
  const jour = Number(fr[1])
  return `${jour === 1 ? "1er" : jour} ${mois} ${fr[3]}`
}

/**
 * Titre de document : « LETTRE DE RECOMMANDATION ». Le préfixe est exigé pour
 * ne pas prendre une raison sociale en capitales (« ORANGE CI ») pour un titre.
 */
const estTitre = (bloc: string[]): boolean =>
  bloc.length === 1 && /^LETTRE\b/.test(bloc[0]) && bloc[0] === bloc[0].toUpperCase()

const estObjet = (bloc: string[]): boolean => /^objet\s*:/i.test(bloc[0])

/**
 * Rend le texte du document dans un jsPDF. Partagé par le téléchargement et par
 * l'enregistrement dans la bibliothèque de CV, qui a besoin du binaire plutôt
 * que d'une sauvegarde navigateur.
 */
const renderPDF = (content: string): jsPDF => {
  const pdf = new jsPDF({ unit: "mm", format: "a4" })
  const largeur = PAGE_W - MARGE * 2

  // Le texte arrive à plat : chaque bloc (séparé par une ligne vide) est
  // reclassé d'après sa position et sa forme pour recevoir sa mise en page.
  const blocs = content
    .split(/\n\s*\n/)
    .map((bloc) => bloc.split("\n").map((ligne) => ligne.trim()).filter(Boolean))
    .filter((bloc) => bloc.length > 0)

  const expediteur = blocs[0] ?? []
  let suivant = 1

  let date = ""
  if (blocs[suivant]?.length === 1 && blocs[suivant][0].length < 40 && /\d/.test(blocs[suivant][0])) {
    date = dateLongue(blocs[suivant][0])
    suivant++
  }

  let destinataire: string[] = []
  const candidat = blocs[suivant]
  if (
    candidat &&
    !estTitre(candidat) &&
    !estObjet(candidat) &&
    candidat.length <= 4 &&
    candidat.every((ligne) => ligne.length < 70 && !ligne.endsWith(","))
  ) {
    destinataire = candidat
    suivant++
  }

  let y = 0

  const bandeau = () => {
    pdf.setFillColor(...MARINE)
    pdf.rect(0, 0, PAGE_W, 2.4, "F")
    pdf.setFillColor(...ACCENT)
    pdf.rect(0, 0, 52, 2.4, "F")
  }

  /** Passe à la page suivante si `hauteur` ne tient plus sur la page courante. */
  const place = (hauteur: number) => {
    if (y + hauteur > PAGE_H - MARGE_BAS) {
      pdf.addPage()
      bandeau()
      y = 24
    }
  }

  const style = (graisse: "normal" | "bold" | "italic", taille: number, couleur: Rgb) => {
    pdf.setFont("helvetica", graisse)
    pdf.setFontSize(taille)
    pdf.setTextColor(...couleur)
  }

  /** Écrit un texte avec retour à la ligne ; le style doit déjà être posé. */
  const texte = (valeur: string, x: number, w: number, interligne: number, justifie = false) => {
    const lignes: string[] = pdf.splitTextToSize(valeur, w)
    // jsPDF ne connaît pas la chasse de « œ » dans les polices standard et la
    // compte pour zéro : on la mesure comme « oe », sinon le mot suivant
    // vient se coller dessus.
    const mesure = (mot: string) => pdf.getTextWidth(mot.replace(/œ/g, "oe").replace(/Œ/g, "OE"))
    const espaceNormal = mesure(" ")
    lignes.forEach((ligne, index) => {
      place(interligne)
      const mots = ligne.trim().split(/\s+/)
      const espace = (w - mesure(mots.join(""))) / Math.max(mots.length - 1, 1)
      // La dernière ligne d'un paragraphe reste alignée à gauche, comme une
      // ligne trop courte pour être étirée sans trous.
      if (justifie && index < lignes.length - 1 && mots.length > 1 && espace < espaceNormal * 3) {
        let curseur = x
        for (const mot of mots) {
          pdf.text(mot, curseur, y)
          curseur += mesure(mot) + espace
        }
      } else {
        pdf.text(ligne, x, y)
      }
      y += interligne
    })
  }

  // ─── En-tête : expéditeur ───────────────────────────────────────────────────
  bandeau()
  y = 28
  style("bold", 21, MARINE)
  texte(expediteur[0] ?? "", MARGE, largeur, 9)
  if (expediteur.length > 1) {
    y -= 2.2
    style("normal", 9, GRIS)
    texte(expediteur.slice(1).join("   ·   "), MARGE, largeur, 4.6)
  }
  y += 1.4
  pdf.setDrawColor(...FILET)
  pdf.setLineWidth(0.2)
  pdf.line(MARGE, y, PAGE_W - MARGE, y)
  pdf.setFillColor(...ACCENT)
  pdf.rect(MARGE, y - 0.35, 18, 0.7, "F")
  y += 13

  // ─── Date et destinataire ───────────────────────────────────────────────────
  if (date) {
    style("normal", 9.5, GRIS)
    pdf.text(date, PAGE_W - MARGE, y, { align: "right" })
  }
  if (destinataire.length > 0) {
    style("bold", 7.5, ACCENT)
    pdf.text("À L'ATTENTION DE", MARGE, y, { charSpace: 0.4 })
    y += 6
    destinataire.forEach((ligne, index) => {
      if (index === 0) style("bold", 10.5, ENCRE)
      else style("normal", 10, GRIS)
      texte(ligne, MARGE, largeur * 0.7, 5)
    })
    y += 7
  } else if (date) {
    y += 10
  }

  // ─── Corps ──────────────────────────────────────────────────────────────────
  const interligne = 10.5 * PT * 1.55
  const expediteurNom = expediteur[0]

  blocs.slice(suivant).forEach((bloc) => {
    if (estTitre(bloc)) {
      place(14)
      style("bold", 13, MARINE)
      pdf.text(bloc[0], MARGE, y, { charSpace: 0.6 })
      y += 10
      return
    }

    if (estObjet(bloc)) {
      place(14)
      style("bold", 10.5, MARINE)
      const debut = y
      texte(bloc.join(" "), MARGE + 4, largeur - 4, 5.2)
      pdf.setFillColor(...ACCENT)
      pdf.rect(MARGE, debut - 3.6, 0.9, y - debut + 0.4, "F")
      y += 5
      return
    }

    if (/^pi[èe]ces? jointes?\s*:/i.test(bloc[0])) {
      place(12)
      y += 3
      pdf.setDrawColor(...FILET)
      pdf.setLineWidth(0.2)
      pdf.line(MARGE, y, PAGE_W - MARGE, y)
      y += 5.5
      style("italic", 8.5, GRIS)
      texte(bloc.join(" "), MARGE, largeur, 4.2)
      return
    }

    // Signature : le nom de l'expéditeur repris seul en fin de lettre.
    if (bloc[0] === expediteurNom && bloc.length <= 3 && bloc.every((ligne) => ligne.length < 60)) {
      const largeurSignature = 66
      const x = PAGE_W - MARGE - largeurSignature
      place(10 + bloc.length * 5)
      y += 5
      bloc.forEach((ligne, index) => {
        if (index === 0) style("bold", 11, MARINE)
        else style("normal", 9.5, GRIS)
        texte(ligne, x, largeurSignature, 5)
      })
      y += 3
      return
    }

    for (const ligne of bloc) {
      style("normal", 10.5, TEXTE)
      if (ligne.startsWith("•")) {
        place(interligne)
        pdf.setFillColor(...ACCENT)
        pdf.circle(MARGE + 2, y - 1.2, 0.7, "F")
        texte(ligne.slice(1).trim(), MARGE + 6, largeur - 6, interligne)
      } else {
        texte(ligne, MARGE, largeur, interligne, true)
      }
    }
    y += 3.4
  })

  // Pagination, seulement si la lettre déborde sur plusieurs pages.
  const pages = pdf.getNumberOfPages()
  if (pages > 1) {
    for (let page = 1; page <= pages; page++) {
      pdf.setPage(page)
      style("normal", 8, GRIS_CLAIR)
      pdf.text(`${page} / ${pages}`, PAGE_W / 2, PAGE_H - 10, { align: "center" })
    }
  }

  return pdf
}

export const generatePDF = (content: string, filename = "document.pdf"): void => {
  renderPDF(content).save(filename)
}

/** Le même PDF, en fichier prêt à être téléversé (`POST /me/resumes`). */
export const generatePDFFile = (content: string, filename = "document.pdf"): File =>
  new File([renderPDF(content).output("blob")], filename, { type: "application/pdf" })

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

/**
 * Bloc d'en-tête (coordonnées) : les lignes facultatives laissées vides sont
 * retirées plutôt que rendues en « [Ton adresse] » dans la lettre finale.
 */
const bloc = (...lignes: Array<string | undefined>): string =>
  lignes.map((ligne) => ligne?.trim()).filter(Boolean).join("\n")

const generateMotivationLetter = (data: DocumentData): string => {
  const today = new Date().toLocaleDateString("fr-FR")

  return `${bloc(data.nom || "[Ton nom]", data.titre, data.adresse, data.ville, data.telephone, data.email)}

${formatDateFr(data.date) || today}

${bloc(
    [data.destinataire, data.titreDestinataire].filter(Boolean).join(", "),
    data.entreprise || "[Nom de l'entreprise]",
    data.adresseEntreprise,
  )}

Objet : Candidature pour le poste de ${data.poste || "[Poste visé]"}

${data.destinataire ? `Madame, Monsieur ${data.destinataire}` : "Madame, Monsieur"},

Je me permets de vous adresser ma candidature pour le poste de ${data.poste || "[poste visé]"} au sein de votre équipe chez ${data.entreprise || "[entreprise]"}.

Diplômé(e) et fort(e) de mon expérience professionnelle, je suis convaincu(e) que mon profil correspond aux exigences de ce poste. Mes compétences techniques et ma motivation à contribuer efficacement aux objectifs de votre équipe constituent des atouts majeurs pour votre organisation.

Mon parcours professionnel m'a permis de développer des compétences solides${data.competences?.trim() ? ` en ${data.competences.trim()}` : ""}, particulièrement adaptées aux défis que représente le poste proposé. Je suis persuadé(e) que mes qualités personnelles et professionnelles seront un véritable atout pour ${data.entreprise || "[entreprise]"}.

Je serais ravi(e) de vous rencontrer pour discuter de ma candidature et vous démontrer ma motivation. Je reste à votre disposition pour tout complément d'information.

Dans l'attente de votre retour, je vous prie d'agréer, ${data.destinataire ? `Madame, Monsieur ${data.destinataire}` : "Madame, Monsieur"}, l'expression de mes salutations distinguées.

${data.nom || "[Ton nom]"}

Pièces jointes : CV, diplômes, références`
}

const generateResignationLetter = (data: DocumentData): string => {
  const today = new Date().toLocaleDateString("fr-FR")

  return `${bloc(data.nom || "[Ton nom]", data.poste || "[Ton poste actuel]", data.adresse, data.ville, data.telephone, data.email)}

${formatDateFr(data.date) || today}

${bloc(data.manager, data.entreprise || "[Nom de l'entreprise]", data.adresseEntreprise)}

Objet : Démission de mon poste de ${data.poste || "[ton poste]"}

${data.manager ? `Madame, Monsieur ${data.manager}` : "Madame, Monsieur"},

Par la présente, je vous informe de ma décision de démissionner de mon poste de ${data.poste || "[ton poste]"} au sein de ${data.entreprise || "[entreprise]"}.

Conformément aux dispositions de mon contrat de travail et aux conventions collectives en vigueur, je respecterai la période de préavis légale. Mon dernier jour de travail sera donc le ${formatDateFr(data.dateFin) || "[date de fin]"}.

Cette décision, mûrement réfléchie, s'inscrit dans le cadre de mon évolution professionnelle. Je tiens à vous assurer que je mettrai tout en œuvre pour assurer une transition harmonieuse de mes responsabilités et former, si nécessaire, la personne qui me succédera.

Je vous remercie pour la confiance que vous m'avez accordée durant ces années de collaboration et pour les opportunités de développement professionnel que j'ai pu saisir au sein de votre équipe.

Je reste à votre disposition pour organiser au mieux cette transition et vous prie d'agréer, ${data.manager ? `Madame, Monsieur ${data.manager}` : "Madame, Monsieur"}, l'expression de mes salutations respectueuses.

${data.nom || "[Ton nom]"}`
}

const generateRecommendationLetter = (data: DocumentData): string => {
  const today = new Date().toLocaleDateString("fr-FR")

  return `${bloc(data.nom || "[Ton nom]", data.poste || "[Ton poste]", data.entreprise, data.adresse, data.telephone, data.email)}

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
${data.poste || "[Ton poste]"}`
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
