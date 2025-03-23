"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import Editor from "@monaco-editor/react"

interface CodeEditorProps {
    initialCode: string
    language: string
    tests: any[]
    onSubmit: (code: string, testResults: any[]) => void
    isSubmitting: boolean
}

interface TestResult {
    testId: string
    passed: boolean
    output: string
    expected: string
}

export default function CodeEditor({ initialCode, language, onSubmit, isSubmitting }: CodeEditorProps) {
    const [code, setCode] = useState(initialCode || "")
    const [output, setOutput] = useState("")
    const [isRunning, setIsRunning] = useState(false)
    const [testResults, setTestResults] = useState<TestResult[]>([])
    // const [allTestsPassed, setAllTestsPassed] = useState(false)

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value)
        }
    }

    const handleRunCode = async () => {
        setIsRunning(true)
        setOutput("")
        try {
            const result = await executeCode(code, language)
            setOutput(result.output || result.error || "")
        } catch (error) {
            setOutput(`Error: ${error}`)
        } finally {
            setIsRunning(false)
        }
    }

    const handleSubmit = () => {
        // Soumettre le code sans exécuter les tests
        onSubmit(code, testResults)
    }

    async function executeCode(code: string, language: string) {
        try {
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-0">
                        <Editor
                            height="400px"
                            language={language}
                            value={code}
                            onChange={handleEditorChange}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: "on",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </CardContent>
                </Card>

                <div className="flex space-x-2">
                    <Button onClick={handleRunCode} disabled={isRunning}>
                        {isRunning ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Exécution...
                            </>
                        ) : (
                            "Exécuter"
                        )}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Soumission...
                            </>
                        ) : (
                            "Soumettre"
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardContent className="p-0">
                        <Textarea
                            value={output}
                            readOnly
                            className="h-[400px] font-mono bg-black text-green-400 p-4"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

