'use server'

import { revalidatePath } from 'next/cache'
import {ExamType, ParticipantStatus} from '@prisma/client'
import {prisma} from '@/lib/prisma'

interface QuestionData {
  text: string
  maxPoints: number
  choices: string[]
  programmingLanguage?: string
}

interface ExamData {
  title: string
  description?: string
  type: ExamType
  filePath?: string
  format?: string
  maxAttempts?: number
  endDate?: Date
  startDate?: Date
  questions?: QuestionData[]
}

export async function createExam(data: ExamData, userId: string) {
  try {
    // Validation des données selon le type d'examen
    if (data.type === 'DOCUMENT') {
      if (!data.filePath || data.questions?.length) {
        return { 
          success: false, 
          error: 'Un devoir de type DOCUMENT nécessite un fichier et ne doit pas avoir de questions' 
        }
      }
    } else {
      if (data.filePath || !data.questions?.length) {
        return { 
          success: false, 
          error: 'Les devoirs de type QCM ou CODE nécessitent des questions et ne doivent pas avoir de fichier' 
        }
      }
    }

    // Validation spécifique pour QCM
    if (data.type === 'QCM' && data.questions) {
      const invalidQuestions = data.questions.some(q => !q.choices?.length)
      if (invalidQuestions) {
        return {
          success: false,
          error: 'Les questions QCM doivent avoir des choix'
        }
      }
    }

    // Validation spécifique pour CODE
    if (data.type === 'CODE' && data.questions) {
      const invalidQuestions = data.questions.some(q => !q.programmingLanguage)
      if (invalidQuestions) {
        return {
          success: false,
          error: 'Les questions de code doivent spécifier un langage de programmation'
        }
      }
    }

    // Préparation des données pour la création
    const examData = {
      title: data.title,
      description: data.description || '',
      type: data.type,
      filePath: data.filePath || '',
      format: data.format || data.type.toString(),
      maxAttempts: data.maxAttempts || 1,
      startDate: data.startDate,
      endDate: data.endDate,
      createdById: userId,
      questions: data.questions ? {
        create: data.questions.map(q => ({
          text: q.text,
          maxPoints: q.maxPoints,
          choices: q.choices || [],
          programmingLanguage: q.programmingLanguage || null
        }))
      } : undefined
    }

    const exam = await prisma.exam.create({
      data: examData,
      include: {
        questions: true
      }
    })

    revalidatePath('/[locale]/(dashboard)/exams')
    return { success: true, data: exam }
  } catch (error) {
    console.error('Error creating exam:', error)
    return { success: false, error: 'Failed to create exam' }
  }
}

export async function updateExam(examId: string, data: ExamData) {
  try {
    // Vérifier si l'examen existe et n'a pas commencé
    const existingExam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true }
    })

    if (!existingExam) {
      return { success: false, error: 'Examen non trouvé' }
    }

    // Vérifier que l'examen n'a pas encore commencé
    const now = new Date()
    if (existingExam.startDate && existingExam.startDate < now) {
      return { success: false, error: 'Impossible de modifier un examen qui a déjà commencé' }
    }

    if (existingExam.status !== 'PENDING') {
      return { success: false, error: 'Impossible de modifier un examen qui n\'est plus en attente' }
    }

    // Vérifier qu'on ne modifie pas le type d'examen
    if (data.type && data.type !== existingExam.type) {
      return { success: false, error: 'Impossible de modifier le type d\'examen' }
    }

    // Vérifier qu'on ne modifie pas le contenu des questions (sauf le barème)
    if (data.questions) {
      const hasInvalidModifications = data.questions.some((newQ, index) => {
        const existingQ = existingExam.questions[index]
        return (
          newQ.text !== existingQ.text ||
          JSON.stringify(newQ.choices) !== JSON.stringify(existingQ.choices) ||
          newQ.programmingLanguage !== existingQ.programmingLanguage
        )
      })

      if (hasInvalidModifications) {
        return { success: false, error: 'Seul le barème des questions peut être modifié' }
      }
    }

    // Seules les métadonnées peuvent être modifiées
    const exam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title: data.title,
        description: data.description,
        maxAttempts: data.maxAttempts,
        startDate: data.startDate,
        endDate: data.endDate,
        questions: data.questions ? {
          update: data.questions.map((q, index) => ({
            where: { id: existingExam.questions[index].id },
            data: { maxPoints: q.maxPoints }
          }))
        } : undefined
      },
      include: {
        questions: true
      }
    })

    revalidatePath('/[locale]/(dashboard)/exams')
    return { success: true, data: exam }
  } catch (error) {
    console.error('Error updating exam:', error)
    return { success: false, error: 'Échec de la mise à jour de l\'examen' }
  }
}

export async function deleteExam(examId: string) {
  try {
    await prisma.exam.delete({
      where: { id: examId }
    })

    revalidatePath('/[locale]/(dashboard)/exams')
    return { success: true }
  } catch (error) {
    console.error('Error deleting exam:', error)
    return { success: false, error: 'Failed to delete exam' }
  }
}

export async function getExam(examId: string) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true
      }
    })

    return { success: true, data: exam }
  } catch (error) {
    console.error('Error fetching exam:', error)
    return { success: false, error: 'Failed to fetch exam' }
  }
}

export async function getExams(userId: string) {
  try {
    const exams = await prisma.exam.findMany({
      where: { createdById: userId },
      include: {
        questions: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        answers: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            grade: {
              select: {
                finalScore: true,
              }
            }
          }
        }
      }
    })

    return { success: true, data: exams }
  } catch (error) {
    console.error('Error fetching exams:', error)
    return { success: false, error: 'Failed to fetch exams' }
  }
}

export async function joinExam(examId: string,userId: string) {
  try {

    // Vérifier si l'utilisateur n'est pas déjà participant
    const existingParticipant = await prisma.examParticipant.findUnique({
      where: {
        examId_userId: {
          examId: examId,
          userId: userId,
        },
      },
    })

    if (existingParticipant) {
      return { success: false, error: "Déjà participant à cet examen" }
    }

    const examParticipant = await prisma.examParticipant.create({
      data: {
        examId: examId,
        userId: userId,
        status: ParticipantStatus.ACCEPTED,
      },
    })

    revalidatePath('/[locale]/exams')
    return { success: true, data: examParticipant }
  } catch (error) {
    console.error("[EXAM_JOIN]", error)
    return { success: false, error: "Une erreur est survenue" }
  }
}

export async function updateParticipantStatus(participantId: string, status: ParticipantStatus) {
  try {
    // First find the participant to get their examId
    const existingParticipant = await prisma.examParticipant.findFirst({
      where: { userId: participantId }
    });

    if (!existingParticipant) {
      return { success: false, error: 'Participant not found' };
    }

    // Now update with both userId and examId
    const participant = await prisma.examParticipant.update({
      where: {
        examId_userId: {
          examId: existingParticipant.examId,
          userId: participantId
        }
      },
      data: { status }
    });

    revalidatePath('/[locale]/(dashboard)/exams');
    return { success: true, data: participant };
  } catch (error) {
    console.error('Error updating participant status:', error);
    return { success: false, error: 'Failed to update participant status' };
  }
}