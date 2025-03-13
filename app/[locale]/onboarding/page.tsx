"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@src/components/ui/card"
import { Progress } from "@src/components/ui/progress"
import UserTypeSelection from "@src/components/onboarding/user-type-selection"
import VerificationStep from "@src/components/onboarding/verification-step"
import TeacherInfoForm from "@src/components/onboarding/teacher-info-form"
import StudentInfoForm from "@src/components/onboarding/student-info-form"
import CompletionStep from "@src/components/onboarding/completion-step"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<"teacher" | "student" | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [formData, setFormData] = useState({
    teacher: {
      school: "",
      subject: "",
      gradeLevel: "",
      experience: "",
    },
    student: {
      school: "",
      grade: "",
      subjects: [] as string[],
    },
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Complete onboarding and redirect to dashboard
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const updateFormData = (type: "teacher" | "student", data: any) => {
    setFormData({
      ...formData,
      [type]: {
        ...formData[type],
        ...data,
      },
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Let&apos;s set up your account to get the most out of our AI grading platform
          </CardDescription>
          <Progress value={progress} className="h-2 mt-4" />
        </CardHeader>
        <CardContent className="py-6">
          {step === 1 && <UserTypeSelection selectedType={userType} onSelect={(type) => setUserType(type)} />}

          {step === 2 && <VerificationStep isVerified={isVerified} onVerify={() => setIsVerified(true)} />}

          {step === 3 && userType === "teacher" && (
            <TeacherInfoForm data={formData.teacher} onChange={(data) => updateFormData("teacher", data)} />
          )}

          {step === 3 && userType === "student" && (
            <StudentInfoForm data={formData.student} onChange={(data) => updateFormData("student", data)} />
          )}

          {step === 4 && <CompletionStep userType={userType} />}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </div>

          <Button onClick={handleNext} disabled={(step === 1 && !userType) || (step === 2 && !isVerified)}>
            {step === totalSteps ? (
              <>
                Complete
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

