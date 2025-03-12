import Link from 'next/link'
import { ArrowRight, CheckCircle, Code, GraduationCap, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FeatureCard from './feature-card'
import DemoSection from './demo-section'
import Testimonials from './testimonials'
import Navbar from './navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-full mb-8 border border-gray-700">
          <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
          <span className="text-sm">AI-powered exam creation and grading</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
          Grade Smarter with codeGrade
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-10">
          codeGrade is an intelligent platform that transforms how educators create exams and evaluate student performance, leveraging AI to save time and improve accuracy.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
            Book a Demo
          </Button>
        </div>
        
        <div className="relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-pink-500/10"></div>
          <img 
            src="/placeholder.svg?height=600&width=1000" 
            alt="codeGrade platform interface" 
            className="w-full h-auto"
          />
        </div>
      </section>
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Revolutionize Your Teaching Experience</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our AI-powered platform streamlines the entire assessment process from creation to grading.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Sparkles className="h-6 w-6 text-purple-400" />}
            title="AI-Generated Exams"
            description="Create comprehensive exams in seconds with our AI assistant. Customize difficulty levels and topics to match your curriculum."
          />
          <FeatureCard 
            icon={<Code className="h-6 w-6 text-purple-400" />}
            title="Intelligent Code Grading"
            description="Automatically evaluate programming assignments with detailed feedback on logic, efficiency, and best practices."
          />
          <FeatureCard 
            icon={<GraduationCap className="h-6 w-6 text-purple-400" />}
            title="Student Progress Tracking"
            description="Monitor individual and class performance with intuitive analytics and identify areas for improvement."
          />
          <FeatureCard 
            icon={<CheckCircle className="h-6 w-6 text-purple-400" />}
            title="Instant Feedback"
            description="Students receive immediate, detailed feedback on their submissions, enhancing the learning experience."
          />
          <FeatureCard 
            icon={<ArrowRight className="h-6 w-6 text-purple-400" />}
            title="Seamless Integration"
            description="Easily integrate with your existing LMS and other educational tools for a unified workflow."
          />
          <FeatureCard 
            icon={<Sparkles className="h-6 w-6 text-purple-400" />}
            title="Plagiarism Detection"
            description="Advanced algorithms detect similarities between submissions to ensure academic integrity."
          />
        </div>
      </section>
      
      {/* Demo Section */}
      <DemoSection />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-16 text-center border border-gray-800">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Grading Process?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of educators who are saving time and improving student outcomes with codeGrade.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">codeGrade</h3>
              <p className="text-gray-400 mt-2">© {new Date().getFullYear()} codeGrade. All rights reserved.</p>
            </div>
            <div className="flex gap-8">
              <Link href="#" className="text-gray-400 hover:text-white transition">About</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition">Features</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition">Pricing</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}