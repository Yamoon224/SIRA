import { CandidatureStatus, CompanyStatus, CVStatus, EventStatus, EventType, InterviewStatus, JobExperienceType, JobStatus, JobType, MatchingStatus, ScoringStatus, UserRole, UserStatus } from "./enums";

export interface IUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    avatar: string | null;
    registrationDate: Date;
    company?: { id: string; name: string } | null;
    createdAt: Date;
    updatedAt: Date;
}

// ─────────────────────────────────────────────
export interface ICompany {
    id: string;
    name: string;
    sector: string;
    logo: string | null;
    coverImage: string | null;
    about: string | null;
    website: string | null;
    creationDate: Date | null;
    partnershipDate: Date;
    companySize: string | null;
    socialLinks: string[];
    country: string | null;
    headquarters: string | null;
    location: string | null;
    phone: string | null;
    email: string | null;
    status: CompanyStatus;
    createdAt: Date;
    updatedAt: Date;
}

// ─────────────────────────────────────────────
export interface IJobOffer {
    id: string;
    title: string;
    location: string;
    type: JobType;
    experience: JobExperienceType;
    salary: string;
    description: string;
    benefits: string;
    requirements: string[];
    status: JobStatus;
    publishDate: Date;
    endDate: Date;
    applicants: number;
    image?: string | null;
    remote?: boolean;
    company?: ICompany | null;
    createdAt: Date;
    updatedAt: Date;
}

// ─────────────────────────────────────────────
export interface ICandidature {
    id: string;
    candidateName: string;
    candidateEmail: string;
    status: CandidatureStatus;
    score: number;
    appliedDate: Date;
    user?: IUser | null;
    jobOffer?: IJobOffer | null;
    createdAt: Date;
    updatedAt: Date;
}

// ─────────────────────────────────────────────
export interface IPortfolio {
    id: string;
    title: string;
    description: string;
    skills: string[];
    views: number;
    downloads: number;
    likes: number;
    createdDate: Date;
    user?: IUser | null;
    createdAt: Date;
    updatedAt: Date;
}

// ─────────────────────────────────────────────
export interface IInterviewSession {
    id: string;
    candidateName: string;
    candidateEmail: string;
    position: string;
    duration: number;
    score: number;
    status: InterviewStatus;
    startTime: Date;
    feedback: string;
    createdAt: Date;
    updatedAt: Date;
}

// ─────────────────────────────────────────────
export interface ICVAnalysis {
    id: string;
    fileName: string;
    analysisScore: number;
    recommendations: string[];
    uploadDate: Date;
    status: CVStatus;
    createdAt: Date;
    updatedAt: Date;
}

// ─────────────────────────────────────────────
export interface ICalendarEvent {
    id: string;
    title: string;
    type: EventType;
    startTime: Date;
    endTime: Date;
    participants: string[];
    location: string | null;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
}

// ─────────────────────────────────────────────
export interface IScoringResult {
    id: string;
    candidateName: string;
    candidateEmail: string;
    position: string;
    overallScore: number;
    criteria: any;
    analysisDate: Date;
    status: ScoringStatus;
    createdAt: Date;
    updatedAt: Date;
}

// ─────────────────────────────────────────────
export interface IExperience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string;
    logo: string | null;
}

// ─────────────────────────────────────────────
export interface IEducation {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    logo: string | null;
}

// ─────────────────────────────────────────────
export interface IMatchingResult {
    id: string;
    candidateName: string;
    candidateEmail: string;
    position: string;
    company: string;
    matchingScore: number;
    status: MatchingStatus;
    matchDate: Date;
    createdAt: Date;
    updatedAt: Date;
}