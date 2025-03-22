"use client"

import { useState, useEffect } from "react"

interface PdfViewerProps {
    pdfUrl: string
    height?: string
}

export default function PdfViewer({ pdfUrl, height = "500px" }: PdfViewerProps) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return (
            <div className="flex items-center justify-center bg-gray-100" style={{ height }}>
                Chargement du document...
            </div>
        )
    }

    return (
        <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
            className="w-full"
            style={{ height }}
            frameBorder="0"
        />
    )
}

