"use client"

import React, {useState, useTransition} from "react";
import {SimpleHeaderTitle} from "@/components/dashboard/header/header-title";
import StepperProgressComponent from "@/components/dashboard/exams/create/StepperProgressComponent";
import {Notebook} from "lucide-react";
import {useEdgeStore} from "@/lib/edgestore";
import {useCustomToast} from "@/components/utilities/alert/alert";
import CreationContentComponent from "@/components/dashboard/exams/create/creation-content-component";
import StepContent from "@/components/dashboard/exams/create/stepContent";
import {ExamType} from "@prisma/client"
import {generateCodeTestCases, generateDocumentAnswers, generateQCMAnswers} from "@/actions/ai-integration.action";
import {createQcmExam, createCodeExam, createDocumentExam} from "@/actions/create-exam.action";
import {redirect} from "@/i18n/navigation";
import {extractContentFromDocument} from "@/actions/utils.action";

export interface CreateExamsPageProps {
    userId?: string
}

export interface Question {
    id: string;
    text: string;
    maxPoints: number;
    choices: string[];
    programmingLanguage?: string;
    answer?: string;
    examId?: string;
}

export interface FormDataI {
    title: string;
    description: string;
    format: ExamType;
    startDate: string;
    endDate: string;
    file?: File;
    questions: Question[];
}

export interface AiAnswer{
    questionId: number;
    correctAnswers: string[];
    explanation: string;
    feedback: {
        correct: string,
        incorrect: string
    }
}

export interface AiTestCase{
    questionId: number;
    testCases: {
        input: string,
        expectedOutput: string
    }[];
}

const CreateExamPage = ({userId}: CreateExamsPageProps) => {

    const [currentStep, setCurrentStep] = useState<number>(1)
    const [formData, setFormData] = useState<FormDataI>({
        title: "",
        description: "",
        format: "QCM",
        startDate: new Date().toISOString().slice(0, 16) + ":00",
        endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16) + ":00",
        file: undefined,
        questions: [{
            id: "1",
            text: "",
            maxPoints: 5,
            choices: [""],
            programmingLanguage: undefined,
            answer: ""
        }]
    })
    const { edgestore } = useEdgeStore();
    const { showToast } = useCustomToast()
    const [ isPending, startTransition] = useTransition()

    const totalSteps = 4

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const nextStep = () => {
        if(!validateStep()){
            showToast("erreur", "veuillez remplir les champs correctement", "error")
            return ;
        }
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        }
    }

    const validateStep = () => {
        if (currentStep === 1) {
            return formData.title.trim() !== "" && formData.format.trim() !== "" && formData.startDate !== "" && formData.endDate !== "";
        } else if (currentStep === 2) {
            return formData.format !== "DOCUMENT" || formData.file !== undefined;
        } else if (currentStep === 3) {
            return formData.format === "DOCUMENT" || formData.questions.every(question =>
                question.text.trim() !== "" &&
                question.maxPoints > 0 &&
                (formData.format === "QCM" ? question.choices.length > 0 && question.choices.every(choice => choice.trim() !== "") : question.programmingLanguage !== undefined)
            );
        } else if (currentStep === 4) {
            return true;
        }
        return false;
    };

    const handleSubmit = async () => {
        startTransition(async () => {
            if (formData.format === "DOCUMENT")
            {
                if (!formData.file) {
                    showToast("erreur", "veuillez choisir un fichier", "error");
                    return;
                }

                const allowedMimeTypes = [
                    "application/pdf",
                    "text/markdown",
                    "text/x-latex",
                    "text/plain"
                ];

                const typesExt = [
                    "pdf",
                    "md",
                    "latex",
                    "txt"
                ]

                if (!allowedMimeTypes.includes(formData.file.type)) {
                    showToast("erreur", "Veuillez choisir un fichier de type PDF, MD, LaTeX ou TXT", "error");
                    return;
                }

                const text = await extractContentFromDocument(formData.file as File, typesExt[allowedMimeTypes.indexOf(formData.file?.type)] as "pdf" | "md" | "latex" | "txt")

                const aiResponses = await generateDocumentAnswers(text);

                if(!aiResponses.success){
                    showToast("erreur", aiResponses.error, "error");
                    return ;
                }

                const uploadedFileMeta = await edgestore.publicFiles.upload({
                    file: formData.file as File,
                    onProgressChange: (progress) => {
                        console.log(progress);
                    },
                });

                const aiData : string = aiResponses.data as string;


                const formattedExam = {
                    title: formData.title,
                    description: formData.description,
                    type: ExamType.DOCUMENT,
                    startDate: new Date(formData.startDate),
                    endDate: new Date(formData.endDate),
                    examDocumentPath: uploadedFileMeta.url,
                    aiCorrection: aiData,
                }

                console.log(formattedExam);

                const addResult = await createDocumentExam(formattedExam as never, userId as string);

                if(addResult.success){
                    showToast("success", "exam created !", "success");
                    redirect({locale: "fr", href: "/exams"});

                }else{
                    showToast('error', addResult.error, 'error');
                }

            }
            else if(formData.format === "QCM")
            {

                const aiResponses = await generateQCMAnswers(formData.questions);

                if(!aiResponses.success){
                    showToast("erreur", aiResponses.error, "error");
                    return ;
                }

                const aiData : AiAnswer[] = aiResponses.data as AiAnswer[];

                const questionsWithAiAnswers = formData.questions.map((question, index) => {
                    // const current : AiAnswer = aiData.find(q => q.questionId === index + 1) as AiAnswer;
                    const current : AiAnswer = aiData[index] as AiAnswer;
                    if(!current){return question;}
                    return {
                        ...question,
                        correctAnswer: current.correctAnswers ?? "",
                        explanation: current.explanation ?? "",
                        feedbackCorrect: current.feedback.correct ?? "",
                        feedbackIncorrect: current.feedback.incorrect ?? "",
                    }
                })

                console.log(questionsWithAiAnswers);

                const formattedExam = {
                    title: formData.title,
                    description: formData.description,
                    type: ExamType.QCM,
                    startDate: new Date(formData.startDate),
                    endDate: new Date(formData.endDate),
                    questions: questionsWithAiAnswers
                }

                const addResult = await createQcmExam(formattedExam as never, userId as string);

                if(addResult.success){
                    showToast("success", "exam created !", "success");
                    redirect({locale: "fr", href: "/exams"});

                }else{
                    showToast('error', addResult.error, 'error');
                }

            }
            else
            {

                const aiResponses = await generateCodeTestCases(formData.questions);

                if(!aiResponses.success){
                    showToast("erreur", aiResponses.error, "error");
                    return ;
                }

                const aiData : AiTestCase[] = aiResponses.data as AiTestCase[];

                const questionsWithTestCases = formData.questions.map((question, index) => {
                    // const current : AiAnswer = aiData.find(q => q.questionId === index + 1) as AiAnswer;
                    const current : AiTestCase = aiData[index] as AiTestCase;
                    if(!current){return question;}
                    return {
                        ...question,
                        testCases: current.testCases ?? "",
                    }
                })

                console.log(questionsWithTestCases);

                const formattedExam = {
                    title: formData.title,
                    description: formData.description,
                    type: ExamType.CODE,
                    startDate: new Date(formData.startDate),
                    endDate: new Date(formData.endDate),
                    questions: questionsWithTestCases
                }

                const addResult = await createCodeExam(formattedExam as never, userId as string);

                if(addResult.success){
                    showToast("success", "exam created !", "success");
                    redirect({locale: "fr", href: "/exams"});

                }else{
                    showToast('error', addResult.error, 'error');
                }

            }

        })
    }

    return (
        <>
            <SimpleHeaderTitle
                title={'exams.createNew'}
                Icon={<Notebook className="h-5 w-5" />}
            />
            <div className="container py-10">
                <StepperProgressComponent currentStep={currentStep} setCurrentStep={setCurrentStep}/>

                <CreationContentComponent currentStep={currentStep} nextStep={nextStep} prevStep={prevStep} handleSubmit={handleSubmit} isPending={isPending}>
                    <>
                        <StepContent currentStep={currentStep} formData={formData} setFormData={setFormData} />
                    </>
                </CreationContentComponent>

            </div>
        </>
    );
};

export default CreateExamPage;
