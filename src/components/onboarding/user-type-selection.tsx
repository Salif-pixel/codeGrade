"use client"

import { School, GraduationCap } from "lucide-react"
import { Card, CardContent } from "@src/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@src/components/ui/radio-group"
import { Label } from "@src/components/ui/label"

interface UserTypeSelectionProps {
  selectedType: "teacher" | "student" | null
  onSelect: (type: "teacher" | "student") => void
}

export default function UserTypeSelection({ selectedType, onSelect }: UserTypeSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">I am a...</h2>
        <p className="text-muted-foreground">Select your role to personalize your experience</p>
      </div>

      <RadioGroup
        value={selectedType || ""}
        onValueChange={(value) => onSelect(value as "teacher" | "student")}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="relative">
          <RadioGroupItem value="teacher" id="teacher" className="sr-only" />
          <Label htmlFor="teacher" className="cursor-pointer">
            <Card
              className={`h-full transition-all ${selectedType === "teacher" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${selectedType === "teacher" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <School className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium mb-2">Teacher</h3>
                <p className="text-center text-muted-foreground">
                  Create assignments, grade work, and track student progress
                </p>
              </CardContent>
            </Card>
          </Label>
        </div>

        <div className="relative">
          <RadioGroupItem value="student" id="student" className="sr-only" />
          <Label htmlFor="student" className="cursor-pointer">
            <Card
              className={`h-full transition-all ${selectedType === "student" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${selectedType === "student" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <GraduationCap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium mb-2">Student</h3>
                <p className="text-center text-muted-foreground">
                  Submit assignments, receive feedback, and improve your skills
                </p>
              </CardContent>
            </Card>
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}

