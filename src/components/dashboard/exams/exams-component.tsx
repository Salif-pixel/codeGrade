"use client"

import {useState} from "react"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {
    Copy,
    Eye,
    Link as LinkIcon,
    FileText,
    Clock,
    ChevronLeft,
    Info,
    Calendar,
    HourglassIcon,
    CheckCircle2,
    XCircle,
    Search,
    Filter, ArrowUpDown
} from "lucide-react"
import {useCustomToast} from "@/components/utilities/alert/alert"
import { User, ParticipationStatus, ExamType} from "@prisma/client"
import {useLocale, useTranslations} from "next-intl"
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem} from "@/components/ui/dropdown-menu"
import {cn} from "@/lib/utils"
import {SimpleHeaderTitle} from "@/components/dashboard/header/header-title"
import {formatDuration, getExamStatus, getStatusBadge, StatusBadge} from "./utils"
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

function AssignmentList({ assignments, onViewDetails, onCopyInviteLink, user }: AssignmentListProps) {
    const t = useTranslations("exams-component")
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState<{ field: string; direction: "asc" | "desc" }>({
        field: "title",
        direction: "asc",
    })

    // Filter assignments based on search term
    const filteredAssignments = assignments.filter((assignment) =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort assignments
    const sortedAssignments = [...filteredAssignments].sort((a, b) => {
        if (sortBy.field === "title") {
            return sortBy.direction === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
        }
        if (sortBy.field === "type") {
            return sortBy.direction === "asc" ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type)
        }
        if (sortBy.field === "deadline" && a.endDate && b.endDate) {
            const dateA = new Date(a.endDate).getTime()
            const dateB = new Date(b.endDate).getTime()
            return sortBy.direction === "asc" ? dateA - dateB : dateB - dateA
        }
        return 0
    })

    // Toggle sort direction
    const toggleSort = (field: string) => {
        setSortBy((prev) => ({
            field,
            direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
        }))
    }

    // Calculate completion percentage
    const getCompletionPercentage = (assignment: { totalStudents: number; submissionStats: { total: number } }) => {
        if (assignment.totalStudents === 0) return 0
        return Math.round((assignment.submissionStats.total / assignment.totalStudents) * 100)
    }

    return (
        <div className="space-y-6">
            {/* Header with search and filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("search.placeholder") || "Search assignments..."}
                        className="pl-9 dark:bg-zinc-800/70"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="dark:bg-zinc-800/70">
                        <Filter className="mr-2 h-4 w-4" />
                        {t("filters.label") || "Filters"}
                    </Button>
                    {user?.role === "TEACHER" && (
                        <Button size="sm" className="bg-primary">
                            <span>{t("assignment.create") || "Create Assignment"}</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Dashboard summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="dark:bg-zinc-800/50 border-zinc-700">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("dashboard.total") || "Total Assignments"}</p>
                            <p className="text-2xl font-bold">{assignments.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-zinc-800/50 border-zinc-700">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("dashboard.active") || "Active Assignments"}</p>
                            <p className="text-2xl font-bold">
                                {assignments.filter((a) => a.endDate && new Date(a.endDate) > new Date()).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-zinc-800/50 border-zinc-700">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("dashboard.completed") || "Completed"}</p>
                            <p className="text-2xl font-bold">
                                {assignments.filter((a) => a.endDate && new Date(a.endDate) < new Date()).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table view of assignments */}
            <div className="rounded-md border border-zinc-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-800/30">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-zinc-400 w-[40%]">
                                <button
                                    className="flex items-center gap-1 hover:text-white transition-colors"
                                    onClick={() => toggleSort("title")}
                                >
                                    {t("assignment.title") || "Assignment"}
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </TableHead>
                            <TableHead className="text-zinc-400">
                                <button
                                    className="flex items-center gap-1 hover:text-white transition-colors"
                                    onClick={() => toggleSort("type")}
                                >
                                    {t("assignment.types") || "Type"}
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </TableHead>
                            <TableHead className="text-zinc-400">
                                <button
                                    className="flex items-center gap-1 hover:text-white transition-colors"
                                    onClick={() => toggleSort("deadline")}
                                >
                                    {t("assignment.deadline") || "Deadline"}
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </TableHead>
                            <TableHead className="text-zinc-400">{t("assignment.progress") || "Progress"}</TableHead>
                            <TableHead className="text-right text-zinc-400">{t("assignment.actions") || "Actions"}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedAssignments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {searchTerm
                                        ? t("search.noResults") || "No assignments found matching your search"
                                        : t("assignment.empty") || "No assignments available"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedAssignments.map((assignment) => {
                                const completionPercentage = getCompletionPercentage(assignment)
                                const isExpired = assignment.endDate && new Date(assignment.endDate) < new Date()

                                return (
                                    <TableRow key={assignment.id} className="hover:bg-zinc-800/20">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="font-medium">{assignment.title}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                    <FileText className="h-3 w-3" />
                                                    {assignment.questions?.length ?? 0} {t("assignment.questions")}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                                                {assignment.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className={isExpired ? "text-red-400" : ""}>
                          {assignment.endDate
                              ? new Date(assignment.endDate).toLocaleDateString()
                              : t("assignment.noDeadline") || "No deadline"}
                        </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-xs">
                          <span>
                            {assignment.submissionStats.total}/{assignment.totalStudents}
                          </span>
                                                    <span>{completionPercentage}%</span>
                                                </div>
                                                <div className="w-full bg-zinc-700 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${
                                                            completionPercentage < 30
                                                                ? "bg-red-500"
                                                                : completionPercentage < 70
                                                                    ? "bg-yellow-500"
                                                                    : "bg-green-500"
                                                        }`}
                                                        style={{ width: `${completionPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    className="h-8 dark:bg-zinc-800 hover:dark:bg-zinc-700 transition-colors"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onViewDetails(assignment.id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only md:not-sr-only md:ml-2">{t("assignment.viewDetails")}</span>
                                                </Button>
                                                {user?.role === "TEACHER" && (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                className="h-8 dark:bg-zinc-800 hover:dark:bg-zinc-700 transition-colors"
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <LinkIcon className="h-4 w-4" />
                                                                <span className="sr-only md:not-sr-only md:ml-2">{t("assignment.invite")}</span>
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-80 p-4 dark:bg-zinc-900 border-zinc-800">
                                                            <div className="space-y-4">
                                                                <h4 className="font-medium text-sm">{t("assignment.inviteLink.title")}</h4>
                                                                <div className="flex items-center space-x-2">
                                                                    <Input value={assignment.inviteLink} readOnly className="dark:bg-zinc-800 text-sm" />
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="hover:bg-zinc-800"
                                                                        onClick={() => onCopyInviteLink(assignment.inviteLink)}
                                                                    >
                                                                        <Copy className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {t("assignment.inviteLink.description")}
                                                                </p>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function AssignmentDetails({ assignment, onBack, onCopyInviteLink }: AssignmentDetailsProps) {
    const { showToast } = useCustomToast()
    const t = useTranslations("exams-component")

    const studentsResults = assignment.participants
        ?.map((participant) => {
            if (!participant?.user) return null

            let latestAnswer = null
            if (assignment.type !== ExamType.DOCUMENT) {
                const studentSubmissions = assignment.submissions?.filter((s) => s.studentId === participant.userId)
                latestAnswer =
                    (studentSubmissions?.length ?? 0)
                        ? studentSubmissions.reduce((latest, current) => (latest.createdAt > current.createdAt ? latest : current))
                        : null
            }

            return {
                id: participant.userId,
                name: participant.user.name || "Anonyme",
                email: participant.user.email || "",
                status: participant.status,
                submissionDate: latestAnswer?.createdAt || null,
                score: latestAnswer?.correction?.finalScore || null,
            }
        })
        .filter(Boolean)

    const [studentResults, setStudentResults] = useState(studentsResults || [])

    const handleStatusUpdate = async (participantId: string, newStatus: ParticipationStatus) => {
        // try {
        //     const result = await updateParticipantStatus(participantId, newStatus)

        //     if (result.success) {
        //         showToast("Succès", t("toast.statusUpdate.success"), "success")
        //         const updatedResults = studentResults.map((student) =>
        //             student?.id === participantId ? { ...student, status: newStatus } : student,
        //         )
        //         setStudentResults(updatedResults)
        //     } else {
        //         throw new Error(result.error)
        //     }
        // } catch {
        //     showToast("Erreur", t("toast.statusUpdate.error"), "error")
        // }
    }

    const totalMaxPoints = assignment.questions.reduce((acc, q) => acc + q.maxPoints, 0)
    const participationRate = Math.round(
        (assignment.submissionStats.total / (assignment.participants?.length || 1)) * 100,
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">{t("details.back")}</span>
                    </Button>
                    <h1 className="text-2xl font-bold">{assignment.title}</h1>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="dark:bg-zinc-800 hover:dark:bg-zinc-700">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            {t("assignment.inviteLink.title")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 dark:bg-zinc-900 border-zinc-800">
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm">{t("assignment.inviteLink.title")}</h4>
                            <div className="flex items-center space-x-2">
                                <Input value={assignment.inviteLink} readOnly className="dark:bg-zinc-800 text-sm" />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="hover:bg-zinc-800"
                                    onClick={() => onCopyInviteLink(assignment.inviteLink)}
                                >
                                    <Copy className="h-4 w-4" />
                                    <span className="sr-only">{t("assignment.inviteLink.copy")}</span>
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">{t("assignment.inviteLink.description")}</p>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4 dark:bg-zinc-800/50">
                    <TabsTrigger value="overview">{t("details.tabs.overview")}</TabsTrigger>
                    <TabsTrigger value="results">{t("details.tabs.results")}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <Card className="dark:bg-zinc-900/90 border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{t("details.information.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Info className="h-4 w-4" />
                                                {t("details.information.type")}
                                            </div>
                                            <div className="text-sm font-medium">
                                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                                    {assignment.type}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <FileText className="h-4 w-4" />
                                                {t("details.information.questions")}
                                            </div>
                                            <div className="text-sm font-medium">
                                                {assignment.type !== ExamType.DOCUMENT ? (assignment.questions?.length ?? 0) : "N/A"}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                {t("details.information.duration")}
                                            </div>
                                            <div className="text-sm font-medium">
                                                {formatDuration(assignment.startDate, assignment.endDate)}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                {t("assignment.deadline")}
                                            </div>
                                            <div className="text-sm font-medium">
                                                {assignment.endDate ? assignment.endDate.toLocaleDateString() : "Non défini"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <Info className="h-4 w-4" />
                                            {t("details.information.status")}
                                        </div>
                                        {getStatusBadge(assignment.status)}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Info className="h-4 w-4" />
                                        {t("details.information.description")}
                                    </div>
                                    <div className="p-4 rounded-lg bg-zinc-800/30 text-sm min-h-[120px]">
                                        {assignment.description || t("details.information.noDescription")}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="dark:bg-zinc-900/90 border-zinc-800">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">{t("details.results.summary")}</CardTitle>
                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                    {participationRate}% {t("assignment.participation")}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="dark:bg-zinc-800/50 border-zinc-700">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col items-center justify-center text-center h-full">
                                            <span className="text-3xl font-bold">{assignment.participants?.length || 0}</span>
                                            <span className="text-sm text-muted-foreground">{t("details.results.totalStudents")}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="dark:bg-zinc-800/50 border-zinc-700">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col items-center justify-center text-center h-full">
                                            <span className="text-3xl font-bold">{assignment.submissionStats.total}</span>
                                            <span className="text-sm text-muted-foreground">{t("details.results.submissions")}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="dark:bg-zinc-800/50 border-zinc-700">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col items-center justify-center text-center h-full">
                      <span className="text-3xl font-bold">
                        {assignment.type !== ExamType.DOCUMENT ? totalMaxPoints : "N/A"}
                      </span>
                                            <span className="text-sm text-muted-foreground">{t("details.results.maxPoints")}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="results">
                    <Card className="dark:bg-zinc-900/90 border-zinc-800">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">{t("details.results.title")}</CardTitle>
                                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {assignment.submissionStats.total} {t("details.results.submissions")} /{" "}
                      {assignment.participants?.length || 1} {t("details.results.students")}
                  </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-zinc-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-zinc-800/30">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="text-zinc-400">{t("details.results.table.student")}</TableHead>
                                            <TableHead className="text-zinc-400">{t("details.results.table.email")}</TableHead>
                                            <TableHead className="text-zinc-400">{t("details.results.table.status")}</TableHead>
                                            <TableHead className="text-zinc-400">{t("details.results.table.submissionDate")}</TableHead>
                                            <TableHead className="text-right text-zinc-400">{t("details.results.table.score")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentResults.map((student) => (
                                            <TableRow key={student?.id} className="hover:bg-zinc-800/20">
                                                <TableCell className="font-medium">{student?.name}</TableCell>
                                                <TableCell>{student?.email}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 p-0 cursor-pointer">
                                                                <StatusBadge status={student?.status ?? ParticipationStatus.PENDING} t={t} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start" className="dark:bg-zinc-900 border-zinc-800">
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(student?.id ?? "", ParticipationStatus.PENDING)}
                                                                className="flex items-center gap-2 text-yellow-500"
                                                            >
                                                                <HourglassIcon className="h-4 w-4" />
                                                                {t("details.results.status.pending")}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(student?.id ?? "", ParticipationStatus.ACCEPTED)}
                                                                className="flex items-center gap-2 text-blue-500"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                {t("details.results.status.accepted")}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(student?.id ?? "", ParticipationStatus.DECLINED)}
                                                                className="flex items-center gap-2 text-red-500"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                                {t("details.results.status.declined")}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(student?.id ?? "", ParticipationStatus.COMPLETED)}
                                                                className="flex items-center gap-2 text-green-500"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                {t("details.results.status.completed")}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                                <TableCell>
                                                    {student?.submissionDate ? (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                                            <span>{new Date(student?.submissionDate).toLocaleDateString()}</span>
                                                        </div>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {student?.score !== null && assignment.type !== ExamType.DOCUMENT ? (
                                                        <span
                                                            className={cn(
                                                                "font-medium px-2 py-1 rounded-md",
                                                                (student?.score ?? 0) < totalMaxPoints * 0.6
                                                                    ? "bg-red-500/10 text-red-500"
                                                                    : (student?.score ?? 0) < totalMaxPoints * 0.8
                                                                        ? "bg-yellow-500/10 text-yellow-500"
                                                                        : "bg-green-500/10 text-green-500",
                                                            )}
                                                        >
                              {student?.score} / {totalMaxPoints}
                            </span>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
