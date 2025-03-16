'use server'

import { revalidatePath } from 'next/cache'
import {ExamType, ParticipantStatus} from '@prisma/client'
import {prisma} from '@/lib/prisma'

interface QuestionData {
  text: string
  maxPoints: number
  choices: string[]
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
          error: 'Les questions de code doivent spécifier un langage de programmation'
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
    const existingExam = await prisma.exam.findUnique({
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

export async function joinExam(examId: string,userId: string) {
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
      prompt = `Génère une réponse détaillée avec exemple de code en ${question.programmingLanguage} pour la question suivante: ${question.text}`;
    } else if (question.choices?.length) {
      prompt = `Tu es un expert en évaluation. Analyse cette question QCM et fournis la ou les bonnes réponses.

Question: ${question.text}
Choix disponibles: ${question.choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Retourne ta réponse sous ce format JSON exact:
{
  "type": "single" OU "multiple",
  "correctAnswers": [numéro(s) de(s) réponse(s) correcte(s)],
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
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: 'user', content: prompt }],
        response_format: question.choices?.length ? { type: "json_object" } : undefined
      })
    });
    console.log(response)
    if (!response.ok) {
      throw new Error('Failed to generate answer');
    }

    const data = await response.json();
    console.log('Generated answer:', data.choices[0].message.content)
    
    // Pour les QCM, formater la réponse
    if (question.choices?.length) {
      try {
        const parsedAnswer = JSON.parse(data.choices[0].message.content);
        return JSON.stringify(parsedAnswer, null, 2); // Retourner le JSON formaté
      } catch (e) {
        console.error('Error parsing JSON answer:', e);
        return data.choices[0].message.content;
      }
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating answer:', error);
    return `Une erreur est survenue lors de la génération de la réponse pour: "${question.text}"`;
  }
}

export async function updateExamAnswers(examId: string, questions: QuestionData[]) {
  try {
    // Mettre à jour chaque question avec sa réponse
    await Promise.all(
      questions.map(async (question) => {
        await prisma.question.update({
          where: {
            id: question.id
          },
          data: {
            answer: question.answer
          }
        });
      })
    );

    revalidatePath('/[locale]/exams');
    return { success: true };
  } catch (error) {
    console.error('Error updating exam answers:', error);
    return { success: false, error: 'Failed to update exam answers' };
  }
}