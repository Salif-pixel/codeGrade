import { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'

const testimonials = [
  {
    id: 1,
    quote: "codeGrade has completely transformed how I assess my students' programming assignments. The AI grading is remarkably accurate, and the time I've saved has allowed me to focus more on teaching.",
    author: "Dr. Sarah Johnson",
    role: "Computer Science Professor",
    institution: "Stanford University"
  },
  {
    id: 2,
    quote: "As a high school CS teacher, codeGrade has been a game-changer. My students receive immediate feedback on their code, which has significantly improved their learning outcomes and engagement.",
    author: "Michael Chen",
    role: "Computer Science Teacher",
    institution: "Lincoln High School"
  },
  {
    id: 3,
    quote: "The exam generation feature alone is worth the investment. What used to take me hours now takes minutes, and the quality of the questions is consistently high.",
    author: "Prof. Emily Rodriguez",
    role: "Engineering Department Chair",
    institution: "MIT"
  }
]

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section id="testimonials" className="container mx-auto px-4 py-24 overflow-hidden">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">What Educators Are Saying</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Join thousands of satisfied educators who have transformed their teaching with codeGrade.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl"></div>
        
        <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12">
          <Quote className="h-12 w-12 text-purple-500/30 mb-6" />
          
          <div className="min-h-[200px]">
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              "{testimonials[activeIndex].quote}"
            </p>
            
            <div>
              <p className="font-semibold text-lg">{testimonials[activeIndex].author}</p>
              <p className="text-gray-400">{testimonials[activeIndex].role}</p>
              <p className="text-gray-400">{testimonials[activeIndex].institution}</p>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              size="icon" 
              className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === activeIndex ? 'bg-purple-500' : 'bg-gray-700'
                  }`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={nextTestimonial}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}