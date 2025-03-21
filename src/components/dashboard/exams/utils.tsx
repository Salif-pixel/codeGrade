import {Exam, ExamStatus} from "@prisma/client";
import {Badge} from "@/components/ui/badge";

export const getStatusBadge = (status: ExamStatus) => {
    switch (status) {
        case ExamStatus.PUBLISHED:
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Publié</Badge>
        case ExamStatus.CLOSED:
            return <Badge variant="outline" className="bg-green-100 text-green-800">Fermé</Badge>
        case ExamStatus.DRAFT:
            return <Badge variant="outline" className="bg-blue-100 text-blue-800">Brouillon</Badge>
    }
}

export const formatDuration = (startDate: Date | null | undefined, endDate: Date | null | undefined): string => {

    if (!startDate || !endDate) return "non defini"

    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

    const days = Math.floor(diffInMinutes / (24 * 60))
    const hours = Math.floor((diffInMinutes % (24 * 60)) / 60)
    const minutes = diffInMinutes % 60

    const parts = []
    if (days > 0) parts.push(`${days} ${days > 1 ? "jours" : "jour"}`)
    if (hours > 0) parts.push(`${hours} ${hours > 1 ? "heures" : "heure"}`)
    if (minutes > 0) parts.push(`${minutes} ${minutes > 1 ? "minutes" : "minute"}`)

    return parts.join(" ")
}

export const getExamStatus = (exam: Exam): ExamStatus => {
    const now = new Date();
    if (!exam.startDate || new Date(exam.startDate) > now) return ExamStatus.DRAFT;
    if (!exam.endDate || new Date(exam.endDate) > now) return ExamStatus.PUBLISHED;
    return ExamStatus.CLOSED;
};
