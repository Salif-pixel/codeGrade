"use client"

import {useState} from "react"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {ChevronRight, Copy, Eye, Link as LinkIcon, FileText} from "lucide-react"
import {useCustomToast} from "@/components/utilities/alert/alert"
import { User, ParticipationStatus, ExamType} from "@prisma/client"
import {useLocale, useTranslations} from "next-intl"
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem} from "@/components/ui/dropdown-menu"
import {cn} from "@/lib/utils"
import {updateParticipantStatus} from "@/actions/examActions"
import {SimpleHeaderTitle} from "@/components/dashboard/header/header-title"
import {formatDuration, getExamStatus, getStatusBadge} from "../utils"
import {Assignment, AssignmentDetailsProps, AssignmentListProps} from "@/components/dashboard/exams/types";
import {ExamsCalendar} from "@/components/dashboard/exams/exams-calendar";

export default function ExamsComponent({user, exams}: { user: User; exams: Assignment[] }) {
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
    const [showAssignmentDetails, setShowAssignmentDetails] = useState(false)
    const {showToast} = useCustomToast()
    const local = useLocale()
    const t = useTranslations("exams-component")

    const assignments: Assignment[] = exams.map((exam) => {
        let submissionStats = { total: 0, pending: 0, corrected: 0, revised: 0 };

        if (exam.type !== ExamType.DOCUMENT) {
            submissionStats = exam.submissions.reduce(
                (acc, submission) => {
                    acc.total++;
                    switch (submission.status) {
                        case "PENDING":
                            acc.pending++;
                            break;
                        case "CORRECTED":
                            acc.corrected++;
                            break;
                        case "REVISED":
                            acc.revised++;
                            break;
                    }
                    return acc;
                },
                { total: 0, pending: 0, corrected: 0, revised: 0 }
            );
        }

        return {
            ...exam,
            status: getExamStatus(exam),
            submissionStats,
            totalStudents: exam.participants?.length ?? 0,
            inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/${local}/exams/${exam.id}`,
            creator: exam.creator,
            submissions: exam.submissions,
        };
    });

    const copyInviteLink = (link: string) => {
        navigator.clipboard.writeText(link)
        showToast(t("toast.linkCopied.title"), t("toast.linkCopied.description"), "success")
    }

    return (
        <div className="px-0 md:px-4 lg:px-8 xl:px-12 pt-10 pb-4 dark:bg-zinc-950 mb-10 flex flex-col gap-12">
            <SimpleHeaderTitle title="exams-component.title" Icon={<FileText className="h-5 w-5 text-primary"/>}/>
            <div className="px-0 md:px-4 lg:px-8 xl:px-12 dark:bg-zinc-950">
                <Tabs defaultValue="calendar" className="mb-6">
                    <TabsList
                        className="grid w-60 md:w-96 mx-auto grid-cols-2 gap-2 rounded-lg bg-muted p-1 h-auto mb-4 dark:bg-zinc-900">
                        <TabsTrigger
                            value="list"
                            className="rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:cursor-default data-[state=active]:dark:hover:bg-background data-[state=active]:bg-background cursor-pointer hover:bg-white dark:hover:bg-zinc-950/25 data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                        >
                            {t("tabs.list")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="calendar"
                            className="rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:cursor-default data-[state=active]:dark:hover:bg-background data-[state=active]:bg-background cursor-pointer hover:bg-white dark:hover:bg-zinc-950/25 data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                        >
                            {t("tabs.calendar")}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-4">
                        {!showAssignmentDetails ? (
                            <AssignmentList
                                user={user}
                                assignments={assignments}
                                onViewDetails={(id) => {
                                    setSelectedAssignment(id)
                                    setShowAssignmentDetails(true)
                                }}
                                onCopyInviteLink={copyInviteLink}
                            />
                        ) : (
                            <AssignmentDetails
                                assignment={assignments.find((a) => a.id === selectedAssignment)!}
                                onBack={() => setShowAssignmentDetails(false)}
                                onCopyInviteLink={copyInviteLink}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="calendar">
                        <div className="flex flex-col px-6 md:px-0">
                            {/*<Calendar user={user} initialExams={exams as never}/>*/}
                            <ExamsCalendar user={user} initialExams={exams as never}/>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function AssignmentList({assignments, onViewDetails, onCopyInviteLink, user}: AssignmentListProps) {
    const t = useTranslations("exams-component")

    return (
        <div className="space-y-4">
            {assignments.map((assignment) => (
                <Card className="bg-zinc-900" key={assignment.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{assignment.title}</CardTitle>
                                <CardDescription>
                                    {t("assignment.deadline")}: {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : "Non définie"}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="dark:bg-zinc-800 hover:dark:bg-zinc-800"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onViewDetails(assignment.id)}
                                >
                                    <Eye className="mr-2 h-4 w-4"/>
                                    {t("assignment.viewDetails")}
                                </Button>
                                {user?.role === "TEACHER" && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button className="dark:bg-zinc-800 hover:dark:bg-zinc-800"
                                                    variant="outline" size="sm">
                                                <LinkIcon className="mr-2 h-4 w-4"/>
                                                {t("assignment.invite")}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="space-y-4">
                                                <h4 className="font-medium">{t("assignment.inviteLink.title")}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <Input value={assignment.inviteLink} readOnly/>
                                                    <Button size="sm" variant="ghost"
                                                            onClick={() => onCopyInviteLink(assignment.inviteLink)}>
                                                        <Copy className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{t("assignment.inviteLink.description")}</p>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <span
                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{assignment.type}</span>
                            <span className="text-xs">{assignment.questions?.length ?? 0} {t("assignment.questions")}</span>
                            <span className="text-xs">{formatDuration(assignment.startDate, assignment.endDate)}</span>
                            <span className="text-xs ml-auto">
  {assignment.type !== ExamType.DOCUMENT
      ? `${assignment.submissionStats.total} ${t("assignment.submissions")} / ${assignment.totalStudents} ${t("assignment.students")}`
      : `${assignment.totalStudents} ${t("assignment.students")}`
  }
</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function AssignmentDetails({assignment, onBack, onCopyInviteLink}: AssignmentDetailsProps) {
    const {showToast} = useCustomToast()
    const t = useTranslations("exams-component")

    const studentsResults = assignment.participants
        ?.map((participant) => {
            if (!participant?.user) return null;

            let latestAnswer = null;
            if (assignment.type !== ExamType.DOCUMENT) {
                const studentSubmissions = assignment.submissions?.filter((s) => s.studentId === participant.userId);
                latestAnswer = (studentSubmissions?.length ?? 0) ? studentSubmissions.reduce((latest, current) =>
                    (latest.createdAt > current.createdAt ? latest : current)) : null;
            }

            return {
                id: participant.userId,
                name: participant.user.name || "Anonyme",
                email: participant.user.email || "",
                status: participant.status,
                submissionDate: latestAnswer?.createdAt || null,
                score: latestAnswer?.correction?.finalScore || null,
            };
        })
        .filter(Boolean);

    const [studentResults, setStudentResults] = useState(studentsResults || [])

    const handleStatusUpdate = async (participantId: string, newStatus: ParticipationStatus) => {
        try {
            const result = await updateParticipantStatus(participantId, newStatus)

            if (result.success) {
                showToast("Succès", t("toast.statusUpdate.success"), "success")
                const updatedResults = studentResults.map((student) =>
                    student?.id === participantId ? {...student, status: newStatus} : student
                )
                setStudentResults(updatedResults)
            } else {
                throw new Error(result.error)
            }
        } catch {
            showToast("Erreur", t("toast.statusUpdate.error"), "error")
        }
    }

    return (
        <div>
            <div className="flex items-center mb-6">
                <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
                    <ChevronRight className="h-4 w-4 rotate-180 mr-1"/>
                    {t("details.back")}
                </Button>
                <h1 className="text-2xl font-bold">{t("details.title")}</h1>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{assignment.title}</CardTitle>
                            <CardDescription>
                                {t("assignment.deadline")}: {assignment.endDate ? assignment.endDate.toLocaleDateString() : "Non défini"}
                            </CardDescription>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <LinkIcon className="mr-2 h-4 w-4"/>
                                    {t("assignment.inviteLink.title")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="space-y-4">
                                    <h4 className="font-medium">{t("assignment.inviteLink.title")}</h4>
                                    <div className="flex items-center space-x-2">
                                        <Input value={assignment.inviteLink} readOnly/>
                                        <Button size="sm" variant="ghost"
                                                onClick={() => onCopyInviteLink(assignment.inviteLink)}>
                                            <Copy className="h-4 w-4"/>
                                            <span className="sr-only">{t("assignment.inviteLink.copy")}</span>
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{t("assignment.inviteLink.description")}</p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="font-medium mb-2">{t("details.information.title")}</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span
                                        className="text-sm text-muted-foreground">{t("details.information.type")}:</span>
                                    <span className="text-sm font-medium">{assignment.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span
                                        className="text-sm text-muted-foreground">{t("details.information.questions")}:</span>
                                    <span className="text-sm font-medium">
    {assignment.type !== ExamType.DOCUMENT ? (assignment.questions?.length ?? 0) : "N/A"}
  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span
                                        className="text-sm text-muted-foreground">{t("details.information.duration")}:</span>
                                    <span
                                        className="text-sm font-medium">{formatDuration(assignment.startDate, assignment.endDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span
                                        className="text-sm text-muted-foreground">{t("details.information.status")}:</span>
                                    {getStatusBadge(assignment.status)}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">{t("details.information.description")}</h3>
                            <p className="text-sm">{assignment.description}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{t("details.results.title")}</CardTitle>
                        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
                {assignment.submissionStats.total} {t("details.results.submissions")} / {(assignment.participants?.length || 1)} {t("details.results.students")}
            </span>
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                                {Math.round((assignment.submissionStats.total / (assignment.participants?.length || 1)) * 100)}% {t("assignment.participation")}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("details.results.table.student")}</TableHead>
                                <TableHead>{t("details.results.table.email")}</TableHead>
                                <TableHead>{t("details.results.table.status")}</TableHead>
                                <TableHead>{t("details.results.table.submissionDate")}</TableHead>
                                <TableHead className="text-right">{t("details.results.table.score")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentResults.map((student) => (
                                <TableRow key={student?.id}>
                                    <TableCell className="font-medium">{student?.name}</TableCell>
                                    <TableCell>{student?.email}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            student?.status === ParticipationStatus.COMPLETED && "bg-green-100 text-green-800",
                                                            student?.status === ParticipationStatus.ACCEPTED && "bg-blue-100 text-blue-800",
                                                            student?.status === ParticipationStatus.DECLINED && "bg-red-100 text-red-800",
                                                            student?.status === ParticipationStatus.PENDING && "bg-yellow-100 text-yellow-800"
                                                        )}
                                                    >
                                                        {student?.status === ParticipationStatus.COMPLETED
                                                            ? t("details.results.status.completed")
                                                            : student?.status === ParticipationStatus.ACCEPTED
                                                                ? t("details.results.status.accepted")
                                                                : student?.status === ParticipationStatus.DECLINED
                                                                    ? t("details.results.status.declined")
                                                                    : t("details.results.status.pending")}
                                                    </Badge>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusUpdate(student?.id ?? "", ParticipationStatus.PENDING)}
                                                    className="text-yellow-600"
                                                >
                                                    {t("details.results.status.pending")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusUpdate(student?.id ?? "", ParticipationStatus.ACCEPTED)}
                                                    className="text-blue-600"
                                                >
                                                    {t("details.results.status.accepted")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusUpdate(student?.id ?? "", ParticipationStatus.DECLINED)}
                                                    className="text-red-600"
                                                >
                                                    {t("details.results.status.declined")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusUpdate(student?.id ?? "", ParticipationStatus.COMPLETED)}
                                                    className="text-green-600"
                                                >
                                                    {t("details.results.status.completed")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell>
                                        {student?.submissionDate ? new Date(student?.submissionDate).toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {student?.score !== null && assignment.type !== ExamType.DOCUMENT ? (
                                            <span
                                                className={`font-medium ${
                                                    student?.score && student?.score < assignment.questions.reduce((acc, q) => acc + q.maxPoints, 0) * 0.6
                                                        ? "text-red-600"
                                                        : student?.score && student?.score < assignment.questions.reduce((acc, q) => acc + q.maxPoints, 0) * 0.8
                                                            ? "text-yellow-600"
                                                            : "text-green-600"
                                                }`}
                                            >
        {student?.score} / {assignment.questions.reduce((acc, q) => acc + q.maxPoints, 0)}
    </span>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
