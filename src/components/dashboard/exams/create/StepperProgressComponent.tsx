"use client"

import {Card, CardContent} from "@/components/ui/card";
import {Fragment} from "react";
import {cn} from "@/lib/utils";
import {BookOpen, CheckCircle2, FileQuestion, FileText} from "lucide-react";

interface StepperProgressComponentProps {
    currentStep: number
    setCurrentStep: (step: number) => void
}

export default function StepperProgressComponent({ currentStep, setCurrentStep}: StepperProgressComponentProps) {
    return (
        <>
            <Card className="mb-8 shadow-md border-zinc-200 dark:border-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((step) => (
                            <Fragment key={step}>
                                <div
                                    className={`flex flex-col items-center ${currentStep >= step ? "text-primary" : "text-muted-foreground"
                                    }`}
                                    onClick={() => step < currentStep && setCurrentStep(step)}
                                >
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center font-medium mb-2 cursor-pointer transition-all",
                                            currentStep > step
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : currentStep === step
                                                    ? "border-2 border-primary text-primary shadow-sm"
                                                    : "border-2 border-muted text-muted-foreground",
                                        )}
                                    >
                                        {currentStep > step ? (
                                            <CheckCircle2 className="h-6 w-6" />
                                        ) : (
                                            <>
                                                {step === 1 && <BookOpen className="h-5 w-5" />}
                                                {step === 2 && <FileText className="h-5 w-5" />}
                                                {step === 3 && <FileQuestion className="h-5 w-5" />}
                                                {step === 4 && <CheckCircle2 className="h-5 w-5" />}
                                            </>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium">
                      {step === 1 && "Etape 1"}
                                        {step === 2 && "Etape 2"}
                                        {step === 3 && "Etape 3"}
                                        {step === 4 && "Etape 4"}
                    </span>
                                </div>

                                {step < 4 && (
                                    <div className={cn("w-24 h-0.5 mt-6", currentStep > step ? "bg-primary" : "bg-muted")} />
                                )}
                            </Fragment>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
