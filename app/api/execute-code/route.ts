import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();

    const apiKey = process.env.JUDGE0_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    // 📌 Mapping des langages vers leurs IDs Judge0
    const languageMapping: Record<string, number> = {
      javascript: 63,
      python: 71,
      cpp: 54,
      java: 62,
      csharp: 51
    };

    const languageId = languageMapping[language];
    if (!languageId) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    // 📌 1. Envoyer le code à Judge0
    const submitResponse = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: "",
      }),
    });

    if (!submitResponse.ok) {
      console.error("Submit response error:", await submitResponse.text());
      return NextResponse.json({ error: "Submission failed" }, { status: submitResponse.status });
    }

    const submitResult = await submitResponse.json();
    if (!submitResult.token) {
      return NextResponse.json({ error: "No token received" }, { status: 500 });
    }

    // 📌 2. Récupérer le résultat d'exécution
    const outputResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${submitResult.token}?base64_encoded=false`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      },
    });

    if (!outputResponse.ok) {
      console.error("Output response error:", await outputResponse.text());
      return NextResponse.json({ error: "Failed to get results" }, { status: outputResponse.status });
    }

    const outputResult = await outputResponse.json();

    return NextResponse.json({
      output: outputResult.stdout || outputResult.stderr || "No output",
      error: outputResult.stderr,
      status: outputResult.status?.description
    });
  } catch (error) {
    console.error("Error executing code:", error);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}
