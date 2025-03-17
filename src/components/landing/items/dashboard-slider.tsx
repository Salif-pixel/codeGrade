"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Images des différentes vues du dashboard
const dashboardImages = [
    {
        id: 1,
        src: "/assets/Code.png",
        alt: "Vue des évaluations",
        title: "Interface d'évaluations Code",
        description: "Gérez toutes vos évaluations de Code en un seul endroit",
    },
    {
        id: 2,
        src: "/assets/code2.png",
        alt: "Vue des documents",
        title: "Interface d'évaluation de documents",
        description: "Déposez et corrigez des documents PDF et Word",
    },
    {
        id: 3,
        src: "/assets/code3.png",
        alt: "Vue des QCM",
        title: "Interface d'évaluation QCM",
        description: "Créez et corrigez des questionnaires à choix multiples",
    },

]

export default function DashboardSlider() {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Fonction pour passer à l'image suivante
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === dashboardImages.length - 1 ? 0 : prevIndex + 1))
    }

    // Fonction pour passer à l'image précédente
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? dashboardImages.length - 1 : prevIndex - 1))
    }

    // Changement automatique d'image toutes les 5 secondes
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide()
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative overflow-hidden w-full  rounded-xl border bg-card text-card-foreground shadow">
            {/* Slider d'images */}
            <div className="relative h-[600px] w-full">
                {dashboardImages.map((image, index) => (
                    <div
                        key={image.id}
                        className={cn(
                            "absolute inset-0 transition-opacity duration-1000",
                            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0",
                        )}
                    >
                        <img
                            src={image.src || "/placeholder.svg"}
                            alt={image.alt}
                            className="h-full w-full object-cover object-top"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                            <h3 className="text-xl font-bold">{image.title}</h3>
                            <p>{image.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Contrôles du slider */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
                aria-label="Image précédente"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
                aria-label="Image suivante"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Indicateurs */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                {dashboardImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                            "h-2 w-2 rounded-full transition-all",
                            index === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80",
                        )}
                        aria-label={`Aller à l'image ${index + 1}`}
                    />
                ))}
            </div>



        </div>
    )
}

