"use client"

import { motion } from "framer-motion"
import { Sparkles, BookOpen, Award, Brain, BarChart } from "lucide-react"
import { useTranslations } from "next-intl"

export default function WelcomeStep() {
  const t = useTranslations("welcome")

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-4">{t("title")}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-background dark:bg-zinc-800 p-6 rounded-lg border shadow-sm"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t("features.intelligentGrading.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("features.intelligentGrading.description")}</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-background dark:bg-zinc-800 p-6 rounded-lg border shadow-sm"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t("features.personalizedFeedback.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("features.personalizedFeedback.description")}</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-background dark:bg-zinc-800 p-6 rounded-lg border shadow-sm"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <BarChart className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t("features.advancedAnalytics.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("features.advancedAnalytics.description")}</p>
        </motion.div>
      </div>

      <div className="bg-background dark:bg-zinc-800 p-6 rounded-lg border mt-8">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          {t("onboardingProcess")}
        </h3>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start">
            <div className="bg-primary/20 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              1
            </div>
            <div>
              <span className="font-medium">{t("onboardingSteps.step1")}</span>
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/20 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              2
            </div>
            <div>
              <span className="font-medium">{t("onboardingSteps.step2")}</span>
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/20 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              3
            </div>
            <div>
              <span className="font-medium">{t("onboardingSteps.step3")}</span>
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/20 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              4
            </div>
            <div>
              <span className="font-medium">{t("onboardingSteps.step4")}</span>
            </div>
          </li>
        </ol>
      </div>
    </div>
  )
}

