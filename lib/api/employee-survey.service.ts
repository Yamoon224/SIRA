import { apiRequest } from "@/lib/api-client-http"

export type SurveyQuestionType = "RATING" | "TEXT"
export type SurveyStatus = "DRAFT" | "ACTIVE" | "CLOSED"

export interface ISurveyQuestion {
    id: string
    question: string
    type: SurveyQuestionType
}

export interface IEmployeeSurvey {
    id: string
    title: string
    description: string | null
    questions: ISurveyQuestion[]
    status: SurveyStatus
    dueDate: string | null
    department: string | null
    createdAt: string
}

export const employeeSurveyService = {
    // Note : le backend ne restreint pas cette liste au rôle ADMIN de
    // l'entreprise (voir EmployeeSurveysController::requireCompanyId) — tout
    // utilisateur rattaché à la même entreprise (company_id) peut la
    // consulter, ce qui est le comportement voulu pour qu'un employé
    // découvre les enquêtes à répondre.
    list: async () => {
        return apiRequest<IEmployeeSurvey[]>({ endpoint: "/employee-surveys", method: "GET" })
    },

    submitResponse: async (surveyId: string, answers: { questionId: string; value: string | number }[]) => {
        return apiRequest<{ message: string }>({ endpoint: `/employee-surveys/${surveyId}/responses`, method: "POST", data: { answers } })
    },
}
