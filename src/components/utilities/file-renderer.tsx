"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FileRendererProps {
  file: File
  content: string | ArrayBuffer | null
}

export default function FileRenderer({ file, content }: FileRendererProps) {
  const [renderedLatex, setRenderedLatex] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("preview")
  const [pdfUrl, setPdfUrl] = useState<string>("")

  const fileType = getFileType(file)

  // Gestion de l'URL blob pour le PDF
  useEffect(() => {
    if (fileType === "pdf") {
      const url = content instanceof ArrayBuffer
        ? URL.createObjectURL(new Blob([content], { type: 'application/pdf' }))
        : URL.createObjectURL(file)
      setPdfUrl(url)

      // Nettoyage de l'URL lors du démontage
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [content, file, fileType])

  function getFileType(file: File): "markdown" | "text" | "pdf" | "latex" | "unknown" {
    const extension = file.name.split(".").pop()?.toLowerCase()

    if (file.type === "text/markdown" || extension === "md") {
      return "markdown"
    } else if (file.type === "application/pdf" || extension === "pdf") {
      return "pdf"
    } else if (extension === "tex") {
      return "latex"
    } else if (file.type === "text/plain" || extension === "txt") {
      return "text"
    }

    return "unknown"
  }

  if (fileType === "unknown") {
    return <div className="text-center py-10">Type de fichier non supporté</div>
  }

  if (fileType === "pdf") {
    return (
      <iframe
        src={pdfUrl ? (pdfUrl == "" ? undefined : pdfUrl) : undefined}
        className="w-full aspect-[1/1.4142] h-auto rounded-lg border border-gray-200"
        title="PDF Viewer"
      />
    )
  }

  if (fileType === "markdown") {
    return (
      <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="min-h-[300px]">
          <article className="prose dark:prose-invert max-w-none">
            {typeof content === "string" && <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>}
          </article>
        </TabsContent>

        <TabsContent value="source">
          <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[500px]">
            <code>{typeof content === "string" ? content : "Impossible d'afficher le contenu"}</code>
          </pre>
        </TabsContent>
      </Tabs>
    )
  }

  if (fileType === "latex") {
    return (
      <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="min-h-[300px]">
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderedLatex }} />
        </TabsContent>

        <TabsContent value="source">
          <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[500px]">
            <code>{typeof content === "string" ? content : "Impossible d'afficher le contenu"}</code>
          </pre>
        </TabsContent>
      </Tabs>
    )
  }

  // Fichiers texte
  return (
    <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[500px] whitespace-pre-wrap">
      {typeof content === "string" ? content : "Impossible d'afficher le contenu"}
    </pre>
  )
}
