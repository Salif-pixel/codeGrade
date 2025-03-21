'use server'

import {QuestionData} from "@/actions/datatype";

export async function generateQCMAnswers(
    questions: QuestionData[],
    model: string = process.env.AI_MODEL || "deepseek/deepseek-chat:free"
) {
    const schema = {
        type: "array",
        items: {
            type: "object",
            properties: {
                questionId: {
                    type: "number",
                    description: "Index de la question (commence à 1)"
                },
                correctAnswers: {
                    type: "array",
                    items: { type: "string" },
                    description: "Réponses textuelles exactes"
                },
                explanation: {
                    type: "string",
                    description: "Explication détaillée"
                },
                feedback: {
                    type: "object",
                    properties: {
                        correct: { type: "string" },
                        incorrect: { type: "string" }
                    },
                    required: ["correct", "incorrect"]
                }
            },
            required: ["questionId", "correctAnswers", "explanation", "feedback"],
            additionalProperties: false
        }
    };

    try {
        const response = await fetch(process.env.AI_API_URL ?? 'https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [{
                    role: 'user',
                    content: `Analysez ces ${questions.length} QCM et donnez les réponses au format JSON strict.\n
${questions.map((q, index) =>
                        `Question ${index + 1}: ${q.text}\nChoix: ${q.choices?.join(' | ')}`
                    ).join('\n\n')}

Important :
- Répondez TOUJOURS avec un tableau, même pour une seule question
- Utilisez questionId correspondant au numéro de la question
- Les réponses doivent être le texte EXACT des choix`
                }],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'qcmEvaluationBatch',
                        strict: true,
                        schema
                    }
                },
                temperature: 0.1
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        // Mapping des IDs réels
        const formattedResults = result.map((item: any) => ({
            questionId: questions[item.questionId - 1]?.id, // Conversion index 1-based vers ID réel
            correctAnswers: item.correctAnswers,
            explanation: item.explanation,
            feedback: item.feedback
        }));

        return { success: true, data: formattedResults };

    } catch (error) {
        console.error('QCM generation error:', error);
        return { success: false, error: 'Échec de la génération des réponses' };
    }
}

export async function generateCodeTestCases(
    questions: QuestionData[],
    model: string = process.env.AI_MODEL || "deepseek/deepseek-chat:free"
) {
    const schema = {
        type: "object",
        properties: {
            testCases: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        input: {
                            type: "string",
                            description: "Entrée du test au format approprié pour le langage"
                        },
                        expectedOutput: {
                            type: "string",
                            description: "Résultat exact attendu"
                        }
                    },
                    required: ["input", "expectedOutput"]
                }
            }
        },
        required: ["testCases"],
        additionalProperties: false
    };

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [{
                    role: 'user',
                    content: `Générez des cas de test pour ces problèmes de programmation:\n
          ${questions.map(q => `${q.programmingLanguage}: ${q.text}`).join('\n')}`
                }],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'codeTestCases',
                        strict: true,
                        schema
                    }
                },
                temperature: 0.2
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return result.testCases.map((tc: { input: never, expectedOutput: never }) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput
        }));

    } catch (error) {
        console.error('Code tests generation error:', error);
        return [];
    }
}

export async function generateDocumentAnswers() {

}
