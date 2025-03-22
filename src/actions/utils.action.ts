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
                const blob = new Blob([buffer])
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
    } catch (error) {
        console.error("Error extracting content:", error)
        throw new Error(`Failed to extract content from ${type} file: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
}

export async function fetchContent(filePath: string): Promise<string> {
    const response = await fetch(filePath);
    const blob = await response.blob();
    const file = new File([blob], "document", {type: blob.type});

    let content = '';

    switch (file.type) {
        case 'application/pdf':
            content = await extractContentFromDocument(file, 'pdf');
            break
        case 'text/markdown':
            content = await extractContentFromDocument(file, 'md');
            break
        case 'application/x-latex':
            content = await extractContentFromDocument(file, 'latex');
            break
        case 'text/plain':
            content = await extractContentFromDocument(file, 'txt');
            break;
        default:
            throw new Error('Unsupported file type');
    }

    return content;
}
