'use server'

import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";

async function fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer()
    return Buffer.from(arrayBuffer)
}

export async function extractContentFromDocument(file: File, type: "pdf" | "md" | "latex" | "txt"): Promise<string> {
    try {
        const buffer = await fileToBuffer(file)

        switch (type) {
            case "pdf": {
                // Create a blob from the buffer
                const blob = new Blob([buffer])
                // Use PDFLoader to extract text from PDF
                const loader = new PDFLoader(blob)
                const docs = await loader.load()
                return docs.map((doc: { pageContent: string }) => doc.pageContent).join("\n")
            }

            case "md":
            case "latex":
            case "txt": {
                // For text-based formats, we can just return the text content
                return buffer.toString("utf-8")
            }

            default:
                throw new Error(`Unsupported file type: ${type}`)
        }
    } catch (error : any) {
        console.error("Error extracting content:", error)
        throw new Error(`Failed to extract content from ${type} file: ${error.message}`)
    }
}
