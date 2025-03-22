"use client"

import * as React from "react"
import {Plus, CalendarIcon} from "lucide-react"
import {format} from "date-fns"

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {CalendarView, type Exam} from "./calendar-view"
import {ExamForm} from "./exams-form"
import type {Answer, Question, User} from "@prisma/client";

export function ExamsCalendar({initialExams}: {
    user: User;
    initialExams: (Exam & { questions: Question[]; answers: Answer[] })[]
}) {
    const [exams, setExams] = React.useState<Exam[]>(initialExams)
    const [examToEdit, setExamToEdit] = React.useState<Exam | null>(null)
    const [isFormOpen, setIsFormOpen] = React.useState(false)

    const handleEditExam = (exam: Exam) => {
        setExamToEdit(exam)
        setIsFormOpen(true)
    }

    const handleSaveExam = (exam: Exam) => {
        if (examToEdit) {
            // Mise à jour d'un examen existant
            setExams(exams.map((e) => (e.id === exam.id ? exam : e)))
        } else {
            // Ajout d'un nouvel examen
            setExams([...exams, exam])
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                <Card className="lg:col-span-3">
                    <CardContent className="p-4 pt-4">
                        <CalendarView exams={exams} onEditExam={handleEditExam}/>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <CalendarIcon className="mr-2 h-5 w-5"/>
                                Statistiques
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total des examens</span>
                                    <span className="font-medium">{exams.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Brouillons</span>
                                    <span
                                        className="font-medium">{exams.filter((e) => e.status === "DRAFT").length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Publiés</span>
                                    <span
                                        className="font-medium">{exams.filter((e) => e.status === "PUBLISHED").length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Fermés</span>
                                    <span
                                        className="font-medium">{exams.filter((e) => e.status === "CLOSED").length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Légende</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm">Brouillon</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-2 h-3 w-3 rounded-full bg-amber-500"></div>
                                    <span className="text-sm">Publié</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-2 h-3 w-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-sm">Fermé</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Examens à venir</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {exams
                                    .filter((e) => e.startDate > new Date())
                                    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                                    .slice(0, 3)
                                    .map((exam) => (
                                        <div key={exam.id} className="rounded-md border p-2">
                                            <div className="font-medium">{exam.title}</div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {format(exam.startDate, "dd/MM/yyyy HH:mm")}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ExamForm exam={examToEdit} open={isFormOpen} onOpenChange={setIsFormOpen} onSave={handleSaveExam}/>
        </div>
    )
}

