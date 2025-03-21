"use client"

import type React from "react"

import { useState, useRef } from "react"
import { format } from "date-fns"
import { X, Upload, FileText, Trash, CodeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export interface Assignment {
  id: string
  title: string
  description: string
  date: string
  duration: number
  type: "devoir" | "examen" | "projet"
  submissionType?: "qcm" | "pdf" | "code" | "autre"
  fileUrl?: string
  fileName?: string
  language?: "javascript" | "python" | "java" | "cpp" | "csharp"
  initialCode?: string
  tests?: CodeTest[]
}

export interface CodeTest {
  id: string
  name: string
  description: string
  testCode: string
  expectedOutput: string
}

interface AssignmentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: Assignment
  onUpdate: (assignment: Assignment) => void
  onDelete: (id: string) => void
  isEditMode: boolean
}

export default function AssignmentDetailModal({
                                                isOpen,
                                                onClose,
                                                assignment,
                                                onUpdate,
                                                onDelete,
                                                isEditMode,
                                              }: AssignmentDetailModalProps) {
  const [title, setTitle] = useState(assignment.title)
  const [description, setDescription] = useState(assignment.description)
  const [date, setDate] = useState(format(new Date(assignment.date), "yyyy-MM-dd"))
  const [time, setTime] = useState(format(new Date(assignment.date), "HH:mm"))
  const [duration, setDuration] = useState(assignment.duration)
  const [type, setType] = useState<"devoir" | "examen" | "projet">(assignment.type)
  const [submissionType, setSubmissionType] = useState<"qcm" | "pdf" | "code" | "autre">(
      assignment.submissionType || "autre",
  )
  const [language, setLanguage] = useState<"javascript" | "python" | "java" | "cpp" | "csharp">(
      assignment.language || "javascript",
  )
  const [initialCode, setInitialCode] = useState(assignment.initialCode || "")
  const [codeTests, setCodeTests] = useState<
      { id: string; name: string; description: string; testCode: string; expectedOutput: string }[]
  >(
      assignment.tests || [
        {
          id: "1",
          name: "Test de base",
          description: "Vérifie la fonctionnalité de base",
          testCode: "",
          expectedOutput: "",
        },
      ],
  )
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(assignment.fileUrl || null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    const updatedAssignment: Assignment = {
      ...assignment,
      title,
      description,
      date: dateTime.toISOString(),
      duration,
      type,
      submissionType,
      fileUrl: fileUrl || undefined,
      fileName: file?.name || assignment.fileName,
      ...(submissionType === "code" && {
        language,
        initialCode,
        tests: codeTests,
      }),
    }

    onUpdate(updatedAssignment)
  }

  return (
      <>
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Modifier le devoir" : "Détails du devoir"}
              </AlertDialogTitle>
              <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 rounded-full hover:bg-gray-100"
                  onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </AlertDialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 pt-2">
              <div className="space-y-5">
                {/* Section Informations principales */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-medium uppercase text-gray-500">Informations principales</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="mb-1 block text-gray-700">Titre</Label>
                      <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          disabled={!isEditMode}
                          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="mb-1 block text-gray-700">Description</Label>
                      <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          disabled={!isEditMode}
                          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Planification */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-medium uppercase text-gray-500">Planification</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date" className="mb-1 block text-gray-700">Date</Label>
                      <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                          disabled={!isEditMode}
                          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time" className="mb-1 block text-gray-700">Heure</Label>
                      <Input
                          id="time"
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          required
                          disabled={!isEditMode}
                          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration" className="mb-1 block text-gray-700">Durée (heures)</Label>
                      <Input
                          id="duration"
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={duration}
                          onChange={(e) => setDuration(Number.parseFloat(e.target.value))}
                          required
                          disabled={!isEditMode}
                          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type" className="mb-1 block text-gray-700">Type</Label>
                      <Select
                          value={type}
                          onValueChange={(value) => setType(value as "devoir" | "examen" | "projet")}
                          disabled={!isEditMode}
                      >
                        <SelectTrigger id="type" className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="devoir">Devoir</SelectItem>
                          <SelectItem value="examen">Examen</SelectItem>
                          <SelectItem value="projet">Projet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Section Type de rendu */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-medium uppercase text-gray-500">Type de rendu</h3>
                  <RadioGroup
                      value={submissionType}
                      onValueChange={(value) => setSubmissionType(value as "qcm" | "pdf" | "code" | "autre")}
                      className="mt-2 flex flex-wrap gap-4"
                      disabled={!isEditMode}
                  >
                    <div className="flex items-center rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-indigo-300">
                      <RadioGroupItem value="qcm" id="detail-qcm" disabled={!isEditMode} className="border-indigo-500 text-indigo-600" />
                      <Label htmlFor="detail-qcm" className="ml-2 cursor-pointer font-medium">QCM</Label>
                    </div>
                    <div className="flex items-center rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-indigo-300">
                      <RadioGroupItem value="pdf" id="detail-pdf" disabled={!isEditMode} className="border-indigo-500 text-indigo-600" />
                      <Label htmlFor="detail-pdf" className="ml-2 cursor-pointer font-medium">Rendu de PDF</Label>
                    </div>
                    <div className="flex items-center rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-indigo-300">
                      <RadioGroupItem value="code" id="detail-code" disabled={!isEditMode} className="border-indigo-500 text-indigo-600" />
                      <Label htmlFor="detail-code" className="ml-2 cursor-pointer font-medium">Éditeur de code</Label>
                    </div>
                    <div className="flex items-center rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-indigo-300">
                      <RadioGroupItem value="autre" id="detail-autre" disabled={!isEditMode} className="border-indigo-500 text-indigo-600" />
                      <Label htmlFor="detail-autre" className="ml-2 cursor-pointer font-medium">Autre</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Section Configuration du Code */}
                {submissionType === "code" && isEditMode && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h3 className="mb-3 text-sm font-medium uppercase text-gray-500">Configuration de l&aposéditeur de code</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="language" className="mb-1 block text-gray-700">Langage de programmation</Label>
                          <Select value={language} onValueChange={(value) => setLanguage(value as never)}>
                            <SelectTrigger id="language" className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
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
                          <Label htmlFor="initialCode" className="mb-1 block text-gray-700">Code initial</Label>
                          <Textarea
                              id="initialCode"
                              value={initialCode}
                              onChange={(e) => setInitialCode(e.target.value)}
                              rows={5}
                              className="font-mono text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="// Code initial que l'étudiant verra"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="text-gray-700">Tests automatiques</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
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
                          <div className="mt-2 space-y-4">
                            {codeTests.map((test, index) => (
                                <div key={test.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="font-medium text-gray-700">Test {index + 1}</span>
                                    {codeTests.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 rounded-full p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => {
                                              setCodeTests(codeTests.filter((_, i) => i !== index))
                                            }}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                    )}
                                  </div>
                                  <div className="grid gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label htmlFor={`test-name-${test.id}`} className="text-xs text-gray-600">Nom du test</Label>
                                        <Input
                                            id={`test-name-${test.id}`}
                                            value={test.name}
                                            onChange={(e) => {
                                              const newTests = [...codeTests]
                                              newTests[index].name = e.target.value
                                              setCodeTests(newTests)
                                            }}
                                            className="mt-1 text-sm border-gray-200"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`test-expected-${test.id}`} className="text-xs text-gray-600">Résultat attendu</Label>
                                        <Input
                                            id={`test-expected-${test.id}`}
                                            value={test.expectedOutput}
                                            onChange={(e) => {
                                              const newTests = [...codeTests]
                                              newTests[index].expectedOutput = e.target.value
                                              setCodeTests(newTests)
                                            }}
                                            className="mt-1 text-sm border-gray-200"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <Label htmlFor={`test-desc-${test.id}`} className="text-xs text-gray-600">Description</Label>
                                      <Input
                                          id={`test-desc-${test.id}`}
                                          value={test.description}
                                          onChange={(e) => {
                                            const newTests = [...codeTests]
                                            newTests[index].description = e.target.value
                                            setCodeTests(newTests)
                                          }}
                                          className="mt-1 text-sm border-gray-200"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`test-code-${test.id}`} className="text-xs text-gray-600">Code du test</Label>
                                      <Textarea
                                          id={`test-code-${test.id}`}
                                          value={test.testCode}
                                          onChange={(e) => {
                                            const newTests = [...codeTests]
                                            newTests[index].testCode = e.target.value
                                            setCodeTests(newTests)
                                          }}
                                          rows={3}
                                          className="mt-1 font-mono text-sm border-gray-200"
                                      />
                                    </div>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {/* Section Vue Code en lecture seule */}
                {submissionType === "code" && !isEditMode && (
                    <div className="rounded-lg bg-indigo-50 p-5 border border-indigo-100">
                      <div className="mb-4 flex items-center">
                        <CodeIcon className="mr-2 h-5 w-5 text-indigo-600" />
                        <span className="font-medium text-indigo-900">Devoir de programmation</span>
                      </div>
                      <div className="mb-3 space-y-2">
                        <div className="flex items-center">
                          <span className="w-32 text-sm font-medium text-gray-600">Langage:</span>
                          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200 font-medium">
                            {language.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <span className="w-32 text-sm font-medium text-gray-600">Tests:</span>
                          <span className="text-gray-700">{codeTests.length} test(s) configuré(s)</span>
                        </div>
                      </div>
                      {initialCode && (
                          <div className="mt-4">
                            <span className="block text-sm font-medium text-gray-600 mb-2">Code initial:</span>
                            <div className="max-h-40 overflow-auto rounded-lg bg-white p-3 text-xs font-mono border border-indigo-200">
                              {initialCode}
                            </div>
                          </div>
                      )}
                    </div>
                )}

                {/* Section Document */}
                {isEditMode && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h3 className="mb-3 text-sm font-medium uppercase text-gray-500">Document</h3>
                      <Label htmlFor="file" className="mb-1 block text-gray-700">Document du devoir (PDF)</Label>
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
                          <Button
                              type="button"
                              variant="outline"
                              className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {fileUrl ? "Changer le fichier" : "Choisir un fichier"}
                          </Button>
                          {(file || assignment.fileName) && (
                              <span className="text-sm text-gray-600">{file?.name || assignment.fileName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                )}

                {fileUrl && (
                    <div className="mt-4 flex items-center rounded-lg bg-blue-50 p-3 border border-blue-100 text-sm text-blue-800">
                      <FileText className="mr-2 h-5 w-5 text-blue-500" />
                      Document PDF joint
                      {isEditMode && (
                          <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-auto h-7 w-7 rounded-full p-0 text-red-500 hover:bg-red-50"
                              onClick={() => setFileUrl(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                      )}
                    </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t pt-5 flex justify-between">
                {isEditMode && (
                    <Button
                        type="button"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                )}
                <div className="ml-auto flex gap-3">
                  <Button
                      variant="outline"
                      type="button"
                      className="border-gray-300 hover:bg-gray-50"
                      onClick={onClose}
                  >
                    {isEditMode ? "Annuler" : "Fermer"}
                  </Button>
                  {isEditMode && (
                      <Button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Enregistrer
                      </Button>
                  )}
                </div>
              </div>
            </form>

            {/* Dialog de confirmation de suppression */}


        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">Êtes-vous sûr de vouloir supprimer ce devoir ?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Cette action est irréversible. Le devoir sera définitivement supprimé du calendrier.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">Annuler</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDelete(assignment.id)}>
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </AlertDialogContent>
        </AlertDialog>
      </>
  )
}
