"use client"

import { Sparkles, BookOpen, Rocket, CheckCircle, ArrowRight, GraduationCap, Award } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import {Link} from "@/i18n/navigation";

interface CompletionStepProps {
  userType: "TEACHER" | "STUDENT" | null
}

export default function CompletionStep({ userType }: CompletionStepProps) {
  const t = useTranslations("completion")

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">{t("title")}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="h-full bg-background dark:bg-zinc-800">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-3">{t("nextSteps.title")}</h3>
              <ul className="space-y-3">
                {userType === "TEACHER" ? (
                  <>
                    {t.raw("nextSteps.teacher").map((step: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </>
                ) : (
                  <>
                    {t.raw("nextSteps.student").map((step: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </>
                )}
              </ul>
              <Link className={buttonVariants({ variant: "default", className: "w-full mt-6 gap-2" })} href="/dashboard">
                {userType === "TEACHER" ? t("nextSteps.button.teacher") : t("nextSteps.button.student")}
                    <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="h-full bg-background dark:bg-zinc-800">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-3">{t("platformBenefits.title")}</h3>
              <ul className="space-y-3">
                {t.raw("platformBenefits.benefits").map((benefit: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-medium">{benefit.title}</span>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 mt-8">
        <div className="flex items-start">
          {userType === "TEACHER" ? (
            <GraduationCap className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
          ) : (
            <Award className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
          )}
          <div>
            <h3 className="text-lg font-medium mb-2">
              {userType === "TEACHER" ? t("resourceCenter.teacher.title") : t("resourceCenter.student.title")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {userType === "TEACHER"
                ? t("resourceCenter.teacher.description")
                : t("resourceCenter.student.description")}
            </p>
            <div className="flex flex-wrap gap-2">
              {t.raw("resourceCenter.buttons").map((button: string, index: number) => (
                <Button className="hover:dark:bg-zinc-800" key={index} variant="outline" size="sm">
                  {button}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

