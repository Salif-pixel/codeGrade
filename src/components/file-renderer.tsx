// components/FileRenderer.tsx
import { useState, useEffect } from 'react';
import { extractContentFromDocument } from '@/actions/examActions';
interface FileRendererProps {
  fileurl: string;
  type: 'pdf' | 'md' | 'latex' | 'txt';
}

export default function FileRenderer({ fileurl, type }: FileRendererProps) {
  const [content, setContent] = useState<string>('');
  const file = new File([fileurl], fileurl, { type: type });

  useEffect(() => {
    async function loadContent() {
      try {
        const extracted = await extractContentFromDocument(file, type);
        setContent(extracted);
      } catch (error) {
        console.error('Erreur lors de l’extraction du contenu : ', error);
      }
    }
    loadContent();
  }, [file, type]);

  return (
    <div>
      {type === 'md' ? (
        // Pour le markdown, on affiche le HTML converti en utilisant dangerouslySetInnerHTML
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        // Pour les autres types, on affiche le contenu dans une balise pre pour conserver le formatage
        <pre>{content}</pre>
      )}
    </div>
  );
}
