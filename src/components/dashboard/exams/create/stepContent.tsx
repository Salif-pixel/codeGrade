import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle2,
    CheckSquare,
    ClipboardList,
    Clock,
    Code,
    FileQuestion,
    FileText,
    HelpCircle,
    Info,
    Plus,
    Trash,
    Upload,
    X
} from "lucide-react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Textarea} from "@/components/ui/textarea";
import React, {useRef} from "react";
import {useTranslations} from "next-intl";
import {FormDataI, Question} from "@/components/dashboard/exams/create/main";

interface StepContentProps {
    currentStep: number;
    formData: FormDataI
    setFormData: React.Dispatch<React.SetStateAction<FormDataI>>;
}

export default function StepContent({currentStep, formData, setFormData}: StepContentProps) {
    const t = useTranslations("exams");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (field: string, value: string | File | undefined) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({...prev, file}));
        }
    };

    const handleChoiceChange = (questionId: string, choiceIndex: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === questionId ? {...q, choices: q.choices.map((c, i) => (i === choiceIndex ? value : c))} : q
            ),
        }));
    };

    const addChoice = (questionId: string) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === questionId ? {...q, choices: [...q.choices, ""]} : q
            ),
        }));
    };

    const removeChoice = (questionId: string, choiceIndex: number) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === questionId ? {...q, choices: q.choices.filter((_, i) => i !== choiceIndex)} : q
            ),
        }));
    };

    const addQuestion = () => {
        setFormData((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    id: Date.now().toString(),
                    text: "",
                    maxPoints: 10,
                    choices: prev.format === "QCM" ? [""] : [],
                    programmingLanguage: prev.format === "CODE" ? "javascript" : undefined,
                },
            ],
        }));
    };

    const removeQuestion = (id: string) => {
        if (formData.questions.length > 1) {
            setFormData((prev) => ({
                ...prev,
                questions: prev.questions.filter((q) => q.id !== id),
            }));
        } else {
            // Show toast or warning message
        }
    };

    const updateQuestion = (id: string, field: keyof Question, value: string | number | undefined) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === id ? {...q, [field]: value} : q
            ),
        }));
    };

    switch (currentStep) {
        case 1:
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-primary"/>
                        <h2 className="text-xl font-semibold">{t("basicInfo")}</h2>
                    </div>

                    <Card className="dark:bg-zinc-900 border-primary/20">
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4 text-primary"/>
                                        {t("title")}
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            {t("required")}
                                        </Badge>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        placeholder={t("titlePlaceholder")}
                                        className="transition-all focus-visible:ring-primary dark:bg-zinc-800"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="format" className="flex items-center gap-2">
                                        <FileQuestion className="h-4 w-4 text-primary"/>
                                        {t("format")}
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            {t("required")}
                                        </Badge>
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Button
                                            type="button"
                                            variant={formData.format === "QCM" ? "default" : "outline"}
                                            className={cn(
                                                "flex items-center gap-2 w-full",
                                                formData.format === "QCM" && "border-primary"
                                            )}
                                            onClick={() => handleInputChange("format", "QCM")}
                                        >
                                            <CheckSquare className="h-4 w-4"/>
                                            QCM
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={formData.format === "CODE" ? "default" : "outline"}
                                            className={cn(
                                                "flex items-center gap-2 w-full",
                                                formData.format === "CODE" && "border-primary"
                                            )}
                                            onClick={() => handleInputChange("format", "CODE")}
                                        >
                                            <Code className="h-4 w-4"/>
                                            Code
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={formData.format === "DOCUMENT" ? "default" : "outline"}
                                            className={cn(
                                                "flex items-center gap-2 w-full",
                                                formData.format === "DOCUMENT" && "border-primary"
                                            )}
                                            onClick={() => handleInputChange("format", "DOCUMENT")}
                                        >
                                            <FileText className="h-4 w-4"/>
                                            Document
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-primary"/>
                                        {t("description")}
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        placeholder={t("descriptionPlaceholder")}
                                        rows={3}
                                        className="resize-none transition-all focus-visible:ring-primary"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary"/>
                                        {t("startDate")}
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            {t("required")}
                                        </Badge>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="datetime-local"
                                            id="startDate"
                                            className="w-full pl-10 transition-all focus-visible:ring-primary"
                                            value={formData.startDate}
                                            required={true}
                                            onChange={(e) => {
                                                const newStartDate = e.target.value;
                                                handleInputChange("startDate", newStartDate);
                                                if (new Date(newStartDate) > new Date(formData.endDate)) {
                                                    handleInputChange("endDate", newStartDate);
                                                }
                                            }}
                                        />
                                        <Clock
                                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary"/>
                                        {t("endDate")}
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            {t("required")}
                                        </Badge>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="datetime-local"
                                            id="endDate"
                                            className="w-full pl-10 transition-all focus-visible:ring-primary"
                                            value={formData.endDate}
                                            min={formData.startDate}
                                            required={true}
                                            onChange={(e) => handleInputChange("endDate", e.target.value)}
                                        />
                                        <Clock
                                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{t("endDateHelp")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );

        case 2:
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Upload className="h-5 w-5 text-primary"/>
                        <h2 className="text-xl font-semibold">{t("uploadFile")}</h2>
                    </div>

                    <Card className="dark:bg-zinc-900 border-primary/20">
                        <CardContent className="pt-6">
                            {formData.format === "DOCUMENT" ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2 text-lg font-medium">
                                            <FileText className="h-5 w-5 text-primary"/>
                                            {t("uploadDocument")}
                                        </Label>
                                        {formData.file && (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-primary">
                                                    {formData.file.name.split('.').pop()?.toUpperCase()}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive/80"
                                                    onClick={() => {
                                                        handleInputChange("file", undefined);
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = "";
                                                        }
                                                    }}
                                                >
                                                    <X className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept=".pdf,.md,.tex,.txt"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="dark:bg-zinc-800 cursor-pointer file:cursor-pointer file:border-0 file:bg-primary/10 file:text-primary file:font-medium hover:file:bg-primary/20 transition-colors"
                                        />
                                    </div>

                                    {formData.file && (
                                        <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/10">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <FileText className="h-4 w-4"/>
                                                <span className="font-medium">{formData.file.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>{(formData.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                <span>{new Date(formData.file.lastModified).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    className="flex items-center justify-center h-32 rounded-lg bg-primary/5 border border-dashed border-primary/20">
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4"/>
                                        {t("documentUploadNotAllowed")}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            );

        case 3:
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="h-5 w-5 text-primary"/>
                        <h2 className="text-xl font-semibold">{t("questions")}</h2>
                    </div>

                    {formData.format !== "DOCUMENT" && (
                        <div className="space-y-6">
                            {formData.questions.map((question: Question, index: number) => (
                                <Card key={question.id} className="dark:bg-zinc-900 border-primary/20">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-base font-medium">
                                            {t("question")} {index + 1}
                                        </CardTitle>
                                        {formData.questions.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeQuestion(question.id)}
                                                className="h-8 w-8 text-destructive"
                                            >
                                                <Trash className="h-4 w-4"/>
                                            </Button>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`question-${question.id}`}>
                                                {t("questionText")}
                                            </Label>
                                            <Textarea
                                                id={`question-${question.id}`}
                                                value={question.text}
                                                onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                                                className="resize-none dark:bg-zinc-800"
                                                rows={3}
                                            />
                                        </div>

                                        {formData.format === "CODE" && (
                                            <div className="space-y-2">
                                                <Label htmlFor={`language-${question.id}`}>
                                                    {t("programmingLanguage")}
                                                </Label>
                                                <select
                                                    id={`language-${question.id}`}
                                                    value={question.programmingLanguage}
                                                    onChange={(e) => updateQuestion(question.id, "programmingLanguage", e.target.value)}
                                                    className="w-full p-2 rounded-md border dark:bg-zinc-800"
                                                >
                                                    <option value="python">Python</option>
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="java">Java</option>
                                                    <option value="cpp">C++</option>
                                                </select>
                                            </div>
                                        )}

                                        {formData.format === "QCM" && question.choices && (
                                            <div className="space-y-4">
                                                <Label>{t(`choices.${formData.format}`)}</Label>
                                                {question.choices.map((choice: string, choiceIndex: number) => (
                                                    <div key={choiceIndex} className="flex items-center gap-2">
                                                        <Input
                                                            value={choice}
                                                            onChange={(e) =>
                                                                handleChoiceChange(question.id, choiceIndex, e.target.value)
                                                            }
                                                            className="dark:bg-zinc-800"
                                                            placeholder={`${t("choice")} ${choiceIndex + 1}`}
                                                        />
                                                        {question.choices!.length > 1 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeChoice(question.id, choiceIndex)}
                                                                className="h-8 w-8 text-destructive"
                                                            >
                                                                <Trash className="h-4 w-4"/>
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addChoice(question.id)}
                                                    className="mt-2"
                                                >
                                                    <Plus className="h-4 w-4 mr-2"/>
                                                    {t("addChoice")}
                                                </Button>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor={`points-${question.id}`}>
                                                {t("maxPoints")}
                                            </Label>
                                            <Input
                                                id={`points-${question.id}`}
                                                type="number"
                                                min="0"
                                                value={question.maxPoints}
                                                onChange={(e) =>
                                                    updateQuestion(question.id, "maxPoints", parseInt(e.target.value) || 0)
                                                }
                                                className="w-32 dark:bg-zinc-800"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addQuestion}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2"/>
                                {t("addQuestion")}
                            </Button>
                        </div>
                    )}

                    {formData.format === "DOCUMENT" && (
                        <div
                            className="flex items-center justify-center h-32 rounded-lg bg-primary/5 border border-dashed border-primary/20">
                            <p className="text-muted-foreground flex items-center gap-2">
                                <AlertCircle className="h-4 w-4"/>
                                {t("questionsNotRequiredForDOCUMENT")}
                            </p>
                        </div>
                    )}
                </div>
            );

        case 4:
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-primary"/>
                        <h2 className="text-xl font-semibold">{t("review")}</h2>
                    </div>

                    <Card className="border-primary/20 py-0 overflow-hidden">
                        <CardHeader className=" border-b py-4">
                            <div className="space-y-1.5">
                                <CardTitle
                                    className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                    {formData.title}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {formData.description}
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    <div className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded-md bg-primary/10">
                                                <Calendar className="h-5 w-5 text-primary"/>
                                            </div>
                                            <h3 className="font-semibold">{t("startDate")}</h3>
                                        </div>
                                        <p className="text-lg">{new Date(formData.startDate).toLocaleString()}</p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded-md bg-primary/10">
                                                <Calendar className="h-5 w-5 text-primary"/>
                                            </div>
                                            <h3 className="font-semibold">{t("deadline")}</h3>
                                        </div>
                                        <p className="text-lg">{new Date(formData.endDate).toLocaleString()}</p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded-md bg-primary/10">
                                                <FileText className="h-5 w-5 text-primary"/>
                                            </div>
                                            <h3 className="font-semibold">{t("type")}</h3>
                                        </div>
                                        <p className="text-lg">{formData.format}</p>
                                    </div>

                                    {formData.format === "DOCUMENT" ? (
                                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 rounded-md bg-primary/10">
                                                        <Upload className="h-5 w-5 text-primary"/>
                                                    </div>
                                                    <h3 className="font-semibold">{t("attachedFile")}</h3>
                                                </div>
                                                <div
                                                    className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-md shadow-sm">
                                                    <FileText className="h-5 w-5 text-primary"/>
                                                    <p className="font-medium">{formData.file?.name ?? "Aucun fichier"}</p>
                                                </div>
                                            </div>
                                        ) :
                                        (<div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 rounded-md bg-primary/10">
                                                    <FileQuestion className="h-5 w-5 text-primary"/>
                                                </div>
                                                <h3 className="font-semibold">{t("questionCount")}</h3>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="px-4 py-1.5 text-lg font-semibold">
                                                    {formData.questions.length}
                                                </Badge>
                                                <p className="text-lg">{t("questions").toLowerCase()}</p>
                                            </div>
                                        </div>)
                                    }
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="border-t p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <AlertCircle className="h-5 w-5 text-primary"/>
                                </div>
                                <p className="text-sm leading-relaxed">{t("finalConfirmation")}</p>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            );

        default:
            return null;
    }
}
