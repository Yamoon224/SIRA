import jsPDF from "jspdf"
import type { ISlide } from "@/lib/api/presentation.service"
import { BACKEND_URL } from "@/lib/backend-url"

/** "Projet Welloh" -> "projet-welloh" */
export const slugFichier = (titre: string): string =>
    titre
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "presentation"

/**
 * Le backend a longtemps renvoyé un chemin relatif (« /storage/… ») : ouvert
 * tel quel, il pointait sur le domaine du front et tombait en 404.
 */
export const urlFichierBackend = (url: string): string => new URL(url, BACKEND_URL).toString()

/** Déclenche le téléchargement d'un blob sans ouvrir d'onglet (bloqué par Safari après un `await`). */
export function telechargerBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const lien = document.createElement("a")
    lien.href = url
    lien.download = filename
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── Slides -> PDF (16:9, une page par slide) ─────────────────────────────────

const L = 254
const H = 142.875
const MARINE: [number, number, number] = [22, 38, 74]
const BLEU: [number, number, number] = [47, 109, 230]
const ENCRE: [number, number, number] = [27, 35, 49]
const GRIS: [number, number, number] = [91, 100, 116]

export function exporterSlidesPdf(titre: string, slides: ISlide[]) {
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [L, H] })

    // Couverture.
    pdf.setFillColor(...MARINE)
    pdf.rect(0, 0, L, H, "F")
    pdf.setFillColor(...BLEU)
    pdf.circle(L - 18, 20, 46, "F")
    pdf.setFillColor(...MARINE)
    pdf.circle(L - 18, 20, 30, "F")
    pdf.setFillColor(...BLEU)
    pdf.rect(22, H / 2 - 24, 26, 2, "F")
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(34)
    pdf.setTextColor(255, 255, 255)
    const lignesTitre: string[] = pdf.splitTextToSize(titre, L - 90)
    pdf.text(lignesTitre.slice(0, 3), 22, H / 2 - 6, { lineHeightFactor: 1.2 })

    slides.forEach((slide, index) => {
        pdf.addPage([L, H], "landscape")

        pdf.setFillColor(...BLEU)
        pdf.rect(0, 0, 5, H, "F")

        // Numéro de slide.
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(11)
        pdf.setTextColor(...BLEU)
        pdf.text(String(index + 1).padStart(2, "0"), 20, 20)

        pdf.setFontSize(24)
        pdf.setTextColor(...ENCRE)
        const lignes: string[] = pdf.splitTextToSize(slide.title ?? "", L - 40)
        pdf.text(lignes.slice(0, 2), 20, 32, { lineHeightFactor: 1.2 })
        let y = 32 + Math.min(lignes.length, 2) * 10.5 + 2
        pdf.setDrawColor(221, 228, 242)
        pdf.setLineWidth(0.4)
        pdf.line(20, y, L - 20, y)
        y += 12

        // Le corps rétrécit jusqu'à tenir dans la slide plutôt que de déborder.
        const bullets = (slide.bullets ?? []).filter(Boolean)
        const disponible = H - 16 - y
        let taille = 16
        let blocs: string[][] = []
        const hauteur = (t: number) => blocs.reduce((h, b) => h + b.length * t * 0.3528 * 1.35 + t * 0.25, 0)
        for (; taille >= 9; taille -= 1) {
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(taille)
            blocs = bullets.map((b) => pdf.splitTextToSize(b, L - 48) as string[])
            if (hauteur(taille) <= disponible) break
        }
        taille = Math.max(taille, 9)
        const interligne = taille * 0.3528 * 1.35

        pdf.setTextColor(...GRIS)
        for (const bloc of blocs) {
            pdf.setFillColor(...BLEU)
            pdf.circle(21.5, y - taille * 0.12, 1, "F")
            for (const ligne of bloc) {
                pdf.text(ligne, 27, y)
                y += interligne
            }
            y += taille * 0.25
        }

        pdf.setFontSize(8)
        pdf.setTextColor(139, 147, 163)
        pdf.text(titre, 20, H - 8)
        pdf.text(`${index + 1} / ${slides.length}`, L - 20, H - 8, { align: "right" })
    })

    pdf.save(`${slugFichier(titre)}.pdf`)
}

// ─── Schéma (SVG) -> PNG ──────────────────────────────────────────────────────

export function exporterSvgPng(svg: SVGSVGElement, filename: string): Promise<void> {
    const largeur = svg.viewBox.baseVal.width
    const hauteur = svg.viewBox.baseVal.height
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    clone.setAttribute("width", String(largeur))
    clone.setAttribute("height", String(hauteur))
    const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`

    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => {
            // x2 : net sur écran haute densité et à l'impression.
            const canvas = document.createElement("canvas")
            canvas.width = largeur * 2
            canvas.height = hauteur * 2
            const ctx = canvas.getContext("2d")
            if (!ctx) return reject(new Error("Canvas indisponible"))
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error("Export PNG impossible"))
                telechargerBlob(blob, filename)
                resolve()
            }, "image/png")
        }
        image.onerror = () => reject(new Error("Export PNG impossible"))
        image.src = source
    })
}
