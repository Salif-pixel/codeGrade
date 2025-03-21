import {ExamType} from "@prisma/client";

export interface QuestionData {
    id?: string
    text: string
    maxPoints: number
    choices: string[]
    answer?: string
    programmingLanguage?: string
    correctAnswer?: string[]
    explanation?: string
    feedbackCorrect?: string
    feedbackIncorrect?: string
}

export interface ExamData {
    title: string
    description?: string
    type?: ExamType
    startDate?: string
    endDate?: string
    filePath?: string
    questions?: QuestionData[]
}
