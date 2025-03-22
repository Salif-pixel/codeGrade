import { Exam, ExamStatus, ParticipationStatus, Question, SubmissionStatus, User } from "@prisma/client";

export interface Assignment extends Exam {
    questions: Question[];
    participants: {
        id: string;
        userId: string;
        status: ParticipationStatus;
        joinedAt: Date;
        user: User;
    }[];
    submissions: {
        id: string;
        createdAt: Date;
        studentId: string;
        student: User;
        correction: {
            id: string;
            finalScore: number;
        } | null;
        status: SubmissionStatus;
    }[];
    creator: User;
    inviteLink: string;
    status: ExamStatus;
    submissionStats: {
        total: number;
        pending: number;
        corrected: number;
        revised: number;
    };
    totalStudents: number;
}

export interface AssignmentListProps {
    assignments: Assignment[]
    onViewDetails: (id: string) => void
    onCopyInviteLink: (link: string) => void
    user: User
}

export interface AssignmentDetailsProps {
    assignment: Assignment
    onBack: () => void
    onCopyInviteLink: (link: string) => void
}

type QuestionDto = {
    id: string
    text: string
    maxPoints: number
    choices?: string[]
    programmingLanguage: "javascript" | "python" | "java" | "cpp" | "csharp"
    studentAnswer?: string[]
}

export interface ExamData {
    id: string
    title: string
    description: string | null
    type: string
    examDocumentPath: string | null
    teacherCorrectionPath: string | null
    questions: QuestionDto[]
    timeRemaining: number | null
    maxAttempts: number
    currentAttempt: number
}
