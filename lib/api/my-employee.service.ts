import { apiRequest } from "@/lib/api-client-http"

/**
 * Espace employé (standard/app/(protected)/espace-employe) : congés et
 * demandes RH en libre-service, pour tout compte ayant été embauché sur
 * Goriya (voir backend MyEmployeeController). Miroir des services entreprise
 * (lib/api/employee.service.ts côté entreprise), version « moi-même ».
 */

export type LeaveType = "PAID" | "SICK" | "MATERNITY" | "PATERNITY" | "FAMILY_EVENT" | "UNPAID" | "OTHER"
export type HrRequestType = "WORK_CERTIFICATE" | "SALARY_CERTIFICATE" | "SALARY_ADVANCE" | "TRAINING" | "EQUIPMENT" | "SCHEDULE_CHANGE" | "OTHER"
export type HrWorkflowStatus = "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED" | "CANCELLED"
export type EmployeeStatus = "ACTIVE" | "PROBATION" | "SUSPENDED" | "TERMINATED"

export interface ILeaveBalance {
    year: number
    entitlement: number
    taken: number
    pending: number
    remaining: number
}

export interface IMyEmployee {
    id: string
    source: "CANDIDATURE" | "MANUAL"
    companyName: string | null
    matricule: string
    firstName: string
    lastName: string
    fullName: string
    jobTitle: string
    department: string | null
    contractType: string
    hireDate: string
    contractEndDate: string | null
    annualLeaveDays: number
    status: EmployeeStatus
    manager: { id: string; fullName: string; jobTitle: string } | null
    leaveBalance: ILeaveBalance | null
    createdAt: string
}

export interface IMyLeave {
    id: string
    type: LeaveType
    startDate: string
    endDate: string
    days: number
    reason: string | null
    status: HrWorkflowStatus
    decisionComment: string | null
    decidedByName: string | null
    createdAt: string
}

export interface IMyHrRequest {
    id: string
    type: HrRequestType
    subject: string
    description: string | null
    amount: number | null
    status: HrWorkflowStatus
    decisionComment: string | null
    decidedByName: string | null
    createdAt: string
}

const unwrap = <T,>(res: unknown): T => ((res as { data?: T })?.data ?? res) as T

export const myEmployeeService = {
    /** `null` si le compte n'a jamais été employé sur Goriya. */
    get: async () => unwrap<IMyEmployee | null>(await apiRequest({ endpoint: "/me/employee", method: "GET" })),

    leaves: async () => unwrap<IMyLeave[]>(await apiRequest({ endpoint: "/me/employee/leaves", method: "GET" })),

    createLeave: async (payload: { type: LeaveType; startDate: string; endDate: string; reason?: string | null }) =>
        unwrap<IMyLeave>(await apiRequest({ endpoint: "/me/employee/leaves", method: "POST", data: payload })),

    removeLeave: async (id: string) =>
        apiRequest<{ message: string }>({ endpoint: `/me/employee/leaves/${id}`, method: "DELETE" }),

    hrRequests: async () => unwrap<IMyHrRequest[]>(await apiRequest({ endpoint: "/me/employee/hr-requests", method: "GET" })),

    createHrRequest: async (payload: { type: HrRequestType; subject: string; description?: string | null; amount?: number | null }) =>
        unwrap<IMyHrRequest>(await apiRequest({ endpoint: "/me/employee/hr-requests", method: "POST", data: payload })),

    removeHrRequest: async (id: string) =>
        apiRequest<{ message: string }>({ endpoint: `/me/employee/hr-requests/${id}`, method: "DELETE" }),
}
