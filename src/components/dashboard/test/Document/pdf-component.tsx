import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Clock, FileText } from "lucide-react"
import PdfUpload from "@/components/dashboard/test/Document/pdf-upload"
import FileRenderer from "@/components/utilities/file-renderer"
import { extractContentFromDocument } from "@/actions/utils.action"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTranslations } from "next-intl"

export default function PdfComponent({
  assignment,
  activeTab,
  setActiveTab,
  handleSubmit,
  isSubmitting,
  submittedFile,
}: {
  assignment: any
  activeTab: string
  setActiveTab: any
  handleSubmit: any
  isSubmitting: any
  submittedFile?: { url: string; type: string }
}) {
  const t = useTranslations("exam-taking")
  const [file, setFile] = useState<File | null>(null)
  const [content, setContent] = useState<string | ArrayBuffer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (assignment.filePath) {
      fetch(assignment.filePath)
        .then((res) => res.blob())
        .then((blob) => {
          const fileType = assignment.format || "txt"
          const newFile = new File([blob], "document." + fileType, { type: blob.type })
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
  }, [assignment.filePath, t])

  const onSubmit = async (data: { file: File }) => {
    try {
      setError(null)
      setSuccess(null)

      // Vérifier le type de fichier
      if (!data.file.type.includes('pdf')) {
        setError(t("invalidFileType"))
        return
      }

      // Vérifier la taille du fichier (max 10MB)
      if (data.file.size > 10 * 1024 * 1024) {
        setError(t("fileTooLarge"))
        return
      }

      // Extraire le contenu du PDF soumis
      const pdfContent = await extractContentFromDocument(data.file, "pdf")

      // Appeler la fonction handleSubmit avec le contenu du PDF
      const result = await handleSubmit(pdfContent)

      if (result?.success) {
        setSuccess(t("submitSuccess"))
      } else {
        setError(result?.error || t("submitError"))
      }
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
                <span>{t("duration", { minutes: assignment.duration })}</span>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="document" className="mt-4">
            <div className="rounded border p-4">
              {assignment.filePath && file ? (
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
          {assignment.filePath && file ? (
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
