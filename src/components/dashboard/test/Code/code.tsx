"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Play, CheckCircle, XCircle, CodeIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Editor from "@monaco-editor/react"
import { cn } from "@/lib/utils"

// Importons notre module de simulation d'exécution de code
import { executeCode as executeCodeMock } from "./code-mock"

interface CodeTest {
    id: string
    name: string
    description: string
    testCode?: string
    expectedOutput: string
    input: string
}

interface CodeEditorProps {
    initialCode: string
    language: "javascript" | "python" | "sql"
    tests: CodeTest[]
    onSubmit: (data: { code: string; testResults: TestResult[]; type: string; correctAnswers: string; isCorrect: boolean }) => void
    isSubmitting: boolean
}

interface TestResult {
    testId: string
    passed: boolean
    output: string
    expected: string
}

async function executeCode(code: string, language: string, input?: string) {
    try {
        // On exécute simplement le code tel quel
        const response = await fetch('/api/execute-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language })
        });
        
        const result = await response.json();
        return { output: result.output || result.error };
    } catch (error) {
        console.error('Error executing code:', error);
        return { error: typeof error === 'string' ? error : 'Failed to execute code' };
    }
}

export default function CodeEditor({ initialCode, language, tests, onSubmit, isSubmitting }: CodeEditorProps) {
    const [code, setCode] = useState(initialCode)
    const [output, setOutput] = useState("")
    const [isRunning, setIsRunning] = useState(false)
    const [activeTab, setActiveTab] = useState("editor")
    const [testResults, setTestResults] = useState<TestResult[]>([])
    const [allTestsPassed, setAllTestsPassed] = useState(false)
    const [showTestInputs, setShowTestInputs] = useState(true);

    const handleEditorChange = (value: string | undefined) => {
        setCode(value || "")
    }

    const runCode = async () => {
        setIsRunning(true)
        setOutput("")
        
        try {
            const result = await executeCode(code, language)
            setOutput(result.output || result.error)
        } catch (error) {
            setOutput(`Error: ${error}`)
        } finally {
            setIsRunning(false)
        }
    }

    const runTests = async () => {
        setIsRunning(true);
        const results: TestResult[] = [];

        try {
            if (!tests || tests.length === 0) {
                console.log("Aucun test disponible");
                return;
            }

            // Exécuter le code avec les prints pour chaque test
            const testCode = `
${code}

# Exécuter et afficher le résultat pour chaque test
${tests.map(test => `print(${test.input})`).join('\n')}
`;

            console.log("Code exécuté:", testCode);

            const result = await executeCode(testCode, language);
            
            // Séparer les lignes de sortie
            const outputs = result.output.split('\n').filter(line => line.trim() !== '');
            
            // Comparer chaque ligne avec la valeur attendue
            tests.forEach((test, index) => {
                const outputStr = String(outputs[index] || '').trim();
                const expectedStr = String(test.expectedOutput).trim();
                const passed = outputStr === expectedStr;

                console.log("Test:", {
                    input: test.input,
                    expected: expectedStr,
                    got: outputStr,
                    passed
                });

                results.push({
                    testId: test.id,
                    passed,
                    output: outputStr,
                    expected: expectedStr
                });
            });

            setTestResults(results);
            const allPassed = results.every(r => r.passed);
            setAllTestsPassed(allPassed);
            setActiveTab("tests");

            onSubmit({
                code,
                testResults: results,
                type: "code",
                correctAnswers: code,
                isCorrect: allPassed
            });
        } catch (error) {
            console.error("Erreur lors de l'exécution des tests:", error);
            setOutput(`Erreur: ${error}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = () => {
        // Exécuter les tests avant de soumettre
        runTests()
    }

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                        <CodeIcon className="mr-1 h-3 w-3" />
                        {language.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">
            {tests.length} test{tests.length !== 1 ? "s" : ""}
          </span>
                </div>

                <Select value={language} disabled>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Langage" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="w-full">
                    <TabsTrigger value="editor" className="flex-1">
                        Éditeur
                    </TabsTrigger>
                    <TabsTrigger value="output" className="flex-1">
                        Sortie
                    </TabsTrigger>
                    <TabsTrigger value="tests" className="flex-1">
                        Tests
                        {testResults.length > 0 && (
                            <Badge className={`ml-2 ${allTestsPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {testResults.filter((r) => r.passed).length}/{testResults.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="mt-4">
                    <Card className="border-2 shadow-md">
                        <CardHeader className="bg-gray-50 dark:bg-zinc-800 pb-3">
                            <CardTitle className="text-lg font-medium">Éditeur de code</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Editor
                                height="400px"
                                defaultLanguage={language}
                                defaultValue={initialCode}
                                onChange={handleEditorChange}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                }}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-between border-t bg-gray-50 dark:bg-zinc-800 p-4">
                            <Button variant="outline" onClick={runCode} disabled={isRunning}>
                                {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                Exécuter
                            </Button>

                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting || !code.trim()} // Désactiver seulement si pas de code
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                Soumettre
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="output" className="mt-4">
                    <Card className="border-2 shadow-md">
                        <CardHeader className="bg-gray-50 dark:bg-zinc-800 pb-3">
                            <CardTitle className="text-lg font-medium">Sortie du programme</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
              <pre className="min-h-[400px] w-full bg-zinc-900 p-4 font-mono text-sm text-white">
                {output || "Exécutez votre code pour voir la sortie ici"}
              </pre>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tests" className="mt-4">
                    <Card className="border-2 shadow-md">
                        <CardHeader className="bg-gray-50 dark:bg-zinc-800 pb-3">
                            <CardTitle className="text-lg font-medium">Résultats des tests</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {testResults.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                                    <CodeIcon className="mb-2 h-12 w-12" />
                                    <p>Testez votre fonction avec les inputs fournis ci-dessus</p>
                                    <p className="text-sm mt-2">Assurez-vous que votre fonction retourne les résultats attendus</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tests.map((test, index) => {
                                        const result = testResults.find((r) => r.testId === test.id)

                                        return (
                                            <div
                                                key={test.id}
                                                className={cn(
                                                    "p-4 rounded-lg",
                                                    result?.passed ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {result?.passed ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-500" />
                                                    )}
                                                    <h3 className="font-medium">{test.name}</h3>
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">{test.description}</p>
                                                <div className="mt-2 space-y-2">
                                                    <div>
                                                        <span className="text-sm font-medium">Entrée:</span>
                                                        <pre className="mt-1 rounded bg-zinc-100 p-2 text-sm dark:bg-zinc-800">
                                                            {test.input}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium">Sortie attendue:</span>
                                                        <pre className="mt-1 rounded bg-zinc-100 p-2 text-sm dark:bg-zinc-800">
                                                            {test.expectedOutput}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium">Votre sortie:</span>
                                                        <pre className="mt-1 rounded bg-zinc-100 p-2 text-sm dark:bg-zinc-800">
                                                            {result?.output || "Pas de sortie"}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Afficher les inputs des tests */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Inputs des tests :</h3>
                <div className="space-y-2">
                    {tests.map((test, index) => (
                        <div key={test.id} className="flex items-center gap-2">
                            <span className="text-sm font-mono">Test {index + 1}:</span>
                            <code className="px-2 py-1 bg-gray-100 dark:bg-zinc-700 rounded">
                                {test.input}
                            </code>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

