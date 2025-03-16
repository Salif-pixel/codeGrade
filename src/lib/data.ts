import {prisma} from "@/lib/prisma";

export const get_user = async (id: string | "") => {
    const user = await prisma.user.findFirst({
        where: {
            id
        },
        include: {
            accounts: true,
        }
    });
    return user;
}
export const get_users = async ()=>{
    const users = await prisma.user.findMany({
        include: {
            accounts: true,
        }
    });
    return users;
};

export const getExistingSession = async (token: string) => {
    const session = await prisma.session.findFirst({
        where: {
            token: token ?? "",
        },
    });
    return session;
};

export const getExams = async () => {
    const exams = await prisma.exam.findMany({
        include: {
            questions: true,
            participants: {
                include: {
                    user: true
                }
            },
            answers: {
                include: {
                    student: true,
                    grade: true,
                    corrections: true
                }
            },
            createdBy: true
        }
    });
    return exams;
};

export const getTeacherDashboardData = async (userId: string) => {
    const exams = await prisma.exam.findMany({
        where: {
            createdById: userId
        },
        include: {
            participants: {
                include: {
                    user: true
                }
            },
            answers: {
                include: {
                    grade: true,
                    corrections: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const totalExams = exams.length;
    const examsInProgress = exams.filter(exam => exam.status === 'ACTIVE').length;
    const gradedExams = exams.filter(exam => 
        exam.answers.every(answer => answer.grade !== null)
    ).length;

    const allGrades = exams.flatMap(exam => 
        exam.answers.filter(answer => answer.grade).map(answer => answer.grade?.finalScore ?? 0)
    );
    const averageScore = allGrades.length > 0 
        ? Math.round((allGrades.reduce((a, b) => a + b, 0) / allGrades.length) * 100) / 100
        : 0;

    return {
        metrics: {
            totalExams,
            examsInProgress,
            gradedExams,
            averageScore
        },
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
    const participations = await prisma.examParticipant.findMany({
        where: {
            userId: userId
        },
        include: {
            exam: {
                include: {
                    answers: {
                        where: {
                            studentId: userId
                        },
                        include: {
                            grade: true
                        }
                    }
                }
            }
        },
        orderBy: {
            joinedAt: 'desc'
        }
    });

    const completedExams = participations.filter(p => p.status === 'COMPLETED').length;
    const pendingExams = participations.filter(p => p.status === 'PENDING' || p.status === 'ACCEPTED').length;

    const grades = participations
        .flatMap(p => p.exam.answers)
        .filter(answer => answer.grade)
        .map(answer => answer.grade?.finalScore ?? 0);

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
            .filter(p => p.status !== 'COMPLETED' && p.exam.status !== 'COMPLETED')
            .slice(0, 5)
            .map(p => ({
                id: p.exam.id,
                title: p.exam.title,
                type: p.exam.type,
                deadline: p.exam.endDate,
                attemptsLeft: `${p.exam.answers.length}/${p.exam.maxAttempts}`
            }))
    };
};