import { NextResponse } from 'next/server';

// Fonction helper pour générer une réponse factice selon le type de question
function generateFakeAnswer(question: any) {
  if (question.programmingLanguage) {
    // Pour les questions de code
    return `\`\`\`${question.programmingLanguage}
// Solution possible
function solution() {
  // Implémentation de base
  console.log("Voici une solution possible");
  // Plus de détails à venir avec l'API réelle
  return "Résultat";
}
\`\`\`

Explication:
1. Cette solution utilise une approche simple
2. Elle peut être optimisée davantage
3. Points importants à considérer:
   - Complexité: O(n)
   - Utilisation mémoire: O(1)
   - Bonnes pratiques respectées`;
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