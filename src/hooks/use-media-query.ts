"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Définir la valeur initiale
    setMatches(media.matches)

    // Définir un écouteur pour les changements
    const listener = () => {
      setMatches(media.matches)
    }

    // Ajouter l'écouteur
    media.addEventListener("change", listener)

    // Nettoyer l'écouteur
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}

