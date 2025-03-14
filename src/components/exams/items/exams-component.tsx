"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import  Calendar  from "@/components/calendar/calendar"
import { ChevronRight, Copy, Eye, Link as LinkIcon } from "lucide-react"
import {useCustomToast} from "@/components/alert/alert";
import {Exam, User,Question} from "@prisma/client"


interface Assignment {
  id: string
  title: string
  dueDate: string
  language: string
  questions: number
  duration: number
  submissions: number
  totalStudents: number
  status: "active" | "completed"
  description: string
  inviteLink: string
}

interface StudentResult {
  id: string
  name: string
  email: string
  status: "completed" | "pending"
  submissionDate: string | null
  score: number | null
}


export default function ExamsComponent({user, exams}:{user:User, exams: (Exam & {questions: Question[]})[]}) {
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
  const [showAssignmentDetails, setShowAssignmentDetails] = useState(false)
  const { showToast } = useCustomToast()

  // Mock data - replace with actual API calls
  const assignments: Assignment[] = [
    {
      id: "1",
      title: "Introduction à Python",
      dueDate: "2024-02-15",
      language: "Python",
      questions: 10,
      duration: 60,
      submissions: 15,
      totalStudents: 20,
      status: "active",
      description: "Un examen d'introduction couvrant les bases de Python.",
      inviteLink: "https://codegrade.com/exam/123"
    }
  ]

  const studentResults: StudentResult[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      status: "completed",
      submissionDate: "2024-02-10",
      score: 85
    }
  ]



  const copyInviteLink = (link: string) => {
    navigator.clipboard.writeText(link)
   showToast("Lien copié", "Le lien d'invitation a été copié dans le presse-papiers.", "success")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Examens</h1>
      </div>

      <Tabs defaultValue="calendar" className="mb-6">
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {!showAssignmentDetails ? (
            <AssignmentList
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
              studentResults={studentResults}
              onBack={() => setShowAssignmentDetails(false)}
              onCopyInviteLink={copyInviteLink}
            />
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <div className="flex flex-col h-[calc(100vh-12rem)]">
            <Calendar user={user} initialExams={exams} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AssignmentListProps {
  assignments: Assignment[]
  onViewDetails: (id: string) => void
  onCopyInviteLink: (link: string) => void
}

function AssignmentList({ assignments, onViewDetails, onCopyInviteLink }: AssignmentListProps) {
  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card key={assignment.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{assignment.title}</CardTitle>
                <CardDescription>Date limite: {assignment.dueDate}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(assignment.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Inviter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Lien d&apos;invitation</h4>
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
                        Partagez ce lien avec vos étudiants pour qu&apos;ils puissent rejoindre ce devoir.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {assignment.language}
              </span>
              <span className="text-xs">{assignment.questions} questions</span>
              <span className="text-xs">{assignment.duration} minutes</span>
              <span className="text-xs ml-auto">
                {assignment.submissions} soumissions / {assignment.totalStudents} étudiants
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
  studentResults: StudentResult[]
  onBack: () => void
  onCopyInviteLink: (link: string) => void
}

function AssignmentDetails({ assignment, studentResults, onBack, onCopyInviteLink }: AssignmentDetailsProps) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
          <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Détails du devoir</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{assignment.title}</CardTitle>
              <CardDescription>Date limite: {assignment.dueDate}</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Lien d&apos;invitation
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Lien d&apos;invitation</h4>
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
                    Partagez ce lien avec vos étudiants pour qu&apos;ils puissent rejoindre ce devoir.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Informations</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Langage:</span>
                  <span className="text-sm font-medium">{assignment.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Questions:</span>
                  <span className="text-sm font-medium">{assignment.questions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Durée:</span>
                  <span className="text-sm font-medium">{assignment.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Statut:</span>
                  <Badge
                    variant="outline"
                    className={
                      assignment.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {assignment.status === "active" ? "Actif" : "Terminé"}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm">{assignment.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Résultats des étudiants</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {assignment.submissions} soumissions / {assignment.totalStudents} étudiants
              </span>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {Math.round((assignment.submissions / assignment.totalStudents) * 100)}% de participation
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étudiant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de soumission</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentResults.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    {student.status === "completed" ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Complété
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        En attente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{student.submissionDate || "-"}</TableCell>
                  <TableCell className="text-right">
                    {student.score !== null ? (
                      <span
                        className={`font-medium ${
                          student.score >= 80
                            ? "text-green-600"
                            : student.score >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {student.score}%
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