'use server'

import { revalidatePath } from 'next/cache'
import {ExamType, ParticipantStatus} from '@prisma/client'
import {prisma} from '@/lib/prisma'


interface ExamData {
  title: string
  description?: string
  type: ExamType
  filePath: string
  format: string
  maxAttempts?: number
  enDate?: Date
  startDate?: Date
  questions: {
    text: string
    correctionAi: string
    maxPoints: number
  }[]
}

export async function createExam(data: ExamData, userId: string) {
  try {
    const exam = await prisma.exam.create({
      data: {
        ...data,
        createdById: userId,
        questions: {
          create: data.questions
        }
      },
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
    const exam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        filePath: data.filePath,
        format: data.format,
        maxAttempts: data.maxAttempts,
        endDate: data.enDate,
        startDate:data.startDate,
        questions: data.questions ? {
          deleteMany: {},
          create: data.questions
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
    return { success: false, error: 'Failed to update exam' }
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