"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Award, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/layout/page-header"
import { useT } from "@/contexts/i18n-context"
import { enrollmentService, type IEnrollment } from "@/lib/api/course.service"
import { CourseCard, CourseGridSkeleton } from "../_components/course-card"

export default function MyCoursesPage() {
    const t = useT()
    const [enrollments, setEnrollments] = useState<IEnrollment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        enrollmentService
            .list()
            .then((res) => setEnrollments((Array.isArray(res) ? res : []).filter((e) => e.course)))
            .catch((err) => console.error("[formations] my courses error:", err))
            .finally(() => setLoading(false))
    }, [])

    const inProgress = enrollments.filter((e) => e.status === "IN_PROGRESS")
    const completed = enrollments.filter((e) => e.status === "COMPLETED")

    const grid = (items: IEnrollment[]) =>
        items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                <GraduationCap className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="mb-4 text-[13px] text-muted-foreground">{t("training.myCourses.empty")}</p>
                <Link href="/formations">
                    <Button className="rounded-full bg-brand-gradient text-white">{t("training.myCourses.explore")}</Button>
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((e) => {
                    const base = `/formations/${e.course!.slug ?? e.course!.id}`
                    return (
                        <div key={e.id} className="space-y-2">
                            <CourseCard
                                course={e.course!}
                                progress={e.progress}
                                href={e.status === "COMPLETED" ? base : `${base}/apprendre${e.lastLessonId ? `?lecon=${e.lastLessonId}` : ""}`}
                            />
                            {e.hasCertificate && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-full"
                                    onClick={() =>
                                        enrollmentService
                                            .downloadCertificate(e.id, `certificat-${e.course!.slug ?? e.course!.id}.docx`)
                                            .catch(() => toast.error(t("common.error")))
                                    }
                                >
                                    <Award className="h-4 w-4" />
                                    {t("training.course.certificate")}
                                </Button>
                            )}
                        </div>
                    )
                })}
            </div>
        )

    return (
        <div>
            <PageHeader title={t("training.tabs.myCourses")} />
            {loading ? (
                <CourseGridSkeleton count={3} />
            ) : (
                <Tabs defaultValue="progress">
                    <TabsList className="mb-4">
                        <TabsTrigger value="progress">{t("training.myCourses.inProgress")} ({inProgress.length})</TabsTrigger>
                        <TabsTrigger value="completed">{t("training.myCourses.completed")} ({completed.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="progress">{grid(inProgress)}</TabsContent>
                    <TabsContent value="completed">{grid(completed)}</TabsContent>
                </Tabs>
            )}
        </div>
    )
}
