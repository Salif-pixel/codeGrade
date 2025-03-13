import { Sparkles, BookOpen, Rocket } from "lucide-react"

interface CompletionStepProps {
  userType: "teacher" | "student" | null
}

export default function CompletionStep({ userType }: CompletionStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
        <p className="text-muted-foreground">
          Your profile is complete and you're ready to start using our AI grading platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-slate-50 p-6 rounded-lg border">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">What's Next</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {userType === "teacher" ? (
              <>
                <li>• Create your first class</li>
                <li>• Set up assignments</li>
                <li>• Invite your students</li>
                <li>• Explore AI grading features</li>
              </>
            ) : (
              <>
                <li>• Join your classes</li>
                <li>• View available assignments</li>
                <li>• Submit your work</li>
                <li>• Get AI-powered feedback</li>
              </>
            )}
          </ul>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Platform Benefits</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• AI-powered grading and feedback</li>
            <li>• Personalized learning insights</li>
            <li>• Progress tracking and analytics</li>
            <li>• Collaboration tools</li>
            <li>• 24/7 support and resources</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

