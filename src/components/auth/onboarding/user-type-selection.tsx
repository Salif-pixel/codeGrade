"use client"

import { School, GraduationCap, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

interface UserTypeSelectionProps {
  selectedType: "TEACHER" | "STUDENT" | null
  onSelect: (type: "TEACHER" | "STUDENT") => void
  error?: string
}

export default function UserTypeSelection({ selectedType, onSelect, error }: UserTypeSelectionProps) {
  const t = useTranslations("userType")

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <RadioGroup
        value={selectedType || ""}
        onValueChange={(value) => onSelect(value as "TEACHER" | "STUDENT")}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <RadioGroupItem value="TEACHER" id="teacher" className="sr-only" />
          <Label htmlFor="teacher" className="cursor-pointer">
            <Card
              className={`h-full transition-all ${selectedType === "TEACHER" ? "border-primary bg-primary/5 shadow-md" : "hover:border-primary/50 hover:shadow-sm bg-background dark:bg-zinc-800"}`}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 h-full">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all ${selectedType === "TEACHER" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <School className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-medium mb-3">{t("teacher.title")}</h3>
                <p className="text-center text-muted-foreground mb-6">{t("teacher.description")}</p>
                <ul className="text-sm space-y-2 text-left w-full">
                  {t.raw("teacher.features").map((feature: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Label>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative"
        >
          <RadioGroupItem value="STUDENT" id="student" className="sr-only" />
          <Label htmlFor="student" className="cursor-pointer">
            <Card
              className={`h-full transition-all ${selectedType === "STUDENT" ? "border-primary bg-primary/5 shadow-md" : "hover:border-primary/50 hover:shadow-sm bg-background dark:bg-zinc-800"}`}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 h-full">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all ${selectedType === "STUDENT" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <GraduationCap className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-medium mb-3">{t("student.title")}</h3>
                <p className="text-center text-muted-foreground mb-6">{t("student.description")}</p>
                <ul className="text-sm space-y-2 text-left w-full">
                  {t.raw("student.features").map((feature: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Label>
        </motion.div>
      </RadioGroup>

      {error && (
        <div className="text-destructive text-sm mt-2 flex items-center">
          <Info className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      <div className="mt-8 bg-slate-50 dark:bg-zinc-800 p-4 rounded-lg border text-sm">
        <TooltipProvider>
          <div className="flex items-start">
            <Info className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">{t("whyWeAsk.title")}</p>
              <p className="text-muted-foreground">{t("whyWeAsk.description")}</p>
              <div className="mt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-primary cursor-help underline decoration-dotted underline-offset-2">
                      {t("whyWeAsk.canChange")}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{t("whyWeAsk.changeAnswer")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}

