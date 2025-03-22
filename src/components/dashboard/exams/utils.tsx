import {Exam, ExamStatus, ParticipationStatus} from "@prisma/client";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import {CheckCircle2, HourglassIcon, XCircle} from "lucide-react";

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

export const StatusBadge = ({ status, t }: { status: ParticipationStatus; t: (key: string) => string }) => {
    return (
        <Badge
            variant="outline"
            className={cn(
                "flex items-center gap-1",
                status === ParticipationStatus.COMPLETED && "bg-green-500/10 text-green-500",
                status === ParticipationStatus.ACCEPTED && "bg-blue-500/10 text-blue-500",
                status === ParticipationStatus.DECLINED && "bg-red-500/10 text-red-500",
                status === ParticipationStatus.PENDING && "bg-yellow-500/10 text-yellow-500",
            )}
        >
            {status === ParticipationStatus.COMPLETED ? (
                <>
                    <CheckCircle2 className="h-3 w-3" />
                    {t("details.results.status.completed")}
                </>
            ) : status === ParticipationStatus.ACCEPTED ? (
                <>
                    <CheckCircle2 className="h-3 w-3" />
                    {t("details.results.status.accepted")}
                </>
            ) : status === ParticipationStatus.DECLINED ? (
                <>
                    <XCircle className="h-3 w-3" />
                    {t("details.results.status.declined")}
                </>
            ) : (
                <>
                    <HourglassIcon className="h-3 w-3" />
                    {t("details.results.status.pending")}
                </>
            )}
        </Badge>
    )
}
