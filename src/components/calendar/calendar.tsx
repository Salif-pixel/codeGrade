"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from "date-fns"
import { fr } from "date-fns/locale"
import { Plus, Lock, Unlock, ChevronLeft, ChevronRight, Calendar, CalendarDays, CodeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import AssignmentModal from "./assignment-modal"
import AssignmentDetailModal from "./assignment-detail-modal"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCustomToast } from "@/components/alert/alert"
import { createExam, updateExam, deleteExam } from "@/actions/examActions"
import {Exam, User,Question} from "@prisma/client"
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
  deadline?: Date | string
  submissionType?: string
  language?: string
  tests?: { name: string; description: string }[]
}

export default function CalendarView({user, initialExams}:{user:User, initialExams: (Exam & {questions: Question[]})[]}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekDays, setWeekDays] = useState<Date[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [editMode, setEditMode] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ day: number; hour: number } | null>(null)
  const [blinkInterval, setBlinkInterval] = useState<NodeJS.Timeout | null>(null)
  const [isButtonVisible, setIsButtonVisible] = useState(true)
  const [view, setView] = useState<CalendarView>("week")

  // Référence pour le conteneur du calendrier
  const calendarRef = useRef<HTMLDivElement>(null)

  // Media queries pour la responsivité
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isTablet = useMediaQuery("(min-width: 768px)")
  const { showToast } = useCustomToast()

  // Heures de la journée (de 7h à 18h)
  const hours = Array.from({ length: 12 }, (_, i) => i + 7)

  // Effet pour charger les exams existants au démarrage
  useEffect(() => {
    // Ici, vous pourriez ajouter une fonction pour charger les examens existants
    // Par exemple : fetchExams().then(data => setAssignments(data))
  }, [])

  // Effect to initialize assignments with provided exams
  useEffect(() => {
    if (initialExams.length > 0) {
      const formattedAssignments = initialExams.map(exam => ({
        id: exam.id,
        title: exam.title,
        description: exam.description ?? "",
        type: exam.type,
        date: new Date(exam.deadline || ""),
        duration: 1, // Default duration
        maxAttempts: exam.maxAttempts,
        format: exam.format,
        submissionType: exam.format,
        tests: exam.questions?.map((q: any) => ({
          name: q.text,
          description: q.correctionAi
        })) || []
      }))
      setAssignments(formattedAssignments)
    }
  }, [initialExams])

  // Définir la vue par défaut en fonction de la taille de l'écran
  useEffect(() => {
    if (!isTablet) {
      setView("day")
    } else if (!isDesktop) {
      setView("week")
    }
  }, [isDesktop, isTablet])

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

  // Fonction pour mapper le type d'examen au type de l'enum Prisma
  const mapSubmissionTypeToExamType = (submissionType?: string): ExamType => {
    switch (submissionType?.toLowerCase()) {
      case 'qcm':
        return "QCM"
      case 'code':
        return "CODE"
      default:
        return "DOCUMENT"
    }
  }

  // Fonction pour ajouter un devoir
  const addAssignment = async (assignment: Assignment) => {
    try {
      const examType = mapSubmissionTypeToExamType(assignment.submissionType)

      const examData = {
        title: assignment.title,
        description: assignment.description,
        type: examType,
        filePath: assignment.fileUrl || "",
        format: assignment.submissionType || "autre",
        maxAttempts: assignment.maxAttempts || 1,
        deadline: new Date(assignment.date),
        questions: assignment.tests?.map(test => ({
          text: test.name,
          correctionAi: test.description,
          maxPoints: 100
        })) || []
      }

      const result = await createExam(examData,user.id)
      if (result.success) {
        setAssignments([...assignments, { ...assignment, id: result.data?.id || "" }])
        setIsModalOpen(false)
        showToast("Succès", "L'examen a été créé avec succès.", "success")
      } else {
        showToast("Erreur", "Impossible de créer l'examen.", "error")
      }
    } catch {
      showToast("Erreur", "Une erreur est survenue lors de la création de l'examen.", "error")
    }
  }

  // Fonction pour mettre à jour un devoir
  const updateAssignment = async (updatedAssignment: Assignment) => {
    try {
      const examType = mapSubmissionTypeToExamType(updatedAssignment.submissionType)

      const examData = {
        title: updatedAssignment.title,
        description: updatedAssignment.description,
        type: examType,
        filePath: updatedAssignment.fileUrl || "",
        format: updatedAssignment.submissionType || "autre",
        maxAttempts: updatedAssignment.maxAttempts || 1,
        deadline: new Date(updatedAssignment.date),
        questions: updatedAssignment.tests?.map(test => ({
          text: test.name,
          correctionAi: test.description,
          maxPoints: 100
        })) || []
      }

      const result = await updateExam(updatedAssignment.id, examData)
      if (result.success) {
        setAssignments(assignments.map(a => a.id === updatedAssignment.id ? updatedAssignment : a))
        setIsDetailModalOpen(false)
        showToast("Succès", "L'examen a été mis à jour avec succès.", "success")
      } else {
        showToast("Erreur", "Impossible de mettre à jour l'examen.", "error")
      }
    } catch {
      showToast("Erreur", "Une erreur est survenue lors de la mise à jour de l'examen.", "error")
    }
  }

  // Fonction pour supprimer un devoir
  const deleteAssignment = async (id: string) => {
    try {
      const result = await deleteExam(id)
      if (result.success) {
        setAssignments(assignments.filter(a => a.id !== id))
        setIsDetailModalOpen(false)
        showToast("Succès", "L'examen a été supprimé avec succès.", "success")
      } else {
        showToast("Erreur", "Impossible de supprimer l'examen.", "error")
      }
    } catch {
      showToast("Erreur", "Une erreur est survenue lors de la suppression de l'examen.", "error")
    }
  }

  // Fonction pour ouvrir le modal avec le jour et l'heure sélectionnés
  const openModalWithDayAndTime = (day: Date, startHour: number, endHour: number) => {
    if (!editMode) return

    const selectedDate = new Date(day)
    selectedDate.setHours(startHour, 0, 0, 0)
    setSelectedDay(selectedDate)

    // Calculer la durée en heures
    const duration = endHour - startHour

    setIsModalOpen(true)
    // La durée sera passée au modal
    return { date: selectedDate, duration }
  }

  // Fonction pour ouvrir le modal de détail d'un devoir
  const openDetailModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsDetailModalOpen(true)
  }

  // Fonction pour vérifier si un devoir est à une heure donnée
  const getAssignmentsForHourAndDay = (hour: number, day: Date) => {
    return assignments.filter(
        (assignment) => {
          const assignDate = new Date(assignment.date)
          return isSameDay(assignDate, day) && assignDate.getHours() === hour
        }
    )
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

    // Vérifier que le drag est sur le même jour
    if (dragStart.day === dragEnd.day) {
      const startHour = Math.min(dragStart.hour, dragEnd.hour)

      const selectedDate = view === "day" ? currentDate : weekDays[dragStart.day]
      const date = new Date(selectedDate)
      date.setHours(startHour, 0, 0, 0)

      setSelectedDay(date)
      setIsModalOpen(true)
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

  // Fonction pour basculer le mode édition
  const toggleEditMode = () => {
    setEditMode(!editMode)
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

  // Fonction pour gérer le clic sur une cellule vide
  // Fonction pour gérer le clic sur une cellule vide
  const handleCellClick = (day: Date, hour: number) => {
    if (!editMode) return

    // Créer une date avec l'heure spécifiée
    const selectedDate = new Date(day)
    selectedDate.setHours(hour, 0, 0, 0)

    setSelectedDay(selectedDate)
    setIsModalOpen(true)
  }


  // Fonction pour obtenir la classe de couleur en fonction du type d'examen
  const getExamTypeColor = (examType: ExamType | undefined) => {
    switch (examType) {
      case 'QCM':
        return "bg-amber-100 text-amber-800 border-l-4 border-amber-500"
      case 'CODE':
        return "bg-indigo-100 text-indigo-800 border-l-4 border-indigo-500"
      case 'DOCUMENT':
      default:
        return "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
    }
  }

  return (
      <div className="flex flex-col">
        {/* Header avec titre, navigation et contrôles */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Titre et navigation */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateDate("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateDate("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="ml-3 text-lg font-semibold sm:text-xl">
              {view === "day"
                  ? format(currentDate, "EEEE d MMMM yyyy", { locale: fr })
                  : format(weekDays[0] || new Date(), "MMMM yyyy", { locale: fr })}
            </h2>
          </div>

          {/* Contrôles */}
          <div className="flex items-center justify-start md:justify-end">
            <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)} className="mr-2">
              <TabsList className="h-8">
                <TabsTrigger value="day" className="flex h-8 items-center px-2">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Jour</span>
                </TabsTrigger>
                <TabsTrigger value="week" className="flex h-8 items-center px-2">
                  <CalendarDays className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Semaine</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex space-x-2">
              {editMode && (
                  <Button size="sm" className="h-8" onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">Ajouter</span>
                  </Button>
              )}
              <Button
                  variant={editMode ? "default" : "outline"}
                  size="sm"
                  className="relative h-8"
                  onClick={toggleEditMode}
              >
                {editMode && (
                    <div
                        className={cn(
                            "absolute right-1 top-1 h-2 w-2 rounded-full bg-yellow-400",
                            !isButtonVisible && "opacity-0",
                        )}
                    />
                )}
                {editMode ? (
                    <>
                      <Unlock className="mr-1 h-4 w-4" />
                      <span className="hidden sm:inline">Édition</span>
                    </>
                ) : (
                    <>
                      <Lock className="mr-1 h-4 w-4" />
                      <span className="hidden sm:inline">Lecture</span>
                    </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Calendrier */}
        <div className="overflow-hidden rounded-lg border border-gray-200" ref={calendarRef}>
          {/* En-tête des jours */}
          <div
              className="grid border-b"
              style={{
                gridTemplateColumns: `60px repeat(${visibleDays.length}, 1fr)`,
                width: "100%",
              }}
          >
            <div className="border-r border-gray-200 p-2 text-center font-medium text-gray-500"></div>
            {visibleDays.map((day, index) => {
              const dayNumber = format(day, "d")
              const dayName = format(day, "EEE", { locale: fr })
              const isToday = isSameDay(day, new Date())

              return (
                  <div
                      key={index}
                      className={cn(
                          "border-r border-gray-200 p-2 text-center last:border-r-0",
                          isToday && "bg-purple-100",
                          editMode && "cursor-pointer",
                      )}
                      onClick={() => editMode && openModalWithDayAndTime(day, 8, 9)}
                  >
                    <div className="font-medium">{dayName}</div>
                    <div
                        className={cn(
                            "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full",
                            isToday && "bg-purple-600 text-white",
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
                    className="grid border-b border-gray-200 last:border-b-0"
                    style={{
                      gridTemplateColumns: `60px repeat(${visibleDays.length}, 1fr)`,
                      width: "100%",
                    }}
                >
                  <div className="border-r border-gray-200 p-2 text-right text-sm text-gray-500 min-w-[60px]">
                    {hour}:00
                  </div>
                  {visibleDays.map((day, dayIndex) => {
                    return (
                        <div
                            key={`${hour}-${dayIndex}`}
                            className={cn(
                                "relative h-[100px] border-r border-gray-200 last:border-r-0",
                                editMode && "cursor-pointer",
                                isInSelection(dayIndex, hour) && "bg-blue-100",
                            )}
                            onMouseDown={(e) => handleMouseDown(dayIndex, hour, e)}
                            onClick={() => handleCellClick(day, hour)}
                        >
                          {getAssignmentsForHourAndDay(hour, day).map((assignment, idx) => (
                              <div
                                  key={idx}
                                  className={cn(
                                      "assignment-item absolute left-0 right-0 z-10 m-1 overflow-hidden rounded p-2 text-sm cursor-pointer",
                                      getExamTypeColor(assignment.type as ExamType)
                                  )}
                                  style={{
                                    height: getAssignmentHeight(assignment.duration),
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openDetailModal(assignment)
                                  }}
                              >
                                <div className="font-medium">
                                  {typeof assignment.date === 'string'
                                      ? format(new Date(assignment.date), "HH:mm")
                                      : format(assignment.date, "HH:mm")}
                                </div>
                                <div className="font-bold">{assignment.title}</div>
                                <div className="text-xs">{assignment.description}</div>
                                {assignment.fileUrl && (
                                    <div className="mt-1 text-xs font-medium text-blue-600">Document joint</div>
                                )}
                                {assignment.submissionType === "code" && (
                                    <div className="mt-1 flex items-center text-xs font-medium text-indigo-600">
                                      <CodeIcon className="mr-1 h-3 w-3" />
                                      {assignment.language?.toUpperCase()}
                                    </div>
                                )}
                                {assignment.maxAttempts > 1 && (
                                    <div className="mt-1 text-xs text-gray-600">
                                      Max {assignment.maxAttempts} tentatives
                                    </div>
                                )}
                                {assignment.deadline && (
                                    <div className="mt-1 text-xs text-red-600">
                                      Deadline: {typeof assignment.deadline === 'string'
                                        ? format(new Date(assignment.deadline), "dd/MM/yyyy")
                                        : format(assignment.deadline, "dd/MM/yyyy")}
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

        {isModalOpen && (
            <AssignmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addAssignment}
                selectedDate={selectedDay}
                initialDuration={
                  dragStart && dragEnd && dragStart.day === dragEnd.day ? Math.abs(dragEnd.hour - dragStart.hour) + 1 : 1
                }
            />
        )}

        {isDetailModalOpen && selectedAssignment && (
            <AssignmentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                assignment={selectedAssignment}
                onUpdate={updateAssignment}
                onDelete={deleteAssignment}
                isEditMode={editMode}
            />
        )}
      </div>
  )
}