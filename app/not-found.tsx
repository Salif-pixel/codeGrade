"use client"
import "./[locale]/globals.css";
import Link from "next/link"
import { useEffect, useState } from "react"
import TetrisGame from "@/components/pages/NotFound/tetris-game";


export default function NotFound() {
    const [particles, setParticles] = useState<
        Array<{
            id: number
            x: number
            y: number
            size: number
            speed: number
            opacity: number
        }>
    >([])

    useEffect(() => {
        // Générer des particules
        const particlesArray = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            x: Math.random() * 300 - 150,
            y: Math.random() * 300 - 150,
            size: Math.random() * 4 + 1,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random() * 0.5 + 0.3,
        }))
        setParticles(particlesArray)
    }, [])

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 md:p-8">
            <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                {/* Section gauche avec le 404 */}
                <div className="flex-1 text-center lg:text-left relative">
                    <div className="relative inline-block">
                        <h1
                            className="font-mono text-[120px] md:text-[180px] leading-none tracking-tighter text-neutral-200 relative z-10"
                            style={{ fontFamily: "monospace" }}
                        >
                            <span className="inline-block transform -skew-x-12">4</span>
                            <span className="inline-block transform rotate-45 mx-2 md:mx-4">□</span>
                            <span className="inline-block transform -skew-x-12">4</span>
                        </h1>

                        {/* Particules */}
                        <div className="absolute inset-0 overflow-hidden">
                            {particles.map((particle) => (
                                <div
                                    key={particle.id}
                                    className="absolute rounded-full bg-primary"
                                    style={{
                                        width: `${particle.size}px`,
                                        height: `${particle.size}px`,
                                        left: `calc(50% + ${particle.x}px)`,
                                        top: `calc(50% + ${particle.y}px)`,
                                        opacity: particle.opacity,
                                        animation: `float ${3 / particle.speed}s infinite linear`,
                                        transform: `translateY(${Math.sin((Date.now() * particle.speed) / 1000) * 10}px)`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <p className="text-neutral-400 uppercase tracking-widest">THAT&apos;S AN ERROR.</p>
                        <p className="text-neutral-400 uppercase tracking-widest">
                            THE PAGE YOU WERE LOOKING FOR DOESN&apos;T EXIST.
                        </p>
                        <p className="text-neutral-500 mt-4">
                            Pendant que vous attendez, pourquoi ne pas faire une partie de Tetris?
                        </p>
                        <Link
                            href="/"
                            className="inline-block mt-4 text-primary hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            RETOUR À L&apos;ACCUEIL →
                        </Link>
                    </div>
                </div>

                {/* Section droite avec le jeu Tetris */}
                <div className="flex-1 mt-8 lg:mt-0">
                    <TetrisGame />
                </div>
            </div>

            <footer className="mt-12 text-center text-neutral-500 text-sm">
                <p>Plateforme d&apos;organisation de devoirs pour professeurs</p>
            </footer>

            <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(5px) translateX(5px);
          }
          50% {
            transform: translateY(10px) translateX(0px);
          }
          75% {
            transform: translateY(5px) translateX(-5px);
          }
          100% {
            transform: translateY(0px) translateX(0px);
          }
        }
      `}</style>
        </div>
    )
}

