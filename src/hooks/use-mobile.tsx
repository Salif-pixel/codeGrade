"use client"

import { useState, useEffect } from "react"

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Fonction pour vérifier si l'écran est mobile
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        // Vérifier au chargement
        checkIfMobile()

        // Ajouter un écouteur d'événement pour les changements de taille
        window.addEventListener("resize", checkIfMobile)

        // Nettoyer l'écouteur d'événement
        return () => window.removeEventListener("resize", checkIfMobile)
    }, [])

    return isMobile
}

