export interface CVProfileExperience {
    position: string
    company: string
    location: string
    date: string
    skills: string[]
    missions: string[]
}

export interface CVProfileEducation {
    title: string
    level: string
    school: string
    date: string
    skills: string[]
}

/** Informations de profil extraites du CV, relues par l'utilisateur sur /resultat-analyse-cv. */
export interface CVProfile {
    firstName: string
    fullName: string
    title: string
    /** Numéro tel qu'il figure sur le CV, indicatif éventuel compris. */
    phone: string
    email: string
    /** Date ISO `YYYY-MM-DD`, vide si absente du CV. */
    birthDate: string
    gender: "Homme" | "Femme" | ""
    desiredJob: string
    experiences: CVProfileExperience[]
    skills: string[]
    educations: CVProfileEducation[]
    hobbies: string[]
    linkedin: string
    website: string
}

export interface CVAnalysis {
    score: number
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
    keywords: string[]
    summary: string
    /** Absent des analyses stockées avant l'ajout de l'extraction de profil. */
    profile?: CVProfile
}
