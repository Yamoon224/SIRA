import jsPDF from "jspdf"
import { CVData } from "@/lib/@types/pdf"

const escapeHtml = (value: unknown): string =>
    String(value ?? "").replace(/[&<>"']/g, (char) => {
        switch (char) {
            case "&": return "&amp;"
            case "<": return "&lt;"
            case ">": return "&gt;"
            case '"': return "&quot;"
            case "'": return "&#39;"
            default: return char
        }
    })

export const generateCVPDF = async (data: CVData, format: "pdf" | "word" = "pdf") => {
    if (format === "pdf") {
        const pdf = new jsPDF()

        // Header
        pdf.setFontSize(24)
        pdf.text(`${data.personalInfo.firstName} ${data.personalInfo.lastName}`, 20, 30)

        pdf.setFontSize(16)
        pdf.text(data.personalInfo.title, 20, 45)

        // Contact Info
        pdf.setFontSize(12)
        pdf.text(`Email: ${data.personalInfo.email}`, 20, 60)
        pdf.text(`Téléphone: ${data.personalInfo.phone}`, 20, 70)
        pdf.text(`Adresse: ${data.personalInfo.address}`, 20, 80)

        // Summary
        if (data.personalInfo.summary) {
            pdf.setFontSize(14)
            pdf.text("Résumé Professionnel", 20, 100)
            pdf.setFontSize(11)
            const summaryLines = pdf.splitTextToSize(data.personalInfo.summary, 170)
            pdf.text(summaryLines, 20, 115)
        }

        let yPosition = 140

        // Experience
        if (data.experience.length > 0) {
            pdf.setFontSize(14)
            pdf.text("Expérience Professionnelle", 20, yPosition)
            yPosition += 15

            data.experience.forEach((exp) => {
                pdf.setFontSize(12)
                pdf.text(`${exp.position} - ${exp.company}`, 20, yPosition)
                pdf.setFontSize(10)
                pdf.text(`${exp.startDate} - ${exp.endDate}`, 20, yPosition + 10)

                const descLines = pdf.splitTextToSize(exp.description, 170)
                pdf.text(descLines, 20, yPosition + 20)
                yPosition += 35 + descLines.length * 5
            })
        }

        // Education
        if (data.education.length > 0) {
            pdf.setFontSize(14)
            pdf.text("Formation", 20, yPosition)
            yPosition += 15

            data.education.forEach((edu) => {
                pdf.setFontSize(12)
                pdf.text(`${edu.degree} - ${edu.institution}`, 20, yPosition)
                pdf.setFontSize(10)
                pdf.text(`${edu.startDate} - ${edu.endDate}`, 20, yPosition + 10)
                yPosition += 25
            })
        }

        // Skills
        if (data.skills.length > 0) {
            pdf.setFontSize(14)
            pdf.text("Compétences", 20, yPosition)
            yPosition += 15

            pdf.setFontSize(11)
            const skillsText = data.skills.join(", ")
            const skillsLines = pdf.splitTextToSize(skillsText, 170)
            pdf.text(skillsLines, 20, yPosition)
        }

        return pdf
    }

    // For Word format, we'll generate HTML and let the user download it
    if (format === "word") {
        const htmlContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>CV - ${escapeHtml(data.personalInfo.firstName)} ${escapeHtml(data.personalInfo.lastName)}</title>
                <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .title { font-size: 18px; color: #666; margin-bottom: 20px; }
                .contact { margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 16px; font-weight: bold; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 15px; }
                .experience-item, .education-item { margin-bottom: 15px; }
                .job-title { font-weight: bold; }
                .company { color: #666; }
                .date { font-style: italic; color: #888; }
                .skills { display: flex; flex-wrap: wrap; gap: 10px; }
                .skill { background: #f0f0f0; padding: 5px 10px; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                <div class="name">${escapeHtml(data.personalInfo.firstName)} ${escapeHtml(data.personalInfo.lastName)}</div>
                <div class="title">${escapeHtml(data.personalInfo.title)}</div>
                </div>

                <div class="contact">
                <p><strong>Email:</strong> ${escapeHtml(data.personalInfo.email)}</p>
                <p><strong>Téléphone:</strong> ${escapeHtml(data.personalInfo.phone)}</p>
                <p><strong>Adresse:</strong> ${escapeHtml(data.personalInfo.address)}</p>
                </div>

                ${data.personalInfo.summary
                        ? `
                <div class="section">
                    <div class="section-title">Résumé Professionnel</div>
                    <p>${escapeHtml(data.personalInfo.summary)}</p>
                </div>
                `
                        : ""
                    }

                ${data.experience.length > 0
                        ? `
                <div class="section">
                    <div class="section-title">Expérience Professionnelle</div>
                    ${data.experience
                            .map(
                                (exp) => `
                    <div class="experience-item">
                        <div class="job-title">${escapeHtml(exp.position)}</div>
                        <div class="company">${escapeHtml(exp.company)}</div>
                        <div class="date">${escapeHtml(exp.startDate)} - ${escapeHtml(exp.endDate)}</div>
                        <p>${escapeHtml(exp.description)}</p>
                    </div>
                    `,
                            )
                            .join("")}
                </div>
                `
                        : ""
                    }

                ${data.education.length > 0
                        ? `
                <div class="section">
                    <div class="section-title">Formation</div>
                    ${data.education
                            .map(
                                (edu) => `
                    <div class="education-item">
                        <div class="job-title">${escapeHtml(edu.degree)}</div>
                        <div class="company">${escapeHtml(edu.institution)}</div>
                        <div class="date">${escapeHtml(edu.startDate)} - ${escapeHtml(edu.endDate)}</div>
                    </div>
                    `,
                            )
                            .join("")}
                </div>
                `
                        : ""
                    }

                ${data.skills.length > 0
                        ? `
                <div class="section">
                    <div class="section-title">Compétences</div>
                    <div class="skills">
                    ${data.skills.map((skill) => `<span class="skill">${escapeHtml(skill)}</span>`).join("")}
                    </div>
                </div>
                `
                        : ""
                    }
            </body>
        </html>`

        const blob = new Blob([htmlContent], { type: "application/msword" })
        return blob
    }
}

export const downloadFile = (content: any, filename: string, type: "pdf" | "word") => {
    if (type === "pdf") {
        content.save(filename)
    } else {
        const url = URL.createObjectURL(content)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
}
