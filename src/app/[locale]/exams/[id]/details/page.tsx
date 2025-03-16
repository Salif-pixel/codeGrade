import { getExam } from "@/actions/examActions"
import { SimpleHeaderTitle } from "@/components/dashboard/header/header-title"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { useTranslations } from "next-intl"

export default async function ExamDetailsPage({ params }: { params: { id: string } }) {
  const result = await getExam(params.id)
  
  if (!result.success || !result.data) {
    return <div>Exam not found</div>
  }

  const exam = result.data

  return (
    <div className="space-y-6">
      <SimpleHeaderTitle 
        title="exams.details.title" 
        Icon={<FileText className="h-5 w-5 text-primary" />} 
      />

      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>{exam.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {exam.questions?.map((question, index) => (
                <Card key={question.id} className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Question {index + 1}: {question.text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h3 className="font-medium">Réponse suggérée:</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {question.answer}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 