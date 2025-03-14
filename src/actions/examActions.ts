'use server'

import { revalidatePath } from 'next/cache'
import { ExamType } from '@prisma/client'
import {prisma} from '@/lib/prisma'

interface ExamData {
  title: string
  description?: string
  type: ExamType
  filePath: string
  format: string
  maxAttempts?: number
  deadline?: Date
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

export async function updateExam(examId: string, data: Partial<ExamData>) {
  try {
    const exam = await prisma.exam.update({
      where: { id: examId },
      data: {
        ...data,
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