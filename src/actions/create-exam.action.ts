"use server"

import {revalidatePath} from "next/cache";
import {ExamData, QuestionData} from "@/actions/datatype";
import {prisma} from "@/lib/prisma";
import {ExamStatus, ExamType} from "@prisma/client";

export async function createQcmExam(examData: ExamData, userId: string) {
    const generateInviteCode: () => string = () => {
        return userId
    }
    try {
        const exam = await prisma.exam.create({
            data: {
                title: examData.title,
                description: examData.description,
                type: examData.type as ExamType,
                startDate: examData.startDate,
                endDate: examData.endDate,
                inviteCode: generateInviteCode(),
                inviteExpiry: examData.endDate,
                status: ExamStatus.PUBLISHED,
                creator: {connect: {id: userId}},
                questions: {
                    create: examData.questions?.map((q : QuestionData) => {
                        return {
                            text: q.text,
                            maxPoints : q.maxPoints,
                            choices: q.choices,
                            correctAnswer: q.correctAnswer ?? [],
                            explanation: q.explanation,
                            feedbackCorrect: q.feedbackCorrect,
                            feedbackIncorrect: q.feedbackIncorrect,
                        }
                    })
                }
            }
        });

        revalidatePath('/[locale]/(dashboard)/exams')
        return {success: true, data: exam}
    } catch (error) {
        console.error('Error creating exam:', error)
        return {success: false, error: 'Failed to create exam'}
    }
}
