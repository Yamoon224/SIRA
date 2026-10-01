/**
 * Leçons de formation téléchargées pour une lecture hors-ligne.
 *
 * Seules les vidéos en lien direct (VideoProvider FILE : MP4/WebM) sont
 * téléchargeables — YouTube et Vimeo interdisent la récupération du flux.
 * Le fichier est stocké en Blob dans IndexedDB (le Cache API du service
 * worker gère mal les requêtes Range des balises <video>), puis relu via une
 * URL objet. L'hébergeur doit autoriser le CORS, sinon le téléchargement
 * échoue proprement.
 *
 * Tout est local à l'appareil/navigateur : rien n'est envoyé au backend.
 */

const DB_NAME = "goriya-offline"
const DB_VERSION = 1
const STORE = "lessons"

export interface OfflineSubtitle {
    lang: string
    label: string
    /** Contenu WebVTT brut, rejoué via une URL objet. */
    text: string
}

export interface OfflineLessonMeta {
    lessonId: string
    courseId: string
    courseSlug: string | null
    courseTitle: string
    lessonTitle: string
    durationSeconds: number
}

export interface OfflineLesson extends OfflineLessonMeta {
    blob: Blob
    size: number
    subtitles: OfflineSubtitle[]
    savedAt: string
}

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
            reject(new Error("IndexedDB indisponible"))
            return
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains(STORE)) {
                const store = db.createObjectStore(STORE, { keyPath: "lessonId" })
                store.createIndex("courseId", "courseId")
            }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await openDb()
    return new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const request = run(tx.objectStore(STORE))
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
        tx.oncomplete = () => db.close()
    })
}

export async function listOfflineLessons(): Promise<OfflineLesson[]> {
    try {
        const all = await withStore<OfflineLesson[]>("readonly", (s) => s.getAll())
        return all.sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    } catch {
        return []
    }
}

export async function getOfflineLesson(lessonId: string): Promise<OfflineLesson | null> {
    try {
        return (await withStore<OfflineLesson | undefined>("readonly", (s) => s.get(lessonId))) ?? null
    } catch {
        return null
    }
}

export async function offlineLessonIds(): Promise<Set<string>> {
    try {
        const keys = await withStore<IDBValidKey[]>("readonly", (s) => s.getAllKeys())
        return new Set(keys.map(String))
    } catch {
        return new Set()
    }
}

export async function removeOfflineLesson(lessonId: string): Promise<void> {
    await withStore("readwrite", (s) => s.delete(lessonId))
}

/**
 * Télécharge la vidéo (avec progression) et ses sous-titres, puis enregistre
 * le tout. Lève une erreur si l'hébergeur refuse (CORS, 403…).
 */
export async function downloadLesson(
    meta: OfflineLessonMeta,
    videoUrl: string,
    subtitles: { lang: string; label?: string | null; url: string }[],
    onProgress?: (percent: number) => void,
): Promise<OfflineLesson> {
    const response = await fetch(videoUrl, { mode: "cors" })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const total = Number(response.headers.get("content-length")) || 0
    let blob: Blob
    if (response.body && total > 0) {
        const reader = response.body.getReader()
        const chunks: BlobPart[] = []
        let received = 0
        for (;;) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
            received += value.length
            onProgress?.(Math.min(99, Math.round((received / total) * 100)))
        }
        blob = new Blob(chunks, { type: response.headers.get("content-type") ?? "video/mp4" })
    } else {
        blob = await response.blob()
    }

    const offlineSubtitles: OfflineSubtitle[] = []
    for (const track of subtitles) {
        try {
            const res = await fetch(track.url, { mode: "cors" })
            if (res.ok) offlineSubtitles.push({ lang: track.lang, label: track.label ?? track.lang, text: await res.text() })
        } catch {
            // Un sous-titre inaccessible ne doit pas faire échouer la vidéo.
        }
    }

    const lesson: OfflineLesson = {
        ...meta,
        blob,
        size: blob.size,
        subtitles: offlineSubtitles,
        savedAt: new Date().toISOString(),
    }
    await withStore("readwrite", (s) => s.put(lesson))
    onProgress?.(100)

    // Garde la page « Hors-ligne » en cache pour qu'elle s'ouvre sans réseau
    // (le service worker sert les navigations depuis ce cache en dernier
    // recours, voir public/sw.js).
    if (typeof caches !== "undefined") {
        caches.open("goriya-runtime-v1").then((c) => c.add("/formations/hors-ligne")).catch(() => {})
    }

    return lesson
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`
}
