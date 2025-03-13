'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle } from 'lucide-react'
import { Button } from '@src/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@src/components/ui/alert'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto p-8 flex items-center justify-center min-h-[60vh]">
      <Alert variant="destructive" className="max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('title')}</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>{t('description')}</p>
          {error.message && (
            <p className="text-sm font-mono bg-secondary/30 p-2 rounded">
              {error.message}
            </p>
          )}
          <Button
            variant="outline"
            onClick={() => reset()}
            className="mt-4"
          >
            {t('tryAgain')}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}