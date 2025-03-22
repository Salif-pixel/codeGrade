'use server'

import { revalidatePath } from 'next/cache'
import { ParticipantStatus, SubmissionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'


export async function updateParticipantStatus(participantId: string, status: ParticipantStatus) {
  try {
    // First find the participant to get their examId
    const existingParticipant = await prisma.examParticipant.findFirst({
      where: { userId: participantId }
    });

    if (!existingParticipant) {
      return { success: false, error: 'Participant not found' };
    }

    // Now update with both userId and examId
    const participant = await prisma.examParticipant.update({
      where: {
        examId_userId: {
          examId: existingParticipant.examId,
          userId: participantId
        }
      },
      data: { status }
    });

    revalidatePath('/[locale]/(dashboard)/exams');
    return { success: true, data: participant };
  } catch (error) {
    console.error('Error updating participant status:', error);
    return { success: false, error: 'Failed to update participant status' };
  }
}

export async function submitExamAnswers(
  examId: string,
  studentId: string,
  answers: { questionId: string; content: string }[],
  isSubmission: boolean,
) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true }
    });

    if (!exam) throw new Error("Exam not found");

    let totalScore = 0;
    const maxPossibleScore = exam.questions.reduce((sum, q) => sum + q.maxPoints, 0);
    const formattedAnswers = [];

    const normalizeString = (str: string) => {
      if (typeof str !== 'string') return '';
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
    };

    console.log(" ---------------- answers ----------------\n", answers,"\n------------------------------------");

    for (const answer of answers) {
      const question = exam.questions.find(q => q.id === answer.questionId);
      if (!question || !question.answer) continue;

      try {
        // Vérifier si content est déjà un objet et le parser de manière sécurisée
        let studentAnswer;
        console.log(" ---------------- answer ----------------\n", answer,"\n------------------------------------");

        try {
          studentAnswer = typeof answer.content === 'string'
            ? JSON.parse(answer.content)
            : answer.content;
        } catch (parseError) {
          console.error('Error parsing student answer:', parseError);
          studentAnswer = answer.content; // Utiliser la réponse brute si le parsing échoue
        }



        let correctAnswerData;
        try {
          correctAnswerData = JSON.parse(question.answer);
        } catch (parseError) {
          console.error('Error parsing correct answer:', parseError);
          continue;
        }

        if (question.programmingLanguage) {
          // Vérifier que nous avons bien le code et les résultats des tests
          if (!studentAnswer.code || !studentAnswer.testResults) {
            console.error('Missing code or test results in student answer');
            continue;
          }

          // Évaluation du code avec OpenRouter
          const prompt = `En tant qu'évaluateur de code, analyse ce code ${question.programmingLanguage} qui répond à la question: "${question.text}".

Code soumis:
${studentAnswer.code}

Résultats des tests:
${JSON.stringify(studentAnswer.testResults, null, 2)}

Retourne UNIQUEMENT un objet JSON sans formatage markdown, sans backticks \`\`\`, sans commentaires, dans ce format exact:
{
  "score": (nombre entre 0 et ${question.maxPoints}),
  "explanation": "Explication détaillée de l'évaluation",
  "feedback": "Suggestions d'amélioration",
  "codeQuality": "Analyse de la qualité du code"
}`;

          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
              model: "deepseek/deepseek-chat:free",
              messages: [{ role: 'user', content: prompt }],
              response_format: { type: "json_object" }
            })
          });

          const result = await response.json();
          console.log('OpenRouter response:', result);

          let evaluation;
          try {
            // Le contenu peut déjà être un objet JSON
            evaluation = typeof result.choices[0].message.content === 'string'
              ? JSON.parse(result.choices[0].message.content)
              : result.choices[0].message.content;
          } catch (error) {
            console.error('Failed to parse evaluation:', error);
            evaluation = {
              score: 0,
              explanation: "Erreur lors de l'évaluation",
              feedback: "Une erreur est survenue",
              codeQuality: "Non évalué"
            };
          }

          console.log('Parsed evaluation:', evaluation);

          formattedAnswers.push({
            questionId: answer.questionId,
            content: JSON.stringify({
              type: "code",
              code: studentAnswer.code,
              testResults: studentAnswer.testResults,
              evaluation: evaluation,
              maxPoints: question.maxPoints
            })
          });
          console.log('Code evaluation:', evaluation)

          totalScore += evaluation.score;
        } else {
          console.log("studentAnswer parsed:", studentAnswer);
          console.log("correctAnswer parsed:", correctAnswerData);
          let isCorrect = false;

          if (correctAnswerData.type === "single") {
            const studentAnswerText = typeof studentAnswer.correctAnswers === 'string'
              ? studentAnswer.correctAnswers
              : studentAnswer.correctAnswers[0];

            const correctAnswerText = Array.isArray(correctAnswerData.correctAnswers)
              ? correctAnswerData.correctAnswers[0]
              : correctAnswerData.correctAnswers;

            const normalizedStudentAnswer = normalizeString(studentAnswerText);
            const normalizedCorrectAnswer = normalizeString(correctAnswerText);

            isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
          } else {
            const normalizedStudentAnswers = new Set(
              studentAnswer.correctAnswers.map(normalizeString)
            );
            const normalizedCorrectAnswers = new Set(
              correctAnswerData.correctAnswers.map(normalizeString)
            );

            isCorrect = normalizedStudentAnswers.size === normalizedCorrectAnswers.size &&
              [...normalizedStudentAnswers].every(answer =>
                normalizedCorrectAnswers.has(answer)
              );
          }

          if (isCorrect) {
            totalScore += question.maxPoints;
          }

          formattedAnswers.push({
            questionId: answer.questionId,
            content: JSON.stringify({
              type: correctAnswerData.type,
              correctAnswers: studentAnswer.correctAnswers,
              isCorrect: isCorrect,
              score: isCorrect ? question.maxPoints : 0,
              maxPoints: question.maxPoints
            })
          });
        }
      } catch (error) {
        console.error('Error processing answer:', error);
        continue;
      }
    }

    // Créer la réponse
    const examAnswer = await prisma.answer.create({
      data: {
        filePath: "exam_submission",
        attemptNumber: 1,
        status: isSubmission ? SubmissionStatus.REVISED : SubmissionStatus.PENDING,
        student: { connect: { id: studentId } },
        exam: { connect: { id: examId } },
        questionAnswers: {
          create: formattedAnswers.map(answer => ({
            question: { connect: { id: answer.questionId } },
            content: answer.content
          }))
        }
      }
    });

    if (isSubmission) {
      await prisma.examParticipant.update({
        where: {
          examId_userId: {
            examId,
            userId: studentId
          }
        },
        data: {
          status: ParticipantStatus.COMPLETED
        }
      });

      const correction = await prisma.correction.create({
        data: {
          aiFeedback: exam.type === "CODE" ? "Évaluation IA du code" : "Correction automatique du QCM",
          autoScore: totalScore,
          answer: { connect: { id: examAnswer.id } }
        }
      });

      await prisma.grade.create({
        data: {
          finalScore: totalScore,
          comments: exam.type === "CODE" ? "Notation basée sur l'évaluation IA" : "Notation automatique basée sur les réponses au QCM",
          student: { connect: { id: studentId } },
          exam: { connect: { id: examId } },
          correction: { connect: { id: correction.id } },
          answer: { connect: { id: examAnswer.id } }
        }
      });
    }

    revalidatePath(`/available-exams/${examId}`);
    return { success: true };
  } catch (error) {
    console.error('Error submitting exam answers:', error);
    return { success: false, error: 'Failed to submit answers' };
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
          { createdById: userId },
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

export async function evaluatePdfSubmission(
  examId: string,
  studentId: string,
  submissionData: {
    correction: string,
    studentAnswer: string,
    examText: string
  },
  isSubmission: boolean
) {
  try {
    // Récupérer l'examen avec le contenu du PDF original et le corrigé
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        filePath: true,
        fileCorrection: true,
        questions: true
      },
    });


    if (!exam) {
      throw new Error("Examen non trouvé");
    }

    // Préparer le prompt pour l'IA
    const prompt = `En tant que correcteur, évalue cette copie d'examen.

Sujet du devoir:
${submissionData.examText}

Corrigé type:
${submissionData.correction}

Copie de l'étudiant:
${submissionData.studentAnswer}

Fournis une évaluation détaillée au format JSON suivant (sans backticks, sans commentaires):
{
  "score": (note sur 20),
  "feedback": "Commentaires détaillés sur la copie",
  "pointsForts": ["Liste des points forts"],
  "pointsFaibles": ["Liste des points à améliorer"],
  "justificationNote": "Explication détaillée de la note attribuée"
}`;

    // Obtenir l'évaluation de l'IA
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat:free",
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const result = await response.json();
    const evaluation = JSON.parse(result.choices[0].message.content);

    // TODO refactor here cause it's not working
    // const examResponse = await prisma.exam.update({

    // });
    const examAnswer = await prisma.answer.create({
      data: {
        filePath: "pdf_submission",
        attemptNumber: 1,
        status: isSubmission ? SubmissionStatus.REVISED : SubmissionStatus.PENDING,
        student: { connect: { id: studentId } },
        exam: { connect: { id: examId } },
        content: JSON.stringify({
          type: "pdf",
          submittedContent: submissionData.studentAnswer,
          evaluation: evaluation
        })
      }
    });

    if (isSubmission) {
      // Mettre à jour le statut du participant
      await prisma.examParticipant.update({
        where: {
          examId_userId: {
            examId,
            userId: studentId
          }
        },
        data: {
          status: ParticipantStatus.COMPLETED
        }
      });

      // Créer la correction
      const correction = await prisma.correction.create({
        data: {
          aiFeedback: evaluation.feedback,
          autoScore: evaluation.score,
          answer: { connect: { id: examAnswer.id } }
        }
      });

      // Créer la note finale
      await prisma.grade.create({
        data: {
          finalScore: evaluation.score,
          comments: JSON.stringify({
            feedback: evaluation.feedback,
            pointsForts: evaluation.pointsForts,
            pointsFaibles: evaluation.pointsFaibles,
            justificationNote: evaluation.justificationNote
          }),
          student: { connect: { id: studentId } },
          exam: { connect: { id: examId } },
          correction: { connect: { id: correction.id } },
          answer: { connect: { id: examAnswer.id } }
        }
      });
    }

    revalidatePath(`/[locale]/available-exams/${examId}`);
    return { success: true, evaluation };
  } catch (error) {
    console.error('Error evaluating PDF submission:', error);
    return { success: false, error: 'Échec de l\'évaluation du PDF' };
  }
}
