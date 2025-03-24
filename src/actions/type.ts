import {ExamType} from "@prisma/client";

export interface QuestionData {
    id?: string
    text: string
    maxPoints: number
    choices?: string[]
    answer?: string
    programmingLanguage?: string
    correctAnswer?: string[]
    explanation?: string
    feedbackCorrect?: string
    feedbackIncorrect?: string
    testCases?: {
        input: string,
        expectedOutput: string
    }[];
}

export interface ExamData {
    title: string
    description?: string
    type?: ExamType
    startDate?: string
    endDate?: string
    filePath?: string
    questions?: QuestionData[]
    examDocumentPath?: string
    teacherCorrectionPath?: string
    aiCorrection?: string
}

export type CodeSubmission = {
    questionId: string;
    code: string;
    programmingLanguage: string;
};

export type QcmSubmission = {
    questionId: string;
    answers: string[];
};

export type DocumentSubmission = {
    documentPath: string;
    examText?: string;
};

export type DocumentCorrectionReport = {
    summary: string;
    detailedFeedback: string;
    score: number;
    improvements: Array<{
        section: string;
        suggestion: string;
        severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
    }>;
    mermaidDiagram: string;
};
