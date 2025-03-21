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
