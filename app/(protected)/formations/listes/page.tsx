"use client"

import { useEffect, useState } from "react"
import { Bookmark, X } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { useT } from "@/contexts/i18n-context"
import { courseService, type ICourse } from "@/lib/api/course.service"
import { CourseCard, CourseGridSkeleton } from "../_components/course-card"

export default function ListsPage() {
    const t = useT()
    const [courses, setCourses] = useState<ICourse[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        courseService
            .bookmarks()
            .then((res) => setCourses(Array.isArray(res) ? res : []))
            .catch((err) => console.error("[formations] bookmarks error:", err))
            .finally(() => setLoading(false))
    }, [])

    const remove = async (course: ICourse) => {
        setCourses((prev) => prev.filter((c) => c.id !== course.id))
        try {
            await courseService.removeBookmark(course.id)
            toast.success(t("training.lists.removed"))
        } catch {
            setCourses((prev) => [course, ...prev])
            toast.error(t("common.error"))
        }
    }

    return (
        <div>
            <PageHeader title={t("training.lists.title")} />
            {loading ? (
                <CourseGridSkeleton count={3} />
            ) : courses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                    <Bookmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="mx-auto max-w-sm text-[13px] text-muted-foreground">{t("training.lists.empty")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <div key={course.id} className="relative">
                            <CourseCard course={course} />
                            <button
                                type="button"
                                onClick={() => remove(course)}
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/75"
                                aria-label={t("common.delete")}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
