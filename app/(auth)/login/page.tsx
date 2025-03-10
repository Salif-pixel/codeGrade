"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Github, FileText, CheckSquare, Code } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Login attempt with:", { email, password })
        // Ici vous ajouteriez la logique d'authentification
    }

    return (
        <div className="flex min-h-screen w-full ">
            {/* Section Formulaire (Gauche) */}
            <div className="flex w-full flex-col justify-center space-y-6 bg-background px-4 py-12 md:w-1/2 md:px-8 lg:px-12">
                <div className="mx-auto w-full max-w-md">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold text-foreground">Connexion</h1>
                        <p className="text-muted-foreground">Entrez vos identifiants pour accéder à votre compte</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="exemple@domaine.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <Link href="#" className="text-sm text-primary hover:underline">
                                        Mot de passe oublié?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button  type="submit" className="w-full bg-primary">
                            Se connecter
                        </Button>

                        <div className="text-center text-sm">
                            Vous n&apos;avez pas de compte?{" "}
                            <Link href="#" className="text-primary hover:underline">
                                S&apos;inscrire
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Section Technologies (Droite) */}
            <div className="hidden md:block md:w-1/2 relative dark:bg-black/95 dotted-background">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                    <Card className="w-full max-w-md bg-background/10 backdrop-blur-sm border-primary/20">
                        <div className="p-6 space-y-6">
                            <h2 className="text-2xl font-bold text-center text-foreground">Accédez à vos ressources</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <TechCard icon={<Github className="h-8 w-8" />} title="GitHub" description="Projets et code source" />
                                <TechCard icon={<Code className="h-8 w-8" />} title="Java" description="Exercices de programmation" />
                                <TechCard icon={<FileText className="h-8 w-8" />} title="PDF" description="Documents de cours" />
                                <TechCard icon={<CheckSquare className="h-8 w-8" />} title="QCM" description="Tests et évaluations" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Style pour le fond à points */}
            <style jsx global>{`
        .dotted-background {
          background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        /* Classe pour activer le mode sombre */
        .dark {
          color-scheme: dark;
          --background: 240 10% 3.9%;
          --foreground: 0 0% 98%;
          --card: 240 10% 3.9%;
          --card-foreground: 0 0% 98%;
          --popover: 240 10% 3.9%;
          --popover-foreground: 0 0% 98%;
          --primary: 217.2 91.2% 59.8%;
          --primary-foreground: 222.2 47.4% 11.2%;
          --secondary: 240 3.7% 15.9%;
          --secondary-foreground: 0 0% 98%;
          --muted: 240 3.7% 15.9%;
          --muted-foreground: 240 5% 64.9%;
          --accent: 240 3.7% 15.9%;
          --accent-foreground: 0 0% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 0 0% 98%;
          --border: 240 3.7% 15.9%;
          --input: 240 3.7% 15.9%;
          --ring: 240 4.9% 83.9%;
        }
      `}</style>
        </div>
    )
}

// Composant pour les cartes de technologies
function TechCard({
                      icon,
                      title,
                      description,
                  }: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="flex flex-col items-center space-y-2 rounded-lg border border-primary/20 bg-background/5 p-4 text-center transition-all hover:bg-background/10">
            <div className="text-primary">{icon}</div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}

