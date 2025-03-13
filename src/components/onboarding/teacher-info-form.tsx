"use client"
import { Input } from "@src/components/ui/input"
import { Label } from "@src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui/select"
import { Textarea } from "@src/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@src/components/ui/radio-group"

interface TeacherInfoFormProps {
  data: {
    school: string
    subject: string
    gradeLevel: string
    experience: string
  }
  onChange: (data: Partial<TeacherInfoFormProps["data"]>) => void
}

export default function TeacherInfoForm({ data, onChange }: TeacherInfoFormProps) {
  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Computer Science",
    "Art",
    "Music",
    "Physical Education",
    "Foreign Language",
    "Other",
  ]

  const gradeLevels = ["Elementary School", "Middle School", "High School", "College/University"]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Teacher Information</h2>
        <p className="text-muted-foreground">Tell us more about your teaching background</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="school">School or Institution</Label>
          <Input
            id="school"
            placeholder="Enter your school or institution name"
            value={data.school}
            onChange={(e) => onChange({ school: e.target.value })}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="subject">Primary Subject</Label>
          <Select value={data.subject} onValueChange={(value) => onChange({ subject: value })}>
            <SelectTrigger id="subject">
              <SelectValue placeholder="Select your primary subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Grade Level</Label>
          <RadioGroup
            value={data.gradeLevel}
            onValueChange={(value) => onChange({ gradeLevel: value })}
            className="grid grid-cols-2 gap-2"
          >
            {gradeLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={level.replace(/\s+/g, "-").toLowerCase()} />
                <Label htmlFor={level.replace(/\s+/g, "-").toLowerCase()}>{level}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="experience">Teaching Experience</Label>
          <Textarea
            id="experience"
            placeholder="Briefly describe your teaching experience and how you plan to use AI grading"
            value={data.experience}
            onChange={(e) => onChange({ experience: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  )
}

