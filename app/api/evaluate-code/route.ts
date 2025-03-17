import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code, language, tests, questionText } = await request.json();

    const prompt = `Évalue ce code ${language} qui répond à la question: "${questionText}".
    
Code soumis:
${code}

Résultats des tests:
${JSON.stringify(tests, null, 2)}

Fournis une évaluation détaillée au format JSON avec:
- Un score sur le total des points
- Une explication détaillée
- Des suggestions d'amélioration
- Une analyse de la qualité du code`;

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

    return NextResponse.json({
      score: evaluation.score,
      feedback: evaluation.feedback
    });
  } catch (error) {
    console.error('Error evaluating code:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate code' },
      { status: 500 }
    );
  }
} 