"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Edit } from "lucide-react"
import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    format,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
    subDays,
    subMonths,
    subWeeks,
    subYears,
} from "date-fns"
import { fr } from "date-fns/locale"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export interface Exam {
    id: string
    title: string
    startDate: Date
    endDate: Date
    status: "DRAFT" | "PUBLISHED" | "CLOSED"
    type: "DOCUMENT" | "QUIZ"
}

interface CalendarViewProps {
    exams: Exam[]
    onEditExam: (exam: Exam) => void
}

// Update the getStatusColor function to include text color and better visual styling
const getStatusColor = (status: Exam["status"]) => {
    switch (status) {
        case "DRAFT":
            return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
        case "PUBLISHED":
            return "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300"
        case "CLOSED":
            return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300"
        default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300"
    }
}

// Update the getStatusBadgeColor function for badges
const getStatusBadgeColor = (status: Exam["status"]) => {
    switch (status) {
        case "DRAFT":
            return "bg-blue-500 hover:bg-blue-600 text-white"
        case "PUBLISHED":
            return "bg-amber-500 hover:bg-amber-600 text-white"
        case "CLOSED":
            return "bg-emerald-500 hover:bg-emerald-600 text-white"
        default:
            return "bg-gray-500 hover:bg-gray-600 text-white"
    }
}

export function CalendarView({ exams, onEditExam }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = React.useState(new Date())
    const [view, setView] = React.useState<"day" | "week" | "month" | "year">("month")
    const [selectedExam, setSelectedExam] = React.useState<Exam | null>(null)

    const handlePrevious = () => {
        switch (view) {
            case "day":
                setCurrentDate(subDays(currentDate, 1))
                break
            case "week":
                setCurrentDate(subWeeks(currentDate, 1))
                break
            case "month":
                setCurrentDate(subMonths(currentDate, 1))
                break
            case "year":
                setCurrentDate(subYears(currentDate, 1))
                break
        }
    }

    const handleNext = () => {
        switch (view) {
            case "day":
                setCurrentDate(addDays(currentDate, 1))
                break
            case "week":
                setCurrentDate(addWeeks(currentDate, 1))
                break
            case "month":
                setCurrentDate(addMonths(currentDate, 1))
                break
            case "year":
                setCurrentDate(addYears(currentDate, 1))
                break
        }
    }

    const handleToday = () => {
        setCurrentDate(new Date())
    }

    // Replace the renderDayView function with this enhanced version
    const renderDayView = () => {
        const dayExams = exams.filter((exam) => isSameDay(exam.startDate, currentDate))

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 p-4"
            >
                <h2 className="text-xl font-bold">{format(currentDate, "EEEE d MMMM yyyy", { locale: fr })}</h2>
                {dayExams.length > 0 ? (
                    <ul className="space-y-3">
                        {dayExams.map((exam) => (
                            <motion.li
                                key={exam.id}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden rounded-lg border shadow-sm"
                            >
                                <div className="flex items-center justify-between p-4">
                                    <div>
                                        <h3 className="font-medium">{exam.title}</h3>
                                        <div className="mt-1 flex items-center gap-2">
                                            <p className="text-sm text-muted-foreground">
                                                {format(exam.startDate, "HH:mm")} - {format(exam.endDate, "HH:mm")}
                                            </p>
                                            <Badge className={cn("ml-2", getStatusBadgeColor(exam.status))}>{exam.status}</Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">Type: {exam.type}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedExam(exam)}
                                        aria-label={`Modifier l'examen ${exam.title}`}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                        <p className="text-center text-muted-foreground">Aucun examen pour cette journée</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                                onEditExam({
                                    id: "",
                                    title: "",
                                    startDate: currentDate,
                                    endDate: new Date(currentDate.getTime() + 3600000),
                                    status: "DRAFT",
                                    type: "QUIZ",
                                })
                            }}
                        >
                            Ajouter un examen
                        </Button>
                    </div>
                )}
            </motion.div>
        )
    }

    // Replace the renderWeekView function with this enhanced version
    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 p-4"
            >
                <h2 className="text-xl font-bold">
                    Semaine du {format(days[0], "d MMMM", { locale: fr })} au {format(days[6], "d MMMM yyyy", { locale: fr })}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
                    {days.map((day, index) => {
                        const dayExams = exams.filter((exam) => isSameDay(exam.startDate, day))
                        const isToday = isSameDay(day, new Date())

                        return (
                            <motion.div
                                key={day.toString()}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={cn("rounded-lg border p-2", isToday && "border-primary shadow-sm")}
                            >
                                <h3
                                    className={cn(
                                        "mb-2 rounded-md p-1 text-center font-medium",
                                        isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                                    )}
                                >
                                    {format(day, "EEE d", { locale: fr })}
                                </h3>
                                {dayExams.length > 0 ? (
                                    <ul className="space-y-1">
                                        {dayExams.map((exam) => (
                                            <li
                                                key={exam.id}
                                                className={cn(
                                                    "cursor-pointer rounded-md border px-2 py-1 text-xs transition-colors",
                                                    getStatusColor(exam.status),
                                                )}
                                                onClick={() => setSelectedExam(exam)}
                                            >
                                                <div className="font-medium">{format(exam.startDate, "HH:mm")}</div>
                                                <div className="truncate">{exam.title}</div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex h-20 flex-col items-center justify-center rounded-md border border-dashed text-center">
                                        <p className="text-xs text-muted-foreground">Aucun examen</p>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>
        )
    }

    // Replace the renderMonthView function with this enhanced version
    const renderMonthView = () => {
        const firstDayOfMonth = startOfMonth(currentDate)
        const firstDayOfCalendar = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 })
        const days = Array.from({ length: 42 }, (_, i) => addDays(firstDayOfCalendar, i))
        const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 p-4"
            >
                <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy", { locale: fr })}</h2>
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((day) => (
                        <div key={day} className="mb-2 text-center font-medium text-muted-foreground">
                            {day}
                        </div>
                    ))}
                    {days.map((day, index) => {
                        const dayExams = exams.filter((exam) => isSameDay(exam.startDate, day))
                        const isCurrentMonth = isSameMonth(day, currentDate)
                        const isToday = isSameDay(day, new Date())

                        return (
                            <motion.div
                                key={day.toString()}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.003 }}
                                className={cn(
                                    "min-h-[100px] rounded-md border p-1",
                                    !isCurrentMonth && "bg-muted/30",
                                    isToday && "border-primary shadow-sm",
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex h-6 items-center justify-center rounded-full text-xs",
                                        isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                                    )}
                                >
                                    {format(day, "d")}
                                </div>
                                {dayExams.length > 0 && (
                                    <div className="mt-1 space-y-1">
                                        {dayExams.map((exam) => (
                                            <div
                                                key={exam.id}
                                                className={cn(
                                                    "cursor-pointer rounded-md border px-1 py-0.5 text-xs transition-colors",
                                                    getStatusColor(exam.status),
                                                )}
                                                onClick={() => setSelectedExam(exam)}
                                            >
                                                <div className="font-medium">{format(exam.startDate, "HH:mm")}</div>
                                                <div className="truncate">{exam.title}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>
        )
    }

    // Replace the renderYearView function with this enhanced version
    const renderYearView = () => {
        const months = Array.from({ length: 12 }, (_, i) => {
            const date = new Date(currentDate.getFullYear(), i, 1)
            const monthExams = exams.filter(
                (exam) => exam.startDate.getFullYear() === date.getFullYear() && exam.startDate.getMonth() === date.getMonth(),
            )
            return { date, examsCount: monthExams.length }
        })

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 p-4"
            >
                <h2 className="text-xl font-bold">{format(currentDate, "yyyy")}</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {months.map(({ date, examsCount }, index) => {
                        const isCurrentMonth =
                            date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()

                        return (
                            <motion.div
                                key={date.toString()}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={cn(
                                    "cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md",
                                    isCurrentMonth && "border-primary shadow-sm",
                                )}
                                onClick={() => {
                                    setCurrentDate(date)
                                    setView("month")
                                }}
                            >
                                <div className={cn("p-3 text-center font-medium", isCurrentMonth && "bg-primary/10")}>
                                    {format(date, "MMMM", { locale: fr })}
                                </div>
                                <div className="flex items-center justify-center p-4">
                                    <div
                                        className={cn(
                                            "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
                                            examsCount > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        {examsCount}
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-2 text-center text-xs text-muted-foreground">
                                    {examsCount} examen{examsCount !== 1 ? "s" : ""}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>
        )
    }

    // Update the return statement to use Card components and improve accessibility
    return (
        <div className="space-y-4">
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon" onClick={handlePrevious} aria-label="Période précédente">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={handleToday} aria-label="Aujourd'hui">
                                Aujourd&#39;hui
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNext} aria-label="Période suivante">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Tabs value={view} onValueChange={(v) => setView(v as never)} className="w-full sm:w-auto">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="day">Jour</TabsTrigger>
                                <TabsTrigger value="week">Semaine</TabsTrigger>
                                <TabsTrigger value="month">Mois</TabsTrigger>
                                <TabsTrigger value="year">Année</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md">
                        {view === "day" && renderDayView()}
                        {view === "week" && renderWeekView()}
                        {view === "month" && renderMonthView()}
                        {view === "year" && renderYearView()}
                    </div>
                </CardContent>
            </Card>

            {selectedExam && (
                <Dialog open={!!selectedExam} onOpenChange={(open) => !open && setSelectedExam(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{selectedExam.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Date de début</p>
                                    <p>{format(selectedExam.startDate, "dd/MM/yyyy HH:mm")}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Date de fin</p>
                                    <p>{format(selectedExam.endDate, "dd/MM/yyyy HH:mm")}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                                    <p>{selectedExam.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Statut</p>
                                    <Badge className={getStatusBadgeColor(selectedExam.status)}>{selectedExam.status}</Badge>
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => {
                                    onEditExam(selectedExam)
                                    setSelectedExam(null)
                                }}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

