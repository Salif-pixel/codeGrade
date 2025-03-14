"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Plus,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
  CodeIcon,
  X,
  Clock,
  FileText,
  AlertCircle,
  BookOpen,
  CheckCircle,
  CalendarIcon,
  MoreHorizontal,
  Trash2,
  Edit,
  Play,
  CalendarCheck,
  CalendarClock,
  Repeat,
  Save,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCustomToast } from "@/components/alert/alert"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { updateExam, deleteExam } from "@/actions/examActions"
import type { Exam, User, Question } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link } from "@/i18n/navigation"

type CalendarView = "day" | "week" | "month"

// Types alignés avec le schéma Prisma
export type ExamType = "DOCUMENT" | "QCM" | "CODE"

export interface Assignment {
  id: string
  title: string
  description: string
  type: ExamType
  date: Date | string
  duration: number
  fileUrl?: string
  format: string
  maxAttempts: number
  startDate?: Date | string
  endDate?: Date | string
  submissionType?: string
  language?: string
  tests?: { name: string; description: string }[]
}

export default function CalendarView({
  initialExams,
}: { user: User; initialExams: (Exam & { questions: Question[] })[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekDays, setWeekDays] = useState<Date[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [sheetSide, setSheetSide] = useState<"right" | "bottom">("right")
  const [editMode, setEditMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ day: number; hour: number } | null>(null)
  const [blinkInterval, setBlinkInterval] = useState<NodeJS.Timeout | null>(null)
  const [, setIsButtonVisible] = useState(true)
  // État initial avec fallback au localStorage ou "week" par défaut
  const [view, setView] = useState<CalendarView>("week")

  // Référence pour le conteneur du calendrier
  const calendarRef = useRef<HTMLDivElement>(null)

  // Media queries pour la responsivité
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isTablet = useMediaQuery("(min-width: 768px)")
  const { showToast } = useCustomToast()

  // Heures de la journée (de 7h à 18h)
  const hours = Array.from({ length: 24 }, (_, i) => i )

  // Effect to initialize assignments with provided exams
  useEffect(() => {
    if (initialExams.length > 0) {
      const formattedAssignments = initialExams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        description: exam.description ?? "",
        type: exam.type,
        date: new Date(exam.startDate || ""),
        duration:  1,
        maxAttempts: exam.maxAttempts,
        format: exam.format,
        startDate: exam.startDate,
        endDate: exam.endDate,
        submissionType: exam.format,
        tests:
          exam.questions?.map((q) => ({
            name: q.text,
            description: q.correctionAi,
          })) || [],
      }))
      setAssignments(formattedAssignments as never)
    }
  }, [initialExams])

  // Determine sheet side based on screen size
  useEffect(() => {
    setSheetSide(isTablet ? "right" : "bottom")
  }, [isTablet])

  // Charger la vue depuis localStorage au démarrage et initialiser en fonction de la taille d'écran
  useEffect(() => {
    // Vérifier si on est côté client
    if (typeof window !== "undefined") {
      try {
        // Récupérer la vue enregistrée
        const savedView = localStorage.getItem("calendarView") as CalendarView | null

        // Sur mobile, forcer la vue jour
        if (!isTablet) {
          setView("day")
        } else if (savedView && (savedView === "day" || savedView === "week")) {
          // Utiliser la vue sauvegardée si elle existe et est valide
          setView(savedView)
        } else if (!isDesktop) {
          // Fallback pour tablette
          setView("week")
        }
      } catch {
        // En cas d'erreur d'accès au localStorage, utiliser les valeurs par défaut
        if (!isTablet) {
          setView("day")
        } else if (!isDesktop) {
          setView("week")
        }
      }
    }
  }, [isDesktop, isTablet])

  // Sauvegarder la vue dans localStorage quand elle change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("calendarView", view)
      } catch  {
        // Ignorer les erreurs de localStorage
      }
    }
  }, [view])

  // Générer les jours de la semaine
  useEffect(() => {
    const startDay = startOfWeek(currentDate, { weekStartsOn: 1 }) // Commence le lundi
    const days = Array.from({ length: 7 }, (_, i) => addDays(startDay, i))
    setWeekDays(days)
  }, [currentDate])

  // Effet pour le clignotement du cercle d'édition
  useEffect(() => {
    if (editMode) {
      const interval = setInterval(() => {
        setIsButtonVisible((prev) => !prev)
      }, 500) // Clignote toutes les 500ms
      setBlinkInterval(interval)
    } else {
      if (blinkInterval) {
        clearInterval(blinkInterval)
        setBlinkInterval(null)
      }
      setIsButtonVisible(true)
    }

    return () => {
      if (blinkInterval) {
        clearInterval(blinkInterval)
      }
    }
  }, [editMode])

  // Fonction pour ouvrir le sheet avec les détails de l'assignement
  const openAssignmentDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsSheetOpen(true)
  }

  // Fonction pour vérifier si un devoir est à une heure donnée
  const getAssignmentsForHourAndDay = (hour: number, day: Date) => {
    return assignments.filter((assignment) => {
      const assignDate = new Date(assignment.date)
      return isSameDay(assignDate, day) && assignDate.getHours() === hour
    })
  }

  // Fonction pour calculer la hauteur d'un devoir en fonction de sa durée
  const getAssignmentHeight = (duration: number) => {
    // Chaque heure fait 100px de hauteur
    return `${duration * 100}px`
  }

  // Gestionnaires d'événements pour le drag
  const handleMouseDown = (dayIndex: number, hour: number, event: React.MouseEvent) => {
    if (!editMode) return

    // Empêcher la propagation si on clique sur un devoir existant
    const target = event.target as HTMLElement
    if (target.closest(".assignment-item")) {
      return
    }

    event.preventDefault()
    setIsDragging(true)
    setDragStart({ day: dayIndex, hour })
    setDragEnd({ day: dayIndex, hour })

    // Ajouter des écouteurs d'événements globaux pour le drag
    document.addEventListener("mousemove", handleGlobalMouseMove)
    document.addEventListener("mouseup", handleGlobalMouseUp)
  }

  const handleGlobalMouseMove = (event: MouseEvent) => {
    if (!isDragging || !editMode || !calendarRef.current) return

    // Convertir les coordonnées de la souris en position dans la grille
    const rect = calendarRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Calculer l'index du jour et l'heure
    const visibleDays = view === "day" ? 1 : 7
    const cellWidth = rect.width / (visibleDays + 1) // +1 pour la colonne des heures
    const cellHeight = 100 // Hauteur d'une cellule en pixels

    // Calculer l'index du jour (en tenant compte de la première colonne pour les heures)
    const dayIndex = Math.floor(x / cellWidth) - 1

    // Calculer l'heure
    const hourIndex = Math.floor(y / cellHeight)
    const hour = hourIndex + 7 // Les heures commencent à 7h

    // Mettre à jour le drag uniquement si les valeurs sont valides
    if (dayIndex >= 0 && dayIndex < visibleDays && hour >= 7 && hour < 19) {
      setDragEnd({ day: dayIndex, hour })
    }
  }

  const handleGlobalMouseUp = () => {
    if (!isDragging || !editMode || !dragStart || !dragEnd) {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
      return
    }

    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)

    // Supprimer les écouteurs d'événements globaux
    document.removeEventListener("mousemove", handleGlobalMouseMove)
    document.removeEventListener("mouseup", handleGlobalMouseUp)
  }

  // Fonction pour vérifier si une cellule est dans la sélection
  const isInSelection = (dayIndex: number, hour: number) => {
    if (!isDragging || !dragStart || !dragEnd) return false

    // Vérifier que c'est le même jour
    if (dragStart.day !== dayIndex || dragEnd.day !== dayIndex) return false

    const startHour = Math.min(dragStart.hour, dragEnd.hour)
    const endHour = Math.max(dragStart.hour, dragEnd.hour)

    return hour >= startHour && hour <= endHour
  }

  // Fonction pour naviguer entre les jours
  const navigateDate = (direction: "prev" | "next") => {
    if (view === "day") {
      // Navigation par jour
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
      setCurrentDate(newDate)
    } else {
      // Navigation par semaine
      setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
    }
  }

  // Obtenir les jours à afficher en fonction de la vue
  const getVisibleDays = () => {
    if (view === "day") {
      return [currentDate]
    } else {
      return weekDays
    }
  }

  const visibleDays = getVisibleDays()

  // Fonction pour mettre à jour la vue si on n'est pas sur mobile
  const handleViewChange = (newView: CalendarView) => {
    // Sur mobile, on reste en vue jour quoi qu'il arrive
    if (!isTablet && newView !== "day") {
      return
    }

    setView(newView)
    // La sauvegarde dans localStorage est gérée par l'effect
  }

  // Fonction pour obtenir la classe de couleur en fonction du type d'examen
  const getExamTypeColor = (examType: ExamType | undefined) => {
    switch (examType) {
      case "QCM":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-100 border-l-4 border-amber-500 dark:border-amber-400 shadow-sm hover:shadow-md transition-shadow"
      case "CODE":
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-100 border-l-4 border-indigo-500 dark:border-indigo-400 shadow-sm hover:shadow-md transition-shadow"
      case "DOCUMENT":
      default:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 border-l-4 border-blue-500 dark:border-blue-400 shadow-sm hover:shadow-md transition-shadow"
    }
  }

  // Fonction pour obtenir le badge du type d'examen
  const getExamTypeBadge = (examType: ExamType | undefined) => {
    switch (examType) {
      case "QCM":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            QCM
          </Badge>
        )
      case "CODE":
        return (
          <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">
            <CodeIcon className="h-3 w-3 mr-1" />
            Code
          </Badge>
        )
      case "DOCUMENT":
      default:
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            <FileText className="h-3 w-3 mr-1" />
            Document
          </Badge>
        )
    }
  }

  // Fonction pour obtenir l'icône du type d'examen
  const getExamTypeIcon = (examType: ExamType | undefined) => {
    switch (examType) {
      case "QCM":
        return <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      case "CODE":
        return <CodeIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
      case "DOCUMENT":
      default:
        return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    }
  }

  return (
    <Card className="bg-background shadow-md border-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <span>Calendrier des évaluations</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    editMode ? "bg-primary text-primary-foreground animate-pulse" : "",
                  )}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{editMode ? "Désactiver le mode édition" : "Activer le mode édition"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          {/* Header avec titre, navigation et contrôles */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Titre et navigation */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onClick={() => navigateDate("prev")}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Précédent</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onClick={() => navigateDate("next")}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Suivant</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        <CalendarClock className="h-5 w-5 text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Aujourd&apos;hui</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <h2 className="ml-3 text-lg font-semibold sm:text-xl flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-primary hidden sm:inline-block" />
                {view === "day"
                  ? format(currentDate, "EEEE d MMMM yyyy", { locale: fr })
                  : format(weekDays[0] || new Date(), "MMMM yyyy", { locale: fr })}
              </h2>
            </div>

            {/* Contrôles */}
            <div className="flex items-center justify-start md:justify-end gap-2">
              <Tabs value={view} onValueChange={(v) => handleViewChange(v as CalendarView)} className="mr-2">
                <TabsList className="h-9 p-1 bg-muted/80">
                  <TabsTrigger
                    value="day"
                    className="flex h-7 items-center px-3 data-[state=active]:bg-background data-[state=active]:text-primary"
                  >
                    <Calendar className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">Jour</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="week"
                    className="flex h-7 items-center px-3 data-[state=active]:bg-background data-[state=active]:text-primary"
                    disabled={!isTablet} // Désactiver le bouton semaine sur mobile
                  >
                    <CalendarDays className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">Semaine</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {editMode && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" className="h-9 bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Ajouter</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ajouter une évaluation</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Calendrier */}
          <div className="overflow-hidden rounded-lg border border-border shadow-sm bg-card" ref={calendarRef}>
            {/* En-tête des jours */}
            <div
              className="grid border-b"
              style={{
                gridTemplateColumns: `60px repeat(${visibleDays.length}, 1fr)`,
                width: "100%",
              }}
            >
              <div className="border-r border-border p-2 text-center font-medium text-muted-foreground bg-muted/30 dark:bg-zinc-900"></div>
              {visibleDays.map((day, index) => {
                const dayNumber = format(day, "d")
                const dayName = format(day, "EEE", { locale: fr })
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={index}
                    className={cn(
                      "border-r border-border p-2 text-center last:border-r-0",
                      isToday ? "bg-primary/10" : "bg-muted/30 dark:bg-zinc-900",
                    )}
                  >
                    <div className="font-medium text-foreground/80">{dayName}</div>
                    <div
                      className={cn(
                        "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full",
                        isToday && "bg-primary text-primary-foreground font-medium",
                      )}
                    >
                      {dayNumber}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Grille des heures */}
            <div className="relative overflow-x-auto">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="grid border-b border-border last:border-b-0"
                  style={{
                    gridTemplateColumns: `60px repeat(${visibleDays.length}, 1fr)`,
                    width: "100%",
                  }}
                >
                  <div className="border-r border-border p-2 text-right text-sm text-muted-foreground min-w-[60px] bg-muted/20 dark:bg-zinc-900 flex items-center justify-end">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 opacity-70" />
                      {hour}:00
                    </div>
                  </div>
                  {visibleDays.map((day, dayIndex) => {
                    const isCurrentHour = new Date().getHours() === hour && isSameDay(day, new Date())

                    return (
                      <div
                        key={`${hour}-${dayIndex}`}
                        className={cn(
                          "relative h-[100px] border-r border-border last:border-r-0",
                          isInSelection(dayIndex, hour) && "bg-primary/10",
                          isCurrentHour && "bg-primary/5",
                        )}
                        onMouseDown={(e) => handleMouseDown(dayIndex, hour, e)}
                      >
                        {isCurrentHour && (
                          <div className="absolute left-0 right-0 border-t-2 border-primary z-10 top-0"></div>
                        )}
                        {getAssignmentsForHourAndDay(hour, day).map((assignment, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "assignment-item absolute left-0 right-0 z-10 m-1 overflow-hidden rounded-md p-2 text-sm cursor-pointer",
                              getExamTypeColor(assignment.type as ExamType),
                            )}
                            style={{
                              height: getAssignmentHeight(assignment.duration),
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              openAssignmentDetails(assignment)
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium flex items-center">
                                {getExamTypeIcon(assignment.type as ExamType)}
                                <span className="ml-1">
                                  {typeof assignment.date === "string"
                                    ? format(new Date(assignment.date), "HH:mm")
                                    : format(assignment.date, "HH:mm")}
                                </span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openAssignmentDetails(assignment)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem >
                                    <Link href={"/exams"} className="flex flex-row">
                                    <Play className="h-4 w-4 mr-2" />
                                    Commencer
                                    </Link>
                                  </DropdownMenuItem>
                                  {editMode && (
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="font-bold mt-1 line-clamp-1">{assignment.title}</div>
                            <div className="text-xs line-clamp-1 opacity-80">{assignment.description}</div>
                            {assignment.submissionType === "code" && (
                              <div className="mt-1 flex items-center text-xs font-medium">
                                <CodeIcon className="mr-1 h-3 w-3" />
                                {assignment.language?.toUpperCase()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sheet pour afficher les détails d'un devoir */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTitle>
            
          </SheetTitle>
          <SheetContent side={sheetSide} className="sm:max-w-md p-0 border-l border-primary/10">
            {selectedAssignment && (
              <ScrollArea className="h-full">
                <div className="p-6">
                  <SheetHeader className="pr-8">
                    <div className="flex justify-between items-center">
                      {editMode ? (
                        <Input
                          type="text"
                          value={selectedAssignment.title}
                          onChange={(e) =>
                            setSelectedAssignment({
                              ...selectedAssignment,
                              title: e.target.value,
                            })
                          }
                          className="text-xl font-semibold w-full border-b border-primary/20 focus-visible:ring-primary"
                        />
                      ) : (
                        <SheetTitle className="text-xl flex items-center gap-2">
                          {getExamTypeIcon(selectedAssignment.type as ExamType)}
                          {selectedAssignment.title}
                        </SheetTitle>
                      )}
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditMode(!editMode)}
                          className={cn("rounded-full h-8 w-8", editMode && "text-primary")}
                        >
                          {editMode ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      {editMode ? (
                        <select
                          value={selectedAssignment.type}
                          onChange={(e) =>
                            setSelectedAssignment({
                              ...selectedAssignment,
                              type: e.target.value as ExamType,
                            })
                          }
                          className="py-1 px-2 text-xs rounded border border-input focus-visible:ring-primary"
                        >
                          <option value="QCM">QCM</option>
                          <option value="CODE">Code</option>
                          <option value="DOCUMENT">Document</option>
                        </select>
                      ) : (
                        getExamTypeBadge(selectedAssignment.type as ExamType)
                      )}
                      {editMode ? (
                        <Input
                          type="datetime-local"
                          value={
                            typeof selectedAssignment.date === "string"
                              ? new Date(selectedAssignment.date).toISOString().slice(0, 16)
                              : selectedAssignment.date.toISOString().slice(0, 16)
                          }
                          onChange={(e) =>
                            setSelectedAssignment({
                              ...selectedAssignment,
                              date: new Date(e.target.value),
                            })
                          }
                          className="py-1 px-2 text-xs rounded border-input focus-visible:ring-primary"
                        />
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          {typeof selectedAssignment.date === "string"
                            ? format(new Date(selectedAssignment.date), "dd MMMM yyyy à HH:mm", { locale: fr })
                            : format(selectedAssignment.date, "dd MMMM yyyy à HH:mm", { locale: fr })}
                        </Badge>
                      )}
                    </div>
                    <SheetDescription className="mt-4 text-sm" asChild>
                      {editMode ? (
                        <Textarea
                          value={selectedAssignment.description}
                          onChange={(e) =>
                            setSelectedAssignment({
                              ...selectedAssignment,
                              description: e.target.value,
                            })
                          }
                          className="w-full h-20 p-2 border rounded border-input focus-visible:ring-primary resize-none"
                          placeholder="Description de l'évaluation"
                        />
                      ) : (
                        <div className="bg-muted/30 p-3 rounded-md">
                          {selectedAssignment.description || "Aucune description"}
                        </div>
                      )}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="py-6">
                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Format de soumission
                        </h3>
                        {editMode ? (
                          <Input
                            type="text"
                            value={selectedAssignment.format}
                            onChange={(e) =>
                              setSelectedAssignment({
                                ...selectedAssignment,
                                format: e.target.value,
                              })
                            }
                            className="w-full p-1 text-sm border rounded border-input focus-visible:ring-primary"
                          />
                        ) : (
                          <p className="text-sm bg-muted/30 p-2 rounded">
                            {selectedAssignment.format || selectedAssignment.submissionType || "Non spécifié"}
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                          <Repeat className="h-4 w-4 text-primary" />
                          Tentatives maximum
                        </h3>
                        {editMode ? (
                          <Input
                            type="number"
                            min="1"
                            value={selectedAssignment.maxAttempts}
                            onChange={(e) =>
                              setSelectedAssignment({
                                ...selectedAssignment,
                                maxAttempts: Number.parseInt(e.target.value),
                              })
                            }
                            className="w-20 p-1 text-sm border rounded border-input focus-visible:ring-primary"
                          />
                        ) : (
                          <Badge variant="secondary" className="text-sm">
                            {selectedAssignment.maxAttempts || 1}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          Date de debut
                        </h3>
                        {editMode ? (
                          <Input
                            type="datetime-local"
                            value={
                              selectedAssignment.startDate
                                ? typeof selectedAssignment.startDate === "string"
                                  ? new Date(selectedAssignment.startDate).toISOString().slice(0, 16)
                                  : selectedAssignment.startDate.toISOString().slice(0, 16)
                                : ""
                            }
                            onChange={(e) =>
                              setSelectedAssignment({
                                ...selectedAssignment,
                                startDate: e.target.value ? new Date(e.target.value) : undefined,
                              })
                            }
                            className="w-full p-1 text-sm border rounded border-input focus-visible:ring-primary"
                          />
                        ) : selectedAssignment.startDate ? (
                          <Badge variant="destructive" className="text-sm">
                            {typeof selectedAssignment.startDate === "string"
                              ? format(new Date(selectedAssignment.startDate), "dd MMMM yyyy à HH:mm", { locale: fr })
                              : format(selectedAssignment.startDate, "dd MMMM yyyy à HH:mm", { locale: fr })}
                          </Badge>
                        ) : (
                          <p className="text-sm text-muted-foreground">Date de debut</p>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          Date limite
                        </h3>
                        {editMode ? (
                          <Input
                            type="datetime-local"
                            value={
                              selectedAssignment.endDate
                                ? typeof selectedAssignment.endDate === "string"
                                  ? new Date(selectedAssignment.endDate).toISOString().slice(0, 16)
                                  : selectedAssignment.endDate.toISOString().slice(0, 16)
                                : ""
                            }
                            onChange={(e) =>
                              setSelectedAssignment({
                                ...selectedAssignment,
                                endDate: e.target.value ? new Date(e.target.value) : undefined,
                              })
                            }
                            className="w-full p-1 text-sm border rounded border-input focus-visible:ring-primary"
                          />
                        ) : selectedAssignment.endDate ? (
                          <Badge variant="destructive" className="text-sm">
                            {typeof selectedAssignment.endDate === "string"
                              ? format(new Date(selectedAssignment.endDate), "dd MMMM yyyy à HH:mm", { locale: fr })
                              : format(selectedAssignment.endDate, "dd MMMM yyyy à HH:mm", { locale: fr })}
                          </Badge>
                        ) : (
                          <p className="text-sm text-muted-foreground">Aucune date limite</p>
                        )}
                      </div>

                      {(selectedAssignment.type === "CODE" || editMode) && (
                        <div>
                          <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                            <CodeIcon className="h-4 w-4 text-primary" />
                            Langage de programmation
                          </h3>
                          {editMode ? (
                            <Input
                              type="text"
                              value={selectedAssignment.language || ""}
                              onChange={(e) =>
                                setSelectedAssignment({
                                  ...selectedAssignment,
                                  language: e.target.value,
                                })
                              }
                              className="w-full p-1 text-sm border rounded border-input focus-visible:ring-primary"
                              placeholder="javascript, python, etc."
                            />
                          ) : selectedAssignment.language ? (
                            <Badge className="bg-indigo-500 text-white">
                              {selectedAssignment.language.toUpperCase()}
                            </Badge>
                          ) : (
                            <p className="text-sm text-muted-foreground">Non spécifié</p>
                          )}
                        </div>
                      )}

                      {selectedAssignment.tests && (
                        <div>
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-primary" />
                              Tests ({selectedAssignment.tests.length})
                            </h3>
                            {editMode && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-primary/50 text-primary hover:bg-primary/10"
                                onClick={() => {
                                  const newTests = [
                                    ...(selectedAssignment.tests || []),
                                    { name: "Nouveau test", description: "Description du test" },
                                  ]
                                  setSelectedAssignment({
                                    ...selectedAssignment,
                                    tests: newTests,
                                  })
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" /> Ajouter un test
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2 mt-2">
                            {selectedAssignment.tests.map((test, index) => (
                              <Card key={index} className="border-border shadow-sm">
                                <CardContent className="p-3">
                                  {editMode ? (
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <Input
                                          type="text"
                                          value={test.name}
                                          onChange={(e) => {
                                            const updatedTests = [...selectedAssignment.tests ?? []]
                                            updatedTests[index] = { ...test, name: e.target.value }
                                            setSelectedAssignment({
                                              ...selectedAssignment,
                                              tests: updatedTests,
                                            })
                                          }}
                                          className="text-sm font-medium w-full border-b border-input focus-visible:ring-primary"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 rounded-full text-destructive hover:bg-destructive/10"
                                          onClick={() => {
                                            const updatedTests = [...selectedAssignment.tests ?? []]
                                            updatedTests.splice(index, 1)
                                            setSelectedAssignment({
                                              ...selectedAssignment,
                                              tests: updatedTests,
                                            })
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <Textarea
                                        value={test.description}
                                        onChange={(e) => {
                                          const updatedTests = [...selectedAssignment.tests ?? []]
                                          updatedTests[index] = { ...test, description: e.target.value }
                                          setSelectedAssignment({
                                            ...selectedAssignment,
                                            tests: updatedTests,
                                          })
                                        }}
                                        className="text-xs mt-1 w-full p-1 border rounded border-input focus-visible:ring-primary resize-none"
                                      />
                                    </div>
                                  ) : (
                                    <>
                                      <h4 className="text-sm font-medium flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="h-5 w-5 p-0 flex items-center justify-center rounded-full"
                                        >
                                          {index + 1}
                                        </Badge>
                                        {test.name}
                                      </h4>
                                      <p className="text-xs mt-2 text-muted-foreground bg-muted/30 p-2 rounded">
                                        {test.description}
                                      </p>
                                    </>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <SheetFooter className="sm:justify-start gap-2 flex-wrap">
                    {editMode ? (
                      <>
                        <Button
                          variant="default"
                          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                          onClick={async () => {
                            // Format the assignment data for saving
                            const examData = {
                              title: selectedAssignment.title,
                              description: selectedAssignment.description,
                              type: selectedAssignment.type as ExamType,
                              format: selectedAssignment.format,
                              maxAttempts: selectedAssignment.maxAttempts,
                              endDate: selectedAssignment.endDate,
                              questions:
                                selectedAssignment.tests?.map((test) => ({
                                  text: test.name,
                                  correctionAi: test.description,
                                  maxPoints: 10, // Default value
                                })) || [],
                              data: {
                                language: selectedAssignment.language,
                              },
                            }

                            // Update the exam
                            const result = await updateExam(selectedAssignment.id, examData as never)

                            if (result.success) {
                              // Update local state with the updated assignment
                              setAssignments(
                                assignments.map((a) =>
                                  a.id === selectedAssignment.id
                                    ? { ...selectedAssignment, date: selectedAssignment.date }
                                    : a,
                                ),
                              )
                              showToast("Succès", "L'évaluation a été mise à jour avec succès.", "success")
                              setEditMode(false)
                            } else {
                              showToast(
                                "Erreur",
                                "Une erreur est survenue lors de la mise à jour de l'évaluation.",
                                "error",
                              )
                            }
                          }}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full sm:w-auto"
                          onClick={async () => {
                            if (confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?")) {
                              const result = await deleteExam(selectedAssignment.id)

                              if (result.success) {
                                // Remove from local state
                                setAssignments(assignments.filter((a) => a.id !== selectedAssignment.id))
                                showToast("Succès", "L'évaluation a été supprimée avec succès.", "success")
                                setIsSheetOpen(false)
                              } else {
                                showToast(
                                  "Erreur",
                                  "Une erreur est survenue lors de la suppression de l'évaluation.",
                                  "error",
                                )
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                        <Button variant="outline" className="w-full sm:w-auto" onClick={() => setEditMode(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href={`/exams/${selectedAssignment.id}`}>
                          <Button variant="default" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                            <Play className="h-4 w-4 mr-2" />
                            Commencer le devoir
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full sm:w-auto" onClick={() => setEditMode(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                        <SheetClose asChild>
                          <Button variant="outline" className="w-full sm:w-auto">
                            <X className="h-4 w-4 mr-2" />
                            Fermer
                          </Button>
                        </SheetClose>
                      </>
                    )}
                  </SheetFooter>
                </div>
              </ScrollArea>
            )}
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}

