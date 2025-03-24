"use server"

import { prisma } from "@/lib/prisma";
import {  ParticipationStatus } from "@prisma/client";
import {
    evaluateCodeSubmission,
    generateDocumentCorrection
} from "@/actions/ai-integration.action";
import {
    CodeSubmission,
    DocumentSubmission,
    QcmSubmission
} from "@/actions/type"
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {fetchContent} from "@/actions/utils.action";

async function validateParticipation(examId: string, userId: string) {
    const exam = await prisma.exam.findUnique({
        where: { id: examId, status: 'PUBLISHED' },
        include: { participants: true }
    });

    if (!exam) throw new Error("Examen non trouvé ou non publié");
    if (exam.startDate && new Date() < exam.startDate) throw new Error("Examen non commencé");
    if (exam.endDate && new Date() > exam.endDate) throw new Error("Examen terminé");

    const participation = exam.participants.find(p => p.userId === userId);
    if (!participation || participation.status !== 'ACCEPTED') {
        throw new Error("Participation non autorisée");
    }

    return { exam, participation };
}

export async function handleQcmSubmission(
    examId: string,
    userId: string,
    answers: QcmSubmission[]
) {
    try {
        const { participation } = await validateParticipation(examId, userId);

        // Vérification des tentatives
        const attemptNumber = await prisma.submission.count({
            where: { examId, studentId: userId }
        });

        if(attemptNumber > 0){
            return {
                success: false,
                error: new Error("can't submit twice !")
            }
        }

        // Calcul du score
        const questions = await prisma.question.findMany({
            where: { examId },
            select: { id: true, correctAnswer: true, maxPoints: true }
        });

        let totalScore = 0;
        const answerResults = answers.map(answer => {
            const question = questions.find(q => q.id === answer.questionId);
            const isCorrect = question?.correctAnswer.every(ca =>
                answer.answers.includes(ca)
            ) ?? false;

            if (isCorrect) totalScore += question?.maxPoints || 0;

            return {
                questionId: answer.questionId,
                content: answer.answers.join(','),
                isCorrect
            };
        });

        // Transaction Prisma
        const [submission] = await prisma.$transaction([
            prisma.submission.create({
                data: {
                    attemptNumber,
                    status: 'CORRECTED',
                    studentId: userId,
                    examId,
                    answers: {
                        create: answerResults.map(a => ({
                            content: a.content,
                            questionId: a.questionId
                        }))
                    },
                    correction: {
                        create: {
                            aiFeedback: "Correction automatique QCM",
                            autoScore: totalScore,
                            finalScore: totalScore,
                            examId
                        }
                    }
                }
            }),
            prisma.examParticipation.update({
                where: { id: participation.id },
                data: { status: 'COMPLETED' }
            })
        ]);

        return { success: true, data: submission };

    } catch (error) {
        console.error('Erreur soumission QCM:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Erreur' };
    }
}

export async function handleCodeSubmission(
    examId: string,
    userId: string,
    submissions: CodeSubmission[]
) {
    try {
        await validateParticipation(examId, userId);

        // Récupération des tests
        const questions = await prisma.question.findMany({
            where: { examId },
            select: { id: true, testCases: true, maxPoints: true, programmingLanguage: true }
        });

        // Évaluation IA
        const aiEvaluation = await evaluateCodeSubmission(
            submissions,
            questions.map(q => ({
                ...q,
                programmingLanguage: q.programmingLanguage ?? "",
                testCases: q.testCases.map(tc => {
                    const [input, output] = tc.split('=>');
                    return { input, expectedOutput: output };
                })
            }))
        );

        if(!aiEvaluation.success){
            return {
                success: false,
                error: new Error("can't submit code !")
            }
        }

        const aiData = aiEvaluation.data

        // Création de la soumission
        const [submission] = await prisma.$transaction([
            prisma.submission.create({
                data: {
                    status: 'CORRECTED',
                    studentId: userId,
                    examId,
                    answers: {
                        create: submissions.map(s => ({
                            content: s.code,
                            questionId: s.questionId
                        }))
                    },
                    correction: {
                        create: {
                            aiFeedback: aiData.feedback,
                            autoScore: aiData.score,
                            finalScore: aiData.score,
                            improvement: aiData.suggestions,
                            examId
                        }
                    }
                }
            }),
            prisma.examParticipation.update({
                where: { examId_userId: { examId, userId } },
                data: { status: ParticipationStatus.COMPLETED }
            })
        ]);

        return { success: true, data: submission };

    } catch (error) {
        console.error('Erreur soumission Code:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Erreur' };
    }
}

export async function handleDocumentSubmission(
    examId: string,
    userId: string,
    document: DocumentSubmission
) {
    try {
        const { exam } = await validateParticipation(examId, userId);

        const examDocumentContent = await fetchContent(exam.examDocumentPath as string);
        const aiCorrection = exam.aiCorrection ?? "correction automatique";

        const correctionReport = await generateDocumentCorrection(
            examDocumentContent,
            document.examText!,
            aiCorrection
        );

        // Création de la soumission
        const [submission] = await prisma.$transaction([
            prisma.submission.create({
                data: {
                    status: 'CORRECTED',
                    studentId: userId,
                    examId,
                    documentPath: document.documentPath,
                    correction: {
                        create: {
                            aiFeedback: correctionReport.detailedFeedback,
                            autoScore: correctionReport.score,
                            finalScore: correctionReport.score,
                            improvement: JSON.stringify(correctionReport.improvements),
                            evaluation: correctionReport.mermaidDiagram,
                            examId
                        }
                    }
                }
            }),
            prisma.examParticipation.update({
                where: { examId_userId: { examId, userId } },
                data: { status: ParticipationStatus.COMPLETED }
            })
        ]);

        return {
            success: true,
            data: {
                ...submission,
                report: {
                    summary: correctionReport.summary,
                    mermaid: correctionReport.mermaidDiagram
                }
            }
        };

    } catch (error) {
        console.error('Erreur soumission Document:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur'
        };
    }
}

export async function getExamsForUser() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            return { success: false, error: 'Utilisateur non authentifié' };
        }

        const userId = session.user.id;

        // Récupérer les examens créés par l'utilisateur (si professeur)
        // et les examens auxquels l'utilisateur participe (si étudiant)
        const exams = await prisma.exam.findMany({
            where: {
                OR: [
                    { creatorId: userId },
                    { participants: { some: { userId } } }
                ]
            },
            include: {
                questions: true,
                participants: {
                    where: { userId },
                    select: { status: true }
                }
            },
            orderBy: { startDate: 'asc' }
        });

        return { success: true, data: exams };
    } catch (error) {
        console.error('Error fetching user exams:', error);
        return { success: false, error: 'Failed to fetch exams' };
    }
}
