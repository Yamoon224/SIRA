/**
 * Récupère la photo d'identité incrustée dans un CV (PDF ou .docx), côté
 * navigateur, pour préremplir la photo de profil après l'analyse.
 *
 * Rien ne dit dans le fichier qu'une image est « la photo » : on retient la
 * plus grande image de forme portrait ou carrée, en écartant les fonds de page,
 * bandeaux et pictogrammes. Le résultat reste une proposition que l'utilisateur
 * peut remplacer ou retirer.
 */

const EXTRACTED_KEY = "goriya_cv_photo_extracted"

/** Côté maximal de la photo enregistrée : suffisant pour un avatar, léger à stocker. */
const TAILLE_MAX = 400
const COTE_MIN_PX = 90
const RATIO_MIN = 0.6
const RATIO_MAX = 1.35

type Candidat = { source: CanvasImageSource; largeur: number; hauteur: number; poids: number }

const formePhoto = (largeur: number, hauteur: number): boolean => {
    const ratio = largeur / hauteur
    return ratio >= RATIO_MIN && ratio <= RATIO_MAX
}

function versFichier(candidat: Candidat): Promise<File | null> {
    const echelle = Math.min(1, TAILLE_MAX / Math.max(candidat.largeur, candidat.hauteur))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(candidat.largeur * echelle)
    canvas.height = Math.round(candidat.hauteur * echelle)
    const ctx = canvas.getContext("2d")
    if (!ctx) return Promise.resolve(null)
    // Fond blanc : une photo détourée (PNG transparent) deviendrait noire en JPEG.
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(candidat.source, 0, 0, canvas.width, canvas.height)
    return new Promise((resolve) =>
        canvas.toBlob(
            (blob) => resolve(blob ? new File([blob], "photo-cv.jpg", { type: "image/jpeg" }) : null),
            "image/jpeg",
            0.9,
        ),
    )
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

type Matrice = [number, number, number, number, number, number]

const multiplier = (m: Matrice, n: Matrice): Matrice => [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
]

type ImagePdf = { width: number; height: number; bitmap?: ImageBitmap; data?: Uint8ClampedArray | Uint8Array; kind?: number }

/** Image décodée par pdf.js -> source dessinable. Les images 1 bit (masques) sont ignorées. */
function sourcePdf(image: ImagePdf): CanvasImageSource | null {
    if (image.bitmap) return image.bitmap
    if (!image.data) return null
    const pixels = image.width * image.height
    const canaux = image.data.length / pixels
    if (canaux !== 3 && canaux !== 4) return null

    const rgba = new Uint8ClampedArray(pixels * 4)
    for (let i = 0, j = 0; i < pixels; i++) {
        rgba[i * 4] = image.data[j++]
        rgba[i * 4 + 1] = image.data[j++]
        rgba[i * 4 + 2] = image.data[j++]
        rgba[i * 4 + 3] = canaux === 4 ? image.data[j++] : 255
    }
    const canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    canvas.getContext("2d")?.putImageData(new ImageData(rgba, image.width, image.height), 0, 0)
    return canvas
}

async function candidatsPdf(file: File): Promise<Candidat[]> {
    const pdfjs = await import("pdfjs-dist")
    // Copie de node_modules/pdfjs-dist/build/pdf.worker.min.mjs, à resynchroniser
    // si la version de pdfjs-dist change.
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

    const tache = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
    try {
        const pdf = await tache.promise
        // La photo d'un CV est sur la première page.
        const page = await pdf.getPage(1)
        const [x0, y0, x1, y1] = page.view
        const pageL = Math.abs(x1 - x0)
        const pageH = Math.abs(y1 - y0)
        const { fnArray, argsArray } = await page.getOperatorList()
        const { OPS } = pdfjs

        const objet = (id: string) =>
            new Promise<ImagePdf | null>((resolve) => {
                const delai = setTimeout(() => resolve(null), 3000)
                const objs = id.startsWith("g_") ? page.commonObjs : page.objs
                objs.get(id, (valeur: unknown) => {
                    clearTimeout(delai)
                    resolve((valeur as ImagePdf) ?? null)
                })
            })

        const candidats: Candidat[] = []
        // On suit la matrice de transformation pour connaître la taille affichée
        // de chaque image : c'est elle qui distingue une photo d'un fond de page.
        let ctm: Matrice = [1, 0, 0, 1, 0, 0]
        const pile: Matrice[] = []

        for (let i = 0; i < fnArray.length; i++) {
            const fn = fnArray[i]
            const args = argsArray[i] as unknown[]

            if (fn === OPS.save) pile.push(ctm)
            else if (fn === OPS.restore) ctm = pile.pop() ?? ctm
            else if (fn === OPS.transform) ctm = multiplier(ctm, args as unknown as Matrice)
            else if (fn === OPS.paintFormXObjectBegin) {
                pile.push(ctm)
                if (Array.isArray(args?.[0]) && args[0].length === 6) ctm = multiplier(ctm, args[0] as Matrice)
            } else if (fn === OPS.paintFormXObjectEnd) ctm = pile.pop() ?? ctm
            else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
                const afficheL = Math.hypot(ctm[0], ctm[1])
                const afficheH = Math.hypot(ctm[2], ctm[3])
                const tropGrand = afficheL > pageL * 0.5 || afficheH > pageH * 0.45
                if (tropGrand || afficheL < 36 || afficheH < 36 || !formePhoto(afficheL, afficheH)) continue

                const image = typeof args[0] === "string" ? await objet(args[0]) : (args[0] as ImagePdf)
                if (!image || Math.min(image.width, image.height) < COTE_MIN_PX) continue
                const source = sourcePdf(image)
                if (source) candidats.push({ source, largeur: image.width, hauteur: image.height, poids: afficheL * afficheH })
            }
        }
        return candidats
    } finally {
        await tache.destroy()
    }
}

// ─── Word (.docx) ─────────────────────────────────────────────────────────────

/** Images de `word/media/` d'un .docx (une archive ZIP), sans dépendance. */
async function imagesDocx(file: File): Promise<Blob[]> {
    const octets = new Uint8Array(await file.arrayBuffer())
    const vue = new DataView(octets.buffer)

    // Fin du répertoire central : on la cherche depuis la fin du fichier.
    let fin = -1
    for (let i = octets.length - 22; i >= Math.max(0, octets.length - 65557); i--) {
        if (vue.getUint32(i, true) === 0x06054b50) {
            fin = i
            break
        }
    }
    if (fin < 0) return []

    const total = vue.getUint16(fin + 10, true)
    let curseur = vue.getUint32(fin + 16, true)
    const images: Blob[] = []

    for (let n = 0; n < total && curseur + 46 <= octets.length; n++) {
        if (vue.getUint32(curseur, true) !== 0x02014b50) break
        const methode = vue.getUint16(curseur + 10, true)
        const tailleCompressee = vue.getUint32(curseur + 20, true)
        const longueurNom = vue.getUint16(curseur + 28, true)
        const longueurExtra = vue.getUint16(curseur + 30, true)
        const longueurCommentaire = vue.getUint16(curseur + 32, true)
        const local = vue.getUint32(curseur + 42, true)
        const nom = new TextDecoder().decode(octets.subarray(curseur + 46, curseur + 46 + longueurNom))
        curseur += 46 + longueurNom + longueurExtra + longueurCommentaire

        const extension = /^word\/media\/.+\.(png|jpe?g)$/i.exec(nom)?.[1].toLowerCase()
        if (!extension || local + 30 > octets.length) continue

        const debut = local + 30 + vue.getUint16(local + 26, true) + vue.getUint16(local + 28, true)
        const donnees = octets.slice(debut, debut + tailleCompressee)
        const type = extension === "png" ? "image/png" : "image/jpeg"

        if (methode === 0) images.push(new Blob([donnees], { type }))
        else if (methode === 8) {
            const flux = new Blob([donnees]).stream().pipeThrough(new DecompressionStream("deflate-raw"))
            images.push(new Blob([await new Response(flux).arrayBuffer()], { type }))
        }
    }
    return images
}

async function candidatsDocx(file: File): Promise<Candidat[]> {
    const candidats: Candidat[] = []
    for (const blob of await imagesDocx(file)) {
        try {
            const bitmap = await createImageBitmap(blob)
            if (Math.min(bitmap.width, bitmap.height) >= COTE_MIN_PX && formePhoto(bitmap.width, bitmap.height)) {
                candidats.push({ source: bitmap, largeur: bitmap.width, hauteur: bitmap.height, poids: bitmap.width * bitmap.height })
            }
        } catch {
            // image illisible : on passe à la suivante
        }
    }
    return candidats
}

/** Photo trouvée dans le CV, ou `null`. Ne lève jamais : l'analyse ne doit pas en dépendre. */
export async function extractCvPhoto(file: File): Promise<File | null> {
    try {
        const estPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
        const candidats = estPdf ? await candidatsPdf(file) : await candidatsDocx(file)
        if (candidats.length === 0) return null
        return await versFichier(candidats.reduce((a, b) => (b.poids > a.poids ? b : a)))
    } catch (error) {
        console.error("[cv-photo] extraction de la photo impossible:", error)
        return null
    }
}

/** Met la photo extraite de côté pour la page de résultat (même onglet). */
export function storeExtractedPhoto(photo: File | null): Promise<void> {
    return new Promise((resolve) => {
        try {
            sessionStorage.removeItem(EXTRACTED_KEY)
        } catch {
            // stockage indisponible : la photo ne sera simplement pas proposée
        }
        if (!photo) return resolve()
        const reader = new FileReader()
        reader.onload = () => {
            try {
                sessionStorage.setItem(EXTRACTED_KEY, String(reader.result))
            } catch {
                // idem
            }
            resolve()
        }
        reader.onerror = () => resolve()
        reader.readAsDataURL(photo)
    })
}

export async function loadExtractedPhoto(): Promise<File | null> {
    try {
        const dataUrl = sessionStorage.getItem(EXTRACTED_KEY)
        if (!dataUrl) return null
        const blob = await (await fetch(dataUrl)).blob()
        return new File([blob], "photo-cv.jpg", { type: blob.type || "image/jpeg" })
    } catch {
        return null
    }
}

export function clearExtractedPhoto() {
    try {
        sessionStorage.removeItem(EXTRACTED_KEY)
    } catch {
        // rien à nettoyer
    }
}
