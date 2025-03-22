'use server'

import { prisma } from "@/lib/prisma"
import { ParticipationStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

interface JoinExamResponse {
    success: boolean
    data?: { id: string; examId: string; userId: string; status: ParticipationStatus; joinedAt: Date | null }
    error?: string
}

export async function joinExam(examId: string, userId: string): Promise<JoinExamResponse> {
    try {
        if (!examId || !userId) {
            return {
                success: false,
                error: "ID de l'examen ou de l'utilisateur manquant"
            }
        }

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            select: {
                id: true,
                endDate: true,
                status: true
            }
        })

        if (!exam) {
            return {
                success: false,
                error: "Examen non trouvé"
            }
        }

        const now = new Date()
        if (exam.endDate && new Date(exam.endDate) < now) {
            return {
                success: false,
                error: "L'examen est terminé"
            }
        }

        if (exam.status === "CLOSED") {
            return {
                success: false,
                error: "L'examen est fermé"
            }
        }

        const existingParticipant = await prisma.examParticipation.findUnique({
            where: {
                examId_userId: {
                    examId,
                    userId,
                },
            },
        })

        if (existingParticipant) {
            if (existingParticipant.status === ParticipationStatus.ACCEPTED ||
                existingParticipant.status === ParticipationStatus.COMPLETED) {
                return {
                    success: false,
                    error: "Vous participez déjà à cet examen"
                }
            }

            const updatedParticipant = await prisma.examParticipation.update({
                where: {
                    examId_userId: {
                        examId,
                        userId,
                    },
                },
                data: {
                    status: ParticipationStatus.ACCEPTED,
                    joinedAt: new Date(),
                },
            })

            revalidatePath('/[locale]/exams')
            return {
                success: true,
                data: updatedParticipant
            }
        }

        const newParticipant = await prisma.examParticipation.create({
            data: {
                examId,
                userId,
                status: ParticipationStatus.ACCEPTED,
                joinedAt: new Date(),
            },
        })

        revalidatePath('/[locale]/exams')
        return {
            success: true,
            data: newParticipant
        }
    } catch (error) {
        console.error("[EXAM_JOIN_ERROR]", error instanceof Error ? error.message : error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la tentative de rejoindre l'examen"
        }
    }
}
