"use client"

import {Card, CardContent} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {ArrowLeft, ArrowRight, Bot, Loader2} from "lucide-react";
import React from "react";
import {useTranslations} from "next-intl";

interface CreationContentComponentProps {
    currentStep: number
    nextStep: () => void
    prevStep: () => void
    handleSubmit: () => void
    isPending: boolean
    children: React.ReactNode,
}

export default function CreationContentComponent(
    {
        currentStep,
        nextStep,
        prevStep,
        isPending,
        handleSubmit,
        children,

    } : CreationContentComponentProps) {

    const totalSteps = 4;

    const t = useTranslations("exams")
    return (
        <>
            <Card className="shadow-lg border-zinc-200 dark:border-primary/20">
                <CardContent className="p-6">
                    {children}

                    <Separator className="my-6"/>

                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="transition-all hover:border-primary hover:text-primary"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            {t('back')}
                        </Button>

                        {currentStep < totalSteps ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {t('next')}
                                <ArrowRight className="ml-2 h-4 w-4"/>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isPending}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    {isPending ? (
                                        <div className="flex items-center">
                                            <Bot className="mr-2 h-4 w-4 animate-pulse"/>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                            {t('saving')}
                                        </div>
                                    ) : (
                                        <>
                                            <Bot className="mr-2 h-4 w-4"/>
                                            {t('saveExam')}
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
