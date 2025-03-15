'use server'

import { revalidatePath } from 'next/cache'
import { Exam, Question } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type ExamDTO = Exam & {
  questions: Question[]
}

export async function createExam(data: ExamDTO, userId: string) {
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

export async function updateExam(examId: string, data: ExamDTO) {
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
        endDate: data.endDate,
        startDate: data.startDate,
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