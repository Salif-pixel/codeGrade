import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();

    // Encoder le code en base64
    const encodedCode = Buffer.from(code).toString('base64');

    const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": process.env.JUDGE0_API_KEY || '',
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        source_code: encodedCode,
        language_id: language === 'python' ? 71 : 63, // 71 pour Python, 63 pour JavaScript
        stdin: "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Judge0 API error: ${response.status}`);
    }

    const result = await response.json();
    const output = Buffer.from(result.stdout || '', 'base64').toString();
    const error = result.stderr ? Buffer.from(result.stderr, 'base64').toString() : null;

    return NextResponse.json({
      output: output || error || "No output",
      error: error
    });

  } catch (error) {
    console.error("Error executing code:", error);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}
