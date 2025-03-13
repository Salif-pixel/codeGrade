"use client"

import { useState } from "react"
import { Shield, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@src/components/ui/card"
import { Button } from "@src/components/ui/button"

interface VerificationStepProps {
  isVerified: boolean
  onVerify: () => void
}

export default function VerificationStep({ isVerified, onVerify }: VerificationStepProps) {
  const [loading, setLoading] = useState(false)

  // Simulate reCAPTCHA verification
  const handleVerification = () => {
    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false)
      onVerify()
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Verify Your Account</h2>
        <p className="text-muted-foreground">We need to verify you're a real person before continuing</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8">
          {isVerified ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Verification Complete</h3>
              <p className="text-muted-foreground mb-4">Thank you for verifying your account</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium mb-4">Human Verification</h3>
              <p className="text-center text-muted-foreground mb-6">
                This helps us prevent automated accounts and protect our platform
              </p>

              {/* This would be replaced with actual reCAPTCHA in production */}
              <div className="w-full max-w-sm border rounded-md p-4 bg-slate-50 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">reCAPTCHA verification</div>
                  <div className="h-5 w-5 bg-slate-200 rounded"></div>
                </div>
              </div>

              <Button onClick={handleVerification} disabled={loading} className="w-full max-w-sm">
                {loading ? "Verifying..." : "Verify Now"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

