import { inflateRawSync } from "node:zlib"

/**
 * Extraction du texte d'un document Word (.docx) côté serveur, sans
 * dépendance : un .docx est une archive ZIP dont le corps est
 * `word/document.xml`. `File.text()` sur un .docx ne renvoie que les octets
 * compressés, illisibles pour l'IA.
 */

const EOCD_SIGNATURE = 0x06054b50
const CENTRAL_SIGNATURE = 0x02014b50
const LOCAL_SIGNATURE = 0x04034b50

/** Corps, puis en-têtes/pieds de page : les CV y placent souvent leurs coordonnées. */
const PART_PATTERN = /^word\/(document|header\d*|footer\d*)\.xml$/

function readZipEntries(buffer: Buffer): Map<string, Buffer> {
    // La fin du répertoire central se trouve dans les ~65 Ko de fin (commentaire ZIP éventuel).
    let eocd = -1
    for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 22 - 0xffff); i--) {
        if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) {
            eocd = i
            break
        }
    }
    if (eocd < 0) throw new Error("Archive ZIP invalide")

    const count = buffer.readUInt16LE(eocd + 10)
    let offset = buffer.readUInt32LE(eocd + 16)
    const entries = new Map<string, Buffer>()

    for (let i = 0; i < count; i++) {
        if (buffer.readUInt32LE(offset) !== CENTRAL_SIGNATURE) break
        const method = buffer.readUInt16LE(offset + 10)
        const compressedSize = buffer.readUInt32LE(offset + 20)
        const nameLength = buffer.readUInt16LE(offset + 28)
        const extraLength = buffer.readUInt16LE(offset + 30)
        const commentLength = buffer.readUInt16LE(offset + 32)
        const localOffset = buffer.readUInt32LE(offset + 42)
        const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength)
        offset += 46 + nameLength + extraLength + commentLength

        if (!PART_PATTERN.test(name)) continue
        if (buffer.readUInt32LE(localOffset) !== LOCAL_SIGNATURE) continue

        // Les longueurs de l'en-tête local peuvent différer de celles du répertoire central.
        const dataStart = localOffset + 30 + buffer.readUInt16LE(localOffset + 26) + buffer.readUInt16LE(localOffset + 28)
        const data = buffer.subarray(dataStart, dataStart + compressedSize)
        if (method === 0) entries.set(name, data)
        else if (method === 8) entries.set(name, inflateRawSync(data))
    }

    return entries
}

function xmlToText(xml: string): string {
    return xml
        .replace(/<w:tab\b[^>]*\/>/g, "\t")
        .replace(/<w:(br|cr)\b[^>]*\/>/g, "\n")
        .replace(/<\/w:p>/g, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
        .replace(/&amp;/g, "&")
}

/** Lève une erreur si le fichier n'est pas une archive .docx lisible. */
export function extractDocxText(buffer: Buffer): string {
    const entries = readZipEntries(buffer)
    const body = entries.get("word/document.xml")
    if (!body) throw new Error("word/document.xml introuvable")

    const others = [...entries.keys()].filter((name) => name !== "word/document.xml").sort()
    const headers = others.filter((name) => name.includes("header"))
    const footers = others.filter((name) => name.includes("footer"))

    return [...headers, "word/document.xml", ...footers]
        .map((name) => xmlToText(entries.get(name)!.toString("utf8")))
        .join("\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
}
