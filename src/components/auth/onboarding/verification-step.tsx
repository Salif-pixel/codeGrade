"use client"

import { useState, useEffect } from "react"
import { Shield, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

interface VerificationStepProps {
  isVerified: boolean
  onVerify: () => void
  error?: string
}

export default function VerificationStep({ isVerified, onVerify, error }: VerificationStepProps) {
  const t = useTranslations("verification")
  const [verificationMethod, setVerificationMethod] = useState<"captcha" | "email">("captcha")
  const [loading, setLoading] = useState(false)
  const [emailCode, setEmailCode] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Simulate reCAPTCHA verification
  const handleCaptchaVerification = () => {
    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false)
      onVerify()
    }, 1500)
  }

  const sendEmailCode = () => {
    setLoading(true)

    // Simulate sending email
    setTimeout(() => {
      setLoading(false)
      setEmailSent(true)
      setCountdown(60)
    }, 1500)
  }

  const verifyEmailCode = () => {
    setLoading(true)

    // Simulate verifying Code
    setTimeout(() => {
      setLoading(false)
      if (emailCode === "123456") {
        onVerify()
      }
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {isVerified ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-medium mb-3">{t("success.title")}</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">{t("success.description")}</p>
                <div className="flex items-center justify-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {t("success.status")}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div>
          <Tabs
            defaultValue="captcha"
            value={verificationMethod}
            onValueChange={(value) => setVerificationMethod(value as "captcha" | "email")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="captcha">{t("methods.captcha")}</TabsTrigger>
              <TabsTrigger value="email">{t("methods.email")}</TabsTrigger>
            </TabsList>

            <TabsContent value="captcha">
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-4">{t("captcha.title")}</h3>
                  <p className="text-center text-muted-foreground mb-6">{t("captcha.description")}</p>

                  {/* This would be replaced with actual reCAPTCHA in production */}
                  <div className="w-full max-w-sm border rounded-md p-4 bg-slate-50 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">reCAPTCHA</div>
                      <div className="h-5 w-5 bg-slate-200 rounded"></div>
                    </div>
                    <div className="mt-4 h-16 bg-slate-100 rounded flex items-center justify-center text-xs text-muted-foreground">
                      {t("captcha.instruction")}
                    </div>
                  </div>

                  <Button onClick={handleCaptchaVerification} disabled={loading} className="w-full max-w-sm">
                    {loading ? "..." : t("captcha.verify")}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-4">{t("email.title")}</h3>
                  <p className="text-center text-muted-foreground mb-6">{t("email.description")}</p>

                  <div className="w-full max-w-sm space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("email.emailLabel")}</Label>
                      <Input id="email" type="email" placeholder="your@email.com" />
                    </div>

                    {emailSent ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-code">{t("email.codeLabel")}</Label>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={sendEmailCode}
                            disabled={countdown > 0 || loading}
                          >
                            {countdown > 0 ? t("email.resendTimer", { seconds: countdown }) : t("email.resend")}
                          </Button>
                        </div>
                        <Input
                          id="email-code"
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                        />
                        <div className="text-xs text-muted-foreground">{t("email.demoNote")}</div>
                      </div>
                    ) : null}

                    <Button
                      onClick={emailSent ? verifyEmailCode : sendEmailCode}
                      disabled={loading || (emailSent && emailCode.length !== 6)}
                      className="w-full"
                    >
                      {loading ? "..." : emailSent ? t("email.verifyCode") : t("email.sendCode")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="text-destructive text-sm mt-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}

          <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 mb-1">{t("whyNeeded.title")}</p>
                <p className="text-amber-700">{t("whyNeeded.description")}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

