"use client"

import { Input } from "@src/components/ui/input"
import { Label } from "@src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui/select"
import { Checkbox } from "@src/components/ui/checkbox"

interface StudentInfoFormProps {
  data: {
    school: string
    grade: string
    subjects: string[]
  }
  onChange: (data: Partial<StudentInfoFormProps["data"]>) => void
}

export default function StudentInfoForm({ data, onChange }: StudentInfoFormProps) {
  const grades = [
    "1st Grade",
    "2nd Grade",
    "3rd Grade",
    "4th Grade",
    "5th Grade",
    "6th Grade",
    "7th Grade",
    "8th Grade",
    "9th Grade",
    "10th Grade",
    "11th Grade",
    "12th Grade",
    "College Freshman",
    "College Sophomore",
    "College Junior",
    "College Senior",
    "Graduate Student",
  ]

  const subjects = [
    "Mathematics",
    "Science",
    "English/Language Arts",
    "History/Social Studies",
    "Computer Science",
    "Art",
    "Music",
    "Foreign Language",
  ]

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      onChange({ subjects: [...data.subjects, subject] })
    } else {
      onChange({ subjects: data.subjects.filter((s) => s !== subject) })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Student Information</h2>
        <p className="text-muted-foreground">Tell us more about your educational background</p>
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
          <Label htmlFor="grade">Current Grade/Year</Label>
          <Select value={data.grade} onValueChange={(value) => onChange({ grade: value })}>
            <SelectTrigger id="grade">
              <SelectValue placeholder="Select your current grade or year" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Subjects You're Taking</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {subjects.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={subject.replace(/\s+/g, "-").toLowerCase()}
                  checked={data.subjects.includes(subject)}
                  onCheckedChange={(checked: any) => handleSubjectChange(subject, checked as boolean)}
                />
                <Label htmlFor={subject.replace(/\s+/g, "-").toLowerCase()}>{subject}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

