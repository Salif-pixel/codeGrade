"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Clock, FileText } from "lucide-react"
import PdfUpload from "@/components/dashboard/available-exams/id/Document/pdf-upload"
import FileRenderer from "@/components/utilities/file-renderer"
import { extractContentFromDocument } from "@/actions/utils.action"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTranslations } from "next-intl"
import { ExamData } from "@/components/dashboard/exams/types"

interface PdfComponentProps {
  assignment: ExamData
  activeTab: string
  setActiveTab: (tab: string) => void
  handleSubmit: () => Promise<void>
  isSubmitting: boolean
}

export default function PdfComponent({
  assignment,
  activeTab,
  setActiveTab,
  handleSubmit,
  isSubmitting,
}: PdfComponentProps) {
  const t = useTranslations("exam-taking")
  const [file, setFile] = useState<File | null>(null)
  const [content, setContent] = useState<string | ArrayBuffer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (assignment.examDocumentPath) {
      fetch(assignment.examDocumentPath)
        .then((res) => res.blob())
        .then((blob) => {
          const newFile = new File([blob], "document.pdf", { type: "application/pdf" })
          setFile(newFile)

          const reader = new FileReader()
          reader.onload = () => setContent(reader.result)
          reader.readAsText(blob)
        })
        .catch((error) => {
          console.error("Erreur lors du chargement du fichier :", error)
          setError(t("fileLoadError"))
        })
    }
  }, [assignment.examDocumentPath, t])

  const onSubmit = async (data: { file: File }) => {
    try {
      setError(null)
      setSuccess(null)

      if (!data.file.type.includes('pdf')) {
        setError(t("invalidFileType"))
        return
      }

      if (data.file.size > 10 * 1024 * 1024) {
        setError(t("fileTooLarge"))
        return
      }

      await handleSubmit()
      setSuccess(t("submitSuccess"))
    } catch (error) {
      console.error("Erreur lors de la soumission :", error)
      setError(t("submitError"))
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="instructions" className="flex-1">{t("instructions.title")}</TabsTrigger>
            <TabsTrigger value="document" className="flex-1 lg:hidden">{t("document")}</TabsTrigger>
          </TabsList>
          <TabsContent value="instructions" className="mt-4">
            <Card className="p-4">
              <h2 className="mb-2 text-lg font-semibold">{t("instructions.title")}</h2>
              <p className="mb-4">
                {t("instructions.document")}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>{t("professorDocument")}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>{t("timeRemaining", { time: assignment.timeRemaining })}</span>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="document" className="mt-4">
            <div className="rounded border p-4">
              {assignment.examDocumentPath && file ? (
                <div>
                  <h3 className="mb-2 text-lg font-semibold">{t("professorDocument")}</h3>
                  <FileRenderer file={file} content={content} />
                </div>
              ) : (
                <div className="flex h-[600px] items-center justify-center bg-gray-100">
                  <p>{t("noDocument")}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <PdfUpload onSubmit={onSubmit} isSubmitting={isSubmitting} />

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>{t("error")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mt-4 bg-green-50">
            <AlertTitle>{t("success")}</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="hidden lg:block">
        <h2 className="mb-4 text-lg font-semibold">{t("professorDocument")}</h2>
        <div className="rounded border p-4">
          {assignment.examDocumentPath && file ? (
            <FileRenderer file={file} content={content} />
          ) : (
            <div className="flex h-[800px] items-center justify-center bg-gray-100">
              <p>{t("noDocument")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
