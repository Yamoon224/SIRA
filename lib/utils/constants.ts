// Constantes de l'application
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/signin",
        SIGNUP: "/auth/signin",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        FORGOT_PASSWORD: "/auth/password/forgot",
        RESET_PASSWORD: "/auth/password/reset",
    },
    USER: {
        PROFILE: "/user/profile",
        AVATAR: "/user/avatar",
        SETTINGS: "/user/settings",
    },
    JOBS: {
        LIST: "/jobs",
        DETAIL: "/jobs/:id",
        APPLY: "/jobs/:id/apply",
        SAVE: "/jobs/:id/save",
    },
    COMPANIES: {
        LIST: "/companies",
        DETAIL: "/companies/:id",
        FOLLOW: "/companies/:id/follow",
        JOBS: "/companies/:id/jobs",
    },
    APPLICATIONS: {
        LIST: "/applications",
        DETAIL: "/applications/:id",
    },
    MESSAGES: {
        CONVERSATIONS: "/messages/conversations",
        MESSAGES: "/messages/conversations/:id/messages",
    },
    DASHBOARD: {
        STATS: "/dashboard/stats",
        RECENT_APPLICATIONS: "/dashboard/recent-applications",
        RECOMMENDED_JOBS: "/dashboard/recommended-jobs",
        PROFILE_VIEWS: "/dashboard/profile-views",
    },
    CV: {
        ANALYZE: "/cv/analyze",
        UPLOAD: "/cv/upload",
    },
    NOTIFICATIONS: {
        LIST: "/notifications",
        READ: "/notifications/:id/read",
        READ_ALL: "/notifications/read-all",
        SETTINGS: "/notifications/settings",
    },
} as const

export const JOB_TYPES = [
    { value: "full-time", label: "Temps plein" },
    { value: "part-time", label: "Temps partiel" },
    { value: "contract", label: "Contrat" },
    { value: "freelance", label: "Freelance" },
    { value: "internship", label: "Stage" },
] as const

export const EXPERIENCE_LEVELS = [
    { value: "entry", label: "Débutant" },
    { value: "mid", label: "Intermédiaire" },
    { value: "senior", label: "Senior" },
    { value: "lead", label: "Lead" },
    { value: "executive", label: "Exécutif" },
] as const

export const SALARY_RANGES = [
    { value: "0-30k", label: "0 - 30k €" },
    { value: "30k-50k", label: "30k - 50k €" },
    { value: "50k-70k", label: "50k - 70k €" },
    { value: "70k-100k", label: "70k - 100k €" },
    { value: "100k+", label: "100k+ €" },
] as const

export const COMPANY_SIZES = [
    { value: "1-10", label: "1-10 employés" },
    { value: "11-50", label: "11-50 employés" },
    { value: "51-200", label: "51-200 employés" },
    { value: "201-1000", label: "201-1000 employés" },
    { value: "1000+", label: "1000+ employés" },
] as const

export const INDUSTRIES = [
    { value: "technology", label: "Technologie" },
    { value: "finance", label: "Finance" },
    { value: "healthcare", label: "Santé" },
    { value: "education", label: "Éducation" },
    { value: "marketing", label: "Marketing" },
    { value: "consulting", label: "Conseil" },
    { value: "retail", label: "Commerce de détail" },
    { value: "manufacturing", label: "Industrie" },
] as const

export const APPLICATION_STATUSES = [
    { value: "pending", label: "En attente", color: "yellow" },
    { value: "reviewed", label: "Examiné", color: "blue" },
    { value: "interview", label: "Entretien", color: "purple" },
    { value: "accepted", label: "Accepté", color: "green" },
    { value: "rejected", label: "Refusé", color: "red" },
] as const

export const NOTIFICATION_TYPES = {
    APPLICATION: "application",
    JOB_MATCH: "job_match",
    MESSAGE: "message",
    INTERVIEW: "interview",
    COMPANY_UPDATE: "company_update",
} as const

export const ROUTES = {
    HOME: "/",
    DASHBOARD: "/dashboard",
    JOBS: "/chercher-emploi",
    COMPANIES: "/entreprises",
    PROFILE: "/profil",
    MESSAGES: "/messages",
    APPLICATIONS: "/mes-offres",
    CV_ANALYZER: "/analyse-cv",
    SETTINGS: "/parametres",
    AUTH: {
        LOGIN: "/auth/signin",
        SIGNUP: "/auth/signin",
        LOADING: "/auth/loading",
        SETTINGS: "/auth/settings",
    },
} as const
