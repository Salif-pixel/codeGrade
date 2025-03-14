"use client"

import type React from "react"

import { useState, useRef } from "react"
import { format } from "date-fns"
import { X, Upload, FileText, Clock, Calendar, BookOpen, Code, CheckSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Assignment } from "@/components/calendar/assignment-detail-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface AssignmentModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (assignment: Assignment) => void
    selectedDate: Date | null
    initialDuration?: number
}

export default function AssignmentModal({
                                            isOpen,
                                            onClose,
                                            onAdd,
                                            selectedDate,
                                            initialDuration = 1,
                                        }: AssignmentModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState(selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"))
    const [time, setTime] = useState(
        selectedDate ? format(selectedDate, "HH:mm") : format(new Date().setHours(8, 0, 0, 0), "HH:mm"),
    )
    const [duration, setDuration] = useState(initialDuration)
    const [type, setType] = useState<"devoir" | "examen" | "projet">("devoir")
    const [submissionType, setSubmissionType] = useState<"qcm" | "pdf" | "code" | "autre">("autre")
    const [language, setLanguage] = useState<"javascript" | "python" | "java" | "cpp" | "csharp">("javascript")
    const [initialCode, setInitialCode] = useState("")
    const [codeTests, setCodeTests] = useState<
        { id: string; name: string; description: string; testCode: string; expectedOutput: string }[]
    >([
        {
            id: "1",
            name: "Test de base",
            description: "Vérifie la fonctionnalité de base",
            testCode: "",
            expectedOutput: "",
        },
    ])
    const [file, setFile] = useState<File | null>(null)
    const [fileUrl, setFileUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [activeTab, setActiveTab] = useState("general")

    if (!isOpen) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)

            // Créer une URL pour le fichier (pour la prévisualisation)
            const fileUrl = URL.createObjectURL(selectedFile)
            setFileUrl(fileUrl)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const dateTime = new Date(`${date}T${time}`)

        const newAssignment: Assignment = {
            id: Date.now().toString(),
            title,
            description,
            date: dateTime.toISOString(),
            duration,
            type,
            submissionType,
            fileUrl: fileUrl || undefined,
            fileName: file?.name || undefined,
            ...(submissionType === "code" && {
                language,
                initialCode,
                tests: codeTests,
            }),
        }

        onAdd(newAssignment)
    }

    const getSubmissionTypeIcon = () => {
        switch (submissionType) {
            case "qcm":
                return <CheckSquare className="h-4 w-4 mr-1" />
            case "pdf":
                return <FileText className="h-4 w-4 mr-1" />
            case "code":
                return <Code className="h-4 w-4 mr-1" />
            default:
                return <BookOpen className="h-4 w-4 mr-1" />
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Ajouter un devoir</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="general">
                                Général
                            </TabsTrigger>
                            <TabsTrigger value="submission">
                                Type de rendu
                            </TabsTrigger>
                            <TabsTrigger value="attachment" disabled={submissionType !== "code"}>
                                Tests {submissionType === "code" && <Badge className="ml-2 bg-blue-500">Code</Badge>}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-4">
                            <div>
                                <Label htmlFor="title" className="text-sm font-medium">Titre</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1"
                                    placeholder="Nom du devoir"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="mt-1"
                                    placeholder="Instructions pour les étudiants..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Card className="border-gray-200">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                                        </div>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="border-gray-200">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <Label htmlFor="time" className="text-sm font-medium">Heure</Label>
                                        </div>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            required
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-gray-200">
                                <CardContent className="pt-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <Label htmlFor="duration" className="text-sm font-medium">Durée (heures)</Label>
                                    </div>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min="0.5"
                                        step="0.5"
                                        value={duration}
                                        onChange={(e) => setDuration(Number.parseFloat(e.target.value))}
                                        required
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="submission" className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-3">Type de rendu</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Card
                                        className={`cursor-pointer border-2 transition-all ${submissionType === "qcm" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                                        onClick={() => setSubmissionType("qcm")}
                                    >
                                        <CardContent className="flex items-center p-4">
                                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <CheckSquare className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">QCM</p>
                                                <p className="text-sm text-gray-500">Questions à choix multiples</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className={`cursor-pointer border-2 transition-all ${submissionType === "pdf" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                                        onClick={() => setSubmissionType("pdf")}
                                    >
                                        <CardContent className="flex items-center p-4">
                                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                                <FileText className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">PDF</p>
                                                <p className="text-sm text-gray-500">Document à soumettre</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className={`cursor-pointer border-2 transition-all ${submissionType === "code" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                                        onClick={() => setSubmissionType("code")}
                                    >
                                        <CardContent className="flex items-center p-4">
                                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                                <Code className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Code</p>
                                                <p className="text-sm text-gray-500">Exercice de programmation</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className={`cursor-pointer border-2 transition-all ${submissionType === "autre" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                                        onClick={() => setSubmissionType("autre")}
                                    >
                                        <CardContent className="flex items-center p-4">
                                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                <BookOpen className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Autre</p>
                                                <p className="text-sm text-gray-500">Format personnalisé</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {submissionType === "code" && (
                                <div className="space-y-4 pt-2">
                                    <div>
                                        <Label htmlFor="language" className="text-sm font-medium">Langage de programmation</Label>
                                        <Select value={language} onValueChange={(value) => setLanguage(value as never)}>
                                            <SelectTrigger id="language" className="mt-1">
                                                <SelectValue placeholder="Sélectionner un langage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="javascript">JavaScript</SelectItem>
                                                <SelectItem value="python">Python</SelectItem>
                                                <SelectItem value="java">Java</SelectItem>
                                                <SelectItem value="cpp">C++</SelectItem>
                                                <SelectItem value="csharp">C#</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="initialCode" className="text-sm font-medium">Code initial</Label>
                                        <Textarea
                                            id="initialCode"
                                            value={initialCode}
                                            onChange={(e) => setInitialCode(e.target.value)}
                                            rows={5}
                                            className="font-mono text-sm mt-1"
                                            placeholder="// Code initial que l'étudiant verra"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <Label htmlFor="file" className="text-sm font-medium">Document du devoir (PDF)</Label>
                                <div className="mt-2">
                                    <input
                                        type="file"
                                        id="file"
                                        ref={fileInputRef}
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Choisir un fichier
                                        </Button>
                                        {file && <span className="text-sm text-gray-600">{file.name}</span>}
                                    </div>
                                </div>
                                {fileUrl && (
                                    <div className="mt-2 flex items-center rounded-md bg-blue-50 p-2 text-sm text-blue-700">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Document PDF ajouté
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="attachment" className="space-y-4">
                            {submissionType === "code" && (
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Tests automatiques</h3>
                                    <div className="space-y-4">
                                        {codeTests.map((test, index) => (
                                            <Card key={test.id} className="border-gray-200">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="font-medium">Test #{index + 1}</h4>
                                                        {codeTests.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                                                onClick={() => {
                                                                    setCodeTests(codeTests.filter((_, i) => i !== index))
                                                                }}
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Supprimer
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="grid gap-3">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label htmlFor={`test-name-${index}`} className="text-sm">Nom du test</Label>
                                                                <Input
                                                                    id={`test-name-${index}`}
                                                                    value={test.name}
                                                                    onChange={(e) => {
                                                                        const newTests = [...codeTests]
                                                                        newTests[index].name = e.target.value
                                                                        setCodeTests(newTests)
                                                                    }}
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor={`test-expected-${index}`} className="text-sm">Résultat attendu</Label>
                                                                <Input
                                                                    id={`test-expected-${index}`}
                                                                    value={test.expectedOutput}
                                                                    onChange={(e) => {
                                                                        const newTests = [...codeTests]
                                                                        newTests[index].expectedOutput = e.target.value
                                                                        setCodeTests(newTests)
                                                                    }}
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`test-desc-${index}`} className="text-sm">Description</Label>
                                                            <Input
                                                                id={`test-desc-${index}`}
                                                                value={test.description}
                                                                onChange={(e) => {
                                                                    const newTests = [...codeTests]
                                                                    newTests[index].description = e.target.value
                                                                    setCodeTests(newTests)
                                                                }}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`test-code-${index}`} className="text-sm">Code du test</Label>
                                                            <Textarea
                                                                id={`test-code-${index}`}
                                                                value={test.testCode}
                                                                onChange={(e) => {
                                                                    const newTests = [...codeTests]
                                                                    newTests[index].testCode = e.target.value
                                                                    setCodeTests(newTests)
                                                                }}
                                                                rows={3}
                                                                className="font-mono text-sm mt-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full border-dashed"
                                            onClick={() => {
                                                setCodeTests([
                                                    ...codeTests,
                                                    {
                                                        id: Date.now().toString(),
                                                        name: `Test ${codeTests.length + 1}`,
                                                        description: "",
                                                        testCode: "",
                                                        expectedOutput: "",
                                                    },
                                                ])
                                            }}
                                        >
                                            Ajouter un test
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <Separator className="my-6" />

                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            {getSubmissionTypeIcon()}
                            <span className="text-sm text-gray-600">Type: {submissionType === "qcm" ? "QCM" : submissionType === "pdf" ? "PDF" : submissionType === "code" ? "Code" : "Autre"}</span>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={onClose}>
                                Annuler
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                Ajouter
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}