"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, CalendarDays, CheckCircle2, ClipboardList, Loader2, Plus, Star, Trash2, Umbrella, UserCog } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { CompanyLogo } from "@/components/company-logo"
import { cn } from "@/lib/utils"
import {
    myEmployeeService,
    type HrRequestType,
    type IMyEmployee,
    type IMyHrRequest,
    type IMyLeave,
    type LeaveType,
} from "@/lib/api/my-employee.service"
import { employeeSurveyService, type IEmployeeSurvey } from "@/lib/api/employee-survey.service"

/** Miroir des libellés entreprise/lib/data/rh.ts, pour rester cohérent avec ce que les RH voient. */
const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
    PAID: "Congés payés",
    SICK: "Maladie",
    MATERNITY: "Maternité",
    PATERNITY: "Paternité",
    FAMILY_EVENT: "Événement familial",
    UNPAID: "Sans solde",
    OTHER: "Autre absence",
}

const HR_REQUEST_TYPE_LABEL: Record<HrRequestType, string> = {
    WORK_CERTIFICATE: "Attestation de travail",
    SALARY_CERTIFICATE: "Attestation de salaire",
    SALARY_ADVANCE: "Avance sur salaire",
    TRAINING: "Formation",
    EQUIPMENT: "Matériel",
    SCHEDULE_CHANGE: "Aménagement d'horaires",
    OTHER: "Autre demande",
}

const STATUS_META: Record<string, { label: string; className: string }> = {
    PENDING: { label: "En attente", className: "bg-amber-100 text-amber-700" },
    IN_PROGRESS: { label: "En cours", className: "bg-blue-100 text-blue-700" },
    APPROVED: { label: "Approuvé", className: "bg-green-100 text-green-700" },
    REJECTED: { label: "Refusé", className: "bg-red-100 text-red-700" },
    CANCELLED: { label: "Annulé", className: "bg-gray-200 text-gray-600" },
}

const EMPLOYEE_STATUS_LABEL: Record<string, string> = {
    ACTIVE: "Actif",
    PROBATION: "Période d'essai",
    SUSPENDED: "Suspendu",
    TERMINATED: "Ancien employé",
}

function errMsg(err: unknown, fallback: string): string {
    const e = err as { message?: string; error?: string; response?: { data?: { message?: string } } }
    return e?.response?.data?.message ?? e?.message ?? e?.error ?? fallback
}

function fmtDate(value: string): string {
    return new Date(value).toLocaleDateString("fr-FR")
}

export default function Page() {
    const [loading, setLoading] = useState(true)
    const [employee, setEmployee] = useState<IMyEmployee | null>(null)
    const [leaves, setLeaves] = useState<IMyLeave[]>([])
    const [hrRequests, setHrRequests] = useState<IMyHrRequest[]>([])
    const [evaluations, setEvaluations] = useState<IEmployeeSurvey[]>([])
    const [tab, setTab] = useState<"leaves" | "requests" | "evaluations">("leaves")

    const isTerminated = employee?.status === "TERMINATED"

    useEffect(() => {
        const load = async () => {
            try {
                const me = await myEmployeeService.get()
                setEmployee(me)
                if (me) {
                    const [l, r, ev] = await Promise.all([
                        myEmployeeService.leaves(),
                        myEmployeeService.hrRequests(),
                        myEmployeeService.evaluations(),
                    ])
                    setLeaves(Array.isArray(l) ? l : [])
                    setHrRequests(Array.isArray(r) ? r : [])
                    const evList = Array.isArray(ev) ? ev : []
                    setEvaluations(evList)
                    // Une évaluation déjà répondue le reste après rechargement :
                    // le formulaire ne doit pas réapparaître (réponse définitive).
                    setEvalSubmitted(new Set(evList.filter((s) => s.answered).map((s) => s.id)))
                }
            } catch (err) {
                console.error("[espace-employe] load error:", err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // ── Réponse à une évaluation ──
    const [evalAnswers, setEvalAnswers] = useState<Record<string, Record<string, string | number>>>({})
    const [evalSubmitting, setEvalSubmitting] = useState<string | null>(null)
    const [evalSubmitted, setEvalSubmitted] = useState<Set<string>>(new Set())

    const setEvalAnswer = (surveyId: string, questionId: string, value: string | number) => {
        setEvalAnswers((prev) => ({ ...prev, [surveyId]: { ...prev[surveyId], [questionId]: value } }))
    }

    const submitEvaluation = async (survey: IEmployeeSurvey) => {
        const answers = evalAnswers[survey.id] ?? {}
        const payload = survey.questions
            .filter((q) => answers[q.id] !== undefined && answers[q.id] !== "")
            .map((q) => ({ questionId: q.id, value: answers[q.id] }))
        if (payload.length === 0) return

        setEvalSubmitting(survey.id)
        try {
            await employeeSurveyService.submitResponse(survey.id, payload)
            setEvalSubmitted((prev) => new Set(prev).add(survey.id))
            toast.success("Réponse envoyée, merci !")
        } catch (err) {
            toast.error(errMsg(err, "L'envoi de votre réponse a échoué."))
        } finally {
            setEvalSubmitting(null)
        }
    }

    // ── Nouvelle demande de congé ──
    const [leaveOpen, setLeaveOpen] = useState(false)
    const [leaveType, setLeaveType] = useState<LeaveType>("PAID")
    const [leaveStart, setLeaveStart] = useState("")
    const [leaveEnd, setLeaveEnd] = useState("")
    const [leaveReason, setLeaveReason] = useState("")
    const [savingLeave, setSavingLeave] = useState(false)
    const [deleteLeave, setDeleteLeave] = useState<IMyLeave | null>(null)

    const openLeaveDialog = () => {
        setLeaveType("PAID")
        setLeaveStart("")
        setLeaveEnd("")
        setLeaveReason("")
        setLeaveOpen(true)
    }

    const submitLeave = async () => {
        if (!leaveStart || !leaveEnd) {
            toast.error("Indiquez les dates de début et de fin.")
            return
        }
        setSavingLeave(true)
        try {
            const created = await myEmployeeService.createLeave({
                type: leaveType,
                startDate: leaveStart,
                endDate: leaveEnd,
                reason: leaveReason || null,
            })
            setLeaves((prev) => [created, ...prev])
            setLeaveOpen(false)
            toast.success("Demande de congé envoyée.")
        } catch (err) {
            toast.error(errMsg(err, "La demande a échoué."))
        } finally {
            setSavingLeave(false)
        }
    }

    const confirmDeleteLeave = async () => {
        if (!deleteLeave) return
        try {
            await myEmployeeService.removeLeave(deleteLeave.id)
            setLeaves((prev) => prev.filter((l) => l.id !== deleteLeave.id))
            toast.success("Demande retirée.")
        } catch (err) {
            toast.error(errMsg(err, "Le retrait a échoué."))
        } finally {
            setDeleteLeave(null)
        }
    }

    // ── Nouvelle demande RH ──
    const [requestOpen, setRequestOpen] = useState(false)
    const [requestType, setRequestType] = useState<HrRequestType>("WORK_CERTIFICATE")
    const [requestSubject, setRequestSubject] = useState("")
    const [requestDescription, setRequestDescription] = useState("")
    const [requestAmount, setRequestAmount] = useState("")
    const [savingRequest, setSavingRequest] = useState(false)
    const [deleteRequest, setDeleteRequest] = useState<IMyHrRequest | null>(null)

    const openRequestDialog = () => {
        setRequestType("WORK_CERTIFICATE")
        setRequestSubject("")
        setRequestDescription("")
        setRequestAmount("")
        setRequestOpen(true)
    }

    const submitRequest = async () => {
        if (!requestSubject.trim()) {
            toast.error("Indiquez l'objet de la demande.")
            return
        }
        if (requestType === "SALARY_ADVANCE" && !requestAmount) {
            toast.error("Indiquez le montant de l'avance demandée.")
            return
        }
        setSavingRequest(true)
        try {
            const created = await myEmployeeService.createHrRequest({
                type: requestType,
                subject: requestSubject.trim(),
                description: requestDescription || null,
                amount: requestAmount ? Number(requestAmount) : null,
            })
            setHrRequests((prev) => [created, ...prev])
            setRequestOpen(false)
            toast.success("Demande envoyée.")
        } catch (err) {
            toast.error(errMsg(err, "La demande a échoué."))
        } finally {
            setSavingRequest(false)
        }
    }

    const confirmDeleteRequest = async () => {
        if (!deleteRequest) return
        try {
            await myEmployeeService.removeHrRequest(deleteRequest.id)
            setHrRequests((prev) => prev.filter((r) => r.id !== deleteRequest.id))
            toast.success("Demande retirée.")
        } catch (err) {
            toast.error(errMsg(err, "Le retrait a échoué."))
        } finally {
            setDeleteRequest(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!employee) {
        return (
            <div className="space-y-4">
                <PageHeader title="Mon espace employé" />
                <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <Briefcase className="mx-auto mb-3 h-12 w-12 opacity-30" />
                        <p>Cet espace s&apos;ouvre dès qu&apos;une entreprise vous embauche depuis Goriya.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            <PageHeader title="Mon espace employé" description="Vos congés, vos demandes RH et vos évaluations auprès de votre employeur." />

            {isTerminated && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Vous n&apos;êtes plus employé·e chez {employee.companyName ?? "cette entreprise"}. Vous pouvez
                    consulter l&apos;historique ci-dessous, mais plus soumettre de nouvelle demande.
                </div>
            )}

            <Card className="border border-border">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <CompanyLogo
                            name={employee.companyName ?? "?"}
                            logo={employee.companyLogo}
                            className="h-11 w-11 text-sm"
                        />
                        <div>
                            <p className="text-base font-semibold text-foreground">{employee.companyName ?? "Entreprise"}</p>
                            <p className="text-sm text-muted-foreground">{employee.jobTitle}{employee.department ? ` · ${employee.department}` : ""}</p>
                            <p className="mt-1 text-xs text-muted-foreground">Embauché·e le {fmtDate(employee.hireDate)}{employee.manager ? ` · Responsable : ${employee.manager.fullName}` : ""}</p>
                        </div>
                    </div>
                    <Badge className={STATUS_META[employee.status]?.className ?? ""} variant="outline">
                        {EMPLOYEE_STATUS_LABEL[employee.status] ?? employee.status}
                    </Badge>
                </CardContent>
                {employee.leaveBalance && (
                    <div className="grid grid-cols-3 gap-px border-t border-border bg-border text-center">
                        <div className="bg-white px-2 py-3 dark:bg-card">
                            <p className="text-lg font-bold text-foreground">{employee.leaveBalance.remaining}</p>
                            <p className="text-xs text-muted-foreground">Jours restants</p>
                        </div>
                        <div className="bg-white px-2 py-3 dark:bg-card">
                            <p className="text-lg font-bold text-foreground">{employee.leaveBalance.taken}</p>
                            <p className="text-xs text-muted-foreground">Jours pris ({employee.leaveBalance.year})</p>
                        </div>
                        <div className="bg-white px-2 py-3 dark:bg-card">
                            <p className="text-lg font-bold text-foreground">{employee.leaveBalance.entitlement}</p>
                            <p className="text-xs text-muted-foreground">Jours acquis</p>
                        </div>
                    </div>
                )}
            </Card>

            {/* Onglets : même gabarit que ceux de la bibliothèque (piste pleine
                largeur, une seule ligne, actif en dégradé de la marque). Sur
                mobile la piste défile horizontalement plutôt que de passer à
                la ligne. */}
            <div
                role="tablist"
                aria-label="Sections de l'espace employé"
                className="flex w-full gap-1 overflow-x-auto rounded-full bg-[#f4f7ff] p-1.5 dark:bg-muted"
            >
                {(
                    [
                        { id: "leaves" as const, label: "Congés", icon: Umbrella, count: leaves.length },
                        { id: "requests" as const, label: "Demandes RH", icon: UserCog, count: hrRequests.length },
                        { id: "evaluations" as const, label: "Évaluations", icon: ClipboardList, count: evaluations.length },
                    ]
                ).map(({ id, label, icon: Icon, count }) => {
                    const active = tab === id
                    return (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(id)}
                            className={cn(
                                "inline-flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                active
                                    ? "bg-brand-gradient text-white shadow-sm"
                                    : "text-[#7f8796] hover:text-[#1b2331] dark:text-muted-foreground dark:hover:text-foreground",
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                            <span
                                className={cn(
                                    "min-w-[1.5rem] rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                                    active ? "bg-white/25 text-white" : "bg-white text-[#5b6474] dark:bg-background dark:text-muted-foreground",
                                )}
                            >
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {tab === "leaves" && (
                <div className="space-y-3">
                    <div className="flex justify-end">
                        <Button size="sm" className="gap-1.5" disabled={isTerminated} onClick={openLeaveDialog}>
                            <Plus className="h-3.5 w-3.5" />Nouvelle demande de congé
                        </Button>
                    </div>
                    {leaves.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">Aucune demande de congé pour le moment.</p>
                    ) : (
                        <div className="space-y-2">
                            {leaves.map((leave) => (
                                <Card key={leave.id} className="border border-border">
                                    <CardContent className="flex items-center justify-between gap-3 p-4">
                                        <div className="flex items-start gap-3">
                                            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {LEAVE_TYPE_LABEL[leave.type]} · {leave.days} jour{leave.days > 1 ? "s" : ""}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Du {fmtDate(leave.startDate)} au {fmtDate(leave.endDate)}
                                                </p>
                                                {leave.reason && <p className="mt-1 text-xs text-muted-foreground">{leave.reason}</p>}
                                                {leave.decisionComment && <p className="mt-1 text-xs italic text-muted-foreground">« {leave.decisionComment} »</p>}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_META[leave.status]?.className}`}>
                                                {STATUS_META[leave.status]?.label ?? leave.status}
                                            </span>
                                            {leave.status === "PENDING" && (
                                                <button
                                                    onClick={() => setDeleteLeave(leave)}
                                                    aria-label="Retirer cette demande"
                                                    className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === "requests" && (
                <div className="space-y-3">
                    <div className="flex justify-end">
                        <Button size="sm" className="gap-1.5" disabled={isTerminated} onClick={openRequestDialog}>
                            <Plus className="h-3.5 w-3.5" />Nouvelle demande RH
                        </Button>
                    </div>
                    {hrRequests.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">Aucune demande RH pour le moment.</p>
                    ) : (
                        <div className="space-y-2">
                            {hrRequests.map((r) => (
                                <Card key={r.id} className="border border-border">
                                    <CardContent className="flex items-center justify-between gap-3 p-4">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{r.subject}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {HR_REQUEST_TYPE_LABEL[r.type]}{r.amount ? ` · ${r.amount.toLocaleString("fr-FR")} FCFA` : ""} · {fmtDate(r.createdAt)}
                                            </p>
                                            {r.decisionComment && <p className="mt-1 text-xs italic text-muted-foreground">« {r.decisionComment} »</p>}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_META[r.status]?.className}`}>
                                                {STATUS_META[r.status]?.label ?? r.status}
                                            </span>
                                            {r.status === "PENDING" && (
                                                <button
                                                    onClick={() => setDeleteRequest(r)}
                                                    aria-label="Retirer cette demande"
                                                    className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === "evaluations" && (
                <div className="space-y-3">
                    {evaluations.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">Aucune évaluation active pour le moment.</p>
                    ) : (
                        evaluations.map((survey) => {
                            const isSubmitted = evalSubmitted.has(survey.id)
                            return (
                                <Card key={survey.id} className="border border-border">
                                    <CardContent className="space-y-4 p-4">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{survey.title}</p>
                                            {survey.description && <p className="text-xs text-muted-foreground">{survey.description}</p>}
                                            {survey.department && <p className="mt-1 text-[11px] text-muted-foreground">Département : {survey.department}</p>}
                                        </div>

                                        {isSubmitted ? (
                                            <p className="flex items-center gap-1.5 text-sm text-green-600">
                                                <CheckCircle2 className="h-4 w-4" />Réponse envoyée - merci !
                                            </p>
                                        ) : (
                                            <>
                                                <div className="space-y-3">
                                                    {survey.questions.map((q) => (
                                                        <div key={q.id}>
                                                            <p className="mb-1.5 text-sm text-foreground">{q.question}</p>
                                                            {q.type === "RATING" ? (
                                                                <div className="flex gap-1">
                                                                    {[1, 2, 3, 4, 5].map((n) => (
                                                                        <button key={n} onClick={() => setEvalAnswer(survey.id, q.id, n)}>
                                                                            <Star className={cn("h-6 w-6", (evalAnswers[survey.id]?.[q.id] as number) >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <Textarea
                                                                    value={(evalAnswers[survey.id]?.[q.id] as string) ?? ""}
                                                                    onChange={(e) => setEvalAnswer(survey.id, q.id, e.target.value)}
                                                                    placeholder="Votre réponse..."
                                                                    className="min-h-[60px]"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button disabled={evalSubmitting === survey.id} onClick={() => submitEvaluation(survey)}>
                                                    {evalSubmitting === survey.id ? "Envoi..." : "Envoyer ma réponse"}
                                                </Button>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>
            )}

            {/* ── Nouvelle demande de congé ── */}
            <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nouvelle demande de congé</DialogTitle>
                        <DialogDescription>Votre employeur reçoit la demande et pourra l&apos;approuver ou la refuser.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1.5 block text-xs text-muted-foreground">Type de congé</label>
                            <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(LEAVE_TYPE_LABEL) as LeaveType[]).map((k) => (
                                        <SelectItem key={k} value={k}>{LEAVE_TYPE_LABEL[k]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-xs text-muted-foreground">Début</label>
                                <Input type="date" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs text-muted-foreground">Fin</label>
                                <Input type="date" min={leaveStart || undefined} value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs text-muted-foreground">Motif (facultatif)</label>
                            <Textarea rows={3} value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="Précisez si besoin..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" disabled={savingLeave} onClick={() => setLeaveOpen(false)}>Annuler</Button>
                        <Button size="sm" disabled={savingLeave} onClick={submitLeave}>
                            {savingLeave ? "Envoi…" : "Envoyer la demande"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Nouvelle demande RH ── */}
            <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nouvelle demande RH</DialogTitle>
                        <DialogDescription>Attestation, avance, formation… votre demande part directement à votre employeur.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1.5 block text-xs text-muted-foreground">Type de demande</label>
                            <Select value={requestType} onValueChange={(v) => setRequestType(v as HrRequestType)}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(HR_REQUEST_TYPE_LABEL) as HrRequestType[]).map((k) => (
                                        <SelectItem key={k} value={k}>{HR_REQUEST_TYPE_LABEL[k]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs text-muted-foreground">Objet</label>
                            <Input value={requestSubject} onChange={(e) => setRequestSubject(e.target.value)} placeholder="Ex. Attestation pour un dossier bancaire" />
                        </div>
                        {requestType === "SALARY_ADVANCE" && (
                            <div>
                                <label className="mb-1.5 block text-xs text-muted-foreground">Montant demandé (FCFA)</label>
                                <Input type="number" inputMode="numeric" min={1} value={requestAmount} onChange={(e) => setRequestAmount(e.target.value)} placeholder="150000" />
                            </div>
                        )}
                        <div>
                            <label className="mb-1.5 block text-xs text-muted-foreground">Détails (facultatif)</label>
                            <Textarea rows={3} value={requestDescription} onChange={(e) => setRequestDescription(e.target.value)} placeholder="Précisez si besoin..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" disabled={savingRequest} onClick={() => setRequestOpen(false)}>Annuler</Button>
                        <Button size="sm" disabled={savingRequest} onClick={submitRequest}>
                            {savingRequest ? "Envoi…" : "Envoyer la demande"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteLeave} onOpenChange={(open) => !open && setDeleteLeave(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Retirer cette demande de congé ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteLeave} className="bg-red-500 hover:bg-red-600">Retirer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deleteRequest} onOpenChange={(open) => !open && setDeleteRequest(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Retirer cette demande ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteRequest} className="bg-red-500 hover:bg-red-600">Retirer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
