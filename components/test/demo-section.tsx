import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Code, CheckSquare } from 'lucide-react'

export default function DemoSection() {
  const [activeTab, setActiveTab] = useState('create')

  return (
    <section id="demo" className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">See codeGrade in Action</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Experience how codeGrade simplifies the entire assessment process.
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-8">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Create Exams
            </TabsTrigger>
            <TabsTrigger value="take" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Code className="h-4 w-4 mr-2" />
              Take Exams
            </TabsTrigger>
            <TabsTrigger value="grade" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <CheckSquare className="h-4 w-4 mr-2" />
              AI Grading
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <TabsContent value="create" className="m-0">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4">Create Exams with AI Assistance</h3>
                <p className="text-gray-300 mb-6">
                  Generate comprehensive exams in seconds. Our AI understands your curriculum and creates relevant questions across different difficulty levels.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-1 mr-3 mt-1">
                      <CheckSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Generate questions based on specific topics</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-1 mr-3 mt-1">
                      <CheckSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Customize difficulty levels and question types</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-1 mr-3 mt-1">
                      <CheckSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Edit and refine AI-generated content</span>
                  </li>
                </ul>
                <Button className="w-fit bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  Learn More
                </Button>
              </div>
              <div className="bg-gray-950 p-4 flex items-center justify-center">
                <img 
                  src="/placeholder.svg?height=400&width=500" 
                  alt="Exam creation interface" 
                  className="rounded-lg border border-gray-800 shadow-lg"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="take" className="m-0">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4">Intuitive Exam Interface for Students</h3>
                <p className="text-gray-300 mb-6">
                  Students can take exams in a distraction-free environment with support for code execution, multiple choice, and free-form answers.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-1 mr-3 mt-1">
                      <CheckSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Built-in code editor with syntax highlighting</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-1 mr-3 mt-1">
                      <CheckSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Real-time code execution and testing</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-1 mr-3 mt-1">
                      <CheckSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Auto-save functionality to prevent lost work</span>
                  </li>
                </ul>
                <Button className="w-fit bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  See Demo
                </Button>
              </div>
              <div className="bg-gray-950 p-4 flex items-center justify-center">
                <img 
                  src="/placeholder.svg?height=400&width=500" 
                  alt="Student exam interface" 
                  className="rounded-lg border border-gray-800 shadow-lg"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="grade" className="m-0">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4">Intelligent AI Grading</h3>
                <p className="text-gray-300 mb-6">
                  Our AI evaluates student submissions with precision, providing detailed feedback and saving educators countless hours.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-1 mr-3 mt-1">
                      <CheckSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Evaluate code functionality, efficiency, and style</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-1 mr-3 mt-1">
                      <CheckSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Provide personalized feedback to students</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-500/20 rounded-full p-1 mr-3 mt-1">
                      <CheckSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Generate comprehensive grading reports</span>
                  </li>
                </ul>
                <Button className="w-fit bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  Learn More
                </Button>
              </div>
              <div className="bg-gray-950 p-4 flex items-center justify-center">
                <img 
                  src="/placeholder.svg?height=400&width=500" 
                  alt="AI grading dashboard" 
                  className="rounded-lg border border-gray-800 shadow-lg"
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  )
}