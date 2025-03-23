'use server'

import {CodeSubmission, QuestionData} from "@/actions/type";

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
        const formattedResults = result.map((item: {
            questionId: number;
            correctAnswers: string[];
            explanation: string;
            feedback: { correct: string; incorrect: string; }
        }) => ({
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
        type: "array",
        items: {
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
                },
            },
            required: ["testCases"],
            additionalProperties: false
        }
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

        return {success: true, data: result};

    } catch (error) {
        console.error('Code tests generation error:', error);
        return {success: false, error: "Code tests generation error"};
    }
}

export async function generateDocumentAnswers(
    content: string,
    model: string = process.env.AI_MODEL || "deepseek/deepseek-chat:free"
) {
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
                    role: 'system',
                    content: 'Vous êtes un expert en rédaction technique. Fournissez des réponses claires et structurées en Markdown.'
                }, {
                    role: 'user',
                    content: `Analysez ce contenu et fournissez un corrigé détaillée en Markdown :\n\n${content}`
                }],
                response_format: { type: "text" },
                temperature: 0.3,
                max_tokens: 2000
            })
        });

        const data = await response.json();
        const markdownResponse = data.choices[0].message.content;

        return {
            success: true,
            data: markdownResponse
        };

    } catch (error) {
        console.error('Document processing error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur lors de la génération du document'
        };
    }
}

export async function generateDocumentCorrection(
    examDocumentContent: string,
    studentSubmissionContent: string,
    teacherCorrectionContent: string
) {
    const schema = {
        type: "object",
        properties: {
            summary: {
                type: "string",
                description: "Résumé global de la qualité de la soumission"
            },
            detailedFeedback: {
                type: "string",
                description: "Analyse détaillée au format Markdown avec comparaison des documents"
            },
            score: {
                type: "number",
                description: "Note sur 20 calculée selon les critères"
            },
            improvements: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        section: { type: "string" },
                        suggestion: { type: "string" },
                        severity: {
                            type: "string",
                            enum: ["MINOR", "MAJOR", "CRITICAL"]
                        }
                    }
                }
            },
            mermaidDiagram: {
                type: "string",
                description: "Diagramme Mermaid montrant le processus d'évaluation"
            }
        },
        required: ["summary", "detailedFeedback", "score", "improvements", "mermaidDiagram"]
    };

    try {
        const response = await fetch(process.env.AI_API_URL ?? 'https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: process.env.AI_MODEL,
                messages: [{
                    role: 'system',
                    content: `Vous êtes un expert en évaluation de copies. Analysez ces 3 documents :
          1. Document original de l'examen
          2. Soumission de l'élève
          3. Corrigé officiel

          Produisez un rapport structuré avec :
          - Comparaison détaillée élève/corrigé
          - Diagramme Mermaid des étapes clés
          - Suggestions d'amélioration classées
          - Note finale sur 20`
                }, {
                    role: 'user',
                    content: `DOCUMENT EXAMEN:\n${examDocumentContent}\n\nSOUMISSION ÉLÈVE:\n${studentSubmissionContent}\n\nCORRIGÉ OFFICIEL:\n${teacherCorrectionContent}`
                }],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'documentCorrectionReport',
                        strict: true,
                        schema
                    }
                },
                temperature: 0.2,
                max_tokens: 4000
            })
        });

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);

    } catch (error) {
        console.error('Document correction error:', error);
        throw new Error('Échec de la génération du rapport');
    }
}

export async function evaluateCodeSubmission(
    submissions: CodeSubmission[],
    questions: Array<{
        id: string;
        testCases: Array<{ input: string; expectedOutput: string }>;
        maxPoints: number;
        programmingLanguage: string;
    }>,
    model: string = process.env.AI_MODEL || "deepseek/deepseek-chat:free"
) {
    const schema = {
        type: "object",
        properties: {
            score: {
                type: "number",
                description: "Score total basé sur les tests réussis"
            },
            feedback: {
                type: "string",
                description: "Analyse globale de la qualité du code"
            },
            suggestions: {
                type: "string",
                description: "Conseils d'amélioration spécifiques"
            },
            testResults: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        questionId: {
                            type: "string",
                            description: "ID de la question concernée"
                        },
                        passedTests: {
                            type: "number",
                            description: "Nombre de tests réussis pour cette question"
                        },
                        totalTests: {
                            type: "number",
                            description: "Nombre total de tests pour cette question"
                        },
                        failedCases: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    input: { type: "string" },
                                    expected: { type: "string" },
                                    actual: { type: "string" },
                                    error: { type: "string" }
                                }
                            }
                        }
                    },
                    required: ["questionId", "passedTests", "totalTests"]
                }
            }
        },
        required: ["score", "feedback", "suggestions", "testResults"]
    };

    try {
        // Construction du prompt détaillé
        const evaluationPrompt = submissions
            .map((sub) => {
                const question = questions.find((q) => q.id === sub.questionId);
                return `**Question ${sub.questionId}**\nCode soumis:\n\`\`\`${question?.programmingLanguage}\n${sub.code}\n\`\`\`\nTests à passer:\n${question?.testCases
                    .map(
                        (tc, index) =>
                            `Test ${index + 1}: Input = ${tc.input} => Expected Output = ${tc.expectedOutput}`
                    )
                    .join("\n")}`;
            })
            .join("\n\n");

        const response = await fetch(
            process.env.AI_API_URL ?? "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": process.env.SITE_URL ?? "http://localhost:3000",
                    "X-Title": "Code Evaluation"
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "system",
                            content: `Vous êtes un expert en évaluation de code. Analysez chaque soumission :
1. Exécutez mentalement le code avec chaque input
2. Comparez la sortie réelle à la sortie attendue
3. Identifiez les erreurs potentielles
4. Générez un score basé sur les tests passés

Format de réponse strict en JSON selon le schema fourni.`
                        },
                        {
                            role: "user",
                            content: `Évaluez ces soumissions de code :\n\n${evaluationPrompt}`
                        }
                    ],
                    response_format: {
                        type: "json_schema",
                        json_schema: {
                            name: "codeEvaluationResult",
                            strict: true,
                            schema
                        }
                    },
                    temperature: 0.1,
                    max_tokens: 3000
                })
            }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        // Calcul final du score basé sur les points maximum
        const finalScore = questions.reduce((total, question) => {
            const testResult = result.testResults.find(
                (tr: { questionId: string }) => tr.questionId === question.id
            );
            const successRatio = testResult
                ? testResult.passedTests / testResult.totalTests
                : 0;
            return total + question.maxPoints * successRatio;
        }, 0);

        return {
            success: true,
            data: {
                ...result,
                score: finalScore,
                maxPossibleScore: questions.reduce((sum, q) => sum + q.maxPoints, 0)
            }
        };

    } catch (error) {
        console.error("Erreur d'évaluation du code :", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur inconnue"
        };
    }
}
