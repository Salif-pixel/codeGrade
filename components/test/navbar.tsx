"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">codeGrade</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition">Features</Link>
            <Link href="#demo" className="text-gray-300 hover:text-white transition">Demo</Link>
            <Link href="#testimonials" className="text-gray-300 hover:text-white transition">Testimonials</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">Log in</Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
              Sign up
            </Button>
          </div>
          
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-4 pb-4">
              <Link href="#features" className="text-gray-300 hover:text-white transition">Features</Link>
              <Link href="#demo" className="text-gray-300 hover:text-white transition">Demo</Link>
              <Link href="#testimonials" className="text-gray-300 hover:text-white transition">Testimonials</Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
            </div>
            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-800">
              <Button variant="ghost" className="justify-center text-gray-300 hover:text-white hover:bg-gray-800">Log in</Button>
              <Button className="justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                Sign up
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}