import { apiRequest } from "@/lib/api-client-http"
import { resolveToken } from "@/lib/utils"
import { BACKEND_URL } from "@/lib/backend-url"
import { IPaginatedResponse } from "@/lib/@types/api"
import axios from "axios"

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
export type VideoProvider = "YOUTUBE" | "VIMEO" | "FILE"

export interface ICourseCategory {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
    coverUrl: string | null
    coursesCount: number | null
}

export interface IInstructor {
    id: string
    name: string
    headline: string | null
    bio: string | null
    photoUrl: string | null
    country: string | null
    linkedinUrl: string | null
}

export interface ICourse {
    id: string
    slug: string | null
    title: string
    subtitle: string | null
    description: string | null
    category: string | null
    categoryRef?: ICourseCategory | null
    provider: string | null
    instructor?: IInstructor | null
    level: CourseLevel
    language: string
    subtitleLanguages: string[]
    learningOutcomes: string[]
    durationHours: number | null
    thumbnailPath: string | null
    thumbnailUrl: string | null
    trailerUrl: string | null
    isFree: boolean
    lessonsCount: number
    totalMinutes: number
    publishedAt: string | null
}

export interface ISubtitleTrack {
    lang: string
    label?: string | null
    url: string
}

export interface ILessonProgress {
    lastPositionSeconds: number
    completed: boolean
}

export interface ICourseLesson {
    id: string
    courseId: string
    section: string | null
    title: string
    description: string | null
    /** null quand la leçon est verrouillée (forfait ou pass requis). */
    videoUrl: string | null
    videoProvider: VideoProvider
    durationSeconds: number
    position: number
    isFreePreview: boolean
    locked: boolean
    subtitles: ISubtitleTrack[]
    resources: { title: string; url: string }[]
    progress: ILessonProgress | null
}

export interface IEnrollment {
    id: string
    course: ICourse | null
    progress: number
    status: "IN_PROGRESS" | "COMPLETED"
    hasCertificate: boolean
    enrolledAt: string
    completedAt: string | null
    lastLessonId?: string | null
}

export interface ICourseDetail extends ICourse {
    lessons: ICourseLesson[]
    viewer: {
        isAuthenticated: boolean
        hasFullAccess: boolean
        enrollment: IEnrollment | null
        isBookmarked: boolean
    }
}

export interface ICourseAccess {
    hasFullAccess: boolean
    viaPlan: boolean
    pass: { startsAt: string; endsAt: string; active: boolean } | null
    passAvailable: boolean
    passDays: number
}

export interface ICourseProject {
    id: string
    courseId: string | null
    course: { id: string; slug: string | null; title: string } | null
    title: string
    description: string | null
    linkUrl: string | null
    fileName: string | null
    hasFile: boolean
    status: "SUBMITTED" | "REVIEWED"
    feedback: string | null
    reviewedAt: string | null
    createdAt: string
}

export interface CourseFilters {
    page?: number
    limit?: number
    search?: string
    category?: string
    level?: CourseLevel
    language?: string
    isFree?: boolean
}

const API_BASE_URL = BACKEND_URL

/**
 * Télécharge un fichier privé protégé par JWT. Pas de proxy dans cette app,
 * donc pas de simple <a href> : blob authentifié puis URL objet temporaire.
 */
async function downloadPrivateFile(endpoint: string, filename: string) {
    const token = await resolveToken()
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        responseType: "blob",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const url = URL.createObjectURL(response.data as Blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

export const courseService = {
    categories: async () => apiRequest<ICourseCategory[]>({ endpoint: "/course-categories", method: "GET" }),

    paginate: async (filters?: CourseFilters) =>
        apiRequest<IPaginatedResponse<ICourse>>({ endpoint: "/courses/paginate", method: "GET", params: filters }),

    /** Fiche + programme ; accepte l'uuid ou le slug. */
    get: async (idOrSlug: string) => apiRequest<ICourseDetail>({ endpoint: `/courses/${idOrSlug}`, method: "GET" }),

    recordProgress: async (lessonId: string, data: { positionSeconds?: number; completed?: boolean }) =>
        apiRequest<{ lessonId: string; lastPositionSeconds: number; completed: boolean; enrollment: IEnrollment }>({
            endpoint: `/lessons/${lessonId}/progress`,
            method: "POST",
            data,
        }),

    bookmarks: async () => apiRequest<ICourse[]>({ endpoint: "/me/course-bookmarks", method: "GET" }),
    addBookmark: async (courseId: string) => apiRequest({ endpoint: `/courses/${courseId}/bookmark`, method: "POST" }),
    removeBookmark: async (courseId: string) => apiRequest({ endpoint: `/courses/${courseId}/bookmark`, method: "DELETE" }),

    access: async () => apiRequest<ICourseAccess>({ endpoint: "/me/course-access", method: "GET" }),
    activatePass: async () => apiRequest<ICourseAccess>({ endpoint: "/me/course-pass", method: "POST" }),
}

export const enrollmentService = {
    /** « Mes cours » : inscriptions + dernière leçon ouverte. */
    list: async () => apiRequest<IEnrollment[]>({ endpoint: "/me/courses", method: "GET" }),

    enroll: async (courseId: string) => apiRequest<IEnrollment>({ endpoint: `/courses/${courseId}/enroll`, method: "POST" }),

    downloadCertificate: async (id: string, filename: string) => downloadPrivateFile(`/enrollments/${id}/certificate`, filename),
}

export const courseProjectService = {
    list: async () => apiRequest<ICourseProject[]>({ endpoint: "/me/course-projects", method: "GET" }),

    /** Multipart (fichier facultatif). Modification : POST + _method=PATCH, PHP ignorant le multipart d'un vrai PATCH. */
    save: async (data: { id?: string; title: string; description?: string; linkUrl?: string; courseId?: string; file?: File | null }) => {
        const form = new FormData()
        form.append("title", data.title)
        if (data.description !== undefined) form.append("description", data.description)
        if (data.linkUrl !== undefined) form.append("linkUrl", data.linkUrl)
        if (data.courseId !== undefined) form.append("courseId", data.courseId)
        if (data.file) form.append("file", data.file)
        if (data.id) form.append("_method", "PATCH")
        return apiRequest<ICourseProject>({
            endpoint: data.id ? `/me/course-projects/${data.id}` : "/me/course-projects",
            method: "POST",
            data: form,
        })
    },

    remove: async (id: string) => apiRequest({ endpoint: `/me/course-projects/${id}`, method: "DELETE" }),

    downloadFile: async (project: ICourseProject) =>
        downloadPrivateFile(`/me/course-projects/${project.id}/file`, project.fileName ?? "projet"),
}

/** "2h30" / "45 min" à partir d'un nombre de minutes. */
export function formatMinutes(total: number): string {
    if (!total) return "0 min"
    const h = Math.floor(total / 60)
    const m = total % 60
    if (!h) return `${m} min`
    return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`
}

/** Identifiant à utiliser dans les URLs : le slug quand il existe. */
export function courseHref(course: Pick<ICourse, "id" | "slug">): string {
    return `/formations/${course.slug ?? course.id}`
}
