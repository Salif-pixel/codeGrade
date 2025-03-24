"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { BookOpen, CheckCircle2, FileQuestion, FileText } from "lucide-react"

interface StepperProgressComponentProps {
    currentStep: number
    setCurrentStep: (step: number) => void
}

export default function StepperProgressComponent({ currentStep, setCurrentStep }: StepperProgressComponentProps) {
    const totalSteps = 4
    const [animatedProgress, setAnimatedProgress] = useState(0)

    // Animate progress when currentStep changes
    useEffect(() => {
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100
        setAnimatedProgress(0)

        // Small delay before animation for better visual effect
        const timeout = setTimeout(() => {
            setAnimatedProgress(progress)
        }, 50)

        return () => clearTimeout(timeout)
    }, [currentStep, totalSteps])

    return (
        <Card className="mb-8 shadow-md border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-6 sm:p-8">
                {/* Main progress bar */}
                <div className="relative h-1.5 bg-muted/50 rounded-full mb-10 mt-2">
                    <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${animatedProgress}%` }}
                    />

                    {/* Step indicators */}
                    <div className="absolute top-0 left-0 w-full flex justify-between">
                        {[1, 2, 3, 4].map((step) => {
                            const isCompleted = currentStep > step
                            const isCurrent = currentStep === step

                            return (
                                <div
                                    key={step}
                                    className={cn(
                                        "relative flex flex-col items-center -mt-2",
                                        (isCompleted || isCurrent) && "cursor-pointer",
                                    )}
                                    onClick={() => (isCompleted || isCurrent) && setCurrentStep(step)}
                                >
                                    {/* Step marker */}
                                    <div
                                        className={cn(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                            isCompleted
                                                ? "bg-primary border-primary"
                                                : isCurrent
                                                    ? "bg-background border-primary ring-4 ring-primary/20"
                                                    : "bg-muted border-muted-foreground/30",
                                        )}
                                    >
                                        {isCompleted && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                                    </div>

                                    {/* Step details - positioned below the marker */}
                                    <div className="absolute top-8 -translate-x-1/2 left-1/2 w-max">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-all duration-300",
                                                    isCompleted
                                                        ? "bg-primary/10 text-primary"
                                                        : isCurrent
                                                            ? "bg-primary text-primary-foreground shadow-md"
                                                            : "bg-muted/70 text-muted-foreground",
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : (
                                                    <>
                                                        {step === 1 && <BookOpen className="h-5 w-5" />}
                                                        {step === 2 && <FileText className="h-5 w-5" />}
                                                        {step === 3 && <FileQuestion className="h-5 w-5" />}
                                                        {step === 4 && <CheckCircle2 className="h-5 w-5" />}
                                                    </>
                                                )}
                                            </div>

                                            <span
                                                className={cn(
                                                    "text-xs font-medium whitespace-nowrap transition-colors duration-300",
                                                    isCompleted || isCurrent ? "text-primary" : "text-muted-foreground",
                                                )}
                                            >
                        {step === 1 && "Etape 1"}
                                                {step === 2 && "Etape 2"}
                                                {step === 3 && "Etape 3"}
                                                {step === 4 && "Etape 4"}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Mobile view - simplified progress indicators */}
                <div className="sm:hidden mt-16 pt-4">
                    <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-primary">
              Etape {currentStep} sur {totalSteps}
            </span>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4].map((step) => (
                                <div
                                    key={step}
                                    onClick={() => step <= currentStep && setCurrentStep(step)}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        step <= currentStep ? "bg-primary" : "bg-muted",
                                        step === currentStep ? "w-6" : "w-3",
                                        step <= currentStep && "cursor-pointer",
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

