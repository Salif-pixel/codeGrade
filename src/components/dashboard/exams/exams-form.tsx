"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { Exam } from "./calendar-view"

interface ExamFormProps {
    exam: Exam | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (exam: Exam) => void
}

export function ExamForm({ exam, open, onOpenChange, onSave }: ExamFormProps) {
    const [title, setTitle] = React.useState(exam?.title || "")
    const [startDate, setStartDate] = React.useState<Date | undefined>(exam?.startDate)
    const [startTime, setStartTime] = React.useState(exam ? format(exam.startDate, "HH:mm") : "09:00")
    const [endDate, setEndDate] = React.useState<Date | undefined>(exam?.endDate)
    const [endTime, setEndTime] = React.useState(exam ? format(exam.endDate, "HH:mm") : "12:00")
    const [status, setStatus] = React.useState<Exam["status"]>(exam?.status || "DRAFT")
    const [type, setType] = React.useState<Exam["type"]>(exam?.type || "QUIZ")

    React.useEffect(() => {
        if (exam) {
            setTitle(exam.title)
            setStartDate(exam.startDate)
            setStartTime(format(exam.startDate, "HH:mm"))
            setEndDate(exam.endDate)
            setEndTime(format(exam.endDate, "HH:mm"))
            setStatus(exam.status)
            setType(exam.type)
        } else {
            setTitle("")
            setStartDate(new Date())
            setStartTime("09:00")
            setEndDate(new Date())
            setEndTime("12:00")
            setStatus("DRAFT")
            setType("QUIZ")
        }
    }, [exam])

    const handleSave = () => {
        if (!startDate || !endDate || !title) return

        const [startHours, startMinutes] = startTime.split(":").map(Number)
        const [endHours, endMinutes] = endTime.split(":").map(Number)

        const newStartDate = new Date(startDate)
        newStartDate.setHours(startHours, startMinutes)

        const newEndDate = new Date(endDate)
        newEndDate.setHours(endHours, endMinutes)

        onSave({
            id: exam?.id || Math.random().toString(36).substring(2, 9),
            title,
            startDate: newStartDate,
            endDate: newEndDate,
            status,
            type,
        })

        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">{exam ? "Modifier l'examen" : "Nouvel examen"}</DialogTitle>
                </DialogHeader>
                <Separator />
                <div className="grid gap-6 py-4">
                    <div className="grid gap-3">
                        <Label htmlFor="title" className="text-base">
                            Titre de l&#39;examen
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Titre de l'examen"
                            className="h-10"
                        />
                    </div>

                    <div className="grid gap-3">
                        <h3 className="text-base font-medium">Période</h3>
                        <Card>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Date de début</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !startDate && "text-muted-foreground",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={fr} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="startTime" className="text-sm">
                                            Heure de début
                                        </Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="startTime"
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="my-4 flex items-center">
                                    <Separator className="flex-grow" />
                                    <span className="mx-2 text-xs text-muted-foreground">jusqu&#39;à</span>
                                    <Separator className="flex-grow" />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Date de fin</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !endDate && "text-muted-foreground",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {endDate ? format(endDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={fr} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endTime" className="text-sm">
                                            Heure de fin
                                        </Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="endTime"
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm">
                                Statut
                            </Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as Exam["status"])}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">
                                        <div className="flex items-center">
                                            <div className="mr-2 h-2 w-2 rounded-full bg-blue-500"></div>
                                            Brouillon
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="PUBLISHED">
                                        <div className="flex items-center">
                                            <div className="mr-2 h-2 w-2 rounded-full bg-amber-500"></div>
                                            Publié
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="CLOSED">
                                        <div className="flex items-center">
                                            <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500"></div>
                                            Fermé
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-sm">
                                Type
                            </Label>
                            <Select value={type} onValueChange={(value) => setType(value as Exam["type"])}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DOCUMENT">Document</SelectItem>
                                    <SelectItem value="QUIZ">Quiz</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <Separator />
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button type="submit" onClick={handleSave}>
                        {exam ? "Mettre à jour" : "Créer l'examen"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

