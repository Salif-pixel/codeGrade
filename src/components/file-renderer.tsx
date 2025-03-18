// components/FileRenderer.tsx
import { useState, useEffect } from 'react';
import { extractContentFromDocument } from '@/actions/examActions';

interface FileRendererProps {
  fileurl: string;
  type: 'pdf' | 'md' | 'latex' | 'txt';
}

export default function FileRenderer({ fileurl, type }: FileRendererProps) {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    async function loadContent() {
      try {
        // Fetch the file from the provided URL
        const response = await fetch(fileurl);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

        // Convert response to a Blob and create a File object
        const blob = await response.blob();
        const file = new File([blob], 'file', { type: blob.type });

        // Extract content
        const extracted = await extractContentFromDocument(file, type);
        setContent(extracted);
      } catch (error) {
        console.error('Erreur lors de l’extraction du contenu : ', error);
        setContent('Erreur lors du chargement du fichier.');
      }
    }

    loadContent();
  }, [fileurl, type]);

  return (
    <div>
      {type === 'md' ? (
        <div dangerouslySetInnerHTML={{ __html: content }} className='p-4 break-all text-wrap' />
      ) : (
        <pre>{content}</pre>
      )}
    </div>
  );
}
