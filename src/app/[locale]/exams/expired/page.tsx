import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ExamExpiredPage() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Examen expiré</CardTitle>
          <CardDescription>
            Désolé, cet examen n&apos;est plus disponible pour l&apos;inscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              L&apos;examen auquel vous essayez d&apos;accéder est terminé ou
              n&apos;accepte plus de nouvelles inscriptions.
            </p>
            <div className="flex justify-end">
              <Button asChild>
                <Link href="/dashboard">Retour au tableau de bord</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 