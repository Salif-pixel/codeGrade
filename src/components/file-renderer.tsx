"use client"

import { useState, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface FileRendererProps {
  file: File
  content: string | ArrayBuffer | null
}

export default function FileRenderer({ file, content }: FileRendererProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [renderedLatex, setRenderedLatex] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("preview")

  const fileType = getFileType(file)

  useEffect(() => {
    if (fileType === "latex" && typeof content === "string") {
      // For LaTeX files, we'll render them using KaTeX
      import("katex").then((katex) => {
        try {
          // Basic LaTeX rendering
          const html = content
            .split("\n")
            .map((line) => {
              if (line.includes("$$")) {
                try {
                  const mathContent = line.split("$$")[1]
                  return katex.renderToString(mathContent, { displayMode: true })
                } catch (e) {
                  return line
                }
              }
              return line
            })
            .join("<br />")

          setRenderedLatex(html)
        } catch (e) {
          setRenderedLatex("Failed to render LaTeX content")
        }
      })
    }
  }, [content, fileType])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

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
    return <div className="text-center py-10">Unsupported file type</div>
  }

  if (fileType === "pdf") {
    return (
      <div className="flex flex-col items-center">
        <Document
          file={content}
          onLoadSuccess={onDocumentLoadSuccess}
          className="max-w-full"
          error={<div className="text-center py-10">Failed to load PDF. Please check if the file is valid.</div>}
          loading={<div className="text-center py-10">Loading PDF...</div>}
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="max-w-full"
            scale={1}
          />
        </Document>

        {numPages && (
          <div className="flex items-center gap-4 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              Page {pageNumber} of {numPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages || 1))}
              disabled={pageNumber >= (numPages || 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (fileType === "markdown") {
    return (
      <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="min-h-[300px]">
          {/* Use the prose class we defined in globals.css */}
          <article className="prose">
            {typeof content === "string" && <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>}
          </article>
        </TabsContent>

        <TabsContent value="source">
          <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[500px]">
            <code>{typeof content === "string" ? content : "Cannot display content"}</code>
          </pre>
        </TabsContent>
      </Tabs>
    )
  }

  if (fileType === "latex") {
    return (
      <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="min-h-[300px]">
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderedLatex }} />
        </TabsContent>

        <TabsContent value="source">
          <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[500px]">
            <code>{typeof content === "string" ? content : "Cannot display content"}</code>
          </pre>
        </TabsContent>
      </Tabs>
    )
  }

  // Text files
  return (
    <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[500px] whitespace-pre-wrap">
      {typeof content === "string" ? content : "Cannot display content"}
    </pre>
  )
}

