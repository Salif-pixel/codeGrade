"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "@/src/i18n/navigation"
import { ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@src/components/ui/card"
import { Progress } from "@src/components/ui/progress"
import { AnimatePresence, motion } from "framer-motion"
import { useCustomToast } from "@src/components/alert/alert"
import { useLocale, useTranslations } from "next-intl"
import { updateUserVerification } from "@/src/actions/verificationActions"
import { updateUserRole } from "@/src/actions/userRoleActions"
import UserTypeSelection from "@src/components/auth/onboarding/user-type-selection"
import CompletionStep from "@src/components/auth/onboarding/completion-step"
import WelcomeStep from "@src/components/auth/onboarding/welcome-step"
import LanguageSwitcher from "@src/components/internalization/language-switcher"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@src/components/ui/tooltip"
import { Label } from "@src/components/ui/label"
import { authClient } from "@/src/lib/auth-client"
import { useRouter } from "next/navigation"
import { ModeToggle } from "@/src/components/theme/button-theme"

// Custom Connect-the-Dots CAPTCHA Component
const DotsCaptcha = ({ onVerify, isVerified }: { onVerify: (verified: boolean) => void, isVerified: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dots, setDots] = useState<Array<{x: number, y: number, id: number}>>([]);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);


  useEffect(() => {
    if (canvasRef.current) {
      generateRandomDots();
    }
  }, [canvasRef]);

  const generateRandomDots = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const newDots: Array<{x: number, y: number, id: number}> = [];
    // Generate 6 random dots
    for (let i = 0; i < 6; i++) {
      const x = 30 + Math.random() * (canvas.width - 60);
      const y = 30 + Math.random() * (canvas.height - 60);
      newDots.push({ x, y, id: i });
    }
    
    setDots(newDots);
    
    // Create a sequence following natural order (1 to 6)
    const orderedSequence = newDots.map(d => d.id);
    setSequence(orderedSequence);
    
    // Draw the dots
    ctx.fillStyle = "#6b7280";
    newDots.forEach((dot, i) => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Add number labels to the dots
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((i + 1).toString(), dot.x, dot.y);
      ctx.fillStyle = "#6b7280";
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (success || loading) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is on any dot
    for (const dot of dots) {
      const dx = dot.x - x;
      const dy = dot.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 15) {
        // Add this dot to current sequence
        const newSequence = [...currentSequence, dot.id];
        setCurrentSequence(newSequence);
        
        // Draw line connecting dots
        drawConnections(newSequence);
        
        // Check if complete sequence has been entered
        if (newSequence.length === sequence.length) {
          validateSequence(newSequence);
        }
        
        break;
      }
    }
  };

  const drawConnections = (dotSequence: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear and redraw dots
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the dots
    ctx.fillStyle = "#6b7280";
    dots.forEach((dot, i) => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Add number labels to the dots
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((i + 1).toString(), dot.x, dot.y);
      ctx.fillStyle = "#6b7280";
    });
    
    // Draw connections between selected dots
    if (dotSequence.length > 1) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      for (let i = 0; i < dotSequence.length; i++) {
        const dotId = dotSequence[i];
        const dot = dots.find(d => d.id === dotId);
        
        if (dot) {
          if (i === 0) {
            ctx.moveTo(dot.x, dot.y);
          } else {
            ctx.lineTo(dot.x, dot.y);
          }
        }
      }
      
      ctx.stroke();
    }
  };

  const validateSequence = (inputSequence: number[]) => {
    setLoading(true);
    setError("");
    
    
    // Simulate verification delay
    setTimeout(() => {
      // Compare arrays properly by checking each element
      const isCorrect = inputSequence.length === sequence.length &&
        inputSequence.every((value, index) => value === sequence[index]);
      
      if (isCorrect) {
        setSuccess(true);
        onVerify(true);
      } else {
        setError("Sequence incorrect, please try again");
        setCurrentSequence([]);
        generateRandomDots();
      }
      
      setLoading(false);
    }, 1000);
  };

  const resetCaptcha = () => {
    setCurrentSequence([]);
    setSuccess(false);
    setError("");
    generateRandomDots();
  };
  const t = useTranslations();
  return (
    <div className="space-y-4 bg-background dark:bg-zinc-800">
      <div className="flex flex-col items-center">
        <Label className="mb-2 font-medium text-lg">{t("verification.methods.connect-the-dot")}</Label>
        <div className="relative border rounded-lg overflow-hidden bg-white">
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={200} 
            onClick={handleCanvasClick}
            className="cursor-pointer"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {success && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          )}
        </div>
        
        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        
        <div className="mt-4 flex space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={resetCaptcha}
            disabled={loading}
          >
            {t("verification.methods.reset")}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Simplified Verification Step
const VerificationStep = ({ 
  isVerified, 
  onVerify, 
  error,
  userId
}: { 
  isVerified: boolean, 
  onVerify: (verified: boolean) => void, 
  error?: string,
  userId: string
}) => {
  const t = useTranslations();
  
  const handleVerification = async (verified: boolean) => {
    if (verified) {
      try {
        const result = await updateUserVerification(userId);
        if (result.success) {
          onVerify(true);
        } else {
          console.error('Verification update failed:', result.error);
          onVerify(false);
        }
      } catch (error) {
        console.error('Error during verification:', error);
        onVerify(false);
      }
    }
  };
  
  return (
    <div className="space-y-8">
      {/* CAPTCHA Verification Section */}
      <div className="space-y-4 bg-muted/30 dark:bg-zinc-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium">{t("verification.methods.captcha")}</h3>
        <DotsCaptcha onVerify={handleVerification} isVerified={isVerified} />
      </div>
      
      {error && <p className="text-destructive text-sm">{error}</p>}
      
      {isVerified && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          {t("verification.succes")}
        </div>
      )}
    </div>
  );
};

export default function OnboardingPage() {
  const t = useTranslations();
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<"TEACHER" | "STUDENT" | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { data:session} = authClient.useSession() 
  const userid = session?.user.id || "";
  const local = useLocale();
  const { showToast } = useCustomToast();

  const handleUserTypeSelect = async (type: "TEACHER" | "STUDENT") => {
    setUserType(type);
    try {
      const result = await updateUserRole(userid, type);
      if (!result.success) {
        showToast(
          t("userType.error"),
          t("userType.updateError"),
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      showToast(
        t("userType.error"),
        t("userType.updateError"),
        "error"
      );
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: null as File | null,
    background: "",
  });

  // Define all steps
  const steps = [
    { id: "welcome", label: t("steps.welcome") },
    { id: "user-type", label: t("steps.userType") },
    { id: "verification", label: t("steps.verification") },
    { id: "completion", label: t("steps.completion") },
  ];

  const totalSteps = steps.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};

    if (step === 0) {
      // Welcome step - no validation needed
      return true;
    }

    if (step === 1) {
      // User type selection
      if (!userType) {
        errors.userType = t("userType.error");
      }
    }

    if (step === 2) {
      // Verification step
      if (!isVerified) {
        errors.verification = t("verification.error");
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
const router = useRouter();
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (step < totalSteps - 1) {
        setStep(step + 1);
        window.scrollTo(0, 0);
      } else {
        // Complete onboarding and redirect to dashboard
        showToast(
          t("completion.title"),
          t("completion.subtitle"),
          "success"
        );
        router.push(`/${local}/dashboard`);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData({
      ...formData,
      ...data,
    });
  };

  const goToStep = (index: number) => {
    // Only allow going to steps that have been completed or the current step
    if (index <= step) {
      setStep(index);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-background bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:20px_20px]  flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-4xl mb-8 ">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
         
        </div>
        <div className="absolute top-4 right-30 z-10">
          <ModeToggle/>
        </div>

        {/* Improved stepper with better spacing and transitions */}
        <div className="hidden md:block mb-12 mt-4 relative px-8">
          {/* Background track */}
          <div className="absolute h-1 bg-muted top-6 left-12 right-12 z-0"></div>
          
          {/* Progress indicator */}
          <div
            className="absolute h-1 bg-primary top-6 left-12 z-0 transition-all duration-500 ease-in-out"
            style={{ width: `${progress * 0.78}%` }}
          ></div>

          <div className="relative z-10 flex justify-between">
            {steps.map((s, i) => (
              <TooltipProvider key={s.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300
                          ${
                            i < step
                              ? "bg-primary text-primary-foreground shadow-md"
                              : i === step
                                ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg scale-110"
                                : "bg-muted text-muted-foreground"
                          }`}
                        onClick={() => goToStep(i)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {i < step ? <CheckCircle2 className="h-6 w-6" /> : <span className="text-lg font-medium">{i + 1}</span>}
                      </motion.div>
                      <div
                        className={`text-sm mt-3 font-medium
                          ${i <= step ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {s.label}
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{s.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        <div className="md:hidden mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{t.rich("steps.step", { current: step + 1, total: totalSteps })}</span>
            <span>{steps[step].label}</span>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-4xl dark:bg-zinc-900 shadow-lg border-t-4 border-t-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {steps[step].label}
            {step === 1 && userType && (
              <div className="ml-2 text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                {userType === "TEACHER" ? t("userType.teacher.title") : t("userType.student.title")}
              </div>
            )}
          </CardTitle>
          <CardDescription>
            {step === 0 && t("welcome.subtitle")}
            {step === 1 && t("userType.subtitle")}
            {step === 2 && t("verification.subtitle")}
            {step === 3 && t("completion.subtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {step === 0 && <WelcomeStep />}

              {step === 1 && (
                <UserTypeSelection
                  selectedType={userType}
                  onSelect={handleUserTypeSelect}
                  error={formErrors.userType}
                />
              )}

              {step === 2 && (
                <VerificationStep
                 userId={userid}
                  isVerified={isVerified}
                  onVerify={(verified) => {
                    setIsVerified(verified);
                    setFormErrors({ ...formErrors, verification: "" });
                  }}
                  error={formErrors.verification}
                />
              )}

              {step === 3 && <CompletionStep userType={userType} />}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={step === 0} 
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>

          <Button 
            onClick={handleNext} 
            disabled={(step === 2 && !isVerified) || (step === 1 && !userType)}
            className="gap-2"
          >
            {step === totalSteps - 1 ? (
              <>
                {t("common.finish")}
                <CheckCircle2 className="h-4 w-4" />
              </>
            ) : (
              <>
                {t("common.next")}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          {t("common.needHelp")}{" "}
          <a href="#" className="text-primary hover:underline">
            {t("common.contactSupport")}
          </a>
        </p>
      </div>
    </div>
  );
}