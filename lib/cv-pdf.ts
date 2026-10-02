import jsPDF from "jspdf"
import type { CvContent } from "@/lib/api/cv.service"

/**
 * Modèles de CV du créateur. Le PDF est dessiné directement avec jsPDF (texte
 * vectoriel, donc sélectionnable et lisible par les ATS et par l'analyse IA),
 * pas depuis une capture d'écran du formulaire.
 */
export type CvModeleId = "moderne" | "classique" | "elegant"

export const CV_MODELE_PAR_DEFAUT: CvModeleId = "moderne"

export const CV_MODELES: { id: CvModeleId; nom: string; description: string }[] = [
    { id: "moderne", nom: "Moderne", description: "Bandeau latéral coloré, compétences en jauges" },
    { id: "classique", nom: "Classique", description: "Sobre et centré, idéal pour les secteurs formels" },
    { id: "elegant", nom: "Élégant", description: "En-tête pleine largeur, compétences en étiquettes" },
]

export const isCvModele = (value: unknown): value is CvModeleId =>
    CV_MODELES.some((m) => m.id === value)

// ─── Préparation du contenu ───────────────────────────────────────────────────

type Rgb = [number, number, number]

const PAGE_W = 210
const PAGE_H = 297
/** 1 pt = 0,3528 mm : sert à convertir un corps de police en hauteur de ligne. */
const PT = 0.3528

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]

/** « 2023-04-04 » -> « avr. 2023 » : le jour n'apporte rien sur un CV. */
const moisAnnee = (iso: string): string => {
    const m = iso.match(/^(\d{4})-(\d{2})-\d{2}$/)
    return m ? `${MOIS[Number(m[2]) - 1] ?? ""} ${m[1]}`.trim() : iso
}

const periode = (debut: string, fin: string, enCours = false): string =>
    [moisAnnee(debut), enCours ? "Aujourd'hui" : moisAnnee(fin)].filter(Boolean).join(" – ")

/** Une ligne de description = une puce ; les puces saisies à la main sont retirées. */
const puces = (description: string): string[] =>
    description
        .split(/\r?\n/)
        .map((l) => l.replace(/^[\s•\-–*·]+/, "").trim())
        .filter(Boolean)

const NIVEAUX: Record<string, number> = { Débutant: 0.25, Intermédiaire: 0.5, Avancé: 0.75, Expert: 1 }

interface Entree {
    titre: string
    sousTitre: string
    dates: string
    puces: string[]
}

interface CvPret {
    nom: string
    contacts: string[]
    profil: string
    experiences: Entree[]
    formations: Entree[]
    competences: { nom: string; niveau: string; ratio: number }[]
}

function preparer(cv: CvContent): CvPret {
    return {
        nom: cv.nom.trim() || "Votre nom",
        contacts: [
            cv.email.trim(),
            cv.telephone.trim() ? `${cv.indicatif} ${cv.telephone.trim()}`.trim() : "",
            cv.adresse.trim(),
        ].filter(Boolean),
        profil: cv.profil.trim(),
        experiences: cv.experiences
            .map((e) => ({
                titre: e.poste.trim(),
                sousTitre: e.entreprise.trim(),
                dates: periode(e.dateDebut, e.dateFin, e.enCours),
                puces: puces(e.description),
            }))
            .filter((e) => e.titre || e.sousTitre || e.puces.length),
        formations: cv.formations
            .map((f) => ({
                titre: f.diplome.trim(),
                sousTitre: f.etablissement.trim(),
                dates: periode(f.dateDebut, f.dateFin),
                puces: [],
            }))
            .filter((f) => f.titre || f.sousTitre),
        competences: cv.competences
            .filter((c) => c.nom.trim())
            .map((c) => ({ nom: c.nom.trim(), niveau: c.niveau, ratio: NIVEAUX[c.niveau] ?? 0.5 })),
    }
}

// ─── Écriture avec saut de page ───────────────────────────────────────────────

interface Style {
    font?: "helvetica" | "times"
    style?: "normal" | "bold" | "italic"
    size: number
    color: Rgb
    /** Interligne, en multiple du corps. */
    leading?: number
    align?: "left" | "center" | "right"
    indent?: number
}

/**
 * Curseur d'écriture dans une colonne. Plusieurs colonnes (bandeau latéral et
 * corps) partagent les mêmes pages : chacune avance à son rythme et ne crée
 * une page que si elle n'existe pas encore.
 */
class Colonne {
    page = 1

    constructor(
        private pdf: jsPDF,
        public x: number,
        public w: number,
        public y: number,
        private haut: number,
        private bas: number,
        /** Fond à redessiner sur chaque nouvelle page (bandeau latéral). */
        private fond?: (pdf: jsPDF) => void,
    ) {}

    /** Garantit `h` mm disponibles, quitte à passer à la page suivante. */
    place(h: number) {
        this.pdf.setPage(this.page)
        if (this.y + h <= this.bas) return
        this.page += 1
        if (this.page > this.pdf.getNumberOfPages()) {
            this.pdf.addPage()
            this.fond?.(this.pdf)
        }
        this.pdf.setPage(this.page)
        this.y = this.haut
    }

    espace(h: number) {
        this.y += h
    }

    texte(contenu: string, s: Style) {
        if (!contenu) return
        const { pdf } = this
        const indent = s.indent ?? 0
        const hauteur = s.size * PT * (s.leading ?? 1.35)
        pdf.setFont(s.font ?? "helvetica", s.style ?? "normal")
        pdf.setFontSize(s.size)
        const lignes: string[] = pdf.splitTextToSize(contenu, this.w - indent)

        for (const ligne of lignes) {
            this.place(hauteur)
            // Police et couleur sont reposées à chaque ligne : un saut de page
            // (fond redessiné) ou l'autre colonne ont pu les changer.
            pdf.setFont(s.font ?? "helvetica", s.style ?? "normal")
            pdf.setFontSize(s.size)
            pdf.setTextColor(...s.color)
            const x =
                s.align === "center" ? this.x + this.w / 2 : s.align === "right" ? this.x + this.w : this.x + indent
            pdf.text(ligne, x, this.y + s.size * PT * 0.85, { align: s.align ?? "left" })
            this.y += hauteur
        }
    }

    puce(contenu: string, s: Style, couleurPuce: Rgb) {
        const hauteur = s.size * PT * (s.leading ?? 1.35)
        this.place(hauteur)
        this.pdf.setFillColor(...couleurPuce)
        this.pdf.circle(this.x + 1.2, this.y + hauteur / 2 - 0.2, 0.55, "F")
        this.texte(contenu, { ...s, indent: 4 })
    }

    /** Titre à gauche, dates alignées à droite sur la même ligne. */
    titreEtDates(titre: string, dates: string, sTitre: Style, sDates: Style) {
        const { pdf } = this
        const hauteur = sTitre.size * PT * (sTitre.leading ?? 1.35)
        pdf.setFont(sDates.font ?? "helvetica", sDates.style ?? "normal")
        pdf.setFontSize(sDates.size)
        const largeurDates = dates ? pdf.getTextWidth(dates) + 4 : 0

        this.place(hauteur)
        if (dates) {
            pdf.setTextColor(...sDates.color)
            pdf.text(dates, this.x + this.w, this.y + sTitre.size * PT * 0.85, { align: "right" })
        }
        const largeur = this.w
        this.w = largeur - largeurDates
        this.texte(titre || " ", sTitre)
        this.w = largeur
    }
}

const hex = (h: string): Rgb => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]

const ENCRE = hex("#1b2331")
const GRIS = hex("#5b6474")
const GRIS_CLAIR = hex("#8b93a3")
const BLANC: Rgb = [255, 255, 255]

/** Bloc d'entrées (expériences ou formations), commun aux trois modèles. */
function entrees(
    col: Colonne,
    liste: Entree[],
    o: { font: "helvetica" | "times"; accent: Rgb; sousTitreStyle: "normal" | "italic" },
) {
    liste.forEach((e, i) => {
        if (i > 0) col.espace(3.2)
        // Évite un intitulé orphelin en bas de page, séparé de sa première ligne.
        col.place(14)
        col.titreEtDates(
            e.titre || e.sousTitre,
            e.dates,
            { font: o.font, style: "bold", size: 10.5, color: ENCRE },
            { font: o.font, size: 8.5, color: GRIS_CLAIR },
        )
        if (e.titre && e.sousTitre) {
            col.texte(e.sousTitre, { font: o.font, style: o.sousTitreStyle, size: 9.5, color: o.accent })
        }
        if (e.puces.length) col.espace(1.2)
        for (const p of e.puces) {
            col.puce(p, { font: o.font, size: 9.5, color: GRIS, leading: 1.4 }, o.accent)
        }
    })
}

// ─── Modèle « Moderne » : bandeau latéral ─────────────────────────────────────

function dessinerModerne(pdf: jsPDF, cv: CvPret) {
    const marine = hex("#16264a")
    const accent = hex("#2f6de6")
    const ciel = hex("#9db8f5")
    const largeurBandeau = 68

    const fond = (p: jsPDF) => {
        p.setFillColor(...marine)
        p.rect(0, 0, largeurBandeau, PAGE_H, "F")
    }
    fond(pdf)

    // Bandeau : initiales, contact, compétences.
    const bandeau = new Colonne(pdf, 10, largeurBandeau - 20, 16, 16, PAGE_H - 14, fond)

    const initiales = cv.nom
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((m) => m[0]?.toUpperCase() ?? "")
        .join("")
    pdf.setFillColor(...accent)
    pdf.circle(largeurBandeau / 2, bandeau.y + 14, 14, "F")
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(20)
    pdf.setTextColor(...BLANC)
    pdf.text(initiales, largeurBandeau / 2, bandeau.y + 16.5, { align: "center" })
    bandeau.espace(38)

    const titreBandeau = (libelle: string) => {
        bandeau.place(12)
        bandeau.texte(libelle.toUpperCase(), { style: "bold", size: 9, color: ciel })
        pdf.setDrawColor(...ciel)
        pdf.setLineWidth(0.3)
        pdf.line(bandeau.x, bandeau.y + 0.6, bandeau.x + bandeau.w, bandeau.y + 0.6)
        bandeau.espace(4)
    }

    if (cv.contacts.length) {
        titreBandeau("Contact")
        for (const c of cv.contacts) {
            bandeau.texte(c, { size: 8.8, color: BLANC, leading: 1.4 })
            bandeau.espace(1.6)
        }
        bandeau.espace(6)
    }

    if (cv.competences.length) {
        titreBandeau("Compétences")
        for (const c of cv.competences) {
            bandeau.place(9)
            bandeau.texte(c.nom, { size: 8.8, color: BLANC })
            pdf.setFillColor(58, 76, 115)
            pdf.roundedRect(bandeau.x, bandeau.y + 0.8, bandeau.w, 1.4, 0.7, 0.7, "F")
            pdf.setFillColor(...ciel)
            pdf.roundedRect(bandeau.x, bandeau.y + 0.8, bandeau.w * c.ratio, 1.4, 0.7, 0.7, "F")
            bandeau.espace(5.4)
        }
    }

    // Corps.
    const corps = new Colonne(pdf, largeurBandeau + 12, PAGE_W - largeurBandeau - 26, 18, 18, PAGE_H - 16, fond)
    corps.texte(cv.nom, { style: "bold", size: 24, color: marine, leading: 1.15 })
    pdf.setPage(1)
    pdf.setFillColor(...accent)
    pdf.rect(corps.x, corps.y + 1.5, 18, 1.2, "F")
    corps.espace(9)

    const titre = (libelle: string) => {
        corps.place(16)
        corps.texte(libelle.toUpperCase(), { style: "bold", size: 10.5, color: accent })
        pdf.setDrawColor(221, 228, 242)
        pdf.setLineWidth(0.3)
        pdf.line(corps.x, corps.y + 0.8, corps.x + corps.w, corps.y + 0.8)
        corps.espace(4)
    }

    if (cv.profil) {
        titre("Profil")
        corps.texte(cv.profil, { size: 9.5, color: GRIS, leading: 1.5 })
        corps.espace(7)
    }
    if (cv.experiences.length) {
        titre("Expérience professionnelle")
        entrees(corps, cv.experiences, { font: "helvetica", accent, sousTitreStyle: "normal" })
        corps.espace(7)
    }
    if (cv.formations.length) {
        titre("Formation")
        entrees(corps, cv.formations, { font: "helvetica", accent, sousTitreStyle: "normal" })
    }
}

// ─── Modèle « Classique » : une colonne, centré, police à empattements ────────

function dessinerClassique(pdf: jsPDF, cv: CvPret) {
    const marge = 22
    const col = new Colonne(pdf, marge, PAGE_W - marge * 2, 20, 20, PAGE_H - 18)

    col.texte(cv.nom.toUpperCase(), { font: "times", style: "bold", size: 23, color: ENCRE, align: "center", leading: 1.2 })
    col.espace(1.5)
    col.texte(cv.contacts.join("   |   "), { font: "times", size: 10, color: GRIS, align: "center" })
    col.espace(4)
    pdf.setPage(col.page)
    pdf.setDrawColor(...ENCRE)
    pdf.setLineWidth(0.6)
    pdf.line(marge, col.y, PAGE_W - marge, col.y)
    pdf.setLineWidth(0.2)
    pdf.line(marge, col.y + 1, PAGE_W - marge, col.y + 1)
    col.espace(8)

    const titre = (libelle: string) => {
        col.place(16)
        col.texte(libelle.toUpperCase(), { font: "times", style: "bold", size: 11.5, color: ENCRE })
        pdf.setDrawColor(...GRIS_CLAIR)
        pdf.setLineWidth(0.25)
        pdf.line(col.x, col.y + 0.6, col.x + col.w, col.y + 0.6)
        col.espace(4)
    }

    if (cv.profil) {
        titre("Profil")
        col.texte(cv.profil, { font: "times", size: 10.5, color: GRIS, leading: 1.45 })
        col.espace(7)
    }
    if (cv.experiences.length) {
        titre("Expérience professionnelle")
        entrees(col, cv.experiences, { font: "times", accent: ENCRE, sousTitreStyle: "italic" })
        col.espace(7)
    }
    if (cv.formations.length) {
        titre("Formation")
        entrees(col, cv.formations, { font: "times", accent: ENCRE, sousTitreStyle: "italic" })
        col.espace(7)
    }
    if (cv.competences.length) {
        titre("Compétences")
        // Deux colonnes : « Canva ........ Expert ».
        const demi = (col.w - 10) / 2
        const hauteur = 5.6
        for (let i = 0; i < cv.competences.length; i += 2) {
            col.place(hauteur)
            cv.competences.slice(i, i + 2).forEach((c, k) => {
                const x = col.x + k * (demi + 10)
                pdf.setFont("times", "bold")
                pdf.setFontSize(10.5)
                pdf.setTextColor(...ENCRE)
                pdf.text(pdf.splitTextToSize(c.nom, demi - 28)[0] ?? c.nom, x, col.y + 3.6)
                pdf.setFont("times", "italic")
                pdf.setTextColor(...GRIS)
                pdf.text(c.niveau, x + demi, col.y + 3.6, { align: "right" })
            })
            col.espace(hauteur)
        }
    }
}

// ─── Modèle « Élégant » : en-tête pleine largeur, intitulés en marge ─────────

function dessinerElegant(pdf: jsPDF, cv: CvPret) {
    const accent = hex("#0f766e")
    const pale = hex("#e6f4f2")
    const marge = 18
    const largeurIntitule = 42

    // En-tête : sa hauteur dépend du nom (une ou deux lignes).
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(26)
    const lignesNom: string[] = pdf.splitTextToSize(cv.nom, PAGE_W - marge * 2)
    const hauteurEntete = 26 + lignesNom.length * 11
    pdf.setFillColor(...accent)
    pdf.rect(0, 0, PAGE_W, hauteurEntete, "F")

    const entete = new Colonne(pdf, marge, PAGE_W - marge * 2, 14, 14, PAGE_H)
    entete.texte(cv.nom, { style: "bold", size: 26, color: BLANC, leading: 1.2 })
    entete.espace(2)
    entete.texte(cv.contacts.join("   •   "), { size: 9.5, color: hex("#d5efeb") })

    const debut = hauteurEntete + 12
    const intitules = new Colonne(pdf, marge, largeurIntitule - 6, debut, 18, PAGE_H - 16)
    const corps = new Colonne(pdf, marge + largeurIntitule, PAGE_W - marge * 2 - largeurIntitule, debut, 18, PAGE_H - 16)

    /** L'intitulé se pose en marge, à la hauteur où commence le contenu. */
    const section = (libelle: string, minimum = 16) => {
        corps.place(minimum)
        intitules.page = corps.page
        intitules.y = corps.y
        intitules.texte(libelle.toUpperCase(), { style: "bold", size: 9, color: accent, leading: 1.3 })
    }
    const fin = () => {
        corps.espace(5)
        corps.place(4)
        pdf.setDrawColor(...pale)
        pdf.setLineWidth(0.4)
        pdf.line(marge, corps.y, PAGE_W - marge, corps.y)
        corps.espace(6)
    }

    if (cv.profil) {
        section("Profil")
        corps.texte(cv.profil, { size: 9.5, color: GRIS, leading: 1.5 })
        fin()
    }
    if (cv.experiences.length) {
        section("Expérience")
        entrees(corps, cv.experiences, { font: "helvetica", accent, sousTitreStyle: "normal" })
        fin()
    }
    if (cv.formations.length) {
        section("Formation")
        entrees(corps, cv.formations, { font: "helvetica", accent, sousTitreStyle: "normal" })
        fin()
    }
    if (cv.competences.length) {
        section("Compétences", 12)
        // Étiquettes arrondies, renvoyées à la ligne quand la colonne est pleine.
        const h = 6.4
        let x = corps.x
        corps.place(h)
        for (const c of cv.competences) {
            const libelle = c.niveau ? `${c.nom} · ${c.niveau}` : c.nom
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(8.8)
            const w = Math.min(pdf.getTextWidth(libelle) + 7, corps.w)
            if (x + w > corps.x + corps.w) {
                x = corps.x
                corps.espace(h + 2)
                corps.place(h)
            }
            pdf.setFillColor(...pale)
            pdf.roundedRect(x, corps.y, w, h, 3.2, 3.2, "F")
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(8.8)
            pdf.setTextColor(...accent)
            pdf.text(pdf.splitTextToSize(libelle, w - 6)[0] ?? libelle, x + 3.5, corps.y + 4.3)
            x += w + 2.5
        }
    }
}

// ─── API ──────────────────────────────────────────────────────────────────────

const renderCvPdf = (cv: CvContent, modele: CvModeleId): jsPDF => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" })
    const pret = preparer(cv)
    if (modele === "classique") dessinerClassique(pdf, pret)
    else if (modele === "elegant") dessinerElegant(pdf, pret)
    else dessinerModerne(pdf, pret)
    return pdf
}

export const downloadCvPdf = (cv: CvContent, modele: CvModeleId, filename: string): void => {
    renderCvPdf(cv, modele).save(filename)
}

/** Le même PDF, en fichier prêt à être téléversé (`POST /me/resumes`). */
export const cvPdfFile = (cv: CvContent, modele: CvModeleId, filename: string): File =>
    new File([renderCvPdf(cv, modele).output("blob")], filename, { type: "application/pdf" })

/** URL d'aperçu (blob) du PDF ; à libérer avec `URL.revokeObjectURL`. */
export const cvPdfPreviewUrl = (cv: CvContent, modele: CvModeleId): string =>
    URL.createObjectURL(renderCvPdf(cv, modele).output("blob"))
