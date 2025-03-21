"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Calendar from "@/components/utilities/calendar/calendar"
import { ChevronRight, Copy, Eye, Link as LinkIcon, FileText } from "lucide-react"
import { useCustomToast } from "@/components/utilities/alert/alert";
import { Exam, User, Question, ExamStatus, SubmissionStatus, ParticipantStatus } from "@prisma/client"
import { useLocale, useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { updateParticipantStatus } from "@/actions/examActions"
import { SimpleHeaderTitle } from "@/components/dashboard/header/header-title"
import { log } from "console"


interface Assignment extends Exam {
  questions: Question[]
  participants: {
    id: string
    userId: string
    status: ParticipantStatus
    joinedAt: Date
    user: User
  }[]
  answers: {
    id: string
    createdAt: Date
    studentId: string
    student: User
    grade?: {
      id: string
      finalScore: number
    }
    status: SubmissionStatus
  }[]
  createdBy: User
  inviteLink: string
  status: ExamStatus
  submissions: {
    total: number
    pending: number
    corrected: number
    revised: number
  }
  totalStudents: number
}

// interface StudentResult {
//   id: string
//   name: string | null
//   email: string
//   status: ParticipantStatus
//   submissionDate: Date | null
//   score: number | null
// }

export default function ExamsComponent({ user, exams }: { user: User, exams: Assignment[] }) {
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
  const [showAssignmentDetails, setShowAssignmentDetails] = useState(false)
  const { showToast } = useCustomToast()
  const local = useLocale();
  const t = useTranslations('exams-component')

  const getExamStatus = (exam: Exam): ExamStatus => {
    const now = new Date()
    if (!exam.startDate || new Date(exam.startDate) > now) {
      return "PENDING"
    }
    if (!exam.endDate || new Date(exam.endDate) > now) {
      return "ACTIVE"
    }
    return "COMPLETED"
  }

  const assignments: Assignment[] = exams.map(exam => {
    const submissionStats = exam.answers.reduce(
      (acc, answer) => {
        acc.total++
        switch (answer.status) {
          case "PENDING":
            acc.pending++
            break
          case "CORRECTED":
            acc.corrected++
            break
          case "REVISED":
            acc.revised++
            break
        }
        return acc
      },
      { total: 0, pending: 0, corrected: 0, revised: 0 }
    )

    return {
      ...exam,
      status: getExamStatus(exam),
      submissions: submissionStats,
      totalStudents: exam.participants.length,
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/${local}/exams/${exam.id}`
    }
  })

  const copyInviteLink = (link: string) => {
    navigator.clipboard.writeText(link)
    showToast(
      t('toast.linkCopied.title'),
      t('toast.linkCopied.description'),
      "success"
    )
  }


  return (
    <>
      <div className="px-0 md:px-4 lg:px-8 xl:px-12 pt-10 pb-4 dark:bg-zinc-950 mb-10 flex flex-col gap-12">
        <SimpleHeaderTitle
          title="exams-component.title"
          Icon={<FileText className="h-5 w-5 text-primary" />}
        />
        <div className="px-0 md:px-4 lg:px-8 xl:px-12 dark:bg-zinc-950">
          <Tabs defaultValue="calendar" className="mb-6">
            <TabsList className="grid w-60 md:w-96 mx-auto grid-cols-2 gap-2 rounded-lg bg-muted p-1 h-auto mb-4 dark:bg-zinc-900">
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
                <Calendar user={user} initialExams={exams as never} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

interface AssignmentListProps {
  assignments: Assignment[]
  onViewDetails: (id: string) => void
  onCopyInviteLink: (link: string) => void
  user: User
}
const getStatusBadge = (status: ExamStatus) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations('calendar.details.status')

  switch (status) {
    case "PENDING":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{t('PENDING')}</Badge>
    case "ACTIVE":
      return <Badge variant="outline" className="bg-green-100 text-green-800">{t('ACTIVE')}</Badge>
    case "COMPLETED":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">{t('COMPLETED')}</Badge>
  }
}

const formatDuration = (startDate: Date | null | undefined, endDate: Date | null | undefined): string => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations('exams-component.duration')

  if (!startDate || !endDate) return t('undefined')

  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

  const days = Math.floor(diffInMinutes / (24 * 60))
  const hours = Math.floor((diffInMinutes % (24 * 60)) / 60)
  const minutes = diffInMinutes % 60

  const parts = []
  if (days > 0) parts.push(`${days} ${days > 1 ? t('days') : t('day')}`)
  if (hours > 0) parts.push(`${hours} ${hours > 1 ? t('hours') : t('hour')}`)
  if (minutes > 0) parts.push(`${minutes} ${minutes > 1 ? t('minutes') : t('minute')}`)

  return parts.join(' ')
}
function AssignmentList({ assignments, onViewDetails, onCopyInviteLink, user }: AssignmentListProps) {
  const t = useTranslations('exams-component')

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card className="bg-zinc-900" key={assignment.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{assignment.title}</CardTitle>
                <CardDescription>
                  {t('assignment.deadline')}: {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : "Non définie"}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  className="dark:bg-zinc-800 hover:dark:bg-zinc-800"
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(assignment.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {t('assignment.viewDetails')}
                </Button>
                {user?.role === "TEACHER" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="dark:bg-zinc-800 hover:dark:bg-zinc-800" variant="outline" size="sm">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        {t('assignment.invite')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">{t('assignment.inviteLink.title')}</h4>
                        <div className="flex items-center space-x-2">
                          <Input value={assignment.inviteLink} readOnly />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onCopyInviteLink(assignment.inviteLink)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('assignment.inviteLink.description')}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {assignment.type}
              </span>
              <span className="text-xs">{assignment.questions.length} {t('assignment.questions')}</span>
              <span className="text-xs">
                {formatDuration(assignment.startDate, assignment.endDate)}
              </span>
              <span className="text-xs ml-auto">
                {assignment.submissions.total} {t('assignment.submissions')} / {assignment.totalStudents} {t('assignment.students')}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface AssignmentDetailsProps {
  assignment: Assignment
  onBack: () => void
  onCopyInviteLink: (link: string) => void
}

function AssignmentDetails({ assignment, onBack, onCopyInviteLink }: AssignmentDetailsProps) {
  const studentsResults = assignment.participants?.map(participant => {
    if (!participant?.user) return null;

    // Trouver toutes les réponses de l'étudiant pour cet examen
    const studentAnswers = assignment.answers?.filter(a => a.studentId === participant.userId);

    // Prendre la dernière réponse (la plus récente) si elle existe
    const latestAnswer = studentAnswers?.length
      ? studentAnswers.reduce((latest, current) =>
          latest.createdAt > current.createdAt ? latest : current
        )
      : null;

    return {
      id: participant.userId,
      name: participant.user.name || "Anonyme",
      email: participant.user.email || "",
      status: participant.status,
      submissionDate: latestAnswer?.createdAt || null,
      score: latestAnswer?.grade?.finalScore || null
    };
  }).filter(Boolean);

  console.log("studentsResults", studentsResults);

  const { showToast } = useCustomToast();
  const [studentResults, setStudentResults] = useState(studentsResults || []);
  const t = useTranslations('exams-component');

  if (!assignment) {
    return <div>Examen non trouvé</div>;
  }

  const handleStatusUpdate = async (participantId: string, newStatus: ParticipantStatus) => {
    try {
      const result = await updateParticipantStatus(participantId, newStatus)

      if (result.success) {
        showToast("Succès", t('toast.statusUpdate.success'), "success")
        const updatedResults = studentResults.map(student =>
          student?.id === participantId
            ? { ...student, status: newStatus }
            : student
        )
        setStudentResults(updatedResults)
      } else {
        throw new Error(result.error)
      }
    } catch {
      showToast("Erreur", t('toast.statusUpdate.error'), "error")
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
          <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
          {t('details.back')}
        </Button>
        <h1 className="text-2xl font-bold">{t('details.title')}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{assignment.title}</CardTitle>
              <CardDescription>{t('assignment.deadline')}: {assignment.endDate ? assignment.endDate.toLocaleDateString() : "Non défini"}</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  {t('assignment.inviteLink.title')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">{t('assignment.inviteLink.title')}</h4>
                  <div className="flex items-center space-x-2">
                    <Input value={assignment.inviteLink} readOnly />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCopyInviteLink(assignment.inviteLink)}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">{t('assignment.inviteLink.copy')}</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('assignment.inviteLink.description')}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">{t('details.information.title')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('details.information.type')}:</span>
                  <span className="text-sm font-medium">{assignment.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('details.information.questions')}:</span>
                  <span className="text-sm font-medium">{assignment.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('details.information.duration')}:</span>
                  <span className="text-sm font-medium">
                    {formatDuration(assignment.startDate, assignment.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('details.information.status')}:</span>
                  {getStatusBadge(assignment.status)}
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">{t('details.information.description')}</h3>
              <p className="text-sm">{assignment.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('details.results.title')}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {assignment.submissions.total} {t('details.results.submissions')} / {assignment.participants.length} {t('details.results.students')}
              </span>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {Math.round((assignment.submissions.total / (assignment.participants.length || 1)) * 100)}% {t('assignment.participation')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('details.results.table.student')}</TableHead>
                <TableHead>{t('details.results.table.email')}</TableHead>
                <TableHead>{t('details.results.table.status')}</TableHead>
                <TableHead>{t('details.results.table.submissionDate')}</TableHead>
                <TableHead className="text-right">{t('details.results.table.score')}</TableHead>
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
                              student?.status === ParticipantStatus.COMPLETED && "bg-green-100 text-green-800",
                              student?.status === ParticipantStatus.ACCEPTED && "bg-blue-100 text-blue-800",
                              student?.status === ParticipantStatus.DECLINED && "bg-red-100 text-red-800",
                              student?.status === ParticipantStatus.PENDING && "bg-yellow-100 text-yellow-800"
                            )}
                          >
                            {student?.status === ParticipantStatus.COMPLETED ? t('details.results.status.completed') :
                              student?.status === ParticipantStatus.ACCEPTED ? t('details.results.status.accepted') :
                                student?.status === ParticipantStatus.DECLINED ? t('details.results.status.declined') :
                                  t('details.results.status.pending')}
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(student?.id ?? "", ParticipantStatus.PENDING)}
                          className="text-yellow-600"
                        >
                          {t('details.results.status.pending')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(student?.id ?? "", ParticipantStatus.ACCEPTED)}
                          className="text-blue-600"
                        >
                          {t('details.results.status.accepted')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(student?.id ?? "", ParticipantStatus.DECLINED)}
                          className="text-red-600"
                        >
                          {t('details.results.status.declined')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(student?.id ?? "", ParticipantStatus.COMPLETED)}
                          className="text-green-600"
                        >
                          {t('details.results.status.completed')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    {student?.submissionDate
                      ? new Date(student?.submissionDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {student?.score !== null ? (
                      <span
                        className={`font-medium ${student?.score && student?.score < assignment.questions.reduce((acc, q) => acc + q.maxPoints, 0) * 0.6
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
