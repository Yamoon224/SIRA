"use client"

import Link from "next/link"
import { Clock, GraduationCap, PlayCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useT } from "@/contexts/i18n-context"
import { courseHref, formatMinutes, type ICourse } from "@/lib/api/course.service"

/**
 * Carte d'un cours dans le catalogue, « Mes cours » et « Listes ». Avec
 * `progress`, affiche la barre d'avancement et pointe vers le lecteur.
 */
export function CourseCard({ course, progress, href }: { course: ICourse; progress?: number; href?: string }) {
    const t = useT()
    const category = course.categoryRef?.name ?? course.category

    return (
        <Link
            href={href ?? courseHref(course)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-brand-gradient">
                {course.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" decoding="async" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <GraduationCap className="h-10 w-10 text-white/80" />
                    </div>
                )}
                <div className="absolute left-2 top-2 flex gap-1.5">
                    {course.isFree && <Badge className="border-0 bg-emerald-500 text-[10px] text-white">{t("training.free")}</Badge>}
                    {category && <Badge className="border-0 bg-black/55 text-[10px] text-white backdrop-blur">{category}</Badge>}
                </div>
                <PlayCircle className="absolute bottom-2 right-2 h-8 w-8 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-foreground">{course.title}</p>
                {course.instructor && (
                    <p className="truncate text-[12px] text-muted-foreground">{t("training.by", { name: course.instructor.name })}</p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatMinutes(course.totalMinutes)} · {t("training.lessonsCount", { count: course.lessonsCount })}
                    </span>
                    <span>{t(`training.levels.${course.level}`)}</span>
                </div>
                {progress !== undefined && (
                    <div className="pt-1.5">
                        <Progress value={progress} className="h-1.5" />
                        <p className="mt-1 text-[11px] text-muted-foreground">{t("training.course.progress", { progress })}</p>
                    </div>
                )}
            </div>
        </Link>
    )
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="aspect-video animate-pulse bg-secondary" />
                    <div className="space-y-2 p-3.5">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
                    </div>
                </div>
            ))}
        </div>
    )
}
