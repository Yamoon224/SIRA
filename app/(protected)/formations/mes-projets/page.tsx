"use client"

import { useEffect, useState } from "react"
import { Download, ExternalLink, FolderKanban, Loader2, MessageSquareText, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { useI18n } from "@/contexts/i18n-context"
import { courseProjectService, enrollmentService, type ICourse, type ICourseProject } from "@/lib/api/course.service"

const NONE = "none"

type FormState = {
    id?: string
    title: string
    description: string
    linkUrl: string
    courseId: string
    file: File | null
    currentFileName: string | null
}

const EMPTY_FORM: FormState = { title: "", description: "", linkUrl: "", courseId: NONE, file: null, currentFileName: null }

function hostOf(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "")
    } catch {
        return url
    }
}

export default function MyProjectsPage() {
    const { t, locale } = useI18n()
    const [projects, setProjects] = useState<ICourseProject[]>([])
    const [courses, setCourses] = useState<ICourse[]>([])
    const [loading, setLoading] = useState(true)
    const [formOpen, setFormOpen] = useState(false)
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ICourseProject | null>(null)

    const load = async () => {
        try {
            const res = await courseProjectService.list()
            setProjects(Array.isArray(res) ? res : [])
        } catch (err) {
            console.error("[formations] projects error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
        enrollmentService
            .list()
            .then((res) => setCourses((Array.isArray(res) ? res : []).map((e) => e.course).filter((c): c is ICourse => !!c)))
            .catch(() => {})
    }, [])

    const openEdit = (p: ICourseProject) => {
        setForm({
            id: p.id,
            title: p.title,
            description: p.description ?? "",
            linkUrl: p.linkUrl ?? "",
            courseId: p.courseId ?? NONE,
            file: null,
            currentFileName: p.fileName,
        })
        setFormOpen(true)
    }

    const handleSave = async () => {
        if (!form.title.trim()) {
            toast.error(t("common.required"))
            return
        }
        setSaving(true)
        try {
            await courseProjectService.save({
                id: form.id,
                title: form.title.trim(),
                description: form.description.trim(),
                linkUrl: form.linkUrl.trim(),
                courseId: form.courseId === NONE ? "" : form.courseId,
                file: form.file,
            })
            toast.success(t("training.projects.saved"))
            setFormOpen(false)
            await load()
        } catch (err: any) {
            const firstError = err?.errors ? Object.values(err.errors as Record<string, string[]>)[0]?.[0] : null
            toast.error(firstError || err?.message || t("common.error"))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await courseProjectService.remove(deleteTarget.id)
            setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
            toast.success(t("training.projects.deleted"))
        } catch {
            toast.error(t("common.error"))
        } finally {
            setDeleteTarget(null)
        }
    }

    return (
        <div>
            <PageHeader
                title={t("training.projects.title")}
                description={t("training.projects.subtitle")}
                actions={
                    <Button
                        className="rounded-full bg-brand-gradient text-white"
                        onClick={() => {
                            setForm(EMPTY_FORM)
                            setFormOpen(true)
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        {t("training.projects.new")}
                    </Button>
                }
            />

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : projects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                    <FolderKanban className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="mx-auto max-w-sm text-[13px] text-muted-foreground">{t("training.projects.empty")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {projects.map((p) => (
                        <div key={p.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[15px] font-semibold text-foreground">{p.title}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {new Date(p.createdAt).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR")}
                                        {p.course && <> · {p.course.title}</>}
                                    </p>
                                </div>
                                {p.status === "REVIEWED" ? (
                                    <Badge className="shrink-0 border-0 bg-emerald-500 text-white">{t("training.projects.reviewed")}</Badge>
                                ) : (
                                    <Badge variant="outline" className="shrink-0">{t("training.projects.submitted")}</Badge>
                                )}
                            </div>
                            {p.description && <p className="line-clamp-3 whitespace-pre-line text-[13px] text-muted-foreground">{p.description}</p>}
                            {p.feedback && (
                                <div className="rounded-xl bg-secondary p-3">
                                    <p className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                                        <MessageSquareText className="h-3.5 w-3.5" />
                                        {t("training.projects.feedback")}
                                    </p>
                                    <p className="whitespace-pre-line text-[12px] text-muted-foreground">{p.feedback}</p>
                                </div>
                            )}
                            <div className="mt-auto flex flex-wrap gap-2">
                                {p.linkUrl && (
                                    <a href={p.linkUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="rounded-full">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            {hostOf(p.linkUrl)}
                                        </Button>
                                    </a>
                                )}
                                {p.hasFile && (
                                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => courseProjectService.downloadFile(p).catch(() => toast.error(t("common.error")))}>
                                        <Download className="h-3.5 w-3.5" />
                                        {p.fileName}
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" className="ml-auto rounded-full" onClick={() => openEdit(p)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-full text-red-500" onClick={() => setDeleteTarget(p)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{form.id ? t("training.projects.edit") : t("training.projects.new")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>{t("training.projects.titleLabel")} *</Label>
                            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
                        </div>
                        <div>
                            <Label>{t("training.projects.descriptionLabel")}</Label>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={4} />
                        </div>
                        <div>
                            <Label>{t("training.projects.linkLabel")}</Label>
                            <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} className="mt-1" placeholder="https://..." />
                        </div>
                        <div>
                            <Label>{t("training.projects.courseLabel")}</Label>
                            <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>{t("training.projects.noCourse")}</SelectItem>
                                    {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>{t("training.projects.fileLabel")}</Label>
                            <Input
                                type="file"
                                accept=".pdf,.zip,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })}
                                className="mt-1"
                            />
                            {form.currentFileName && !form.file && (
                                <p className="mt-1 text-[11px] text-muted-foreground">{t("training.projects.currentFile", { name: form.currentFileName })}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormOpen(false)}>{t("common.cancel")}</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-brand-gradient text-white">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {form.id ? t("common.save") : t("training.projects.submit")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("training.projects.deleteConfirm")}</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">{t("common.delete")}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
