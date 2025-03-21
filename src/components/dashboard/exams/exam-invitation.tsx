"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Exam, User } from "@prisma/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { joinExam } from "@/actions/examActions"
import { useCustomToast } from "@/components/utilities/alert/alert"
import {useLocale} from "next-intl";

interface TeacherInfo {
  name: string
  email: string
}

interface ExamInvitationProps {
  exam: Exam
  user: User
  teacher: TeacherInfo
}

export default function ExamInvitation({ exam, user, teacher }: ExamInvitationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useCustomToast()
const local = useLocale();
  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const result = await joinExam(exam.id,user.id)

      if (result.success) {
        showToast(
          "Succès",
          "Vous avez rejoint l'examen avec succès",
          "success"
        )
        router.push(`/${local}/exams/${exam.id}`)
      } else {
        showToast(
          "Erreur",
          result.error || "Une erreur est survenue",
          "error"
        )
      }
    } catch (error) {
      console.error("Error joining exam:", error)
      showToast(
        "Erreur",
        "Une erreur est survenue lors de la tentative de rejoindre l'examen",
        "error"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = () => {
    router.back()
    showToast(
      "Information",
      "Vous avez refusé l'invitation à l'examen",
      "info"
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Invitation à l&apos;examen</CardTitle>
          <CardDescription>
            Vous avez été invité par {teacher.name} ({teacher.email}) à participer à cet examen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Titre</h3>
              <p>{exam.title}</p>
            </div>
            <div>
              <h3 className="font-medium">Description</h3>
              <p>{exam.description}</p>
            </div>
            <div>
              <h3 className="font-medium">Type</h3>
              <p>{exam.type}</p>
            </div>
            <div>
              <h3 className="font-medium">Durée</h3>
              <p>
                {exam.startDate && exam.endDate
                  ? `${Math.round(
                      (new Date(exam.endDate).getTime() -
                        new Date(exam.startDate).getTime()) /
                        (1000 * 60)
                    )} minutes`
                  : "Non définie"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Enseignant</h3>
              <p>{teacher.name}</p>
            </div>
            <div>
              <h3 className="font-medium">Date de début</h3>
              <p>
                {exam.startDate
                  ? new Date(exam.startDate).toLocaleDateString()
                  : "Non définie"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Date de fin</h3>
              <p>
                {exam.endDate
                  ? new Date(exam.endDate).toLocaleDateString()
                  : "Non définie"}
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleDecline}>
                Refuser
              </Button>
              <Button onClick={handleAccept} disabled={isLoading}>
                {isLoading ? "Chargement..." : "Accepter"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
