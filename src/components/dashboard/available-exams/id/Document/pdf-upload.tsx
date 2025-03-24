"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, FileText, Upload, Loader2, X } from "lucide-react"

interface PdfUploadProps {
    onSubmit: (data: { file: File }) => void
    isSubmitting: boolean
    documentAnswer: File | null
    setDocumentAnswer: React.Dispatch<React.SetStateAction<File | null>>
}

export default function PdfUpload({ onSubmit, isSubmitting, documentAnswer, setDocumentAnswer }: PdfUploadProps) {
    const [error, setError] = useState<string | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null)

        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]

            // Vérifier le type de fichier
            if (selectedFile.type !== "application/pdf") {
                setError("Seuls les fichiers PDF sont acceptés")
                return
            }

            // Vérifier la taille du fichier (max 10 Mo)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError("Le fichier est trop volumineux (max 10 Mo)")
                return
            }

            setDocumentAnswer(selectedFile)

            // Créer une URL pour la prévisualisation
            const fileUrl = URL.createObjectURL(selectedFile)
            setPreview(fileUrl)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!documentAnswer) {
            setError("Veuillez sélectionner un fichier PDF")
            return
        }

        onSubmit({ file: documentAnswer })
    }

    const clearFile = () => {
        setDocumentAnswer(null)
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card className={error ? "border-red-300" : ""}>
                <CardHeader>
                    <CardTitle className="text-lg">Déposer votre devoir</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="file">Fichier PDF</Label>
                            <input
                                type="file"
                                id="file"
                                ref={fileInputRef}
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {!documentAnswer ? (
                                <div
                                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-500 p-6 hover:bg-zinc-200 dark:hover:bg-zinc-950 "
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                    <p className="text-sm font-medium">Cliquez pour sélectionner un fichier PDF</p>
                                    <p className="text-xs text-gray-500">ou glissez-déposez votre fichier ici</p>
                                </div>
                            ) : (
                                <div className="mt-2 rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <p className="font-medium">{documentAnswer.name}</p>
                                                <p className="text-xs text-gray-500">{(documentAnswer.size / 1024 / 1024).toFixed(2)} Mo</p>
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={clearFile}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {preview && (
                                        <div className="mt-4 rounded border">
                                            <iframe src={preview} className="h-auto w-full aspect-[1/1.4142] rounded" title="Prévisualisation du PDF" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={!documentAnswer || isSubmitting} onClick={handleSubmit}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Soumission en cours...
                            </>
                        ) : (
                            "Soumettre mon devoir"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}

