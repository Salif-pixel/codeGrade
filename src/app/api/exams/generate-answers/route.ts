import { NextResponse } from 'next/server';

// Fonction helper pour générer une réponse factice selon le type de question
function generateFakeAnswer(question: any) {
  if (question.programmingLanguage) {
    // Pour les questions de Code
    return JSON.stringify({
      type: "code",
      correctAnswers: `function solution(arr) {
  // Implémentation de base
  return arr.sort((a, b) => a - b);
}`,
      tests: [
        {
          id: "test1",
          name: "Test basique",
          description: "Vérifie le fonctionnement de base",
          input: "[5, 3, 1, 4, 2]",
          expectedOutput: "[1, 2, 3, 4, 5]"
        },
        {
          id: "test2",
          name: "Test avec doublons",
          description: "Vérifie le comportement avec des valeurs dupliquées",
          input: "[3, 1, 3, 2, 1]",
          expectedOutput: "[1, 1, 2, 3, 3]"
        }
      ],
      explanation: `Cette solution utilise l'algorithme de tri natif pour:
1. Trier les éléments dans l'ordre croissant
2. Gérer correctement les doublons
3. Retourner un nouveau tableau trié`,
      feedback: {
        correct: "Excellent ! Votre implémentation passe tous les tests.",
        incorrect: "Attention, vérifiez que votre fonction:\n- Trie correctement les éléments\n- Gère les doublons\n- Retourne un nouveau tableau"
      }
    }, null, 2);
  } else if (question.choices?.length) {
    // Pour les questions QCM
    return `La réponse correcte serait le choix ${Math.floor(Math.random() * question.choices.length) + 1}.

Explication:
- Ce choix est le plus approprié car il correspond aux critères demandés
- Les autres options présentent des inexactitudes
- Points clés à retenir:
  * Concept principal
  * Application pratique
  * Exceptions possibles`;
  } else {
    // Pour les autres types de questions
    return `Réponse temporaire pour la question: "${question.text}"

Points clés:
1. Premier point important
2. Deuxième aspect à considérer
3. Conclusion et synthèse

Note: Cette réponse sera remplacée par une réponse générée par l'IA dans la version finale.`;
  }
}

export async function POST(request: Request) {
  try {
    const { questions } = await request.json();

    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));

    const questionsWithAnswers = questions.map((question: any) => ({
      ...question,
      answer: generateFakeAnswer(question)
    }));

    return NextResponse.json({ questions: questionsWithAnswers });
  } catch (error) {
    console.error('Error generating answers:', error);
    return NextResponse.json(
      { error: 'Failed to generate answers' }, 
      { status: 500 }
    );
  }
} 