import { prisma } from "@/lib/prisma";

export const get_user = async (id: string | "") => {
    return await prisma.user.findFirst({
        where: { id },
        include: { accounts: true, sessions: true, participations: true, submissions: true }
    });
};

export const get_users = async () => {
    return await prisma.user.findMany({
        include: { accounts: true, sessions: true, participations: true, submissions: true }
    });
};

export const getExistingSession = async (token: string) => {
    return await prisma.session.findFirst({
        where: { token: token ?? "" }
    });
};

export const getExams = async () => {
    return await prisma.exam.findMany({
        include: {
            questions: true,
            participants: { include: { user: true } },
            submissions: {
                include: {
                    student: true,
                    correction: true
                }
            },
            creator: true
        }
    });
};
export const getExamTeacher = async (teacherId:string) => {
    return await prisma.exam.findMany({
        where: { creatorId: teacherId },
        include: {
            questions: true,
            participants: { include: { user: true } },
            submissions: {
                include: {
                    student: true,
                    correction: true
                }
            },
            creator: true
        }
    });
};
export const getTeacherDashboardData = async (userId: string) => {
    const exams = await prisma.exam.findMany({
        where: { creatorId: userId },
        include: {
            participants: { include: { user: true } },
            submissions: { include: { correction: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    const totalExams = exams.length;
    const examsInProgress = exams.filter(exam => exam.status === 'PUBLISHED').length;
    const gradedExams = exams.filter(exam =>
        exam.submissions.every(sub => sub.correction !== null) && exam.submissions.length > 0
    ).length;

    const allGrades = exams.flatMap(exam =>
        exam.submissions.map(sub => sub.correction?.finalScore ?? 0)
    );
    const averageScore = allGrades.length > 0
        ? Math.round((allGrades.reduce((a, b) => a + b, 0) / allGrades.length) * 100) / 100
        : 0;

    return {
        metrics: { totalExams, examsInProgress, gradedExams, averageScore },
        recentExams: exams.slice(0, 5).map(exam => ({
            id: exam.id,
            title: exam.title,
            type: exam.type,
            deadline: exam.endDate,
            status: exam.status
        }))
    };
};

export const getStudentDashboardData = async (userId: string) => {
    const participations = await prisma.examParticipation.findMany({
        where: { userId },
        include: {
            exam: {
                include: {
                    submissions: {
                        where: { studentId: userId },
                        include: { correction: true }
                    }
                }
            }
        },
        orderBy: { joinedAt: 'desc' }
    });

    const completedExams = participations.filter(p => p.status === 'COMPLETED').length;
    const pendingExams = participations.filter(p => p.status === 'PENDING' || p.status === 'ACCEPTED').length;

    const grades = participations
        .flatMap(p => p.exam.submissions)
        .filter(sub => sub.correction)
        .map(sub => sub.correction?.finalScore ?? 0);

    const averageScore = grades.length > 0
        ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 100) / 100
        : 0;

    const nextDeadline = participations
        .filter(p => p.exam.endDate && p.exam.endDate > new Date())
        .sort((a, b) => (a.exam.endDate?.getTime() ?? 0) - (b.exam.endDate?.getTime() ?? 0))[0]?.exam;

    return {
        metrics: {
            completedExams,
            pendingExams,
            averageScore,
            nextDeadline: nextDeadline ? {
                date: nextDeadline.endDate,
                title: nextDeadline.title
            } : null
        },
        upcomingExams: participations
            .filter(p => p.status !== 'COMPLETED' && p.exam.status !== 'CLOSED')
            .slice(0, 5)
            .map(p => ({
                id: p.exam.id,
                title: p.exam.title,
                type: p.exam.type,
                deadline: p.exam.endDate,
                attemptsLeft: `${p.exam.submissions.length}/1`
            }))
    };
};
