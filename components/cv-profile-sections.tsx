"use client"

import { useEffect, useState } from "react"
import { Briefcase, Globe, GraduationCap, Linkedin, Sparkles, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cvProfileService } from "@/lib/api/cv-profile.service"
import type { CVProfile } from "@/lib/@types/openai"

const withProtocol = (link: string) => (/^https?:\/\//i.test(link) ? link : `https://${link}`)

/**
 * Parcours issu du CV validé sur /resultat-analyse-cv (expériences,
 * compétences, formations…). Lecture seule ; rien n'est affiché tant que le
 * membre n'a validé aucun profil ou si le chargement échoue.
 */
export function CvProfileSections() {
    const [profile, setProfile] = useState<Partial<CVProfile> | null>(null)

    useEffect(() => {
        cvProfileService
            .get()
            .then((res) => setProfile(res?.profile ?? null))
            .catch(() => setProfile(null))
    }, [])

    if (!profile) return null

    const experiences = profile.experiences ?? []
    const educations = profile.educations ?? []
    const skills = profile.skills ?? []
    const hobbies = profile.hobbies ?? []
    const links = [
        { href: profile.linkedin, icon: Linkedin },
        { href: profile.website, icon: Globe },
    ].filter((l): l is { href: string; icon: typeof Globe } => !!l.href)

    return (
        <>
            {profile.desiredJob && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Job recherché
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground">{profile.desiredJob}</p>
                    </CardContent>
                </Card>
            )}

            {experiences.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Expériences
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {experiences.map((exp, i) => (
                            <div key={i} className="border-l-2 border-border pl-4">
                                <h4 className="font-semibold text-foreground">{exp.position || "Poste non précisé"}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {[exp.company, exp.location, exp.date].filter(Boolean).join(" · ")}
                                </p>
                                {exp.missions?.length > 0 && (
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                                        {exp.missions.map((mission, j) => (
                                            <li key={j}>{mission}</li>
                                        ))}
                                    </ul>
                                )}
                                {exp.skills?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {exp.skills.map((skill, j) => (
                                            <Badge key={j} variant="secondary" className="text-[10px]">{skill}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {skills.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Compétences &amp; expertises
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, i) => (
                                <Badge key={i} variant="secondary">{skill}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {educations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Diplômes &amp; formations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {educations.map((edu, i) => (
                            <div key={i} className="border-l-2 border-border pl-4">
                                <h4 className="font-semibold text-foreground">{edu.title || edu.level || "Formation"}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {[edu.school, edu.title ? edu.level : "", edu.date].filter(Boolean).join(" · ")}
                                </p>
                                {edu.skills?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {edu.skills.map((skill, j) => (
                                            <Badge key={j} variant="secondary" className="text-[10px]">{skill}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {(hobbies.length > 0 || links.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Divers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hobbies.length > 0 && (
                            <div>
                                <p className="mb-2 text-sm font-medium text-foreground">Loisirs</p>
                                <div className="flex flex-wrap gap-2">
                                    {hobbies.map((hobby, i) => (
                                        <Badge key={i} variant="outline">{hobby}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {links.length > 0 && (
                            <div>
                                <p className="mb-2 text-sm font-medium text-foreground">Liens</p>
                                <div className="space-y-1.5">
                                    {links.map(({ href, icon: Icon }) => (
                                        <a
                                            key={href}
                                            href={withProtocol(href)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 break-all text-sm text-blue-600 hover:underline"
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            {href}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    )
}
