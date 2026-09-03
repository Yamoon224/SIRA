"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Download, Award, Plus } from "lucide-react"
import { courseService, enrollmentService, type ICourse, type IEnrollment } from "@/lib/api/course.service"
import { PageHeader } from "@/components/layout/page-header"

function CatalogueTab({ enrolledCourseIds, onEnroll }: { enrolledCourseIds: Set<string>; onEnroll: (courseId: string) => Promise<void> }) {
    const [courses, setCourses] = useState<ICourse[]>([])
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await courseService.paginate({ page: 1, limit: 50 })
                const body = (res as any)?.data !== undefined ? res : { data: [] }
                setCourses(Array.isArray(body.data) ? body.data : [])
            } catch (err) {
                console.error("[formations] catalogue load error:", err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const handleEnroll = async (courseId: string) => {
        setEnrolling(courseId)
        try {
            await onEnroll(courseId)
        } finally {
            setEnrolling(null)
        }
    }

    if (loading) return <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>

    if (courses.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">Aucune formation disponible pour le moment.</p>

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
                const isEnrolled = enrolledCourseIds.has(course.id)
                return (
                    <Card key={course.id} className="border border-border">
                        <CardContent className="p-4">
                            <p className="text-sm font-semibold text-foreground">{course.title}</p>
                            {course.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{course.description}</p>}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {course.category && <Badge variant="outline" className="text-[10px]">{course.category}</Badge>}
                                {course.provider && <Badge variant="outline" className="text-[10px]">{course.provider}</Badge>}
                                {course.durationHours && <Badge variant="outline" className="text-[10px]">{course.durationHours}h</Badge>}
                            </div>
                            <Button
                                size="sm"
                                disabled={isEnrolled || enrolling === course.id}
                                onClick={() => handleEnroll(course.id)}
                                className="mt-3 w-full gap-1.5 bg-blue-600 text-xs hover:bg-blue-700 disabled:bg-green-600"
                            >
                                {isEnrolled ? "Déjà inscrit" : <><Plus className="h-3.5 w-3.5" />{enrolling === course.id ? "Inscription..." : "S'inscrire"}</>}
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

function MesFormationsTab({ enrollments, onUpdateProgress, onDownloadCertificate }: {
    enrollments: IEnrollment[]
    onUpdateProgress: (id: string, progress: number) => void
    onDownloadCertificate: (enrollment: IEnrollment) => void
}) {
    if (enrollments.length === 0) {
        return (
            <Card className="border border-border">
                <CardContent className="p-12 text-center text-muted-foreground">
                    <GraduationCap className="mx-auto mb-3 h-12 w-12 opacity-30" />
                    <p>Vous n'êtes inscrit à aucune formation.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="border border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">{enrollment.course?.title ?? "Formation"}</p>
                            <Badge className={enrollment.status === "COMPLETED" ? "bg-green-500 text-white" : "bg-blue-100 text-blue-600"}>
                                {enrollment.status === "COMPLETED" ? "Terminée" : "En cours"}
                            </Badge>
                        </div>
                        <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Progression</span>
                                <span className="font-semibold text-foreground">{enrollment.progress}%</span>
                            </div>
                            <Progress value={enrollment.progress} className="h-1.5" />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {enrollment.status !== "COMPLETED" && (
                                <>
                                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onUpdateProgress(enrollment.id, Math.min(100, enrollment.progress + 25))}>
                                        +25% de progression
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onUpdateProgress(enrollment.id, 100)}>
                                        Marquer comme terminée
                                    </Button>
                                </>
                            )}
                            {enrollment.hasCertificate && (
                                <Button size="sm" className="h-8 gap-1.5 bg-green-600 text-xs hover:bg-green-700" onClick={() => onDownloadCertificate(enrollment)}>
                                    <Award className="h-3.5 w-3.5" /><Download className="h-3.5 w-3.5" />Certificat
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function Page() {
    const [enrollments, setEnrollments] = useState<IEnrollment[]>([])
    const [loading, setLoading] = useState(true)

    const loadEnrollments = async () => {
        try {
            const res = await enrollmentService.list()
            const items = ((res as any)?.data ?? res) as IEnrollment[]
            setEnrollments(Array.isArray(items) ? items : [])
        } catch (err) {
            console.error("[formations] enrollments load error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadEnrollments() }, [])

    const handleEnroll = async (courseId: string) => {
        try {
            const res = await enrollmentService.enroll(courseId)
            const enrollment = (res as any)?.data ?? res
            setEnrollments((prev) => [enrollment, ...prev])
        } catch (err) {
            console.error("[formations] enroll error:", err)
        }
    }

    const handleUpdateProgress = async (id: string, progress: number) => {
        try {
            const res = await enrollmentService.updateProgress(id, progress)
            const updated = (res as any)?.data ?? res
            setEnrollments((prev) => prev.map((e) => e.id === updated.id ? updated : e))
        } catch (err) {
            console.error("[formations] progress error:", err)
        }
    }

    const handleDownloadCertificate = async (enrollment: IEnrollment) => {
        try {
            await enrollmentService.downloadCertificate(enrollment.id, `certificat-${enrollment.course?.title ?? "formation"}.docx`)
        } catch (err) {
            console.error("[formations] certificate download error:", err)
        }
    }

    const enrolledCourseIds = new Set(enrollments.map((e) => e.course?.id).filter(Boolean) as string[])

    return (
        <div className="space-y-4">
            <PageHeader
                title="Formations"
                description="Développez vos compétences et obtenez des certificats."
            />

            <Tabs defaultValue="mes-formations">
                <TabsList>
                    <TabsTrigger value="mes-formations">Mes formations</TabsTrigger>
                    <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
                </TabsList>
                <TabsContent value="mes-formations" className="mt-4">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>
                    ) : (
                        <MesFormationsTab enrollments={enrollments} onUpdateProgress={handleUpdateProgress} onDownloadCertificate={handleDownloadCertificate} />
                    )}
                </TabsContent>
                <TabsContent value="catalogue" className="mt-4">
                    <CatalogueTab enrolledCourseIds={enrolledCourseIds} onEnroll={handleEnroll} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
