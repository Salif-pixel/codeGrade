'use server'

import { revalidatePath } from 'next/cache'
import { ExamType, ParticipantStatus, SubmissionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

interface QuestionData {
  id?: string
  text: string
  maxPoints: number
  choices: string[]
  answer?: string
  programmingLanguage?: string
}

interface ExamData {
  title: string
  description?: string
  type: ExamType
  filePath?: string
  format?: string
  maxAttempts?: number
  endDate?: Date
  startDate?: Date
  questions?: QuestionData[]
}

async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function extractContentFromDocument(file: File, type: "pdf" | "md" | "latex" | "txt"): Promise<string> {
  try {
    const buffer = await fileToBuffer(file)

    switch (type) {
      case "pdf": {
        // Create a blob from the buffer
        const blob = new Blob([buffer])
        // Use PDFLoader to extract text from PDF
        const loader = new PDFLoader(blob)
        const docs = await loader.load()
        return docs.map((doc: any) => doc.pageContent).join("\n")
      }

      case "md":
      case "latex":
      case "txt": {
        // For text-based formats, we can just return the text content
        return buffer.toString("utf-8")
      }

      default:
        throw new Error(`Unsupported file type: ${type}`)
    }
  } catch (error: any) {
    console.error("Error extracting content:", error)
    throw new Error(`Failed to extract content from ${type} file: ${error.message}`)
  }
}

export async function createExam(data: ExamData, userId: string) {
  try {
    // Validation des données selon le type d'examen
    if (data.type === 'DOCUMENT') {
      if (!data.filePath || data.questions?.length) {
        return {
          success: false,
          error: 'Un devoir de type DOCUMENT nécessite un fichier et ne doit pas avoir de questions'
        }
      }
    } else {
      if (data.filePath || !data.questions?.length) {
        return {
          success: false,
          error: 'Les devoirs de type QCM ou CODE nécessitent des questions et ne doivent pas avoir de fichier'
        }
      }
    }

    // Validation spécifique pour QCM
    if (data.type === 'QCM' && data.questions) {
      const invalidQuestions = data.questions.some(q => !q.choices?.length)
      if (invalidQuestions) {
        return {
          success: false,
          error: 'Les questions QCM doivent avoir des choix'
        }
      }
    }

    // Validation spécifique pour CODE
    if (data.type === 'CODE' && data.questions) {
      const invalidQuestions = data.questions.some(q => !q.programmingLanguage)
      if (invalidQuestions) {
        return {
          success: false,
          error: 'Les questions de Code doivent spécifier un langage de programmation'
        }
      }
    }

    // Préparation des données pour la création
    const examData = {
      title: data.title,
      description: data.description || '',
      type: data.type,
      filePath: data.filePath || '',
      format: data.format || data.type.toString(),
      maxAttempts: data.maxAttempts || 1,
      startDate: data.startDate,
      endDate: data.endDate,
      createdById: userId,
      questions: data.questions ? {
        create: data.questions.map(q => ({
          text: q.text,
          maxPoints: q.maxPoints,
          choices: q.choices || [],
          programmingLanguage: q.programmingLanguage || null
        }))
      } : undefined
    }

    const exam = await prisma.exam.create({
      data: examData,
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

export async function updateExam(examId: string, data: ExamData) {
  try {
    // Vérifier si l'examen existe et n'a pas commencé
    const existingExam = await prisma.exam.findFirst({
      where: { id: examId },
      include: { questions: true }
    })

    if (!existingExam) {
      return { success: false, error: 'Examen non trouvé' }
    }

    // Vérifier que l'examen n'a pas encore commencé
    const now = new Date()
    if (existingExam.startDate && existingExam.startDate < now) {
      return { success: false, error: 'Impossible de modifier un examen qui a déjà commencé' }
    }

    if (existingExam.status !== 'PENDING') {
      return { success: false, error: 'Impossible de modifier un examen qui n\'est plus en attente' }
    }

    // Vérifier qu'on ne modifie pas le type d'examen
    if (data.type && data.type !== existingExam.type) {
      return { success: false, error: 'Impossible de modifier le type d\'examen' }
    }

    // Vérifier qu'on ne modifie pas le contenu des questions (sauf le barème)
    if (data.questions) {
      const hasInvalidModifications = data.questions.some((newQ, index) => {
        const existingQ = existingExam.questions[index]
        return (
          newQ.text !== existingQ.text ||
          JSON.stringify(newQ.choices) !== JSON.stringify(existingQ.choices) ||
          newQ.programmingLanguage !== existingQ.programmingLanguage
        )
      })

      if (hasInvalidModifications) {
        return { success: false, error: 'Seul le barème des questions peut être modifié' }
      }
    }

    // Seules les métadonnées peuvent être modifiées
    const exam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title: data.title,
        description: data.description,
        maxAttempts: data.maxAttempts,
        startDate: data.startDate,
        endDate: data.endDate,
        questions: data.questions ? {
          update: data.questions.map((q, index) => ({
            where: { id: existingExam.questions[index].id },
            data: { maxPoints: q.maxPoints }
          }))
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
    return { success: false, error: 'Échec de la mise à jour de l\'examen' }
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

export async function getExams(userId: string) {
  try {
    const exams = await prisma.exam.findMany({
      where: { createdById: userId },
      include: {
        questions: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        answers: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            grade: {
              select: {
                finalScore: true,
              }
            }
          }
        }
      }
    })

    return { success: true, data: exams }
  } catch (error) {
    console.error('Error fetching exams:', error)
    return { success: false, error: 'Failed to fetch exams' }
  }
}

export async function joinExam(examId: string, userId: string) {
  try {

    // Vérifier si l'utilisateur n'est pas déjà participant
    const existingParticipant = await prisma.examParticipant.findUnique({
      where: {
        examId_userId: {
          examId: examId,
          userId: userId,
        },
      },
    })

    if (existingParticipant) {
      return { success: false, error: "Déjà participant à cet examen" }
    }

    const examParticipant = await prisma.examParticipant.create({
      data: {
        examId: examId,
        userId: userId,
        status: ParticipantStatus.ACCEPTED,
      },
    })

    revalidatePath('/[locale]/exams')
    return { success: true, data: examParticipant }
  } catch (error) {
    console.error("[EXAM_JOIN]", error)
    return { success: false, error: "Une erreur est survenue" }
  }
}

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

export async function generateAnswers(questions: QuestionData[], model: string = "mistralai/mistral-7b-instruct") {
  try {
    const questionsWithAnswers = await Promise.all(
      questions.map(async (question) => ({
        ...question,
        answer: await generateFakeAnswer(question, model)
      }))
    );

    return { success: true, questions: questionsWithAnswers };
  } catch (error) {
    console.error('Error generating answers:', error);
    return { success: false, error: 'Failed to generate answers' };
  }
}

async function generateFakeAnswer(question: QuestionData, model: string) {
  console.log('Generating answer for:', question.text)
  try {
    let prompt = '';

    if (question.programmingLanguage) {
      prompt = `Fournis une explication détaillée et des tests précis avec le résultat attendu pour la question suivante: ${question.text}. Retourne ta réponse sous ce format JSON spécifique:
      (ne pas inclure les parenthèses les  backticks \`\`\`json et les commentaires)
  "type": "code",
  "tests": [
    {
      "id": "test1",
      "name": "Test basique",
      "description": "Vérifie le fonctionnement de base",
      "input": "Entrée du test",
      "expectedOutput": "Sortie attendue"
    },
    {
      "id": "test2",
      "name": "Test avancé",
      "description": "Vérifie le comportement avec des données complexes",
      "input": "Entrée du test",
      "expectedOutput": "Sortie attendue (résultat)"
    }
  ],
  "explanation": "Explication détaillée de la solution"
}
Important:
- Fournis des tests exhaustifs pour valider la solution
- L'explication doit être claire et aider l'étudiant à comprendre la solution
- Le format JSON doit être respecté strictement`;
    } else if (question.choices?.length) {
      prompt = `Tu es un expert en évaluation. Analyse cette question QCM et fournis la ou les bonnes réponses.

Question: ${question.text}
Choix disponibles: ${question.choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Retourne ta réponse sous ce format JSON exact:
(ne pas inclure les parenthèses les  backticks \`\`\`json et les commentaires)
{
  "type": "single" OU "multiple",
  "correctAnswers": [contenu(s) de(s) réponse(s) correcte(s) sans les numero(s) de choix],
  "explanation": "Explication détaillée du choix",
  "feedback": {
    "correct": "Message à afficher si l'étudiant choisit la bonne réponse",
    "incorrect": "Message à afficher si l'étudiant se trompe"
  }
}

Important:
- Analyse attentivement chaque option
- Justifie clairement pourquoi certaines réponses sont correctes et d'autres incorrectes
- Fournis des explications pédagogiques et constructives
- Assure-toi que le format JSON est strictement respecté`;
    } else {
      prompt = `Réponds de façon détaillée à la question suivante: ${question.text}`;
    }

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

    // Pour les QCM, formater la réponse
    if (question.choices?.length) {
      try {
        const parsedAnswer = JSON.parse(result.choices[0].message.content);
        return JSON.stringify(parsedAnswer, null, 2); // Retourner le JSON formaté
      } catch (e) {
        console.error('Error parsing JSON answer:', e);
        return result.choices[0].message.content;
      }
    }

    return result.choices[0].message.content;
  } catch (error) {
    console.error('Error generating answer:', error);
    return `Une erreur est survenue lors de la génération de la réponse pour: "${question.text}"`;
  }
}

export async function updateExamAnswers(examId: string, questions: any[]) {
  try {
    // Vérifier que l'examen existe
    const exam = await prisma.exam.findFirst({
      where: { id: examId },
      include: { questions: true }
    });

    if (!exam) {
      return { success: false, error: 'Exam not found' };
    }

    // Mettre à jour les réponses pour chaque question
    await Promise.all(
      questions.map(async (question) => {
        // Vérifier que la question existe
        const existingQuestion = exam.questions.find(q => q.id === question.id);
        if (!existingQuestion) {
          console.warn(`Question ${question.id} not found in exam ${examId}`);
          return;
        }

        await prisma.question.update({
          where: {
            id: question.id,
            examId: examId // Ajouter cette condition pour s'assurer que la question appartient à l'examen
          },
          data: {
            answer: question.answer
          }
        });
      })
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating exam answers:', error);
    return { success: false, error: 'Failed to update answers' };
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

export async function generateDocumentAnswer(text: string, model: string = "mistralai/mistral-7b-instruct") {
  try {
    console.log('Generating document answer for text of length:', text.length);

    const prompt = `En tant que correcteur, fournis une correction détaillée et complète de ce document.

Document à corriger:
${text}

Fournis une correction détaillée qui explique les points clés, les concepts importants, et propose une solution complète.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
      })
    });

    const result = await response.json();
    console.log('OpenRouter response received', result);

    const evaluation = result.choices[0].message.content;

    return { success: true, evaluation };
  } catch (error) {
    console.error('Error generating document answer:', error);
    return {
      success: false,
      error: 'Échec de la génération de l\'évaluation du document'
    };
  }
}

export async function updateDocumentExamAnswer(examId: string, answer: string) {
  try {
    // Vérifier que l'examen existe et qu'il est de type DOCUMENT
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        type: 'DOCUMENT'
      }
    });

    if (!exam) {
      return { success: false, error: 'Examen non trouvé ou type invalide' };
    }


    // Mettre à jour la correction du document
    await prisma.exam.update({
      where: {
        id: examId
      },
      data: {
        fileCorrection: answer
      }
    });

    revalidatePath('/[locale]/(dashboard)/exams');
    return { success: true };
  } catch (error) {
    console.error('Error updating document exam answer:', error);
    return { success: false, error: 'Échec de la mise à jour de la réponse' };
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
