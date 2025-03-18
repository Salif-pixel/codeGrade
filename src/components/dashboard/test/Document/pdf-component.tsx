import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Clock, FileText } from "lucide-react"
import PdfUpload from "@/components/dashboard/test/Document/pdf-upload"
import FileRenderer from "@/components/file-renderer"

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
  const [file, setFile] = useState<File | null>(null)
  const [content, setContent] = useState<string | ArrayBuffer | null>(null)

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
        .catch((error) => console.error("Erreur lors du chargement du fichier :", error))
    }
  }, [assignment.filePath])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="instructions" className="flex-1">Instructions</TabsTrigger>
            <TabsTrigger value="document" className="flex-1 lg:hidden">Document</TabsTrigger>
          </TabsList>
          <TabsContent value="instructions" className="mt-4">
            <Card className="p-4">
              <h2 className="mb-2 text-lg font-semibold">Instructions</h2>
              <p className="mb-4">
                Téléchargez le document, rédigez votre réponse et soumettez-la au format PDF.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Document fourni par le professeur</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Durée: {assignment.duration} minutes</span>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="document" className="mt-4">
            <div className="rounded border p-4">
              {assignment.filePath && file ? (
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Votre document soumis</h3>
                  <FileRenderer file={file} content={content} />
                </div>
              ) : (
                <div className="flex h-[600px] items-center justify-center bg-gray-100">
                  <p>Aucun document soumis</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <PdfUpload onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>

      <div className="hidden lg:block">
        <h2 className="mb-4 text-lg font-semibold">Document du professeur</h2>
        <div className="rounded border p-4">
          {assignment.filePath && file ? (
            <FileRenderer file={file} content={content} />
          ) : (
            <div className="flex h-[800px] items-center justify-center bg-gray-100">
              <p>Aucun document fourni par le professeur</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
